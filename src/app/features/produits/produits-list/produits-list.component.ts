import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProduitsService } from '@core/services/produits.service';
import { CategoriesService } from '@core/services/categories.service';
import { ToastService } from '@core/services/notifications.service';
import { Produit, Categorie, PaginatedResponse } from '@core/models';
import { ConfirmModalComponent } from '@shared/components/confirm-modal/confirm-modal.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

@Component({
  selector: 'app-produits-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPipe, ConfirmModalComponent, PaginationComponent],
  template: `
    <div class="produits-page">
      <!-- Header -->
      <div class="page-header">
        <div class="page-header__left">
          <h1>Produits</h1>
          <p class="text-muted">Gérez votre catalogue de produits</p>
        </div>
        <div class="page-header__right">
          <button class="btn btn--secondary" (click)="exportProduits()">
            <i class="ph ph-download-simple"></i>
            Exporter
          </button>
          <a routerLink="/produits/new" class="btn btn--primary">
            <i class="ph ph-plus"></i>
            Nouveau produit
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
              placeholder="Rechercher par nom, référence..."
              class="form-control"
            />
            @if (searchTerm) {
              <button class="search-clear" (click)="clearSearch()">
                <i class="ph ph-x"></i>
              </button>
            }
          </div>

          <select 
            [(ngModel)]="selectedCategorie"
            (ngModelChange)="onFilterChange()"
            class="form-control filter-select"
          >
            <option [ngValue]="null">Toutes les catégories</option>
            @for (cat of categories(); track cat.id) {
              <option [ngValue]="cat.id">{{ cat.nom }}</option>
            }
          </select>

          <select 
            [(ngModel)]="selectedStatut"
            (ngModelChange)="onFilterChange()"
            class="form-control filter-select"
          >
            <option [ngValue]="null">Tous les statuts</option>
            <option [ngValue]="true">Actifs</option>
            <option [ngValue]="false">Inactifs</option>
          </select>

          <label class="form-check stock-filter">
            <input type="checkbox" [(ngModel)]="stockFaibleOnly" (ngModelChange)="onFilterChange()" />
            <span class="form-check__label">Stock faible uniquement</span>
          </label>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-row">
        <div class="mini-stat">
          <div class="mini-stat__icon bg-primary-light">
            <i class="ph ph-package"></i>
          </div>
          <div class="mini-stat__content">
            <span class="mini-stat__value">{{ totalProduits() }}</span>
            <span class="mini-stat__label">Total produits</span>
          </div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat__icon bg-success-light">
            <i class="ph ph-check-circle"></i>
          </div>
          <div class="mini-stat__content">
            <span class="mini-stat__value">{{ produitsActifs() }}</span>
            <span class="mini-stat__label">Actifs</span>
          </div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat__icon bg-warning-light">
            <i class="ph ph-warning"></i>
          </div>
          <div class="mini-stat__content">
            <span class="mini-stat__value">{{ stockFaibleCount() }}</span>
            <span class="mini-stat__label">Stock faible</span>
          </div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat__icon bg-info-light">
            <i class="ph ph-currency-circle-dollar"></i>
          </div>
          <div class="mini-stat__content">
            <span class="mini-stat__value">{{ valeurStock() | currency:'XOF':'symbol':'1.0-0' }}</span>
            <span class="mini-stat__label">Valeur stock</span>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        @if (isLoading()) {
          <div class="loading-container">
            <span class="spinner spinner--lg"></span>
            <p>Chargement des produits...</p>
          </div>
        } @else if (produits().length === 0) {
          <div class="empty-state">
            <i class="ph-duotone ph-package"></i>
            <h3>Aucun produit trouvé</h3>
            <p>
              @if (hasFilters()) {
                Aucun produit ne correspond à vos critères de recherche
              } @else {
                Commencez par ajouter votre premier produit
              }
            </p>
            @if (!hasFilters()) {
              <a routerLink="/produits/new" class="btn btn--primary">
                <i class="ph ph-plus"></i>
                Ajouter un produit
              </a>
            } @else {
              <button class="btn btn--secondary" (click)="resetFilters()">
                <i class="ph ph-x"></i>
                Réinitialiser les filtres
              </button>
            }
          </div>
        } @else {
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Produit</th>
                  <th>Catégorie</th>
                  <th class="text-right">Stock</th>
                  <th class="text-right">Prix vente</th>
                  <th>Statut</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (produit of produits(); track produit.id) {
                  <tr [class.inactive]="!produit.estActif">
                    <td>
                      <code class="ref-code">{{ produit.reference }}</code>
                    </td>
                    <td>
                      <div class="product-cell">
                        <a [routerLink]="['/produits', produit.id]" class="product-name">
                          {{ produit.nom }}
                        </a>
                        @if (produit.marque) {
                          <span class="product-brand">{{ produit.marque }}</span>
                        }
                      </div>
                    </td>
                    <td>
                      @if (produit.categorie) {
                        <span class="badge badge--secondary">{{ produit.categorie.nom }}</span>
                      } @else {
                        <span class="text-muted">-</span>
                      }
                    </td>
                    <td class="text-right">
                      <div class="stock-cell">
                        <span 
                          class="stock-value"
                          [class.stock-low]="isStockFaible(produit)"
                          [class.stock-out]="produit.quantiteStock === 0"
                        >
                          {{ produit.quantiteStock }}
                        </span>
                        @if (isStockFaible(produit)) {
                          <i class="ph ph-warning text-warning" title="Stock faible"></i>
                        }
                      </div>
                    </td>
                    <td class="text-right">
                      <span class="price">{{ produit.prixVente | currency:'XOF':'symbol':'1.0-0' }}</span>
                    </td>
                    <td>
                      @if (produit.estActif) {
                        <span class="badge badge--success">Actif</span>
                      } @else {
                        <span class="badge badge--secondary">Inactif</span>
                      }
                    </td>
                    <td class="text-right">
                      <div class="actions-cell">
                        <a 
                          [routerLink]="['/produits', produit.id]" 
                          class="btn btn--ghost btn--sm btn--icon"
                          title="Voir"
                        >
                          <i class="ph ph-eye"></i>
                        </a>
                        <a 
                          [routerLink]="['/produits', produit.id, 'edit']" 
                          class="btn btn--ghost btn--sm btn--icon"
                          title="Modifier"
                        >
                          <i class="ph ph-pencil"></i>
                        </a>
                        <button 
                          class="btn btn--ghost btn--sm btn--icon"
                          title="Ajuster stock"
                          (click)="openAjustementModal(produit)"
                        >
                          <i class="ph ph-plus-minus"></i>
                        </button>
                        <button 
                          class="btn btn--ghost btn--sm btn--icon text-error"
                          title="Supprimer"
                          (click)="confirmDelete(produit)"
                        >
                          <i class="ph ph-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="table-footer">
            <div class="table-info">
              Affichage de {{ startIndex() }} à {{ endIndex() }} sur {{ meta().total }} produits
            </div>
            <app-pagination
              [currentPage]="currentPage()"
              [totalPages]="meta().totalPages"
              (pageChange)="onPageChange($event)"
            />
          </div>
        }
      </div>

      <!-- Ajustement Modal -->
      @if (showAjustementModal()) {
        <div class="modal-backdrop" (click)="closeAjustementModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal__header">
              <h3 class="modal__title">Ajuster le stock</h3>
              <button class="modal__close" (click)="closeAjustementModal()">
                <i class="ph ph-x"></i>
              </button>
            </div>
            <div class="modal__body">
              <p class="mb-4">
                Produit: <strong>{{ selectedProduit()?.nom }}</strong>
                <br>
                Stock actuel: <strong>{{ selectedProduit()?.quantiteStock }} {{ selectedProduit()?.uniteMesure }}</strong>
              </p>

              <div class="form-group">
                <label class="form-group__label">Type d'ajustement</label>
                <div class="btn-group">
                  <button 
                    class="btn" 
                    [class.btn--primary]="ajustementType() === 'entree'"
                    [class.btn--secondary]="ajustementType() !== 'entree'"
                    (click)="ajustementType.set('entree')"
                  >
                    <i class="ph ph-plus"></i>
                    Entrée
                  </button>
                  <button 
                    class="btn" 
                    [class.btn--primary]="ajustementType() === 'sortie'"
                    [class.btn--secondary]="ajustementType() !== 'sortie'"
                    (click)="ajustementType.set('sortie')"
                  >
                    <i class="ph ph-minus"></i>
                    Sortie
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-group__label">Quantité</label>
                <input 
                  type="number" 
                  [(ngModel)]="ajustementQuantite"
                  class="form-control"
                  min="1"
                  placeholder="Quantité à ajouter/retirer"
                />
              </div>

              <div class="form-group">
                <label class="form-group__label">Raison</label>
                <textarea 
                  [(ngModel)]="ajustementRaison"
                  class="form-control"
                  rows="2"
                  placeholder="Raison de l'ajustement..."
                ></textarea>
              </div>
            </div>
            <div class="modal__footer">
              <button class="btn btn--secondary" (click)="closeAjustementModal()">
                Annuler
              </button>
              <button 
                class="btn btn--primary" 
                (click)="submitAjustement()"
                [disabled]="!ajustementQuantite || !ajustementRaison"
              >
                <i class="ph ph-check"></i>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal
        [show]="showDeleteModal()"
        title="Supprimer le produit"
        [message]="'Êtes-vous sûr de vouloir supprimer le produit ' + (produitToDelete()?.nom || '') + ' ?'"
        confirmLabel="Supprimer"
        confirmClass="btn--danger"
        (confirm)="deleteProduit()"
        (cancel)="showDeleteModal.set(false)"
      />
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-6);
      gap: var(--space-4);
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
      align-items: center;
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 250px;

      i {
        position: absolute;
        left: var(--space-3);
        top: 50%;
        transform: translateY(-50%);
        color: var(--neutral-400);
      }

      input {
        padding-left: var(--space-10);
        padding-right: var(--space-10);
      }
    }

    .search-clear {
      position: absolute;
      right: var(--space-3);
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--neutral-400);
      cursor: pointer;
      padding: var(--space-1);
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: var(--neutral-600);
      }
    }

    .filter-select {
      width: 180px;
    }

    .stock-filter {
      white-space: nowrap;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .mini-stat {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4);
      background: var(--neutral-0);
      border-radius: var(--radius-lg);
      border: 1px solid var(--neutral-200);
    }

    .mini-stat__icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .bg-primary-light {
      background: var(--primary-100);
      color: var(--primary-600);
    }

    .bg-success-light {
      background: var(--success-100);
      color: var(--success-600);
    }

    .bg-warning-light {
      background: var(--warning-100);
      color: var(--warning-600);
    }

    .bg-info-light {
      background: var(--info-100);
      color: var(--info-600);
    }

    .mini-stat__content {
      display: flex;
      flex-direction: column;
    }

    .mini-stat__value {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--neutral-900);
    }

    .mini-stat__label {
      font-size: var(--text-sm);
      color: var(--neutral-500);
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-12);
      gap: var(--space-4);
      color: var(--neutral-500);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-12);
      text-align: center;

      i {
        font-size: 4rem;
        color: var(--neutral-300);
        margin-bottom: var(--space-4);
      }

      h3 {
        margin-bottom: var(--space-2);
      }

      p {
        color: var(--neutral-500);
        margin-bottom: var(--space-6);
      }
    }

    .ref-code {
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      background: var(--neutral-100);
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
    }

    .product-cell {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .product-name {
      font-weight: 500;
      color: var(--neutral-900);

      &:hover {
        color: var(--primary-600);
      }
    }

    .product-brand {
      font-size: var(--text-sm);
      color: var(--neutral-500);
    }

    .stock-cell {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--space-2);
    }

    .stock-value {
      font-family: var(--font-mono);
      font-weight: 500;

      &.stock-low {
        color: var(--warning-600);
      }

      &.stock-out {
        color: var(--error-600);
      }
    }

    .price {
      font-family: var(--font-mono);
      font-weight: 500;
    }

    .actions-cell {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-1);
    }

    tr.inactive {
      opacity: 0.6;
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

    .btn-group {
      display: flex;
      gap: var(--space-2);
    }

    @media (max-width: 1024px) {
      .stats-row {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .page-header__right {
        width: 100%;
      }

      .stats-row {
        grid-template-columns: 1fr;
      }

      .filter-select {
        width: 100%;
      }
    }
  `]
})
export class ProduitsListComponent implements OnInit {
  private produitsService = inject(ProduitsService);
  private categoriesService = inject(CategoriesService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // State
  produits = signal<Produit[]>([]);
  categories = signal<Categorie[]>([]);
  isLoading = signal(true);
  meta = signal({ total: 0, page: 1, limit: 20, totalPages: 0 });

  // Filters
  searchTerm = '';
  selectedCategorie: number | null = null;
  selectedStatut: boolean | null = null;
  stockFaibleOnly = false;
  currentPage = signal(1);

  // Stats
  totalProduits = signal(0);
  produitsActifs = signal(0);
  stockFaibleCount = signal(0);
  valeurStock = signal(0);

  // Modals
  showAjustementModal = signal(false);
  showDeleteModal = signal(false);
  selectedProduit = signal<Produit | null>(null);
  produitToDelete = signal<Produit | null>(null);

  // Ajustement
  ajustementType = signal<'entree' | 'sortie'>('entree');
  ajustementQuantite: number | null = null;
  ajustementRaison = '';

  // Computed
  startIndex = computed(() => (this.meta().page - 1) * this.meta().limit + 1);
  endIndex = computed(() => Math.min(this.meta().page * this.meta().limit, this.meta().total));

  private searchTimeout: any;

  ngOnInit() {
    // Check query params
    this.route.queryParams.subscribe(params => {
      if (params['stockFaible'] === 'true') {
        this.stockFaibleOnly = true;
      }
    });

    this.loadCategories();
    this.loadProduits();
    this.loadStats();
  }

  loadProduits() {
    this.isLoading.set(true);

    const params: any = {
      page: this.currentPage(),
      limit: this.meta().limit,
    };

    if (this.searchTerm) params.search = this.searchTerm;
    if (this.selectedCategorie) params.categorieId = this.selectedCategorie;
    if (this.selectedStatut !== null) params.estActif = this.selectedStatut;

    this.produitsService.getAll(params).subscribe({
      next: (response) => {
        this.produits.set(response.data);
        this.meta.set(response.meta);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Erreur', 'Impossible de charger les produits');
        this.isLoading.set(false);
      }
    });
  }

  loadCategories() {
    this.categoriesService.getAll({ limit: 100 }).subscribe({
      next: (response) => this.categories.set(response.data),
      error: () => console.error('Failed to load categories')
    });
  }

  loadStats() {
    this.produitsService.getStatistiques().subscribe({
      next: (stats) => {
        this.totalProduits.set(stats.totalProduits || 0);
        this.produitsActifs.set(stats.produitsActifs || 0);
        this.stockFaibleCount.set(stats.stockFaible || 0);
        this.valeurStock.set(stats.valeurTotaleStock || 0);
      },
      error: () => console.error('Failed to load stats')
    });
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadProduits();
    }, 300);
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadProduits();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadProduits();
  }

  clearSearch() {
    this.searchTerm = '';
    this.onFilterChange();
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedCategorie = null;
    this.selectedStatut = null;
    this.stockFaibleOnly = false;
    this.currentPage.set(1);
    this.loadProduits();
  }

  hasFilters(): boolean {
    return !!(this.searchTerm || this.selectedCategorie || this.selectedStatut !== null || this.stockFaibleOnly);
  }

  isStockFaible(produit: Produit): boolean {
    return produit.quantiteStock <= produit.niveauStockMin;
  }

  // Modal actions
  openAjustementModal(produit: Produit) {
    this.selectedProduit.set(produit);
    this.ajustementType.set('entree');
    this.ajustementQuantite = null;
    this.ajustementRaison = '';
    this.showAjustementModal.set(true);
  }

  closeAjustementModal() {
    this.showAjustementModal.set(false);
    this.selectedProduit.set(null);
  }

  submitAjustement() {
    const produit = this.selectedProduit();
    if (!produit || !this.ajustementQuantite || !this.ajustementRaison) return;

    this.produitsService.ajusterStock(produit.id, {
      type: this.ajustementType(),
      quantite: this.ajustementQuantite,
      raison: this.ajustementRaison
    }).subscribe({
      next: () => {
        this.toast.success('Stock ajusté', 'Le stock a été mis à jour avec succès');
        this.closeAjustementModal();
        this.loadProduits();
        this.loadStats();
      },
      error: (err) => {
        this.toast.error('Erreur', err.error?.message || 'Impossible d\'ajuster le stock');
      }
    });
  }

  confirmDelete(produit: Produit) {
    this.produitToDelete.set(produit);
    this.showDeleteModal.set(true);
  }

  deleteProduit() {
    const produit = this.produitToDelete();
    if (!produit) return;

    this.produitsService.delete(produit.id).subscribe({
      next: () => {
        this.toast.success('Produit supprimé', 'Le produit a été désactivé');
        this.showDeleteModal.set(false);
        this.produitToDelete.set(null);
        this.loadProduits();
        this.loadStats();
      },
      error: (err) => {
        this.toast.error('Erreur', err.error?.message || 'Impossible de supprimer le produit');
      }
    });
  }

  exportProduits() {
    this.produitsService.export('excel').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `produits_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toast.success('Export réussi', 'Le fichier a été téléchargé');
      },
      error: () => {
        this.toast.error('Erreur', 'Impossible d\'exporter les produits');
      }
    });
  }
}
