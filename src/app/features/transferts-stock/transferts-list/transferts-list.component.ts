import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TransfertsStockService } from '@core/services/transferts-stock.service';
import { ToastService } from '@core/services/notifications.service';
import { TransfertStock, StatutTransfert } from '@core/models';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

@Component({
  selector: 'app-transferts-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe, PaginationComponent],
  template: `
    <div class="transferts-page">
      <div class="page-header">
        <div><h1>Transferts de Stock</h1><p class="text-muted">Mouvements inter-entrepôts</p></div>
        <a routerLink="/transferts/new" class="btn btn--primary"><i class="ph ph-arrows-left-right"></i> Nouveau transfert</a>
      </div>

      <div class="filters card mb-6">
        <div class="filters__row">
          <select [(ngModel)]="selectedStatut" (ngModelChange)="onFilterChange()" class="form-control" style="width: 180px;">
            <option [ngValue]="null">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="EN_TRANSIT">En transit</option>
            <option value="RECU">Reçu</option>
            <option value="ANNULE">Annulé</option>
          </select>
        </div>
      </div>

      <div class="card">
        @if (isLoading()) {
          <div class="loading-container"><span class="spinner spinner--lg"></span></div>
        } @else if (transferts().length === 0) {
          <div class="empty-state">
            <i class="ph-duotone ph-arrows-left-right"></i>
            <h3>Aucun transfert</h3>
            <a routerLink="/transferts/new" class="btn btn--primary"><i class="ph ph-plus"></i> Créer un transfert</a>
          </div>
        } @else {
          <div class="table-container">
            <table class="table">
              <thead><tr><th>Référence</th><th>De</th><th>Vers</th><th>Date</th><th>Produits</th><th>Statut</th><th class="text-right">Actions</th></tr></thead>
              <tbody>
                @for (t of transferts(); track t.id) {
                  <tr>
                    <td><a [routerLink]="['/transferts', t.id]" class="font-medium">{{ t.reference }}</a></td>
                    <td>{{ t.entrepotOrigine?.nom }}</td>
                    <td>{{ t.entrepotDestination?.nom }}</td>
                    <td>{{ t.dateTransfert | date:'dd/MM/yyyy' }}</td>
                    <td><span class="badge badge--secondary">{{ t._count?.lignes || t.lignes?.length || 0 }}</span></td>
                    <td><span class="badge" [class]="getStatutBadge(t.statut)">{{ getStatutLabel(t.statut) }}</span></td>
                    <td class="text-right">
                      <a [routerLink]="['/transferts', t.id]" class="btn btn--ghost btn--sm btn--icon"><i class="ph ph-eye"></i></a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="table-footer">
            <span class="text-muted text-sm">{{ meta().total }} transfert(s)</span>
            <app-pagination [currentPage]="currentPage()" [totalPages]="meta().totalPages" (pageChange)="onPageChange($event)" />
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
    .filters__row { display: flex; gap: var(--space-4); }
    .loading-container, .empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--space-12); gap: var(--space-4); }
    .empty-state i { font-size: 4rem; color: var(--neutral-300); }
    .table-footer { display: flex; justify-content: space-between; align-items: center; padding: var(--space-4) var(--space-6); border-top: 1px solid var(--neutral-200); }
  `]
})
export class TransfertsListComponent implements OnInit {
  private transfertsService = inject(TransfertsStockService);
  private toast = inject(ToastService);

  transferts = signal<TransfertStock[]>([]);
  isLoading = signal(true);
  meta = signal({ total: 0, page: 1, limit: 20, totalPages: 0 });
  currentPage = signal(1);
  selectedStatut: string | null = null;

  ngOnInit() { this.loadTransferts(); }

  loadTransferts() {
    this.isLoading.set(true);
    const params: any = { page: this.currentPage(), limit: this.meta().limit };
    if (this.selectedStatut) params.statut = this.selectedStatut;

    this.transfertsService.getAll(params).subscribe({
      next: (res) => { this.transferts.set(res.data); this.meta.set(res.meta); this.isLoading.set(false); },
      error: () => { this.toast.error('Erreur', 'Impossible de charger les transferts'); this.isLoading.set(false); }
    });
  }

  onFilterChange() { this.currentPage.set(1); this.loadTransferts(); }
  onPageChange(page: number) { this.currentPage.set(page); this.loadTransferts(); }

  getStatutBadge(statut: StatutTransfert): string {
    const badges: Record<string, string> = { EN_ATTENTE: 'badge--warning', EN_TRANSIT: 'badge--info', RECU: 'badge--success', ANNULE: 'badge--error' };
    return badges[statut] || 'badge--secondary';
  }

  getStatutLabel(statut: StatutTransfert): string {
    const labels: Record<string, string> = { EN_ATTENTE: 'En attente', EN_TRANSIT: 'En transit', RECU: 'Reçu', ANNULE: 'Annulé' };
    return labels[statut] || statut;
  }
}
