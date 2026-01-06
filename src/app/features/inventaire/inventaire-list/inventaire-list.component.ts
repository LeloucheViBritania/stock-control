import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InventaireService } from '@core/services/inventaire.service';
import { EntrepotsService } from '@core/services/entrepots.service';
import { ToastService } from '@core/services/notifications.service';
import { Inventaire, Entrepot } from '@core/models';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

@Component({
  selector: 'app-inventaire-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe, PaginationComponent],
  template: `
    <div class="inventaire-page">
      <div class="page-header">
        <div><h1>Inventaire</h1><p class="text-muted">Stock par entrepôt et produit</p></div>
        <button class="btn btn--secondary" (click)="exportInventaire()"><i class="ph ph-download-simple"></i> Exporter</button>
      </div>

      <div class="filters card mb-6">
        <div class="filters__row">
          <div class="search-box">
            <i class="ph ph-magnifying-glass"></i>
            <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()" placeholder="Rechercher produit..." class="form-control" />
          </div>
          <select [(ngModel)]="selectedEntrepot" (ngModelChange)="onFilterChange()" class="form-control" style="width: 200px;">
            <option [ngValue]="null">Tous les entrepôts</option>
            @for (e of entrepots(); track e.id) { <option [ngValue]="e.id">{{ e.nom }}</option> }
          </select>
          <label class="form-check">
            <input type="checkbox" [(ngModel)]="stockFaibleOnly" (ngModelChange)="onFilterChange()" />
            <span class="form-check__label">Stock faible uniquement</span>
          </label>
        </div>
      </div>

      <div class="stats-row mb-6">
        <div class="mini-stat"><span class="value">{{ totalProduits() }}</span><span class="label">Produits</span></div>
        <div class="mini-stat"><span class="value">{{ valeurTotale() | currency:'XOF':'symbol':'1.0-0' }}</span><span class="label">Valeur stock</span></div>
        <div class="mini-stat mini-stat--warning"><span class="value">{{ stockFaible() }}</span><span class="label">Stock faible</span></div>
      </div>

      <div class="card">
        @if (isLoading()) {
          <div class="loading-container"><span class="spinner spinner--lg"></span></div>
        } @else if (inventaires().length === 0) {
          <div class="empty-state">
            <i class="ph-duotone ph-clipboard-text"></i>
            <h3>Aucun inventaire</h3>
            <p>Ajoutez des produits aux entrepôts</p>
          </div>
        } @else {
          <div class="table-container">
            <table class="table">
              <thead>
                <tr><th>Produit</th><th>Entrepôt</th><th>Emplacement</th><th class="text-right">Quantité</th><th class="text-right">Réservé</th><th class="text-right">Disponible</th><th class="text-right">Valeur</th></tr>
              </thead>
              <tbody>
                @for (inv of inventaires(); track inv.id) {
                  <tr [class.row-warning]="inv.quantite <= (inv.produit?.niveauStockMin || 0)">
                    <td>
                      <a [routerLink]="['/produits', inv.produitId]" class="font-medium">{{ inv.produit?.nom }}</a>
                      <span class="text-muted text-sm d-block">{{ inv.produit?.reference }}</span>
                    </td>
                    <td>{{ inv.entrepot?.nom }}</td>
                    <td><code>{{ inv.emplacement || '-' }}</code></td>
                    <td class="text-right">
                      <span [class.text-error]="inv.quantite === 0" [class.text-warning]="inv.quantite > 0 && inv.quantite <= (inv.produit?.niveauStockMin || 0)">
                        {{ inv.quantite }}
                      </span>
                    </td>
                    <td class="text-right">{{ inv.quantiteReservee || 0 }}</td>
                    <td class="text-right"><strong>{{ inv.quantite - (inv.quantiteReservee || 0) }}</strong></td>
                    <td class="text-right">{{ inv.quantite * (inv.produit?.coutUnitaire || 0) | currency:'XOF':'symbol':'1.0-0' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="table-footer">
            <span class="text-muted text-sm">{{ meta().total }} ligne(s)</span>
            <app-pagination [currentPage]="currentPage()" [totalPages]="meta().totalPages" (pageChange)="onPageChange($event)" />
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
    .filters__row { display: flex; gap: var(--space-4); flex-wrap: wrap; align-items: center; }
    .search-box { position: relative; flex: 1; min-width: 200px;
      i { position: absolute; left: var(--space-3); top: 50%; transform: translateY(-50%); color: var(--neutral-400); }
      input { padding-left: var(--space-10); }
    }
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }
    .mini-stat { padding: var(--space-4); background: var(--neutral-0); border-radius: var(--radius-lg); border: 1px solid var(--neutral-200); text-align: center;
      .value { display: block; font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 600; }
      .label { font-size: var(--text-sm); color: var(--neutral-500); }
      &--warning { border-color: var(--warning-300); background: var(--warning-50); }
    }
    .row-warning { background: var(--warning-50); }
    .loading-container, .empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--space-12); gap: var(--space-4); }
    .empty-state i { font-size: 4rem; color: var(--neutral-300); }
    .table-footer { display: flex; justify-content: space-between; align-items: center; padding: var(--space-4) var(--space-6); border-top: 1px solid var(--neutral-200); }
  `]
})
export class InventaireListComponent implements OnInit {
  private inventaireService = inject(InventaireService);
  private entrepotsService = inject(EntrepotsService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  inventaires = signal<Inventaire[]>([]);
  entrepots = signal<Entrepot[]>([]);
  isLoading = signal(true);
  meta = signal({ total: 0, page: 1, limit: 20, totalPages: 0 });
  currentPage = signal(1);

  searchTerm = '';
  selectedEntrepot: number | null = null;
  stockFaibleOnly = false;

  totalProduits = signal(0);
  valeurTotale = signal(0);
  stockFaible = signal(0);

  private searchTimeout: any;

  ngOnInit() {
    this.route.queryParams.subscribe(p => { if (p['entrepotId']) this.selectedEntrepot = +p['entrepotId']; });
    this.loadEntrepots();
    this.loadInventaire();
  }

  loadEntrepots() { this.entrepotsService.getAll().subscribe({ next: (res) => this.entrepots.set(res.data) }); }

  loadInventaire() {
    this.isLoading.set(true);
    const params: any = { page: this.currentPage(), limit: this.meta().limit };
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.selectedEntrepot) params.entrepotId = this.selectedEntrepot;
    if (this.stockFaibleOnly) params.stockFaible = true;

    this.inventaireService.getAll(params).subscribe({
      next: (res) => {
        this.inventaires.set(res.data);
        this.meta.set(res.meta);
        this.totalProduits.set(res.meta.total);
        this.isLoading.set(false);
      },
      error: () => { this.toast.error('Erreur', 'Impossible de charger l\'inventaire'); this.isLoading.set(false); }
    });
  }

  onSearchChange() { clearTimeout(this.searchTimeout); this.searchTimeout = setTimeout(() => { this.currentPage.set(1); this.loadInventaire(); }, 300); }
  onFilterChange() { this.currentPage.set(1); this.loadInventaire(); }
  onPageChange(page: number) { this.currentPage.set(page); this.loadInventaire(); }

  exportInventaire() {
    this.inventaireService.export('excel').subscribe({
      next: (blob) => { const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `inventaire_${new Date().toISOString().split('T')[0]}.xlsx`; a.click(); },
      error: () => this.toast.error('Erreur', 'Export impossible')
    });
  }
}
