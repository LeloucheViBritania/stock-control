/**
 * Détail d'un produit avec historique et actions
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProduitsService, Produit } from '../../services/produits.service';
import { MouvementsStockService, MouvementStock } from '@features/mouvements-stock/services/mouvements-stock.service';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';
import { TypeMouvementLabels, TypeMouvementColors } from '@enums/type-mouvement.enum';

@Component({
  selector: 'app-produit-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      @if (isLoading()) {
        <div class="card p-12">
          <app-loading-spinner size="lg" text="Chargement du produit..." />
        </div>
      } @else if (produit()) {
        <!-- Header -->
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div class="flex items-start gap-4">
            <a routerLink="/produits" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors mt-1">
              <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </a>
            
            <div class="flex items-start gap-4">
              <!-- Image -->
              @if (produit()?.image) {
                <img [src]="produit()?.image" [alt]="produit()?.nom" class="w-20 h-20 rounded-xl object-cover" />
              } @else {
                <div class="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                  <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                </div>
              }
              
              <div>
                <div class="flex items-center gap-3">
                  <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ produit()?.nom }}</h1>
                  @if (produit()?.actif) {
                    <span class="badge-success">Actif</span>
                  } @else {
                    <span class="badge-secondary">Inactif</span>
                  }
                </div>
                <p class="text-gray-600 dark:text-gray-400 mt-1">
                  <span class="font-mono">{{ produit()?.reference }}</span>
                  @if (produit()?.codeBarres) {
                    <span class="mx-2">•</span>
                    <span class="font-mono text-sm">{{ produit()?.codeBarres }}</span>
                  }
                </p>
                @if (produit()?.categorie) {
                  <span 
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2"
                    [style.background-color]="produit()?.categorie?.couleur + '20'"
                    [style.color]="produit()?.categorie?.couleur"
                  >
                    {{ produit()?.categorie?.nom }}
                  </span>
                }
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button 
              type="button"
              class="btn-secondary"
              (click)="openStockModal()"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
              Ajuster stock
            </button>
            <a [routerLink]="['modifier']" class="btn-primary">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Modifier
            </a>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Stock -->
          <div class="card p-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">Stock actuel</p>
            <p 
              class="text-2xl font-bold mt-1"
              [class.text-danger-600]="produit()!.quantiteStock <= produit()!.seuilCritique"
              [class.text-warning-600]="produit()!.quantiteStock > produit()!.seuilCritique && produit()!.quantiteStock <= produit()!.seuilAlerte"
              [class.text-gray-900]="produit()!.quantiteStock > produit()!.seuilAlerte"
              [class.dark:text-white]="produit()!.quantiteStock > produit()!.seuilAlerte"
            >
              {{ produit()?.quantiteStock }} {{ produit()?.unite }}
            </p>
            @if (produit()!.quantiteStock <= produit()!.seuilCritique) {
              <span class="badge-danger text-xs mt-1">Stock critique</span>
            } @else if (produit()!.quantiteStock <= produit()!.seuilAlerte) {
              <span class="badge-warning text-xs mt-1">Stock faible</span>
            }
          </div>

          <!-- Prix d'achat -->
          <div class="card p-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">Prix d'achat HT</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ produit()?.prixAchat | number:'1.2-2' }} €
            </p>
          </div>

          <!-- Prix de vente -->
          <div class="card p-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">Prix de vente HT</p>
            <p class="text-2xl font-bold text-primary-600 mt-1">
              {{ produit()?.prixVente | number:'1.2-2' }} €
            </p>
            <p class="text-sm text-gray-500 mt-1">
              TTC: {{ (produit()!.prixVente * (1 + produit()!.tva / 100)) | number:'1.2-2' }} €
            </p>
          </div>

          <!-- Valeur en stock -->
          <div class="card p-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">Valeur en stock</p>
            <p class="text-2xl font-bold text-success-600 mt-1">
              {{ (produit()!.quantiteStock * produit()!.prixAchat) | number:'1.2-2' }} €
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Informations -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Description -->
            @if (produit()?.description) {
              <div class="card p-6">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
                <p class="text-gray-600 dark:text-gray-400">{{ produit()?.description }}</p>
              </div>
            }

            <!-- Historique des mouvements -->
            <div class="card p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-900 dark:text-white">Historique des mouvements</h3>
                <a routerLink="/mouvements-stock" [queryParams]="{ produitId: produit()?.id }" class="text-sm text-primary-600 hover:underline">
                  Voir tout
                </a>
              </div>

              @if (mouvements().length === 0) {
                <p class="text-gray-500 text-center py-8">Aucun mouvement enregistré</p>
              } @else {
                <div class="space-y-3">
                  @for (mouvement of mouvements(); track mouvement.id) {
                    <div class="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div 
                        class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        [class.bg-success-100]="mouvement.type.includes('ENTREE') || mouvement.type.includes('POSITIF')"
                        [class.bg-danger-100]="mouvement.type.includes('SORTIE') || mouvement.type.includes('NEGATIF')"
                        [class.bg-primary-100]="mouvement.type.includes('TRANSFERT') || mouvement.type === 'INVENTAIRE'"
                      >
                        @if (mouvement.type.includes('ENTREE') || mouvement.type.includes('POSITIF')) {
                          <svg class="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                          </svg>
                        } @else if (mouvement.type.includes('SORTIE') || mouvement.type.includes('NEGATIF')) {
                          <svg class="w-5 h-5 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                          </svg>
                        } @else {
                          <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                          </svg>
                        }
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="font-medium text-gray-900 dark:text-white">
                            {{ getTypeLabel(mouvement.type) }}
                          </span>
                          <span 
                            class="font-semibold"
                            [class.text-success-600]="mouvement.type.includes('ENTREE') || mouvement.type.includes('POSITIF')"
                            [class.text-danger-600]="mouvement.type.includes('SORTIE') || mouvement.type.includes('NEGATIF')"
                          >
                            {{ mouvement.type.includes('SORTIE') || mouvement.type.includes('NEGATIF') ? '-' : '+' }}{{ mouvement.quantite }}
                          </span>
                        </div>
                        <p class="text-sm text-gray-500 truncate">{{ mouvement.motif }}</p>
                      </div>
                      <div class="text-right text-sm">
                        <p class="text-gray-900 dark:text-white">{{ mouvement.quantiteApres }} {{ produit()?.unite }}</p>
                        <p class="text-gray-500">{{ mouvement.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Graphique évolution stock (PREMIUM teaser) -->
            <div class="card p-6 relative overflow-hidden">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Évolution du stock</h3>
              
              @if (!isPremium()) {
                <div class="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-800 via-white/80 dark:via-gray-800/80 to-transparent flex items-end justify-center pb-6 z-10">
                  <div class="text-center">
                    <span class="badge-premium mb-2">Premium</span>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Graphiques d'évolution et analyses avancées
                    </p>
                    <a routerLink="/abonnement" class="btn-sm bg-gradient-to-r from-warning-500 to-warning-600 text-white">
                      Débloquer
                    </a>
                  </div>
                </div>
              }
              
              <!-- Placeholder graphique -->
              <div class="h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <svg class="w-16 h-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Détails -->
            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Détails</h3>
              <dl class="space-y-3">
                <div class="flex justify-between">
                  <dt class="text-gray-600 dark:text-gray-400">TVA</dt>
                  <dd class="font-medium text-gray-900 dark:text-white">{{ produit()?.tva }}%</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600 dark:text-gray-400">Seuil alerte</dt>
                  <dd class="font-medium text-warning-600">{{ produit()?.seuilAlerte }} {{ produit()?.unite }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600 dark:text-gray-400">Seuil critique</dt>
                  <dd class="font-medium text-danger-600">{{ produit()?.seuilCritique }} {{ produit()?.unite }}</dd>
                </div>
                @if (produit()?.emplacement) {
                  <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Emplacement</dt>
                    <dd class="font-medium text-gray-900 dark:text-white">{{ produit()?.emplacement }}</dd>
                  </div>
                }
                <div class="flex justify-between">
                  <dt class="text-gray-600 dark:text-gray-400">Créé le</dt>
                  <dd class="font-medium text-gray-900 dark:text-white">{{ produit()?.createdAt | date:'dd/MM/yyyy' }}</dd>
                </div>
              </dl>
            </div>

            <!-- Fournisseur -->
            @if (produit()?.fournisseurPrincipal) {
              <div class="card p-6">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Fournisseur principal</h3>
                <a 
                  [routerLink]="['/fournisseurs', produit()?.fournisseurPrincipal?.id]"
                  class="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 -m-2 rounded-lg transition-colors"
                >
                  <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <span class="text-primary-600 font-semibold">
                      {{ produit()?.fournisseurPrincipal?.nom?.charAt(0) }}
                    </span>
                  </div>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ produit()?.fournisseurPrincipal?.nom }}
                  </span>
                </a>
              </div>
            }

            <!-- Entrepôt (PREMIUM) -->
            <div class="card p-6 relative">
              @if (!isPremium()) {
                <div class="absolute top-4 right-4">
                  <span class="badge-premium text-xs">PRO</span>
                </div>
              }
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Entrepôt</h3>
              @if (isPremium() && produit()?.entrepot) {
                <p class="text-gray-900 dark:text-white">{{ produit()?.entrepot?.nom }}</p>
              } @else {
                <p class="text-gray-500">Entrepôt principal</p>
                @if (!isPremium()) {
                  <a routerLink="/abonnement" class="text-sm text-primary-600 hover:underline mt-2 inline-block">
                    Multi-entrepôts avec Premium →
                  </a>
                }
              }
            </div>

            <!-- Actions rapides -->
            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
              <div class="space-y-2">
                <button 
                  type="button"
                  class="w-full btn-secondary justify-start"
                  (click)="duplicateProduit()"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  Dupliquer
                </button>
                <button 
                  type="button"
                  class="w-full btn-secondary justify-start text-danger-600 hover:bg-danger-50"
                  (click)="confirmDelete()"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Stock Modal -->
      @if (showStockModal()) {
        <div class="fixed inset-0 z-50 overflow-y-auto">
          <div class="fixed inset-0 bg-black/50" (click)="closeStockModal()"></div>
          <div class="relative min-h-screen flex items-center justify-center p-4">
            <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ajuster le stock
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Stock actuel: <span class="font-semibold">{{ produit()?.quantiteStock }} {{ produit()?.unite }}</span>
              </p>
              
              <div class="space-y-4">
                <div>
                  <label class="form-label">Type de mouvement</label>
                  <select [(ngModel)]="stockMovement.type" class="form-input w-full">
                    <option value="ENTREE">Entrée</option>
                    <option value="SORTIE">Sortie</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Quantité</label>
                  <input type="number" [(ngModel)]="stockMovement.quantite" class="form-input w-full" min="1" />
                </div>
                <div>
                  <label class="form-label">Motif</label>
                  <textarea [(ngModel)]="stockMovement.motif" class="form-input w-full" rows="2"></textarea>
                </div>
              </div>

              <div class="flex justify-end gap-3 mt-6">
                <button type="button" class="btn-secondary" (click)="closeStockModal()">Annuler</button>
                <button 
                  type="button" 
                  class="btn-primary"
                  [disabled]="!stockMovement.quantite || !stockMovement.motif"
                  (click)="saveStockMovement()"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ProduitDetailComponent implements OnInit {
  private readonly produitsService = inject(ProduitsService);
  private readonly mouvementsService = inject(MouvementsStockService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // State
  produit = signal<Produit | null>(null);
  mouvements = signal<MouvementStock[]>([]);
  isLoading = signal(true);
  showStockModal = signal(false);

  stockMovement = {
    type: 'ENTREE' as 'ENTREE' | 'SORTIE',
    quantite: 1,
    motif: '',
  };

  // Labels
  typeLabels = TypeMouvementLabels;

  // Computed
  isPremium = computed(() => this.authService.isPremium());

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadProduit(id);
      this.loadMouvements(id);
    }
  }

  loadProduit(id: string): void {
    this.produitsService.getById(id).subscribe({
      next: (produit) => {
        this.produit.set(produit);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.error('Produit non trouvé');
        this.router.navigate(['/produits']);
      },
    });
  }

  loadMouvements(id: string): void {
    this.mouvementsService.getByProduit(id, 1, 10).subscribe({
      next: (response) => {
        this.mouvements.set(response.data);
      },
    });
  }

  getTypeLabel(type: string): string {
    return this.typeLabels[type as keyof typeof this.typeLabels] || type;
  }

  openStockModal(): void {
    this.stockMovement = { type: 'ENTREE', quantite: 1, motif: '' };
    this.showStockModal.set(true);
  }

  closeStockModal(): void {
    this.showStockModal.set(false);
  }

  saveStockMovement(): void {
    const produit = this.produit();
    if (!produit) return;

    const service$ = this.stockMovement.type === 'ENTREE'
      ? this.mouvementsService.creerEntree({
          produitId: produit.id,
          quantite: this.stockMovement.quantite,
          motif: this.stockMovement.motif,
        })
      : this.mouvementsService.creerSortie({
          produitId: produit.id,
          quantite: this.stockMovement.quantite,
          motif: this.stockMovement.motif,
        });

    service$.subscribe({
      next: () => {
        this.notificationService.success('Stock mis à jour');
        this.closeStockModal();
        this.loadProduit(produit.id);
        this.loadMouvements(produit.id);
      },
      error: () => {
        this.notificationService.error('Erreur lors de la mise à jour');
      },
    });
  }

  duplicateProduit(): void {
    // Navigate to form with copy data
    this.notificationService.info('Fonctionnalité en cours de développement');
  }

  confirmDelete(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.produitsService.delete(this.produit()!.id).subscribe({
        next: () => {
          this.notificationService.success('Produit supprimé');
          this.router.navigate(['/produits']);
        },
        error: () => {
          this.notificationService.error('Erreur lors de la suppression');
        },
      });
    }
  }
}
