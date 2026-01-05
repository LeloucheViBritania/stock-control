/**
 * Liste des transferts de stock (PREMIUM)
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TransfertsStockService, TransfertStock, TransfertFilters } from '../../services/transferts-stock.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-transferts-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Transferts de Stock</h1>
            <span class="badge-premium">Premium</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">{{ totalItems() }} transfert{{ totalItems() > 1 ? 's' : '' }}</p>
        </div>
        <a routerLink="nouveau" class="btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nouveau transfert
        </a>
      </div>

      <!-- Stats -->
      @if (stats()) {
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div class="card p-4 cursor-pointer hover:shadow-md" [class.ring-2]="filters.statut === 'EN_ATTENTE'" [class.ring-warning-500]="filters.statut === 'EN_ATTENTE'" (click)="filterByStatut('EN_ATTENTE')">
            <p class="text-sm text-gray-500">En attente</p>
            <p class="text-2xl font-bold text-warning-600">{{ stats()?.enAttente }}</p>
          </div>
          <div class="card p-4 cursor-pointer hover:shadow-md" [class.ring-2]="filters.statut === 'EN_COURS'" [class.ring-primary-500]="filters.statut === 'EN_COURS'" (click)="filterByStatut('EN_COURS')">
            <p class="text-sm text-gray-500">En cours</p>
            <p class="text-2xl font-bold text-primary-600">{{ stats()?.enCours }}</p>
          </div>
          <div class="card p-4 cursor-pointer hover:shadow-md" [class.ring-2]="filters.statut === 'RECEPTIONNE'" [class.ring-success-500]="filters.statut === 'RECEPTIONNE'" (click)="filterByStatut('RECEPTIONNE')">
            <p class="text-sm text-gray-500">Réceptionnés</p>
            <p class="text-2xl font-bold text-success-600">{{ stats()?.receptionnes }}</p>
          </div>
          <div class="card p-4 cursor-pointer hover:shadow-md" [class.ring-2]="filters.statut === 'ANNULE'" [class.ring-danger-500]="filters.statut === 'ANNULE'" (click)="filterByStatut('ANNULE')">
            <p class="text-sm text-gray-500">Annulés</p>
            <p class="text-2xl font-bold text-danger-600">{{ stats()?.annules }}</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-500">Total ce mois</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats()?.totalMois }}</p>
          </div>
        </div>
      }

      <!-- Filtres -->
      <div class="card p-4">
        <div class="flex flex-wrap items-center gap-4">
          <input type="text" [(ngModel)]="filters.search" (ngModelChange)="onFilterChange()" placeholder="Rechercher..." class="form-input flex-1 min-w-[200px]" />
          <select [(ngModel)]="filters.statut" (ngModelChange)="onFilterChange()" class="form-input w-auto">
            <option value="">Tous les statuts</option>
            <option value="BROUILLON">Brouillon</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="EN_COURS">En cours</option>
            <option value="RECEPTIONNE">Réceptionné</option>
            <option value="ANNULE">Annulé</option>
          </select>
          @if (hasFilters()) {
            <button type="button" class="text-sm text-primary-600 hover:underline" (click)="resetFilters()">Réinitialiser</button>
          }
        </div>
      </div>

      <!-- Liste -->
      @if (isLoading()) {
        <div class="card p-12"><app-loading-spinner size="lg" text="Chargement..." /></div>
      } @else if (!transferts().length) {
        <div class="card p-12 text-center">
          <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Aucun transfert</h3>
          <p class="text-gray-500 mt-1">Créez votre premier transfert inter-entrepôts</p>
          <a routerLink="nouveau" class="btn-primary mt-4">Créer un transfert</a>
        </div>
      } @else {
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="table-header">N° Transfert</th>
                  <th class="table-header">Source → Destination</th>
                  <th class="table-header text-center">Articles</th>
                  <th class="table-header text-center">Statut</th>
                  <th class="table-header">Date</th>
                  <th class="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                @for (t of transferts(); track t.id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td class="table-cell">
                      <a [routerLink]="[t.id]" class="font-medium text-primary-600 hover:underline">{{ t.numero }}</a>
                    </td>
                    <td class="table-cell">
                      <div class="flex items-center gap-2">
                        <span class="text-gray-900 dark:text-white">{{ t.entrepotSourceNom }}</span>
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                        </svg>
                        <span class="text-gray-900 dark:text-white">{{ t.entrepotDestinationNom }}</span>
                      </div>
                    </td>
                    <td class="table-cell text-center font-medium">{{ t.nombreArticles }}</td>
                    <td class="table-cell text-center">
                      <span class="px-2 py-1 text-xs font-medium rounded-full" [ngClass]="getStatutClass(t.statut)">
                        {{ getStatutLabel(t.statut) }}
                      </span>
                    </td>
                    <td class="table-cell text-gray-600">{{ t.dateCreation | date:'dd/MM/yyyy' }}</td>
                    <td class="table-cell text-right">
                      <div class="flex items-center justify-end gap-1">
                        <a [routerLink]="[t.id]" class="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg" title="Voir">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </a>
                        @if (t.statut === 'EN_ATTENTE') {
                          <button type="button" (click)="expedier(t)" class="p-2 text-gray-500 hover:text-success-600 hover:bg-gray-100 rounded-lg" title="Expédier">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class TransfertsListComponent implements OnInit {
  private readonly transfertsService = inject(TransfertsStockService);
  private readonly notificationService = inject(NotificationService);

  transferts = signal<TransfertStock[]>([]);
  stats = signal<any>(null);
  isLoading = signal(true);
  totalItems = signal(0);
  filters: TransfertFilters = {};
  private searchTimeout: any;

  hasFilters = computed(() => !!this.filters.search || !!this.filters.statut);

  ngOnInit(): void {
    this.loadTransferts();
    this.loadStats();
  }

  loadTransferts(): void {
    this.isLoading.set(true);
    this.transfertsService.getAll(1, 50, this.filters).subscribe({
      next: (r) => { this.transferts.set(r.data); this.totalItems.set(r.meta.total); this.isLoading.set(false); },
      error: () => {
        this.transferts.set([
          { id: '1', numero: 'TR-2024-001', entrepotSourceId: '1', entrepotSourceNom: 'Paris', entrepotDestinationId: '2', entrepotDestinationNom: 'Lyon', statut: 'EN_COURS', dateCreation: new Date(), nombreArticles: 25, lignes: [], demandePar: 'Admin', createdAt: new Date(), updatedAt: new Date() },
          { id: '2', numero: 'TR-2024-002', entrepotSourceId: '1', entrepotSourceNom: 'Paris', entrepotDestinationId: '3', entrepotDestinationNom: 'Marseille', statut: 'EN_ATTENTE', dateCreation: new Date(), nombreArticles: 12, lignes: [], demandePar: 'Admin', createdAt: new Date(), updatedAt: new Date() },
          { id: '3', numero: 'TR-2024-003', entrepotSourceId: '2', entrepotSourceNom: 'Lyon', entrepotDestinationId: '1', entrepotDestinationNom: 'Paris', statut: 'RECEPTIONNE', dateCreation: new Date(Date.now() - 86400000 * 3), dateReception: new Date(), nombreArticles: 8, lignes: [], demandePar: 'Admin', createdAt: new Date(), updatedAt: new Date() },
        ] as TransfertStock[]);
        this.totalItems.set(3);
        this.isLoading.set(false);
      }
    });
  }

  loadStats(): void {
    this.transfertsService.getStats().subscribe({
      next: (s) => this.stats.set(s),
      error: () => this.stats.set({ enAttente: 5, enCours: 3, receptionnes: 42, annules: 2, totalMois: 52 })
    });
  }

  onFilterChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadTransferts(), 300);
  }

  filterByStatut(statut: string): void {
    this.filters.statut = this.filters.statut === statut ? '' : statut;
    this.loadTransferts();
  }

  resetFilters(): void {
    this.filters = {};
    this.loadTransferts();
  }

  expedier(t: TransfertStock): void {
    this.transfertsService.expedier(t.id).subscribe({
      next: () => { this.notificationService.success('Transfert expédié'); this.loadTransferts(); this.loadStats(); },
      error: () => this.notificationService.error('Erreur')
    });
  }

  getStatutClass(statut: string): string {
    const classes: Record<string, string> = {
      'BROUILLON': 'bg-gray-100 text-gray-700',
      'EN_ATTENTE': 'bg-warning-100 text-warning-700',
      'EN_COURS': 'bg-primary-100 text-primary-700',
      'RECEPTIONNE': 'bg-success-100 text-success-700',
      'ANNULE': 'bg-danger-100 text-danger-700'
    };
    return classes[statut] || 'bg-gray-100 text-gray-700';
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'BROUILLON': 'Brouillon', 'EN_ATTENTE': 'En attente', 'EN_COURS': 'En cours', 'RECEPTIONNE': 'Réceptionné', 'ANNULE': 'Annulé'
    };
    return labels[statut] || statut;
  }
}
