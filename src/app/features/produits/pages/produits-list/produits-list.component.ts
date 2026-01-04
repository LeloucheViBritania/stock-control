/**
 * Liste des produits avec filtres, pagination et actions
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProduitsService, Produit, ProduitFilters, PaginatedResponse } from '../../services/produits.service';
import { CategoriesService, Categorie } from '@features/categories/services/categories.service';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-produits-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Produits</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            {{ totalItems() }} produit{{ totalItems() > 1 ? 's' : '' }} au total
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Export (PREMIUM) -->
          <div class="relative">
            <button 
              type="button"
              class="btn-secondary flex items-center gap-2"
              [class.opacity-60]="!isPremium()"
              (click)="isPremium() ? openExportMenu() : showPremiumPrompt('export')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Exporter
              @if (!isPremium()) {
                <span class="badge-premium text-xs">PRO</span>
              }
            </button>
            @if (showExportMenu() && isPremium()) {
              <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                <button (click)="exportData('csv')" class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                  Export CSV
                </button>
                <button (click)="exportData('excel')" class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                  Export Excel
                </button>
                <button (click)="exportData('pdf')" class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                  Export PDF
                </button>
              </div>
            }
          </div>
          
          <a routerLink="nouveau" class="btn-primary flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouveau produit
          </a>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Total produits</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats()?.totalProduits || 0 }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Actifs</p>
          <p class="text-2xl font-bold text-success-600">{{ stats()?.produitsActifs || 0 }}</p>
        </div>
        <div class="card p-4 cursor-pointer hover:shadow-md transition-shadow" routerLink="stock-faible">
          <p class="text-sm text-gray-600 dark:text-gray-400">Stock faible</p>
          <p class="text-2xl font-bold text-warning-600">{{ stats()?.stockFaible || 0 }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Valeur stock</p>
          <p class="text-2xl font-bold text-primary-600">{{ stats()?.valeurStock || 0 | number:'1.0-0' }} €</p>
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
                placeholder="Rechercher par nom, référence, code-barres..."
                class="form-input pl-10 w-full"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>

          <!-- Category Filter -->
          <div class="w-full lg:w-48">
            <select 
              [(ngModel)]="filters.categorieId" 
              (ngModelChange)="loadProduits()"
              class="form-input w-full"
            >
              <option value="">Toutes catégories</option>
              @for (cat of categories(); track cat.id) {
                <option [value]="cat.id">{{ cat.nom }}</option>
              }
            </select>
          </div>

          <!-- Stock Filter -->
          <div class="w-full lg:w-48">
            <select 
              [(ngModel)]="stockFilter" 
              (ngModelChange)="onStockFilterChange()"
              class="form-input w-full"
            >
              <option value="">Tous les stocks</option>
              <option value="faible">Stock faible</option>
              <option value="critique">Stock critique</option>
              <option value="disponible">En stock</option>
              <option value="rupture">Rupture</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div class="w-full lg:w-36">
            <select 
              [(ngModel)]="filters.actif" 
              (ngModelChange)="loadProduits()"
              class="form-input w-full"
            >
              <option [ngValue]="undefined">Tous</option>
              <option [ngValue]="true">Actifs</option>
              <option [ngValue]="false">Inactifs</option>
            </select>
          </div>

          <!-- Entrepôt Filter (PREMIUM) -->
          <div class="w-full lg:w-48 relative">
            <select 
              class="form-input w-full"
              [disabled]="!isPremium()"
              [class.opacity-60]="!isPremium()"
            >
              <option value="">Tous entrepôts</option>
            </select>
            @if (!isPremium()) {
              <span class="absolute right-8 top-1/2 -translate-y-1/2 badge-premium text-xs">PRO</span>
            }
          </div>

          <!-- Reset Filters -->
          @if (hasActiveFilters()) {
            <button 
              type="button"
              (click)="resetFilters()"
              class="btn-secondary whitespace-nowrap"
            >
              Réinitialiser
            </button>
          }
        </div>
      </div>

      <!-- Table -->
      <div class="card overflow-hidden">
        @if (isLoading()) {
          <div class="p-12">
            <app-loading-spinner size="lg" text="Chargement des produits..." />
          </div>
        } @else if (produits().length === 0) {
          <div class="p-12 text-center">
            <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Aucun produit trouvé</h3>
            <p class="mt-2 text-gray-500">
              @if (hasActiveFilters()) {
                Modifiez vos filtres ou
              } @else {
                Commencez par
              }
              <a routerLink="nouveau" class="text-primary-600 hover:underline">créer un produit</a>
            </p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="table-header">
                    <input 
                      type="checkbox" 
                      [checked]="allSelected()"
                      (change)="toggleSelectAll()"
                      class="rounded border-gray-300 text-primary-600"
                    />
                  </th>
                  <th class="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" (click)="sortBy('reference')">
                    <div class="flex items-center gap-1">
                      Référence
                      @if (currentSort() === 'reference') {
                        <svg class="w-4 h-4" [class.rotate-180]="sortOrder() === 'desc'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                        </svg>
                      }
                    </div>
                  </th>
                  <th class="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" (click)="sortBy('nom')">
                    <div class="flex items-center gap-1">
                      Produit
                      @if (currentSort() === 'nom') {
                        <svg class="w-4 h-4" [class.rotate-180]="sortOrder() === 'desc'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                        </svg>
                      }
                    </div>
                  </th>
                  <th class="table-header">Catégorie</th>
                  <th class="table-header text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" (click)="sortBy('quantiteStock')">
                    <div class="flex items-center justify-end gap-1">
                      Stock
                      @if (currentSort() === 'quantiteStock') {
                        <svg class="w-4 h-4" [class.rotate-180]="sortOrder() === 'desc'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                        </svg>
                      }
                    </div>
                  </th>
                  <th class="table-header text-right">Prix achat</th>
                  <th class="table-header text-right">Prix vente</th>
                  <th class="table-header text-center">Statut</th>
                  <th class="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                @for (produit of produits(); track produit.id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td class="table-cell">
                      <input 
                        type="checkbox" 
                        [checked]="isSelected(produit.id)"
                        (change)="toggleSelect(produit.id)"
                        class="rounded border-gray-300 text-primary-600"
                      />
                    </td>
                    <td class="table-cell">
                      <span class="font-mono text-sm text-gray-600 dark:text-gray-400">{{ produit.reference }}</span>
                    </td>
                    <td class="table-cell">
                      <div class="flex items-center gap-3">
                        @if (produit.image) {
                          <img [src]="produit.image" [alt]="produit.nom" class="w-10 h-10 rounded-lg object-cover" />
                        } @else {
                          <div class="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                            </svg>
                          </div>
                        }
                        <div>
                          <a [routerLink]="[produit.id]" class="font-medium text-gray-900 dark:text-white hover:text-primary-600">
                            {{ produit.nom }}
                          </a>
                          @if (produit.codeBarres) {
                            <p class="text-xs text-gray-500">{{ produit.codeBarres }}</p>
                          }
                        </div>
                      </div>
                    </td>
                    <td class="table-cell">
                      @if (produit.categorie) {
                        <span 
                          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          [style.background-color]="produit.categorie.couleur + '20'"
                          [style.color]="produit.categorie.couleur"
                        >
                          {{ produit.categorie.nom }}
                        </span>
                      } @else {
                        <span class="text-gray-400">—</span>
                      }
                    </td>
                    <td class="table-cell text-right">
                      <div class="flex items-center justify-end gap-2">
                        <span 
                          class="font-medium"
                          [class.text-danger-600]="produit.quantiteStock <= produit.seuilCritique"
                          [class.text-warning-600]="produit.quantiteStock > produit.seuilCritique && produit.quantiteStock <= produit.seuilAlerte"
                          [class.text-gray-900]="produit.quantiteStock > produit.seuilAlerte"
                          [class.dark:text-white]="produit.quantiteStock > produit.seuilAlerte"
                        >
                          {{ produit.quantiteStock }}
                        </span>
                        <span class="text-gray-500 text-sm">{{ produit.unite }}</span>
                        @if (produit.quantiteStock <= produit.seuilCritique) {
                          <span class="badge-danger text-xs">Critique</span>
                        } @else if (produit.quantiteStock <= produit.seuilAlerte) {
                          <span class="badge-warning text-xs">Faible</span>
                        }
                      </div>
                    </td>
                    <td class="table-cell text-right font-medium">
                      {{ produit.prixAchat | number:'1.2-2' }} €
                    </td>
                    <td class="table-cell text-right font-medium text-primary-600">
                      {{ produit.prixVente | number:'1.2-2' }} €
                    </td>
                    <td class="table-cell text-center">
                      @if (produit.actif) {
                        <span class="badge-success">Actif</span>
                      } @else {
                        <span class="badge-secondary">Inactif</span>
                      }
                    </td>
                    <td class="table-cell">
                      <div class="flex items-center justify-end gap-1">
                        <a 
                          [routerLink]="[produit.id]"
                          class="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Voir"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </a>
                        <a 
                          [routerLink]="[produit.id, 'modifier']"
                          class="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </a>
                        <button 
                          type="button"
                          (click)="openStockModal(produit)"
                          class="p-2 text-gray-500 hover:text-success-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Ajuster stock"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                          </svg>
                        </button>
                        <button 
                          type="button"
                          (click)="confirmDelete(produit)"
                          class="p-2 text-gray-500 hover:text-danger-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Supprimer"
                        >
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
                <select 
                  [ngModel]="pageSize()" 
                  (ngModelChange)="onPageSizeChange($event)"
                  class="form-input py-1.5 text-sm"
                >
                  <option [value]="10">10 / page</option>
                  <option [value]="20">20 / page</option>
                  <option [value]="50">50 / page</option>
                  <option [value]="100">100 / page</option>
                </select>
                <div class="flex items-center gap-1">
                  <button 
                    type="button"
                    (click)="goToPage(1)"
                    [disabled]="currentPage() === 1"
                    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
                    </svg>
                  </button>
                  <button 
                    type="button"
                    (click)="goToPage(currentPage() - 1)"
                    [disabled]="currentPage() === 1"
                    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <span class="px-3 py-1 text-sm">
                    Page {{ currentPage() }} / {{ totalPages() }}
                  </span>
                  <button 
                    type="button"
                    (click)="goToPage(currentPage() + 1)"
                    [disabled]="currentPage() === totalPages()"
                    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                  <button 
                    type="button"
                    (click)="goToPage(totalPages())"
                    [disabled]="currentPage() === totalPages()"
                    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Bulk Actions -->
      @if (selectedIds().length > 0) {
        <div class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-4 z-50">
          <span class="text-sm">{{ selectedIds().length }} sélectionné(s)</span>
          <div class="h-6 w-px bg-gray-700"></div>
          <button type="button" class="text-sm hover:text-primary-400 transition-colors">
            Modifier catégorie
          </button>
          <button type="button" class="text-sm hover:text-danger-400 transition-colors" (click)="bulkDelete()">
            Supprimer
          </button>
          <button type="button" class="text-sm text-gray-400 hover:text-white" (click)="clearSelection()">
            Annuler
          </button>
        </div>
      }

      <!-- Stock Adjustment Modal -->
      @if (showStockModal()) {
        <div class="fixed inset-0 z-50 overflow-y-auto">
          <div class="fixed inset-0 bg-black/50" (click)="closeStockModal()"></div>
          <div class="relative min-h-screen flex items-center justify-center p-4">
            <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ajuster le stock - {{ selectedProduit()?.nom }}
              </h3>
              
              <div class="space-y-4">
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Stock actuel: <span class="font-semibold">{{ selectedProduit()?.quantiteStock }} {{ selectedProduit()?.unite }}</span>
                  </p>
                </div>

                <div>
                  <label class="form-label">Type de mouvement</label>
                  <select [(ngModel)]="stockMovement.type" class="form-input w-full">
                    <option value="ENTREE">Entrée</option>
                    <option value="SORTIE">Sortie</option>
                    <option value="AJUSTEMENT">Ajustement (nouvelle quantité)</option>
                  </select>
                </div>

                <div>
                  <label class="form-label">
                    {{ stockMovement.type === 'AJUSTEMENT' ? 'Nouvelle quantité' : 'Quantité' }}
                  </label>
                  <input 
                    type="number" 
                    [(ngModel)]="stockMovement.quantite" 
                    class="form-input w-full"
                    min="0"
                  />
                </div>

                <div>
                  <label class="form-label">Motif</label>
                  <textarea 
                    [(ngModel)]="stockMovement.motif" 
                    class="form-input w-full" 
                    rows="2"
                    placeholder="Raison du mouvement..."
                  ></textarea>
                </div>
              </div>

              <div class="flex justify-end gap-3 mt-6">
                <button type="button" class="btn-secondary" (click)="closeStockModal()">
                  Annuler
                </button>
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

      <!-- Delete Confirmation Modal -->
      @if (showDeleteModal()) {
        <div class="fixed inset-0 z-50 overflow-y-auto">
          <div class="fixed inset-0 bg-black/50" (click)="closeDeleteModal()"></div>
          <div class="relative min-h-screen flex items-center justify-center p-4">
            <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
              <div class="text-center">
                <div class="w-12 h-12 mx-auto bg-danger-100 dark:bg-danger-900/30 rounded-full flex items-center justify-center mb-4">
                  <svg class="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Supprimer le produit ?</h3>
                <p class="mt-2 text-gray-600 dark:text-gray-400">
                  Êtes-vous sûr de vouloir supprimer <strong>{{ produitToDelete()?.nom }}</strong> ?
                  Cette action est irréversible.
                </p>
              </div>
              <div class="flex justify-center gap-3 mt-6">
                <button type="button" class="btn-secondary" (click)="closeDeleteModal()">
                  Annuler
                </button>
                <button type="button" class="btn-danger" (click)="deleteProduit()">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .table-header {
      @apply px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider;
    }
    .table-cell {
      @apply px-6 py-4 whitespace-nowrap text-sm;
    }
  `],
})
export class ProduitsListComponent implements OnInit {
  private readonly produitsService = inject(ProduitsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  Math = Math;

  // State
  produits = signal<Produit[]>([]);
  categories = signal<Categorie[]>([]);
  stats = signal<any>(null);
  isLoading = signal(false);

  // Pagination
  currentPage = signal(1);
  pageSize = signal(20);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  // Sorting
  currentSort = signal<string>('nom');
  sortOrder = signal<'asc' | 'desc'>('asc');

  // Filters
  filters: ProduitFilters = {};
  stockFilter = '';
  private searchTimeout: any;

  // Selection
  selectedIds = signal<string[]>([]);
  allSelected = computed(() => 
    this.produits().length > 0 && this.selectedIds().length === this.produits().length
  );

  // Modals
  showStockModal = signal(false);
  showDeleteModal = signal(false);
  showExportMenu = signal(false);
  selectedProduit = signal<Produit | null>(null);
  produitToDelete = signal<Produit | null>(null);

  stockMovement = {
    type: 'ENTREE' as 'ENTREE' | 'SORTIE' | 'AJUSTEMENT',
    quantite: 0,
    motif: '',
  };

  // Computed
  isPremium = computed(() => this.authService.isPremium());

  ngOnInit(): void {
    this.loadCategories();
    this.loadStats();
    this.loadProduits();
  }

  loadProduits(): void {
    this.isLoading.set(true);
    this.produitsService.getAll(
      this.currentPage(),
      this.pageSize(),
      this.filters,
      this.currentSort(),
      this.sortOrder()
    ).subscribe({
      next: (response) => {
        this.produits.set(response.data);
        this.totalItems.set(response.meta.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notificationService.error('Erreur lors du chargement des produits');
      },
    });
  }

  loadCategories(): void {
    this.categoriesService.getAll().subscribe({
      next: (categories) => this.categories.set(categories),
    });
  }

  loadStats(): void {
    this.produitsService.getStats().subscribe({
      next: (stats) => this.stats.set(stats),
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadProduits();
    }, 300);
  }

  onStockFilterChange(): void {
    switch (this.stockFilter) {
      case 'faible':
        this.filters.stockFaible = true;
        this.filters.stockCritique = false;
        break;
      case 'critique':
        this.filters.stockFaible = false;
        this.filters.stockCritique = true;
        break;
      default:
        delete this.filters.stockFaible;
        delete this.filters.stockCritique;
    }
    this.currentPage.set(1);
    this.loadProduits();
  }

  sortBy(field: string): void {
    if (this.currentSort() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.currentSort.set(field);
      this.sortOrder.set('asc');
    }
    this.loadProduits();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadProduits();
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadProduits();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.search || this.filters.categorieId || this.stockFilter || this.filters.actif !== undefined);
  }

  resetFilters(): void {
    this.filters = {};
    this.stockFilter = '';
    this.currentPage.set(1);
    this.loadProduits();
  }

  // Selection
  toggleSelect(id: string): void {
    const current = this.selectedIds();
    if (current.includes(id)) {
      this.selectedIds.set(current.filter(i => i !== id));
    } else {
      this.selectedIds.set([...current, id]);
    }
  }

  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.selectedIds.set([]);
    } else {
      this.selectedIds.set(this.produits().map(p => p.id));
    }
  }

  isSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  clearSelection(): void {
    this.selectedIds.set([]);
  }

  // Stock Modal
  openStockModal(produit: Produit): void {
    this.selectedProduit.set(produit);
    this.stockMovement = { type: 'ENTREE', quantite: 0, motif: '' };
    this.showStockModal.set(true);
  }

  closeStockModal(): void {
    this.showStockModal.set(false);
    this.selectedProduit.set(null);
  }

  saveStockMovement(): void {
    const produit = this.selectedProduit();
    if (!produit) return;

    this.produitsService.mouvementStock(produit.id, {
      type: this.stockMovement.type as any,
      quantite: this.stockMovement.quantite,
      motif: this.stockMovement.motif,
    }).subscribe({
      next: () => {
        this.notificationService.success('Stock mis à jour');
        this.closeStockModal();
        this.loadProduits();
        this.loadStats();
      },
      error: () => {
        this.notificationService.error('Erreur lors de la mise à jour du stock');
      },
    });
  }

  // Delete
  confirmDelete(produit: Produit): void {
    this.produitToDelete.set(produit);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.produitToDelete.set(null);
  }

  deleteProduit(): void {
    const produit = this.produitToDelete();
    if (!produit) return;

    this.produitsService.delete(produit.id).subscribe({
      next: () => {
        this.notificationService.success('Produit supprimé');
        this.closeDeleteModal();
        this.loadProduits();
        this.loadStats();
      },
      error: () => {
        this.notificationService.error('Erreur lors de la suppression');
      },
    });
  }

  bulkDelete(): void {
    // Implement bulk delete
    this.notificationService.info('Suppression multiple en cours...');
  }

  // Export
  openExportMenu(): void {
    this.showExportMenu.set(!this.showExportMenu());
  }

  exportData(format: 'csv' | 'excel' | 'pdf'): void {
    this.showExportMenu.set(false);
    this.produitsService.export(format, this.filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `produits.${format === 'excel' ? 'xlsx' : format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.notificationService.success('Export réussi');
      },
      error: () => {
        this.notificationService.error('Erreur lors de l\'export');
      },
    });
  }

  showPremiumPrompt(feature: string): void {
    this.router.navigate(['/premium-requis'], { queryParams: { feature } });
  }
}
