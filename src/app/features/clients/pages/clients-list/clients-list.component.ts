/**
 * Liste des clients avec filtres et pagination
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientsService, Client, ClientFilters, PaginatedResponse } from '../../services/clients.service';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            {{ totalItems() }} client{{ totalItems() > 1 ? 's' : '' }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Segmentation (visible pour tous, détails PREMIUM) -->
          <a 
            routerLink="segmentation" 
            class="btn-secondary flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>
            </svg>
            Segmentation
          </a>
          
          <!-- Export (PREMIUM) -->
          <button 
            type="button"
            class="btn-secondary flex items-center gap-2"
            [class.opacity-60]="!isPremium()"
            (click)="isPremium() ? exportClients() : showPremiumPrompt('export')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Exporter
            @if (!isPremium()) {
              <span class="badge-premium text-xs">PRO</span>
            }
          </button>
          
          <a routerLink="nouveau" class="btn-primary flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouveau client
          </a>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Total clients</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats()?.totalClients || 0 }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Clients actifs</p>
          <p class="text-2xl font-bold text-success-600">{{ stats()?.clientsActifs || 0 }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Nouveaux ce mois</p>
          <p class="text-2xl font-bold text-primary-600">{{ stats()?.nouveauxClientsMois || 0 }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Entreprises</p>
          <p class="text-2xl font-bold text-info-600">
            {{ getTypeCount('ENTREPRISE') }}
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card p-4">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="filters.search"
                (ngModelChange)="onSearchChange()"
                placeholder="Rechercher par nom, email, téléphone..."
                class="form-input pl-10 w-full"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>

          <!-- Type Filter -->
          <div class="w-full lg:w-48">
            <select [(ngModel)]="filters.type" (ngModelChange)="loadClients()" class="form-input w-full">
              <option value="">Tous les types</option>
              <option value="PARTICULIER">Particuliers</option>
              <option value="ENTREPRISE">Entreprises</option>
            </select>
          </div>

          <!-- Segment Filter -->
          <div class="w-full lg:w-48">
            <select [(ngModel)]="filters.segment" (ngModelChange)="loadClients()" class="form-input w-full">
              <option value="">Tous segments</option>
              <option value="NOUVEAU">Nouveaux</option>
              <option value="REGULIER">Réguliers</option>
              <option value="VIP">VIP</option>
              <option value="INACTIF">Inactifs</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div class="w-full lg:w-36">
            <select [(ngModel)]="filters.actif" (ngModelChange)="loadClients()" class="form-input w-full">
              <option [ngValue]="undefined">Tous</option>
              <option [ngValue]="true">Actifs</option>
              <option [ngValue]="false">Inactifs</option>
            </select>
          </div>

          @if (hasActiveFilters()) {
            <button type="button" (click)="resetFilters()" class="btn-secondary whitespace-nowrap">
              Réinitialiser
            </button>
          }
        </div>
      </div>

      <!-- Table -->
      <div class="card overflow-hidden">
        @if (isLoading()) {
          <div class="p-12">
            <app-loading-spinner size="lg" text="Chargement des clients..." />
          </div>
        } @else if (clients().length === 0) {
          <div class="p-12 text-center">
            <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Aucun client trouvé</h3>
            <p class="mt-2 text-gray-500">
              <a routerLink="nouveau" class="text-primary-600 hover:underline">Ajoutez votre premier client</a>
            </p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="table-header">Client</th>
                  <th class="table-header">Type</th>
                  <th class="table-header">Contact</th>
                  <th class="table-header text-right">Total achats</th>
                  <th class="table-header text-center">Commandes</th>
                  <th class="table-header text-center">Segment</th>
                  <th class="table-header text-center">Statut</th>
                  <th class="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                @for (client of clients(); track client.id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td class="table-cell">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                             [class.bg-primary-100]="client.type === 'PARTICULIER'"
                             [class.bg-info-100]="client.type === 'ENTREPRISE'">
                          <span class="font-semibold"
                                [class.text-primary-600]="client.type === 'PARTICULIER'"
                                [class.text-info-600]="client.type === 'ENTREPRISE'">
                            {{ getInitials(client) }}
                          </span>
                        </div>
                        <div>
                          <a [routerLink]="[client.id]" class="font-medium text-gray-900 dark:text-white hover:text-primary-600">
                            {{ client.type === 'PARTICULIER' ? client.prenom + ' ' + client.nom : client.nom }}
                          </a>
                          <p class="text-sm text-gray-500">{{ client.code }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="table-cell">
                      @if (client.type === 'PARTICULIER') {
                        <span class="badge-primary">Particulier</span>
                      } @else {
                        <span class="badge-info">Entreprise</span>
                      }
                    </td>
                    <td class="table-cell">
                      <div class="text-sm">
                        @if (client.email) {
                          <p class="text-gray-900 dark:text-white">{{ client.email }}</p>
                        }
                        <p class="text-gray-500">{{ client.telephone }}</p>
                      </div>
                    </td>
                    <td class="table-cell text-right font-medium text-gray-900 dark:text-white">
                      {{ client.totalAchats | number:'1.2-2' }} €
                    </td>
                    <td class="table-cell text-center">
                      <span class="font-medium">{{ client.nombreCommandes }}</span>
                    </td>
                    <td class="table-cell text-center">
                      @switch (client.segment) {
                        @case ('VIP') {
                          <span class="badge bg-gradient-to-r from-warning-500 to-warning-600 text-white">VIP</span>
                        }
                        @case ('REGULIER') {
                          <span class="badge-success">Régulier</span>
                        }
                        @case ('NOUVEAU') {
                          <span class="badge-primary">Nouveau</span>
                        }
                        @case ('INACTIF') {
                          <span class="badge-secondary">Inactif</span>
                        }
                        @default {
                          <span class="text-gray-400">—</span>
                        }
                      }
                    </td>
                    <td class="table-cell text-center">
                      @if (client.actif) {
                        <span class="badge-success">Actif</span>
                      } @else {
                        <span class="badge-secondary">Inactif</span>
                      }
                    </td>
                    <td class="table-cell">
                      <div class="flex items-center justify-end gap-1">
                        <a [routerLink]="[client.id]" class="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Voir">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </a>
                        <a [routerLink]="[client.id, 'modifier']" class="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Modifier">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </a>
                        <a [routerLink]="['/commandes/nouveau']" [queryParams]="{ clientId: client.id }" class="p-2 text-gray-500 hover:text-success-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Nouvelle commande">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                          </svg>
                        </a>
                        <button type="button" (click)="confirmDelete(client)" class="p-2 text-gray-500 hover:text-danger-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Supprimer">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Affichage {{ (currentPage() - 1) * pageSize() + 1 }} - {{ Math.min(currentPage() * pageSize(), totalItems()) }} sur {{ totalItems() }}
              </div>
              <div class="flex items-center gap-2">
                <select [ngModel]="pageSize()" (ngModelChange)="onPageSizeChange($event)" class="form-input py-1.5 text-sm">
                  <option [value]="10">10 / page</option>
                  <option [value]="20">20 / page</option>
                  <option [value]="50">50 / page</option>
                </select>
                <div class="flex items-center gap-1">
                  <button type="button" (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 1" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <span class="px-3 py-1 text-sm">Page {{ currentPage() }} / {{ totalPages() }}</span>
                  <button type="button" (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() === totalPages()" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Delete Modal -->
      @if (showDeleteModal()) {
        <div class="fixed inset-0 z-50 overflow-y-auto">
          <div class="fixed inset-0 bg-black/50" (click)="closeDeleteModal()"></div>
          <div class="relative min-h-screen flex items-center justify-center p-4">
            <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 text-center">
              <div class="w-12 h-12 mx-auto bg-danger-100 rounded-full flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Supprimer le client ?</h3>
              <p class="mt-2 text-gray-600 dark:text-gray-400">
                Cette action est irréversible. Toutes les données associées seront perdues.
              </p>
              <div class="flex justify-center gap-3 mt-6">
                <button type="button" class="btn-secondary" (click)="closeDeleteModal()">Annuler</button>
                <button type="button" class="btn-danger" (click)="deleteClient()">Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .table-header { @apply px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider; }
    .table-cell { @apply px-6 py-4 whitespace-nowrap text-sm; }
  `],
})
export class ClientsListComponent implements OnInit {
  private readonly clientsService = inject(ClientsService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  Math = Math;

  clients = signal<Client[]>([]);
  stats = signal<any>(null);
  isLoading = signal(false);
  
  currentPage = signal(1);
  pageSize = signal(20);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  filters: ClientFilters = {};
  private searchTimeout: any;

  showDeleteModal = signal(false);
  clientToDelete = signal<Client | null>(null);

  isPremium = computed(() => this.authService.isPremium());

  ngOnInit(): void {
    this.loadClients();
    this.loadStats();
  }

  loadClients(): void {
    this.isLoading.set(true);
    this.clientsService.getAll(this.currentPage(), this.pageSize(), this.filters).subscribe({
      next: (response) => {
        this.clients.set(response.data);
        this.totalItems.set(response.meta.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notificationService.error('Erreur lors du chargement');
      },
    });
  }

  loadStats(): void {
    this.clientsService.getStats().subscribe({
      next: (stats) => this.stats.set(stats),
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadClients();
    }, 300);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadClients();
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadClients();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.search || this.filters.type || this.filters.segment || this.filters.actif !== undefined);
  }

  resetFilters(): void {
    this.filters = {};
    this.currentPage.set(1);
    this.loadClients();
  }

  getInitials(client: Client): string {
    if (client.type === 'PARTICULIER') {
      return (client.prenom?.charAt(0) || '') + (client.nom?.charAt(0) || '');
    }
    return client.nom?.substring(0, 2).toUpperCase() || '';
  }

  getTypeCount(type: string): number {
    const stats = this.stats();
    if (!stats?.clientsParType) return 0;
    const found = stats.clientsParType.find((t: any) => t.type === type);
    return found?.count || 0;
  }

  confirmDelete(client: Client): void {
    this.clientToDelete.set(client);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.clientToDelete.set(null);
  }

  deleteClient(): void {
    const client = this.clientToDelete();
    if (!client) return;

    this.clientsService.delete(client.id).subscribe({
      next: () => {
        this.notificationService.success('Client supprimé');
        this.closeDeleteModal();
        this.loadClients();
        this.loadStats();
      },
      error: () => this.notificationService.error('Erreur lors de la suppression'),
    });
  }

  exportClients(): void {
    this.clientsService.export('excel', this.filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'clients.xlsx';
        a.click();
        this.notificationService.success('Export réussi');
      },
      error: () => this.notificationService.error('Erreur lors de l\'export'),
    });
  }

  showPremiumPrompt(feature: string): void {
    this.router.navigate(['/premium-requis'], { queryParams: { feature } });
  }
}
