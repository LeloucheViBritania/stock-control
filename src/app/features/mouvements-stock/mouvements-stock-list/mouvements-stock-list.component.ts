import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MouvementsStockService } from '@core/services/mouvements-stock.service';
import { ToastService } from '@core/services/notifications.service';
import { MouvementStock, TypeMouvement } from '@core/models';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

@Component({
  selector: 'app-mouvements-stock-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, PaginationComponent],
  template: `
    <div class="mouvements-page">
      <div class="page-header">
        <div>
          <h1>Mouvements de Stock</h1>
          <p class="text-muted">Historique de tous les mouvements</p>
        </div>
        <button class="btn btn--secondary" (click)="exportMouvements()">
          <i class="ph ph-download-simple"></i>
          Exporter
        </button>
      </div>

      <!-- Filters -->
      <div class="filters card">
        <div class="filters__row">
          <div class="search-box">
            <i class="ph ph-magnifying-glass"></i>
            <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()" placeholder="Rechercher produit..." class="form-control" />
          </div>
          <select [(ngModel)]="selectedType" (ngModelChange)="onFilterChange()" class="form-control" style="width: 180px;">
            <option [ngValue]="null">Tous les types</option>
            @for (type of types; track type) {
              <option [ngValue]="type">{{ type }}</option>
            }
          </select>
          <input type="date" [(ngModel)]="dateDebut" (ngModelChange)="onFilterChange()" class="form-control" style="width: 150px;" />
          <input type="date" [(ngModel)]="dateFin" (ngModelChange)="onFilterChange()" class="form-control" style="width: 150px;" />
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="mini-stat mini-stat--success"><i class="ph ph-arrow-down"></i><div><span class="value">{{ statsEntree() }}</span><span class="label">Entrées</span></div></div>
        <div class="mini-stat mini-stat--error"><i class="ph ph-arrow-up"></i><div><span class="value">{{ statsSortie() }}</span><span class="label">Sorties</span></div></div>
        <div class="mini-stat mini-stat--info"><i class="ph ph-arrows-left-right"></i><div><span class="value">{{ statsTransfert() }}</span><span class="label">Transferts</span></div></div>
        <div class="mini-stat mini-stat--warning"><i class="ph ph-sliders"></i><div><span class="value">{{ statsAjustement() }}</span><span class="label">Ajustements</span></div></div>
      </div>

      <!-- Table -->
      <div class="card">
        @if (isLoading()) {
          <div class="loading-container"><span class="spinner spinner--lg"></span></div>
        } @else if (mouvements().length === 0) {
          <div class="empty-state">
            <i class="ph-duotone ph-arrows-down-up"></i>
            <h3>Aucun mouvement</h3>
            <p>Les mouvements de stock apparaîtront ici</p>
          </div>
        } @else {
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Produit</th>
                  <th>Type</th>
                  <th class="text-right">Quantité</th>
                  <th>Raison</th>
                  <th>Par</th>
                </tr>
              </thead>
              <tbody>
                @for (mvt of mouvements(); track mvt.id) {
                  <tr>
                    <td>{{ mvt.dateMouvement | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td>
                      <div class="product-cell">
                        <span class="product-name">{{ mvt.produit?.nom }}</span>
                        <span class="product-ref text-muted">{{ mvt.produit?.reference }}</span>
                      </div>
                    </td>
                    <td><span class="badge" [class]="getTypeBadge(mvt.typeMouvement)">{{ mvt.typeMouvement }}</span></td>
                    <td class="text-right">
                      <span class="qty" [class]="getQtyClass(mvt.typeMouvement)">
                        {{ getQtySign(mvt.typeMouvement) }}{{ mvt.quantite }}
                      </span>
                    </td>
                    <td>{{ mvt.raison || '-' }}</td>
                    <td>{{ mvt.utilisateur?.nomComplet || mvt.utilisateur?.nomUtilisateur || '-' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="table-footer">
            <span class="text-muted text-sm">{{ meta().total }} mouvement(s)</span>
            <app-pagination [currentPage]="currentPage()" [totalPages]="meta().totalPages" (pageChange)="onPageChange($event)" />
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
    .filters { margin-bottom: var(--space-6); }
    .filters__row { display: flex; gap: var(--space-4); flex-wrap: wrap; }
    .search-box { position: relative; flex: 1; min-width: 200px;
      i { position: absolute; left: var(--space-3); top: 50%; transform: translateY(-50%); color: var(--neutral-400); }
      input { padding-left: var(--space-10); }
    }
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4); margin-bottom: var(--space-6); }
    .mini-stat { display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4); background: var(--neutral-0); border-radius: var(--radius-lg); border: 1px solid var(--neutral-200);
      i { font-size: 1.5rem; }
      .value { font-family: var(--font-display); font-size: var(--text-xl); font-weight: 600; display: block; }
      .label { font-size: var(--text-sm); color: var(--neutral-500); }
      &--success i { color: var(--success-500); }
      &--error i { color: var(--error-500); }
      &--info i { color: var(--info-500); }
      &--warning i { color: var(--warning-500); }
    }
    .product-cell { display: flex; flex-direction: column; }
    .product-name { font-weight: 500; }
    .product-ref { font-size: var(--text-sm); }
    .qty { font-family: var(--font-mono); font-weight: 600;
      &.text-success { color: var(--success-600); }
      &.text-error { color: var(--error-600); }
    }
    .loading-container, .empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--space-12); gap: var(--space-4); }
    .empty-state i { font-size: 4rem; color: var(--neutral-300); }
    .table-footer { display: flex; justify-content: space-between; align-items: center; padding: var(--space-4) var(--space-6); border-top: 1px solid var(--neutral-200); }
  `]
})
export class MouvementsStockListComponent implements OnInit {
  private mouvementsService = inject(MouvementsStockService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  mouvements = signal<MouvementStock[]>([]);
  isLoading = signal(true);
  meta = signal({ total: 0, page: 1, limit: 20, totalPages: 0 });
  currentPage = signal(1);

  searchTerm = '';
  selectedType: TypeMouvement | null = null;
  dateDebut = '';
  dateFin = '';

  types = Object.values(TypeMouvement);
  statsEntree = signal(0);
  statsSortie = signal(0);
  statsTransfert = signal(0);
  statsAjustement = signal(0);

  private searchTimeout: any;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['produitId']) this.searchTerm = params['produitId'];
    });
    this.loadMouvements();
    this.loadStats();
  }

  loadMouvements() {
    this.isLoading.set(true);
    const params: any = { page: this.currentPage(), limit: this.meta().limit };
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.selectedType) params.typeMouvement = this.selectedType;
    if (this.dateDebut) params.dateDebut = this.dateDebut;
    if (this.dateFin) params.dateFin = this.dateFin;

    this.mouvementsService.getAll(params).subscribe({
      next: (res) => { this.mouvements.set(res.data); this.meta.set(res.meta); this.isLoading.set(false); },
      error: () => { this.toast.error('Erreur', 'Impossible de charger les mouvements'); this.isLoading.set(false); }
    });
  }

  loadStats() {
    this.mouvementsService.getStatistiques().subscribe({
      next: (stats) => {
        this.statsEntree.set(stats.entree || 0);
        this.statsSortie.set(stats.sortie || 0);
        this.statsTransfert.set(stats.transfert || 0);
        this.statsAjustement.set(stats.ajustement || 0);
      }
    });
  }

  onSearchChange() { clearTimeout(this.searchTimeout); this.searchTimeout = setTimeout(() => { this.currentPage.set(1); this.loadMouvements(); }, 300); }
  onFilterChange() { this.currentPage.set(1); this.loadMouvements(); }
  onPageChange(page: number) { this.currentPage.set(page); this.loadMouvements(); }

  getTypeBadge(type: TypeMouvement): string {
    const map: Record<string, string> = { ENTREE: 'badge--success', SORTIE: 'badge--error', TRANSFERT: 'badge--info', AJUSTEMENT: 'badge--warning', RETOUR: 'badge--secondary' };
    return map[type] || 'badge--secondary';
  }

  getQtyClass(type: TypeMouvement): string { return type === 'ENTREE' || type === 'RETOUR' ? 'text-success' : 'text-error'; }
  getQtySign(type: TypeMouvement): string { return type === 'ENTREE' || type === 'RETOUR' ? '+' : '-'; }

  exportMouvements() {
    this.mouvementsService.export('excel').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `mouvements_${new Date().toISOString().split('T')[0]}.xlsx`; a.click();
      },
      error: () => this.toast.error('Erreur', 'Export impossible')
    });
  }
}
