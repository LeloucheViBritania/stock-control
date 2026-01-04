/**
 * Liste des catégories avec vue arborescente
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoriesService, Categorie, CategorieTree } from '../../services/categories.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Catégories</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            {{ totalCategories() }} catégorie{{ totalCategories() > 1 ? 's' : '' }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Toggle vue -->
          <div class="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button 
              type="button"
              (click)="viewMode.set('tree')"
              class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              [class.bg-white]="viewMode() === 'tree'"
              [class.shadow-sm]="viewMode() === 'tree'"
              [class.text-gray-900]="viewMode() === 'tree'"
              [class.text-gray-600]="viewMode() !== 'tree'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
              </svg>
            </button>
            <button 
              type="button"
              (click)="viewMode.set('grid')"
              class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              [class.bg-white]="viewMode() === 'grid'"
              [class.shadow-sm]="viewMode() === 'grid'"
              [class.text-gray-900]="viewMode() === 'grid'"
              [class.text-gray-600]="viewMode() !== 'grid'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
            </button>
          </div>

          <a routerLink="nouveau" class="btn-primary flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouvelle catégorie
          </a>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Total catégories</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats()?.totalCategories || 0 }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Catégories racines</p>
          <p class="text-2xl font-bold text-primary-600">{{ stats()?.categoriesRacines || 0 }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Produits catégorisés</p>
          <p class="text-2xl font-bold text-success-600">{{ stats()?.produitsCategories || 0 }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Valeur totale stock</p>
          <p class="text-2xl font-bold text-info-600">{{ stats()?.valeurTotale || 0 | number:'1.0-0' }} €</p>
        </div>
      </div>

      @if (isLoading()) {
        <div class="card p-12">
          <app-loading-spinner size="lg" text="Chargement des catégories..." />
        </div>
      } @else if (categories().length === 0) {
        <div class="card p-12 text-center">
          <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Aucune catégorie</h3>
          <p class="mt-2 text-gray-500">
            <a routerLink="nouveau" class="text-primary-600 hover:underline">Créez votre première catégorie</a>
          </p>
        </div>
      } @else {
        <!-- Vue arborescente -->
        @if (viewMode() === 'tree') {
          <div class="card p-6">
            <div class="space-y-2">
              @for (categorie of categoriesTree(); track categorie.id) {
                <ng-container *ngTemplateOutlet="categoryNode; context: { $implicit: categorie, level: 0 }"></ng-container>
              }
            </div>
          </div>
        }

        <!-- Vue grille -->
        @if (viewMode() === 'grid') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            @for (categorie of categories(); track categorie.id) {
              <div class="card p-6 hover:shadow-md transition-shadow group">
                <div class="flex items-start justify-between">
                  <div 
                    class="w-12 h-12 rounded-xl flex items-center justify-center"
                    [style.background-color]="(categorie.couleur || '#3b82f6') + '20'"
                  >
                    @if (categorie.icone) {
                      <span class="text-2xl">{{ categorie.icone }}</span>
                    } @else {
                      <svg class="w-6 h-6" [style.color]="categorie.couleur || '#3b82f6'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                      </svg>
                    }
                  </div>
                  
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <a [routerLink]="[categorie.id, 'modifier']" class="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </a>
                    <button type="button" (click)="confirmDelete(categorie)" class="p-1.5 text-gray-400 hover:text-danger-600 hover:bg-gray-100 rounded">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <a [routerLink]="[categorie.id]" class="block mt-4">
                  <h3 class="font-semibold text-gray-900 dark:text-white hover:text-primary-600">
                    {{ categorie.nom }}
                  </h3>
                  @if (categorie.description) {
                    <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ categorie.description }}</p>
                  }
                </a>

                <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">
                    {{ categorie.nombreProduits || 0 }} produit{{ (categorie.nombreProduits || 0) > 1 ? 's' : '' }}
                  </span>
                  @if (categorie.parent) {
                    <span class="text-xs text-gray-400">
                      dans {{ categorie.parent.nom }}
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        }
      }

      <!-- Template récursif pour l'arbre -->
      <ng-template #categoryNode let-categorie let-level="level">
        <div 
          class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          [style.padding-left.px]="level * 24 + 12"
        >
          <!-- Expand/Collapse -->
          @if (categorie.children?.length) {
            <button 
              type="button"
              (click)="toggleExpand(categorie.id)"
              class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
            >
              <svg 
                class="w-4 h-4 transition-transform" 
                [class.rotate-90]="isExpanded(categorie.id)"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          } @else {
            <div class="w-6"></div>
          }

          <!-- Icône -->
          <div 
            class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            [style.background-color]="(categorie.couleur || '#3b82f6') + '20'"
          >
            @if (categorie.icone) {
              <span>{{ categorie.icone }}</span>
            } @else {
              <svg class="w-4 h-4" [style.color]="categorie.couleur || '#3b82f6'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
            }
          </div>

          <!-- Nom et stats -->
          <div class="flex-1 min-w-0">
            <a [routerLink]="[categorie.id]" class="font-medium text-gray-900 dark:text-white hover:text-primary-600">
              {{ categorie.nom }}
            </a>
          </div>

          <!-- Badges -->
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-500">
              {{ categorie.nombreProduits || 0 }} produit{{ (categorie.nombreProduits || 0) > 1 ? 's' : '' }}
            </span>
            @if ((categorie.valeurStock || 0) > 0) {
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ categorie.valeurStock | number:'1.0-0' }} €
              </span>
            }
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1">
            <a [routerLink]="[categorie.id]" class="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg" title="Voir">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </a>
            <a [routerLink]="[categorie.id, 'modifier']" class="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg" title="Modifier">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </a>
            <button type="button" (click)="confirmDelete(categorie)" class="p-2 text-gray-400 hover:text-danger-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg" title="Supprimer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Enfants -->
        @if (categorie.children?.length && isExpanded(categorie.id)) {
          @for (enfant of categorie.children!; track enfant.id) {
            <ng-container *ngTemplateOutlet="categoryNode; context: { $implicit: enfant, level: level + 1 }"></ng-container>
          }
        }
      </ng-template>
    </div>
  `,
})
export class CategoriesListComponent implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  categories = signal<Categorie[]>([]);
  categoriesTree = signal<CategorieTree[]>([]);
  stats = signal<any>(null);
  isLoading = signal(false);
  viewMode = signal<'tree' | 'grid'>('tree');
  expandedIds = signal<Set<string>>(new Set());

  totalCategories = computed(() => this.categories().length);

  ngOnInit(): void {
    this.loadCategories();
    this.loadTree();
    this.loadStats();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.categoriesService.getAll().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notificationService.error('Erreur lors du chargement');
      },
    });
  }

  loadTree(): void {
    this.categoriesService.getTree().subscribe({
      next: (tree) => {
        this.categoriesTree.set(tree);
        // Expand all by default
        const ids = new Set<string>();
        const collectIds = (items: CategorieTree[]) => {
          items.forEach(item => {
            ids.add(item.id);
            if (item.children) collectIds(item.children);
          });
        };
        collectIds(tree);
        this.expandedIds.set(ids);
      },
    });
  }

  loadStats(): void {
    this.categoriesService.getStats().subscribe({
      next: (stats) => this.stats.set(stats),
    });
  }

  toggleExpand(id: string): void {
    const current = this.expandedIds();
    const newSet = new Set(current);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    this.expandedIds.set(newSet);
  }

  isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  confirmDelete(categorie: Categorie): void {
    if (categorie.nombreProduits && categorie.nombreProduits > 0) {
      this.notificationService.warning(`Cette catégorie contient ${categorie.nombreProduits} produit(s)`);
      return;
    }
    
    if (confirm(`Supprimer la catégorie "${categorie.nom}" ?`)) {
      this.categoriesService.delete(categorie.id).subscribe({
        next: () => {
          this.notificationService.success('Catégorie supprimée');
          this.loadCategories();
          this.loadTree();
          this.loadStats();
        },
        error: () => this.notificationService.error('Erreur lors de la suppression'),
      });
    }
  }
}
