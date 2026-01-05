/**
 * Liste des entrepôts (PREMIUM)
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EntrepotsService, Entrepot, EntrepotFilters } from '../../services/entrepots.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-entrepots-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Entrepôts</h1>
            <span class="badge-premium">Premium</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            {{ totalItems() }} entrepôt{{ totalItems() > 1 ? 's' : '' }}
          </p>
        </div>
        <a routerLink="nouveau" class="btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nouvel entrepôt
        </a>
      </div>

      <!-- Stats globales -->
      @if (globalStats()) {
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div class="card p-4">
            <p class="text-sm text-gray-500">Total entrepôts</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ globalStats()?.totalEntrepots }}</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-500">Capacité totale</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ globalStats()?.capaciteTotale | number }}</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-500">Taux remplissage</p>
            <p class="text-2xl font-bold" [class]="getTauxColor(tauxGlobal())">{{ tauxGlobal() | number:'1.1-1' }}%</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-500">Valeur stock</p>
            <p class="text-2xl font-bold text-primary-600">{{ globalStats()?.valeurTotaleStock | number:'1.0-0' }} €</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-500">Produits stockés</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ globalStats()?.nombreProduitsTotal | number }}</p>
          </div>
        </div>
      }

      <!-- Filtres -->
      <div class="card p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex-1 min-w-[200px]">
            <input 
              type="text" 
              [(ngModel)]="filters.search"
              (ngModelChange)="onFilterChange()"
              placeholder="Rechercher un entrepôt..." 
              class="form-input w-full"
            />
          </div>
          <select [(ngModel)]="filters.type" (ngModelChange)="onFilterChange()" class="form-input w-auto">
            <option value="">Tous les types</option>
            <option value="PRINCIPAL">Principal</option>
            <option value="SECONDAIRE">Secondaire</option>
            <option value="TRANSIT">Transit</option>
            <option value="RESERVE">Réserve</option>
          </select>
          <select [(ngModel)]="filters.statut" (ngModelChange)="onFilterChange()" class="form-input w-auto">
            <option value="">Tous les statuts</option>
            <option value="ACTIF">Actif</option>
            <option value="INACTIF">Inactif</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
          @if (filters.search || filters.type || filters.statut) {
            <button type="button" class="text-sm text-primary-600 hover:underline" (click)="resetFilters()">
              Réinitialiser
            </button>
          }
        </div>
      </div>

      <!-- Liste -->
      @if (isLoading()) {
        <div class="card p-12">
          <app-loading-spinner size="lg" text="Chargement des entrepôts..." />
        </div>
      } @else if (!entrepots().length) {
        <div class="card p-12 text-center">
          <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Aucun entrepôt</h3>
          <p class="text-gray-500 mt-1">Commencez par créer votre premier entrepôt</p>
          <a routerLink="nouveau" class="btn-primary mt-4">Créer un entrepôt</a>
        </div>
      } @else {
        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          @for (entrepot of entrepots(); track entrepot.id) {
            <div class="card overflow-hidden hover:shadow-lg transition-shadow">
              <!-- Header avec statut -->
              <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-3">
                    <div 
                      class="w-12 h-12 rounded-lg flex items-center justify-center"
                      [ngClass]="{
                        'bg-primary-100 text-primary-600': entrepot.type === 'PRINCIPAL',
                        'bg-info-100 text-info-600': entrepot.type === 'SECONDAIRE',
                        'bg-warning-100 text-warning-600': entrepot.type === 'TRANSIT',
                        'bg-gray-100 text-gray-600': entrepot.type === 'RESERVE'
                      }"
                    >
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900 dark:text-white">{{ entrepot.nom }}</h3>
                      <p class="text-sm text-gray-500">{{ entrepot.code }}</p>
                    </div>
                  </div>
                  <span 
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    [ngClass]="{
                      'bg-success-100 text-success-700': entrepot.statut === 'ACTIF',
                      'bg-gray-100 text-gray-700': entrepot.statut === 'INACTIF',
                      'bg-warning-100 text-warning-700': entrepot.statut === 'MAINTENANCE'
                    }"
                  >
                    {{ getStatutLabel(entrepot.statut) }}
                  </span>
                </div>
              </div>

              <!-- Contenu -->
              <div class="p-4 space-y-4">
                <!-- Adresse -->
                <div class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span>{{ entrepot.adresse }}, {{ entrepot.ville }}</span>
                </div>

                <!-- Capacité -->
                <div>
                  <div class="flex items-center justify-between text-sm mb-1">
                    <span class="text-gray-500">Capacité</span>
                    <span class="font-medium">{{ entrepot.capaciteUtilisee | number }} / {{ entrepot.capaciteMax | number }}</span>
                  </div>
                  <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      class="h-full rounded-full transition-all"
                      [style.width.%]="(entrepot.capaciteUtilisee / entrepot.capaciteMax) * 100"
                      [ngClass]="{
                        'bg-success-500': (entrepot.capaciteUtilisee / entrepot.capaciteMax) < 0.7,
                        'bg-warning-500': (entrepot.capaciteUtilisee / entrepot.capaciteMax) >= 0.7 && (entrepot.capaciteUtilisee / entrepot.capaciteMax) < 0.9,
                        'bg-danger-500': (entrepot.capaciteUtilisee / entrepot.capaciteMax) >= 0.9
                      }"
                    ></div>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ ((entrepot.capaciteUtilisee / entrepot.capaciteMax) * 100) | number:'1.1-1' }}% utilisé
                  </p>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p class="text-xs text-gray-500">Produits</p>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ entrepot.nombreProduits | number }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">Valeur stock</p>
                    <p class="font-semibold text-primary-600">{{ entrepot.valeurStock | number:'1.0-0' }} €</p>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span class="text-xs text-gray-500">{{ getTypeLabel(entrepot.type) }}</span>
                <div class="flex items-center gap-2">
                  <a 
                    [routerLink]="[entrepot.id]" 
                    class="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    title="Voir détails"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </a>
                  <a 
                    [routerLink]="[entrepot.id, 'modifier']" 
                    class="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    title="Modifier"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-center gap-2 mt-6">
            <button 
              type="button" 
              class="btn-secondary btn-sm"
              [disabled]="currentPage() === 1"
              (click)="goToPage(currentPage() - 1)"
            >
              Précédent
            </button>
            <span class="px-4 text-sm text-gray-600">
              Page {{ currentPage() }} sur {{ totalPages() }}
            </span>
            <button 
              type="button" 
              class="btn-secondary btn-sm"
              [disabled]="currentPage() === totalPages()"
              (click)="goToPage(currentPage() + 1)"
            >
              Suivant
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class EntrepotsListComponent implements OnInit {
  private readonly entrepotsService = inject(EntrepotsService);
  private readonly notificationService = inject(NotificationService);

  entrepots = signal<Entrepot[]>([]);
  globalStats = signal<any>(null);
  isLoading = signal(true);
  currentPage = signal(1);
  pageSize = signal(12);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  filters: EntrepotFilters = {};
  private searchTimeout: any;

  tauxGlobal = computed(() => {
    const stats = this.globalStats();
    if (!stats || !stats.capaciteTotale) return 0;
    return (stats.capaciteUtilisee / stats.capaciteTotale) * 100;
  });

  ngOnInit(): void {
    this.loadEntrepots();
    this.loadGlobalStats();
  }

  loadEntrepots(): void {
    this.isLoading.set(true);
    this.entrepotsService.getAll(this.currentPage(), this.pageSize(), this.filters).subscribe({
      next: (response) => {
        this.entrepots.set(response.data);
        this.totalItems.set(response.meta.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        // Mock data for demo
        this.entrepots.set([
          { id: '1', code: 'ENT-001', nom: 'Entrepôt Principal Paris', adresse: '123 Rue de la Logistique', ville: 'Paris', pays: 'France', type: 'PRINCIPAL', statut: 'ACTIF', capaciteMax: 10000, capaciteUtilisee: 7500, nombreProduits: 1250, valeurStock: 450000, createdAt: new Date(), updatedAt: new Date() },
          { id: '2', code: 'ENT-002', nom: 'Entrepôt Lyon', adresse: '45 Avenue du Commerce', ville: 'Lyon', pays: 'France', type: 'SECONDAIRE', statut: 'ACTIF', capaciteMax: 5000, capaciteUtilisee: 3200, nombreProduits: 650, valeurStock: 180000, createdAt: new Date(), updatedAt: new Date() },
          { id: '3', code: 'ENT-003', nom: 'Zone Transit Marseille', adresse: '78 Port de Marseille', ville: 'Marseille', pays: 'France', type: 'TRANSIT', statut: 'ACTIF', capaciteMax: 2000, capaciteUtilisee: 1800, nombreProduits: 320, valeurStock: 95000, createdAt: new Date(), updatedAt: new Date() },
          { id: '4', code: 'ENT-004', nom: 'Réserve Bordeaux', adresse: '12 Zone Industrielle', ville: 'Bordeaux', pays: 'France', type: 'RESERVE', statut: 'MAINTENANCE', capaciteMax: 3000, capaciteUtilisee: 500, nombreProduits: 150, valeurStock: 45000, createdAt: new Date(), updatedAt: new Date() },
        ] as Entrepot[]);
        this.totalItems.set(4);
      },
    });
  }

  loadGlobalStats(): void {
    this.entrepotsService.getGlobalStats().subscribe({
      next: (stats) => this.globalStats.set(stats),
      error: () => {
        this.globalStats.set({
          totalEntrepots: 4,
          capaciteTotale: 20000,
          capaciteUtilisee: 13000,
          valeurTotaleStock: 770000,
          nombreProduitsTotal: 2370,
        });
      },
    });
  }

  onFilterChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadEntrepots();
    }, 300);
  }

  resetFilters(): void {
    this.filters = {};
    this.currentPage.set(1);
    this.loadEntrepots();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadEntrepots();
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'ACTIF': 'Actif',
      'INACTIF': 'Inactif',
      'MAINTENANCE': 'Maintenance',
    };
    return labels[statut] || statut;
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'PRINCIPAL': 'Entrepôt principal',
      'SECONDAIRE': 'Entrepôt secondaire',
      'TRANSIT': 'Zone de transit',
      'RESERVE': 'Réserve',
    };
    return labels[type] || type;
  }

  getTauxColor(taux: number): string {
    if (taux < 70) return 'text-success-600';
    if (taux < 90) return 'text-warning-600';
    return 'text-danger-600';
  }
}
