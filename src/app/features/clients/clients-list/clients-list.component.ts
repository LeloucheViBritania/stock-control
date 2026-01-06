import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientsService } from '@core/services/clients.service';
import { ToastService } from '@core/services/notifications.service';
import { Client, StatutClient, SegmentClient } from '@core/models';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPipe, PaginationComponent],
  template: `
    <div class="clients-page">
      <div class="page-header">
        <div><h1>Clients</h1><p class="text-muted">Gérez vos clients</p></div>
        <div class="header-actions">
          <button class="btn btn--secondary" (click)="exportClients()"><i class="ph ph-download-simple"></i> Exporter</button>
          <a routerLink="/clients/new" class="btn btn--primary"><i class="ph ph-plus"></i> Nouveau client</a>
        </div>
      </div>

      <div class="filters card mb-6">
        <div class="filters__row">
          <div class="search-box">
            <i class="ph ph-magnifying-glass"></i>
            <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()" placeholder="Rechercher..." class="form-control" />
          </div>
          <select [(ngModel)]="selectedStatut" (ngModelChange)="onFilterChange()" class="form-control" style="width: 160px;">
            <option [ngValue]="null">Tous les statuts</option>
            <option value="ACTIF">Actif</option>
            <option value="INACTIF">Inactif</option>
            <option value="BLOQUE">Bloqué</option>
          </select>
          <select [(ngModel)]="selectedSegment" (ngModelChange)="onFilterChange()" class="form-control" style="width: 160px;">
            <option [ngValue]="null">Tous les segments</option>
            <option value="PARTICULIER">Particulier</option>
            <option value="PROFESSIONNEL">Professionnel</option>
            <option value="ENTREPRISE">Entreprise</option>
            <option value="VIP">VIP</option>
          </select>
        </div>
      </div>

      <div class="card">
        @if (isLoading()) {
          <div class="loading-container"><span class="spinner spinner--lg"></span></div>
        } @else if (clients().length === 0) {
          <div class="empty-state">
            <i class="ph-duotone ph-users"></i>
            <h3>Aucun client</h3>
            <a routerLink="/clients/new" class="btn btn--primary"><i class="ph ph-plus"></i> Ajouter un client</a>
          </div>
        } @else {
          <div class="table-container">
            <table class="table">
              <thead>
                <tr><th>Client</th><th>Contact</th><th>Segment</th><th class="text-right">Commandes</th><th class="text-right">CA Total</th><th>Statut</th><th class="text-right">Actions</th></tr>
              </thead>
              <tbody>
                @for (client of clients(); track client.id) {
                  <tr [class.row-blocked]="client.statut === 'BLOQUE'">
                    <td>
                      <div class="client-cell">
                        <a [routerLink]="['/clients', client.id]" class="client-name">{{ client.nom }}</a>
                        @if (client.entreprise) { <span class="client-company text-muted">{{ client.entreprise }}</span> }
                      </div>
                    </td>
                    <td>
                      <div class="contact-cell">
                        @if (client.email) { <span><i class="ph ph-envelope"></i> {{ client.email }}</span> }
                        @if (client.telephone) { <span><i class="ph ph-phone"></i> {{ client.telephone }}</span> }
                      </div>
                    </td>
                    <td><span class="badge" [class]="getSegmentBadge(client.segment)">{{ client.segment }}</span></td>
                    <td class="text-right">{{ client._count?.commandes || 0 }}</td>
                    <td class="text-right"><strong>{{ client.chiffreAffaires || 0 | currency:'XOF':'symbol':'1.0-0' }}</strong></td>
                    <td><span class="badge" [class]="getStatutBadge(client.statut)">{{ client.statut }}</span></td>
                    <td class="text-right">
                      <a [routerLink]="['/clients', client.id]" class="btn btn--ghost btn--sm btn--icon"><i class="ph ph-eye"></i></a>
                      <a [routerLink]="['/clients', client.id, 'edit']" class="btn btn--ghost btn--sm btn--icon"><i class="ph ph-pencil"></i></a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="table-footer">
            <span class="text-muted text-sm">{{ meta().total }} client(s)</span>
            <app-pagination [currentPage]="currentPage()" [totalPages]="meta().totalPages" (pageChange)="onPageChange($event)" />
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
    .header-actions { display: flex; gap: var(--space-3); }
    .filters__row { display: flex; gap: var(--space-4); flex-wrap: wrap; }
    .search-box { position: relative; flex: 1; min-width: 200px;
      i { position: absolute; left: var(--space-3); top: 50%; transform: translateY(-50%); color: var(--neutral-400); }
      input { padding-left: var(--space-10); }
    }
    .client-cell { display: flex; flex-direction: column; }
    .client-name { font-weight: 500; &:hover { color: var(--primary-600); } }
    .client-company { font-size: var(--text-sm); }
    .contact-cell { display: flex; flex-direction: column; gap: 2px; font-size: var(--text-sm); color: var(--neutral-600);
      i { margin-right: var(--space-1); }
    }
    .row-blocked { opacity: 0.6; background: var(--error-50); }
    .loading-container, .empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--space-12); gap: var(--space-4); }
    .empty-state i { font-size: 4rem; color: var(--neutral-300); }
    .table-footer { display: flex; justify-content: space-between; align-items: center; padding: var(--space-4) var(--space-6); border-top: 1px solid var(--neutral-200); }
  `]
})
export class ClientsListComponent implements OnInit {
  private clientsService = inject(ClientsService);
  private toast = inject(ToastService);

  clients = signal<Client[]>([]);
  isLoading = signal(true);
  meta = signal({ total: 0, page: 1, limit: 20, totalPages: 0 });
  currentPage = signal(1);
  searchTerm = '';
  selectedStatut: string | null = null;
  selectedSegment: string | null = null;
  private searchTimeout: any;

  ngOnInit() { this.loadClients(); }

  loadClients() {
    this.isLoading.set(true);
    const params: any = { page: this.currentPage(), limit: this.meta().limit };
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.selectedStatut) params.statut = this.selectedStatut;
    if (this.selectedSegment) params.segment = this.selectedSegment;

    this.clientsService.getAll(params).subscribe({
      next: (res) => { this.clients.set(res.data); this.meta.set(res.meta); this.isLoading.set(false); },
      error: () => { this.toast.error('Erreur', 'Impossible de charger les clients'); this.isLoading.set(false); }
    });
  }

  onSearchChange() { clearTimeout(this.searchTimeout); this.searchTimeout = setTimeout(() => { this.currentPage.set(1); this.loadClients(); }, 300); }
  onFilterChange() { this.currentPage.set(1); this.loadClients(); }
  onPageChange(page: number) { this.currentPage.set(page); this.loadClients(); }

  getStatutBadge(statut: string): string {
    const map: Record<string, string> = { ACTIF: 'badge--success', INACTIF: 'badge--secondary', BLOQUE: 'badge--error' };
    return map[statut] || 'badge--secondary';
  }

  getSegmentBadge(segment: string): string {
    const map: Record<string, string> = { VIP: 'badge--primary', ENTREPRISE: 'badge--info', PROFESSIONNEL: 'badge--warning', PARTICULIER: 'badge--secondary' };
    return map[segment] || 'badge--secondary';
  }

  exportClients() {
    this.clientsService.export('excel').subscribe({
      next: (blob) => { const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `clients_${new Date().toISOString().split('T')[0]}.xlsx`; a.click(); },
      error: () => this.toast.error('Erreur', 'Export impossible')
    });
  }
}
