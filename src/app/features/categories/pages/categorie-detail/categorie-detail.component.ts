/**
 * Détail d'une catégorie avec ses produits
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CategoriesService, Categorie } from '../../services/categories.service';
import { ProduitsService, Produit } from '@features/produits/services/produits.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-categorie-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      @if (isLoading()) {
        <div class="card p-12">
          <app-loading-spinner size="lg" text="Chargement..." />
        </div>
      } @else if (categorie()) {
        <!-- Header -->
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div class="flex items-start gap-4">
            <a routerLink="/categories" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mt-1">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </a>
            
            <div class="flex items-start gap-4">
              <div 
                class="w-16 h-16 rounded-xl flex items-center justify-center"
                [style.background-color]="(categorie()?.couleur || '#3b82f6') + '20'"
              >
                @if (categorie()?.icone) {
                  <span class="text-3xl">{{ categorie()?.icone }}</span>
                } @else {
                  <svg class="w-8 h-8" [style.color]="categorie()?.couleur || '#3b82f6'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                }
              </div>
              
              <div>
                <div class="flex items-center gap-3">
                  <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ categorie()?.nom }}
                  </h1>
                  @if (categorie()?.actif) {
                    <span class="badge-success">Active</span>
                  } @else {
                    <span class="badge-secondary">Inactive</span>
                  }
                </div>
                
                @if (categorie()?.parent) {
                  <p class="text-gray-600 dark:text-gray-400 mt-1">
                    dans <a [routerLink]="['/categories', categorie()?.parentId]" class="text-primary-600 hover:underline">{{ categorie()?.parent?.nom }}</a>
                  </p>
                }
                
                @if (categorie()?.description) {
                  <p class="text-gray-600 dark:text-gray-400 mt-2">{{ categorie()?.description }}</p>
                }
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <a [routerLink]="['modifier']" class="btn-primary flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Modifier
            </a>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card p-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">Produits</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ categorie()?.nombreProduits || 0 }}</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">Sous-catégories</p>
            <p class="text-2xl font-bold text-primary-600">{{ categorie()?.enfants?.length || 0 }}</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">Stock total</p>
            <p class="text-2xl font-bold text-success-600">{{ totalStock() }}</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">Valeur stock</p>
            <p class="text-2xl font-bold text-info-600">{{ categorie()?.valeurStock || 0 | number:'1.0-0' }} €</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Produits -->
          <div class="lg:col-span-2 space-y-6">
            <div class="card overflow-hidden">
              <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  Produits ({{ produits().length }})
                </h3>
                <a [routerLink]="['/produits/nouveau']" [queryParams]="{ categorieId: categorie()?.id }" class="btn-secondary btn-sm">
                  + Ajouter un produit
                </a>
              </div>

              @if (produits().length === 0) {
                <div class="p-12 text-center">
                  <svg class="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  <p class="mt-4 text-gray-500">Aucun produit dans cette catégorie</p>
                </div>
              } @else {
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prix</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                      @for (produit of produits(); track produit.id) {
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td class="px-6 py-4">
                            <a [routerLink]="['/produits', produit.id]" class="font-medium text-gray-900 dark:text-white hover:text-primary-600">
                              {{ produit.nom }}
                            </a>
                            <p class="text-sm text-gray-500">{{ produit.reference }}</p>
                          </td>
                          <td class="px-6 py-4 text-right">
                            <span 
                              class="font-medium"
                              [class.text-success-600]="produit.quantiteStock > produit.seuilAlerte"
                              [class.text-warning-600]="produit.quantiteStock <= produit.seuilAlerte && produit.quantiteStock > produit.seuilCritique"
                              [class.text-danger-600]="produit.quantiteStock <= produit.seuilCritique"
                            >
                              {{ produit.quantiteStock }}
                            </span>
                            <span class="text-sm text-gray-500 ml-1">{{ produit.unite }}</span>
                          </td>
                          <td class="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                            {{ produit.prixVente | number:'1.2-2' }} €
                          </td>
                          <td class="px-6 py-4 text-center">
                            @if (produit.actif) {
                              <span class="badge-success">Actif</span>
                            } @else {
                              <span class="badge-secondary">Inactif</span>
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Sous-catégories -->
            @if (categorie()?.enfants?.length) {
              <div class="card p-6">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Sous-catégories</h3>
                <div class="space-y-2">
                  @for (enfant of categorie()?.enfants; track enfant.id) {
                    <a 
                      [routerLink]="['/categories', enfant.id]" 
                      class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div class="flex items-center gap-3">
                        <div 
                          class="w-8 h-8 rounded-lg flex items-center justify-center"
                          [style.background-color]="(enfant.couleur || '#3b82f6') + '20'"
                        >
                          @if (enfant.icone) {
                            <span>{{ enfant.icone }}</span>
                          } @else {
                            <svg class="w-4 h-4" [style.color]="enfant.couleur || '#3b82f6'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                            </svg>
                          }
                        </div>
                        <span class="font-medium text-gray-900 dark:text-white">{{ enfant.nom }}</span>
                      </div>
                      <span class="text-sm text-gray-500">{{ enfant.nombreProduits || 0 }}</span>
                    </a>
                  }
                </div>
              </div>
            }

            <!-- Informations -->
            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Informations</h3>
              <dl class="space-y-3">
                <div class="flex justify-between">
                  <dt class="text-gray-600 dark:text-gray-400">Ordre d'affichage</dt>
                  <dd class="font-medium text-gray-900 dark:text-white">{{ categorie()?.ordre }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600 dark:text-gray-400">Couleur</dt>
                  <dd class="flex items-center gap-2">
                    <span class="w-4 h-4 rounded" [style.background-color]="categorie()?.couleur"></span>
                    <span class="font-mono text-sm text-gray-700 dark:text-gray-300">{{ categorie()?.couleur }}</span>
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600 dark:text-gray-400">Créée le</dt>
                  <dd class="text-gray-900 dark:text-white">{{ categorie()?.createdAt | date:'dd/MM/yyyy' }}</dd>
                </div>
              </dl>
            </div>

            <!-- Actions -->
            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
              <div class="space-y-2">
                <a 
                  [routerLink]="['/categories/nouveau']" 
                  [queryParams]="{ parentId: categorie()?.id }"
                  class="w-full btn-secondary justify-start"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Ajouter sous-catégorie
                </a>
                <button 
                  type="button" 
                  class="w-full btn-secondary justify-start text-danger-600 hover:bg-danger-50"
                  (click)="confirmDelete()"
                  [disabled]="(categorie()?.nombreProduits || 0) > 0"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Supprimer
                </button>
                @if ((categorie()?.nombreProduits || 0) > 0) {
                  <p class="text-xs text-gray-500 text-center">
                    Impossible de supprimer une catégorie contenant des produits
                  </p>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CategorieDetailComponent implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly produitsService = inject(ProduitsService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  categorie = signal<Categorie | null>(null);
  produits = signal<Produit[]>([]);
  isLoading = signal(true);

  totalStock = computed(() => {
    return this.produits().reduce((sum, p) => sum + p.quantiteStock, 0);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadCategorie(id);
      this.loadProduits(id);
    }
  }

  loadCategorie(id: string): void {
    this.categoriesService.getById(id).subscribe({
      next: (categorie) => {
        this.categorie.set(categorie);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.error('Catégorie non trouvée');
        this.router.navigate(['/categories']);
      },
    });
  }

  loadProduits(categorieId: string): void {
    this.categoriesService.getProduits(categorieId).subscribe({
      next: (produits) => this.produits.set(produits),
    });
  }

  confirmDelete(): void {
    const cat = this.categorie();
    if (!cat) return;
    
    if ((cat.nombreProduits || 0) > 0) {
      this.notificationService.warning('Impossible de supprimer une catégorie contenant des produits');
      return;
    }

    if (confirm(`Supprimer la catégorie "${cat.nom}" ?`)) {
      this.categoriesService.delete(cat.id).subscribe({
        next: () => {
          this.notificationService.success('Catégorie supprimée');
          this.router.navigate(['/categories']);
        },
        error: () => this.notificationService.error('Erreur lors de la suppression'),
      });
    }
  }
}
