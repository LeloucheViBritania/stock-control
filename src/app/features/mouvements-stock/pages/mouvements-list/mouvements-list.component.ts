/**
 * Liste des mouvements de stock avec nouveau mouvement inline
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MouvementsStockService, MouvementStock, MouvementFilters } from '../../services/mouvements-stock.service';
import { ProduitsService, Produit } from '@features/produits/services/produits.service';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';
import { TypeMouvement, TypeMouvementLabels, TypeMouvementColors } from '@enums/type-mouvement.enum';

@Component({
  selector: 'app-mouvements-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Mouvements de stock</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Historique des entrées et sorties</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Stats (link) -->
          <a routerLink="statistiques" class="btn-secondary flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Statistiques
          </a>

          <!-- Export (PREMIUM) -->
          <button 
            type="button"
            class="btn-secondary flex items-center gap-2"
            [class.opacity-60]="!isPremium()"
            (click)="isPremium() ? exportMouvements() : showPremiumPrompt('export')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            @if (!isPremium()) {
              <span class="badge-premium text-xs">PRO</span>
            }
          </button>
          
          <button type="button" class="btn-primary flex items-center gap-2" (click)="showNouveauMouvement.set(true)">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouveau mouvement
          </button>
        </div>
      </div>

      <!-- Stats rapides -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Entrées aujourd'hui</p>
          <p class="text-2xl font-bold text-success-600">+{{ stats()?.entrees || 0 }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Sorties aujourd'hui</p>
          <p class="text-2xl font-bold text-danger-600">-{{ stats()?.sorties || 0 }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Valeur entrées</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats()?.valeurEntrees || 0 | number:'1.0-0' }} €</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Mouvements ce mois</p>
          <p class="text-2xl font-bold text-primary-600">{{ stats()?.totalMouvements || 0 }}</p>
        </div>
      </div>

      <!-- Nouveau mouvement (inline form) -->
      @if (showNouveauMouvement()) {
        <div class="card p-6 border-2 border-primary-200 dark:border-primary-800">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900 dark:text-white">Nouveau mouvement</h3>
            <button type="button" (click)="showNouveauMouvement.set(false)" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <!-- Type -->
            <div>
              <label class="form-label">Type</label>
              <select [(ngModel)]="nouveauMouvement.type" class="form-input w-full">
                <option value="ENTREE">Entrée</option>
                <option value="SORTIE">Sortie</option>
              </select>
            </div>

            <!-- Produit -->
            <div class="lg:col-span-2 relative">
              <label class="form-label">Produit</label>
              <input
                type="text"
                [(ngModel)]="produitSearch"
                (ngModelChange)="searchProduits()"
                (focus)="showProduitDropdown.set(true)"
                [placeholder]="selectedProduit() ? selectedProduit()?.nom : 'Rechercher un produit...'"
                class="form-input w-full"
              />
              @if (selectedProduit()) {
                <button 
                  type="button" 
                  (click)="clearProduit()" 
                  class="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              }
              
              @if (showProduitDropdown() && produitResults().length > 0) {
                <div class="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-auto">
                  @for (produit of produitResults(); track produit.id) {
                    <button
                      type="button"
                      (click)="selectProduit(produit)"
                      class="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                    >
                      <div>
                        <p class="font-medium text-gray-900 dark:text-white">{{ produit.nom }}</p>
                        <p class="text-xs text-gray-500">{{ produit.reference }} • Stock: {{ produit.quantiteStock }}</p>
                      </div>
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Quantité -->
            <div>
              <label class="form-label">Quantité</label>
              <input type="number" [(ngModel)]="nouveauMouvement.quantite" class="form-input w-full" min="1" />
            </div>

            <!-- Prix unitaire (pour entrées) -->
            @if (nouveauMouvement.type === 'ENTREE') {
              <div>
                <label class="form-label">Prix unitaire</label>
                <input type="number" [(ngModel)]="nouveauMouvement.prixUnitaire" class="form-input w-full" step="0.01" min="0" />
              </div>
            }
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <!-- Motif -->
            <div>
              <label class="form-label">Motif</label>
              <select [(ngModel)]="nouveauMouvement.motif" class="form-input w-full">
                @if (nouveauMouvement.type === 'ENTREE') {
                  <option value="Réception commande">Réception commande</option>
                  <option value="Retour client">Retour client</option>
                  <option value="Correction inventaire">Correction inventaire</option>
                  <option value="Production">Production</option>
                  <option value="Autre">Autre</option>
                } @else {
                  <option value="Vente">Vente</option>
                  <option value="Casse">Casse</option>
                  <option value="Péremption">Péremption</option>
                  <option value="Correction inventaire">Correction inventaire</option>
                  <option value="Don">Don</option>
                  <option value="Autre">Autre</option>
                }
              </select>
            </div>

            <!-- Référence -->
            <div>
              <label class="form-label">Référence (optionnel)</label>
              <input type="text" [(ngModel)]="nouveauMouvement.reference" class="form-input w-full" placeholder="N° BL, commande..." />
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-4">
            <button type="button" class="btn-secondary" (click)="showNouveauMouvement.set(false)">
              Annuler
            </button>
            <button 
              type="button" 
              class="btn-primary"
              [disabled]="!selectedProduit() || !nouveauMouvement.quantite || !nouveauMouvement.motif || isSaving()"
              (click)="enregistrerMouvement()"
            >
              @if (isSaving()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              }
              Enregistrer
            </button>
          </div>
        </div>
      }

      <!-- Filters -->
      <div class="card p-4">
        <div class="flex flex-col lg:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="filters.search"
                (ngModelChange)="onSearchChange()"
                placeholder="Rechercher..."
                class="form-input pl-10 w-full"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>

          <div class="w-full lg:w-40">
            <select [(ngModel)]="filters.type" (ngModelChange)="loadMouvements()" class="form-input w-full">
              <option value="">Tous types</option>
              <option value="ENTREE">Entrées</option>
              <option value="SORTIE">Sorties</option>
              <option value="AJUSTEMENT_POSITIF">Ajustement +</option>
              <option value="AJUSTEMENT_NEGATIF">Ajustement -</option>
              <option value="TRANSFERT_ENTREE">Transfert entrant</option>
              <option value="TRANSFERT_SORTIE">Transfert sortant</option>
            </select>
          </div>

          <div class="w-full lg:w-40">
            <input type="date" [(ngModel)]="filters.dateDebut" (ngModelChange)="loadMouvements()" class="form-input w-full" />
          </div>

          <div class="w-full lg:w-40">
            <input type="date" [(ngModel)]="filters.dateFin" (ngModelChange)="loadMouvements()" class="form-input w-full" />
          </div>

          @if (hasActiveFilters()) {
            <button type="button" (click)="resetFilters()" class="btn-secondary">Réinitialiser</button>
          }
        </div>
      </div>

      <!-- Table -->
      <div class="card overflow-hidden">
        @if (isLoading()) {
          <div class="p-12">
            <app-loading-spinner size="lg" text="Chargement..." />
          </div>
        } @else if (mouvements().length === 0) {
          <div class="p-12 text-center">
            <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Aucun mouvement</h3>
            <button type="button" (click)="showNouveauMouvement.set(true)" class="text-primary-600 hover:underline">
              Créer un mouvement
            </button>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="table-header">Date</th>
                  <th class="table-header">Type</th>
                  <th class="table-header">Produit</th>
                  <th class="table-header text-right">Quantité</th>
                  <th class="table-header text-right">Stock après</th>
                  <th class="table-header">Motif</th>
                  <th class="table-header">Référence</th>
                  <th class="table-header">Utilisateur</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                @for (mouvement of mouvements(); track mouvement.id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td class="table-cell text-gray-600 dark:text-gray-400">
                      {{ mouvement.createdAt | date:'dd/MM/yyyy HH:mm' }}
                    </td>
                    <td class="table-cell">
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [style.background-color]="getTypeColor(mouvement.type) + '20'"
                        [style.color]="getTypeColor(mouvement.type)"
                      >
                        {{ getTypeLabel(mouvement.type) }}
                      </span>
                    </td>
                    <td class="table-cell">
                      @if (mouvement.produit) {
                        <a [routerLink]="['/produits', mouvement.produitId]" class="font-medium text-gray-900 dark:text-white hover:text-primary-600">
                          {{ mouvement.produit.nom }}
                        </a>
                        <p class="text-xs text-gray-500">{{ mouvement.produit.reference }}</p>
                      } @else {
                        <span class="text-gray-400">Produit supprimé</span>
                      }
                    </td>
                    <td class="table-cell text-right">
                      <span 
                        class="font-semibold"
                        [class.text-success-600]="isEntree(mouvement.type)"
                        [class.text-danger-600]="!isEntree(mouvement.type)"
                      >
                        {{ isEntree(mouvement.type) ? '+' : '-' }}{{ mouvement.quantite }}
                      </span>
                      <span class="text-gray-500 text-sm ml-1">{{ mouvement.produit?.unite }}</span>
                    </td>
                    <td class="table-cell text-right font-medium text-gray-900 dark:text-white">
                      {{ mouvement.quantiteApres }}
                    </td>
                    <td class="table-cell text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {{ mouvement.motif }}
                    </td>
                    <td class="table-cell">
                      @if (mouvement.reference) {
                        <span class="font-mono text-sm text-gray-600">{{ mouvement.reference }}</span>
                      } @else if (mouvement.commandeId) {
                        <a [routerLink]="['/commandes', mouvement.commandeId]" class="text-primary-600 hover:underline text-sm">
                          {{ mouvement.commande?.numero }}
                        </a>
                      } @else {
                        <span class="text-gray-400">—</span>
                      }
                    </td>
                    <td class="table-cell text-gray-600 dark:text-gray-400">
                      @if (mouvement.createdBy) {
                        {{ mouvement.createdBy.prenom }} {{ mouvement.createdBy.nom }}
                      } @else {
                        <span class="text-gray-400">Système</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-600">
                {{ (currentPage() - 1) * pageSize() + 1 }} - {{ Math.min(currentPage() * pageSize(), totalItems()) }} sur {{ totalItems() }}
              </div>
              <div class="flex items-center gap-2">
                <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 1" class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <span class="px-3 text-sm">Page {{ currentPage() }} / {{ totalPages() }}</span>
                <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() === totalPages()" class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .table-header { @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider; }
    .table-cell { @apply px-6 py-4 whitespace-nowrap text-sm; }
  `],
})
export class MouvementsListComponent implements OnInit {
  private readonly mouvementsService = inject(MouvementsStockService);
  private readonly produitsService = inject(ProduitsService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  Math = Math;

  mouvements = signal<MouvementStock[]>([]);
  stats = signal<any>(null);
  isLoading = signal(false);
  isSaving = signal(false);

  currentPage = signal(1);
  pageSize = signal(20);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  filters: MouvementFilters = {};
  private searchTimeout: any;

  // Nouveau mouvement
  showNouveauMouvement = signal(false);
  selectedProduit = signal<Produit | null>(null);
  produitSearch = '';
  produitResults = signal<Produit[]>([]);
  showProduitDropdown = signal(false);
  private produitSearchTimeout: any;

  nouveauMouvement = {
    type: 'ENTREE' as 'ENTREE' | 'SORTIE',
    quantite: 1,
    prixUnitaire: 0,
    motif: 'Réception commande',
    reference: '',
  };

  isPremium = computed(() => this.authService.isPremium());

  ngOnInit(): void {
    // Check for produitId filter
    const produitId = this.route.snapshot.queryParams['produitId'];
    if (produitId) {
      this.filters.produitId = produitId;
    }
    
    this.loadMouvements();
    this.loadStats();

    document.addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).closest('.relative')) {
        this.showProduitDropdown.set(false);
      }
    });
  }

  loadMouvements(): void {
    this.isLoading.set(true);
    this.mouvementsService.getAll(this.currentPage(), this.pageSize(), this.filters).subscribe({
      next: (response) => {
        this.mouvements.set(response.data);
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
    this.mouvementsService.getStats('mois').subscribe({
      next: (stats) => this.stats.set(stats),
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadMouvements();
    }, 300);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadMouvements();
    }
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.search || this.filters.type || this.filters.dateDebut || this.filters.dateFin);
  }

  resetFilters(): void {
    this.filters = {};
    this.currentPage.set(1);
    this.loadMouvements();
  }

  getTypeLabel(type: TypeMouvement): string {
    return TypeMouvementLabels[type] || type;
  }

  getTypeColor(type: TypeMouvement): string {
    return TypeMouvementColors[type] || '#6b7280';
  }

  isEntree(type: TypeMouvement): boolean {
    return type === TypeMouvement.ENTREE || type === TypeMouvement.AJUSTEMENT_POSITIF || type === TypeMouvement.TRANSFERT_ENTRANT || type === TypeMouvement.INVENTAIRE;
  }

  // Recherche produit
  searchProduits(): void {
    clearTimeout(this.produitSearchTimeout);
    if (!this.produitSearch) {
      this.produitResults.set([]);
      return;
    }
    this.produitSearchTimeout = setTimeout(() => {
      this.produitsService.search(this.produitSearch, 10).subscribe({
        next: (produits) => this.produitResults.set(produits),
      });
    }, 200);
  }

  selectProduit(produit: Produit): void {
    this.selectedProduit.set(produit);
    this.produitSearch = '';
    this.produitResults.set([]);
    this.showProduitDropdown.set(false);
    // Pré-remplir le prix d'achat
    this.nouveauMouvement.prixUnitaire = produit.prixAchat;
  }

  clearProduit(): void {
    this.selectedProduit.set(null);
    this.produitSearch = '';
  }

  enregistrerMouvement(): void {
    const produit = this.selectedProduit();
    if (!produit) return;

    this.isSaving.set(true);

    const data = {
      produitId: produit.id,
      quantite: this.nouveauMouvement.quantite,
      prixUnitaire: this.nouveauMouvement.prixUnitaire,
      motif: this.nouveauMouvement.motif,
      reference: this.nouveauMouvement.reference || undefined,
    };

    const save$ = this.nouveauMouvement.type === 'ENTREE'
      ? this.mouvementsService.creerEntree(data)
      : this.mouvementsService.creerSortie(data);

    save$.subscribe({
      next: () => {
        this.notificationService.success('Mouvement enregistré');
        this.showNouveauMouvement.set(false);
        this.clearProduit();
        this.nouveauMouvement = { type: 'ENTREE', quantite: 1, prixUnitaire: 0, motif: 'Réception commande', reference: '' };
        this.isSaving.set(false);
        this.loadMouvements();
        this.loadStats();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.notificationService.error(err.error?.message || 'Erreur');
      },
    });
  }

  exportMouvements(): void {
    this.mouvementsService.export('excel', this.filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mouvements-stock.xlsx';
        a.click();
        this.notificationService.success('Export réussi');
      },
      error: () => this.notificationService.error('Erreur'),
    });
  }

  showPremiumPrompt(feature: string): void {
    this.router.navigate(['/premium-requis'], { queryParams: { feature } });
  }
}
