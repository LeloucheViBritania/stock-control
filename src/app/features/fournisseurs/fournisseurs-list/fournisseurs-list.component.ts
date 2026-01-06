import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FournisseursService } from '@core/services/fournisseurs.service';
import { ToastService } from '@core/services/notifications.service';
import { Fournisseur } from '@core/models';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

@Component({
  selector: 'app-fournisseurs-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
  template: `
    <div class="fournisseurs-page">
      <div class="page-header">
        <div><h1>Fournisseurs</h1><p class="text-muted">Gérez vos fournisseurs</p></div>
        <div class="header-actions">
          <button class="btn btn--secondary" (click)="exportFournisseurs()"><i class="ph ph-download-simple"></i> Exporter</button>
          <a routerLink="/fournisseurs/new" class="btn btn--primary"><i class="ph ph-plus"></i> Nouveau fournisseur</a>
        </div>
      </div>

      <div class="filters card mb-6">
        <div class="search-box">
          <i class="ph ph-magnifying-glass"></i>
          <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()" placeholder="Rechercher..." class="form-control" />
        </div>
      </div>

      <div class="card">
        @if (isLoading()) {
          <div class="loading-container"><span class="spinner spinner--lg"></span></div>
        } @else if (fournisseurs().length === 0) {
          <div class="empty-state">
            <i class="ph-duotone ph-truck"></i>
            <h3>Aucun fournisseur</h3>
            <a routerLink="/fournisseurs/new" class="btn btn--primary"><i class="ph ph-plus"></i> Ajouter un fournisseur</a>
          </div>
        } @else {
          <div class="table-container">
            <table class="table">
              <thead>
                <tr><th>Fournisseur</th><th>Contact</th><th>Produits</th><th>Note</th><th>Statut</th><th class="text-right">Actions</th></tr>
              </thead>
              <tbody>
                @for (f of fournisseurs(); track f.id) {
                  <tr>
                    <td>
                      <div class="fournisseur-cell">
                        <a [routerLink]="['/fournisseurs', f.id]" class="fournisseur-name">{{ f.nom }}</a>
                        @if (f.siret) { <span class="fournisseur-siret text-muted">SIRET: {{ f.siret }}</span> }
                      </div>
                    </td>
                    <td>
                      <div class="contact-cell">
                        @if (f.email) { <span><i class="ph ph-envelope"></i> {{ f.email }}</span> }
                        @if (f.telephone) { <span><i class="ph ph-phone"></i> {{ f.telephone }}</span> }
                      </div>
                    </td>
                    <td><span class="badge badge--secondary">{{ f._count?.produitsFournisseurs || 0 }}</span></td>
                    <td>
                      @if (f.noteGlobale) {
                        <div class="rating">
                          <i class="ph-fill ph-star text-warning"></i>
                          <span>{{ f.noteGlobale | number:'1.1-1' }}</span>
                        </div>
                      } @else {
                        <span class="text-muted">-</span>
                      }
                    </td>
                    <td><span class="badge" [class]="f.estActif ? 'badge--success' : 'badge--secondary'">{{ f.estActif ? 'Actif' : 'Inactif' }}</span></td>
                    <td class="text-right">
                      <a [routerLink]="['/fournisseurs', f.id]" class="btn btn--ghost btn--sm btn--icon"><i class="ph ph-eye"></i></a>
                      <a [routerLink]="['/fournisseurs', f.id, 'edit']" class="btn btn--ghost btn--sm btn--icon"><i class="ph ph-pencil"></i></a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="table-footer">
            <span class="text-muted text-sm">{{ meta().total }} fournisseur(s)</span>
            <app-pagination [currentPage]="currentPage()" [totalPages]="meta().totalPages" (pageChange)="onPageChange($event)" />
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
    .header-actions { display: flex; gap: var(--space-3); }
    .search-box { position: relative; max-width: 400px;
      i { position: absolute; left: var(--space-3); top: 50%; transform: translateY(-50%); color: var(--neutral-400); }
      input { padding-left: var(--space-10); }
    }
    .fournisseur-cell { display: flex; flex-direction: column; }
    .fournisseur-name { font-weight: 500; &:hover { color: var(--primary-600); } }
    .fournisseur-siret { font-size: var(--text-sm); }
    .contact-cell { display: flex; flex-direction: column; gap: 2px; font-size: var(--text-sm); color: var(--neutral-600);
      i { margin-right: var(--space-1); }
    }
    .rating { display: flex; align-items: center; gap: var(--space-1); font-weight: 500; }
    .loading-container, .empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--space-12); gap: var(--space-4); }
    .empty-state i { font-size: 4rem; color: var(--neutral-300); }
    .table-footer { display: flex; justify-content: space-between; align-items: center; padding: var(--space-4) var(--space-6); border-top: 1px solid var(--neutral-200); }
  `]
})
export class FournisseursListComponent implements OnInit {
  private fournisseursService = inject(FournisseursService);
  private toast = inject(ToastService);

  fournisseurs = signal<Fournisseur[]>([]);
  isLoading = signal(true);
  meta = signal({ total: 0, page: 1, limit: 20, totalPages: 0 });
  currentPage = signal(1);
  searchTerm = '';
  private searchTimeout: any;

  ngOnInit() { this.loadFournisseurs(); }

  loadFournisseurs() {
    this.isLoading.set(true);
    const params: any = { page: this.currentPage(), limit: this.meta().limit };
    if (this.searchTerm) params.search = this.searchTerm;

    this.fournisseursService.getAll(params).subscribe({
      next: (res) => { this.fournisseurs.set(res.data); this.meta.set(res.meta); this.isLoading.set(false); },
      error: () => { this.toast.error('Erreur', 'Impossible de charger les fournisseurs'); this.isLoading.set(false); }
    });
  }

  onSearchChange() { clearTimeout(this.searchTimeout); this.searchTimeout = setTimeout(() => { this.currentPage.set(1); this.loadFournisseurs(); }, 300); }
  onPageChange(page: number) { this.currentPage.set(page); this.loadFournisseurs(); }

  exportFournisseurs() {
    this.fournisseursService.export('excel').subscribe({
      next: (blob) => { const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `fournisseurs_${new Date().toISOString().split('T')[0]}.xlsx`; a.click(); },
      error: () => this.toast.error('Erreur', 'Export impossible')
    });
  }
}
