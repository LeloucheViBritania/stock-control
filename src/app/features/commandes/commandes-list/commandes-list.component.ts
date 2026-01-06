import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommandesService } from '@core/services/commandes.service';
import { ClientsService } from '@core/services/clients.service';
import { ToastService } from '@core/services/notifications.service';
import { Commande, Client, StatutCommande, PaginatedResponse } from '@core/models';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

@Component({
  selector: 'app-commandes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPipe, DatePipe, PaginationComponent],
  template: `
    <div class="commandes-page">
      <!-- Header -->
      <div class="page-header">
        <div class="page-header__left">
          <h1>Commandes</h1>
          <p class="text-muted">Gérez vos commandes clients</p>
        </div>
        <div class="page-header__right">
          <button class="btn btn--secondary" (click)="exportCommandes()">
            <i class="ph ph-download-simple"></i>
            Exporter
          </button>
          <a routerLink="/commandes/new" class="btn btn--primary">
            <i class="ph ph-plus"></i>
            Nouvelle commande
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters card">
        <div class="filters__row">
          <div class="search-box">
            <i class="ph ph-magnifying-glass"></i>
            <input 
              type="text" 
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchChange()"
              placeholder="Rechercher par numéro, client..."
              class="form-control"
            />
          </div>

          <select 
            [(ngModel)]="selectedStatut"
            (ngModelChange)="onFilterChange()"
            class="form-control filter-select"
          >
            <option [ngValue]="null">Tous les statuts</option>
            @for (statut of statuts; track statut) {
              <option [ngValue]="statut">{{ getStatutLabel(statut) }}</option>
            }
          </select>

          <input 
            type="date"
            [(ngModel)]="dateDebut"
            (ngModelChange)="onFilterChange()"
            class="form-control filter-date"
            placeholder="Date début"
          />

          <input 
            type="date"
            [(ngModel)]="dateFin"
            (ngModelChange)="onFilterChange()"
            class="form-control filter-date"
            placeholder="Date fin"
          />
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        @for (stat of statsCards; track stat.label) {
          <div class="mini-stat" [class]="'mini-stat--' + stat.color">
            <div class="mini-stat__value">{{ stat.value }}</div>
            <div class="mini-stat__label">{{ stat.label }}</div>
          </div>
        }
      </div>

      <!-- Table -->
      <div class="card">
        @if (isLoading()) {
          <div class="loading-container">
            <span class="spinner spinner--lg"></span>
          </div>
        } @else if (commandes().length === 0) {
          <div class="empty-state">
            <i class="ph-duotone ph-shopping-cart"></i>
            <h3>Aucune commande</h3>
            <p>Créez votre première commande</p>
            <a routerLink="/commandes/new" class="btn btn--primary">
              <i class="ph ph-plus"></i>
              Nouvelle commande
            </a>
          </div>
        } @else {
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>N° Commande</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th class="text-right">Montant</th>
                  <th>Statut</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (commande of commandes(); track commande.id) {
                  <tr>
                    <td>
                      <a [routerLink]="['/commandes', commande.id]" class="commande-num">
                        {{ commande.numeroCommande }}
                      </a>
                    </td>
                    <td>
                      <div class="client-cell">
                        <span class="client-name">{{ commande.client?.nom || 'Client anonyme' }}</span>
                        @if (commande.client?.telephone) {
                          <span class="client-phone text-muted">{{ commande.client?.telephone }}</span>
                        }
                      </div>
                    </td>
                    <td>{{ commande.dateCommande | date:'dd/MM/yyyy' }}</td>
                    <td class="text-right">
                      <span class="amount">{{ commande.montantTotal | currency:'XOF':'symbol':'1.0-0' }}</span>
                    </td>
                    <td>
                      <span class="badge" [class]="getStatutClass(commande.statut)">
                        {{ getStatutLabel(commande.statut) }}
                      </span>
                    </td>
                    <td class="text-right">
                      <div class="actions-cell">
                        <a [routerLink]="['/commandes', commande.id]" class="btn btn--ghost btn--sm btn--icon" title="Voir">
                          <i class="ph ph-eye"></i>
                        </a>
                        @if (commande.statut === 'EN_ATTENTE') {
                          <a [routerLink]="['/commandes', commande.id, 'edit']" class="btn btn--ghost btn--sm btn--icon" title="Modifier">
                            <i class="ph ph-pencil"></i>
                          </a>
                        }
                        <div class="dropdown">
                          <button class="btn btn--ghost btn--sm btn--icon" title="Plus">
                            <i class="ph ph-dots-three"></i>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="table-footer">
            <div class="table-info">
              {{ commandes().length }} commande(s) sur {{ meta().total }}
            </div>
            <app-pagination
              [currentPage]="currentPage()"
              [totalPages]="meta().totalPages"
              (pageChange)="onPageChange($event)"
            />
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-6);
    }

    .page-header__right {
      display: flex;
      gap: var(--space-3);
    }

    .filters {
      margin-bottom: var(--space-6);
    }

    .filters__row {
      display: flex;
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 200px;

      i {
        position: absolute;
        left: var(--space-3);
        top: 50%;
        transform: translateY(-50%);
        color: var(--neutral-400);
      }

      input {
        padding-left: var(--space-10);
      }
    }

    .filter-select {
      width: 180px;
    }

    .filter-date {
      width: 150px;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .mini-stat {
      padding: var(--space-4);
      background: var(--neutral-0);
      border-radius: var(--radius-lg);
      border-left: 4px solid;
      
      &--warning { border-color: var(--warning-500); }
      &--info { border-color: var(--info-500); }
      &--primary { border-color: var(--primary-500); }
      &--success { border-color: var(--success-500); }
      &--error { border-color: var(--error-500); }
    }

    .mini-stat__value {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: 600;
      color: var(--neutral-900);
    }

    .mini-stat__label {
      font-size: var(--text-sm);
      color: var(--neutral-500);
    }

    .commande-num {
      font-family: var(--font-mono);
      font-weight: 600;
      color: var(--primary-600);

      &:hover {
        text-decoration: underline;
      }
    }

    .client-cell {
      display: flex;
      flex-direction: column;
    }

    .client-name {
      font-weight: 500;
    }

    .client-phone {
      font-size: var(--text-sm);
    }

    .amount {
      font-family: var(--font-mono);
      font-weight: 500;
    }

    .actions-cell {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-1);
    }

    .loading-container, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-12);
      gap: var(--space-4);
    }

    .empty-state i {
      font-size: 4rem;
      color: var(--neutral-300);
    }

    .table-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--neutral-200);
    }

    .table-info {
      font-size: var(--text-sm);
      color: var(--neutral-500);
    }

    @media (max-width: 768px) {
      .stats-row {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class CommandesListComponent implements OnInit {
  private commandesService = inject(CommandesService);
  private toast = inject(ToastService);

  commandes = signal<Commande[]>([]);
  isLoading = signal(true);
  meta = signal({ total: 0, page: 1, limit: 20, totalPages: 0 });
  currentPage = signal(1);

  // Filters
  searchTerm = '';
  selectedStatut: StatutCommande | null = null;
  dateDebut = '';
  dateFin = '';

  statuts = Object.values(StatutCommande);
  
  statsCards = [
    { label: 'En attente', value: 0, color: 'warning' },
    { label: 'En traitement', value: 0, color: 'info' },
    { label: 'Expédiées', value: 0, color: 'primary' },
    { label: 'Livrées', value: 0, color: 'success' },
    { label: 'Annulées', value: 0, color: 'error' }
  ];

  private searchTimeout: any;

  ngOnInit() {
    this.loadCommandes();
    this.loadStats();
  }

  loadCommandes() {
    this.isLoading.set(true);

    const params: any = {
      page: this.currentPage(),
      limit: this.meta().limit
    };

    if (this.searchTerm) params.search = this.searchTerm;
    if (this.selectedStatut) params.statut = this.selectedStatut;
    if (this.dateDebut) params.dateDebut = this.dateDebut;
    if (this.dateFin) params.dateFin = this.dateFin;

    this.commandesService.getAll(params).subscribe({
      next: (response) => {
        this.commandes.set(response.data);
        this.meta.set(response.meta);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Erreur', 'Impossible de charger les commandes');
        this.isLoading.set(false);
      }
    });
  }

  loadStats() {
    this.commandesService.getStatistiques().subscribe({
      next: (stats) => {
        this.statsCards[0].value = stats.enAttente || 0;
        this.statsCards[1].value = stats.enTraitement || 0;
        this.statsCards[2].value = stats.expedie || 0;
        this.statsCards[3].value = stats.livre || 0;
        this.statsCards[4].value = stats.annule || 0;
      }
    });
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadCommandes();
    }, 300);
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadCommandes();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadCommandes();
  }

  getStatutClass(statut: StatutCommande): string {
    switch (statut) {
      case StatutCommande.EN_ATTENTE: return 'badge--warning';
      case StatutCommande.EN_TRAITEMENT: return 'badge--info';
      case StatutCommande.EXPEDIE: return 'badge--primary';
      case StatutCommande.LIVRE: return 'badge--success';
      case StatutCommande.ANNULE: return 'badge--error';
      default: return 'badge--secondary';
    }
  }

  getStatutLabel(statut: StatutCommande): string {
    switch (statut) {
      case StatutCommande.EN_ATTENTE: return 'En attente';
      case StatutCommande.EN_TRAITEMENT: return 'En traitement';
      case StatutCommande.EXPEDIE: return 'Expédié';
      case StatutCommande.LIVRE: return 'Livré';
      case StatutCommande.ANNULE: return 'Annulé';
      default: return statut;
    }
  }

  exportCommandes() {
    this.commandesService.export('excel').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `commandes_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.toast.error('Erreur', 'Export impossible')
    });
  }
}
