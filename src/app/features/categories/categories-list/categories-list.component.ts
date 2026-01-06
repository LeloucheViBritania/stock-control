import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoriesService } from '@core/services/categories.service';
import { ToastService } from '@core/services/notifications.service';
import { Categorie } from '@core/models';
import { ConfirmModalComponent } from '@shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmModalComponent],
  template: `
    <div class="categories-page">
      <div class="page-header">
        <div><h1>Catégories</h1><p class="text-muted">Organisez vos produits par catégories</p></div>
        <a routerLink="/categories/new" class="btn btn--primary"><i class="ph ph-plus"></i> Nouvelle catégorie</a>
      </div>

      <div class="filters card mb-6">
        <div class="search-box">
          <i class="ph ph-magnifying-glass"></i>
          <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" placeholder="Rechercher..." class="form-control" />
        </div>
      </div>

      <div class="card">
        @if (isLoading()) {
          <div class="loading-container"><span class="spinner spinner--lg"></span></div>
        } @else if (categories().length === 0) {
          <div class="empty-state">
            <i class="ph-duotone ph-folder"></i>
            <h3>Aucune catégorie</h3>
            <a routerLink="/categories/new" class="btn btn--primary"><i class="ph ph-plus"></i> Créer une catégorie</a>
          </div>
        } @else {
          <div class="table-container">
            <table class="table">
              <thead>
                <tr><th>Nom</th><th>Description</th><th>Produits</th><th>Parent</th><th class="text-right">Actions</th></tr>
              </thead>
              <tbody>
                @for (cat of filteredCategories(); track cat.id) {
                  <tr>
                    <td><a [routerLink]="['/categories', cat.id]" class="font-medium">{{ cat.nom }}</a></td>
                    <td class="text-muted">{{ cat.description || '-' }}</td>
                    <td><span class="badge badge--secondary">{{ cat._count?.produits || 0 }}</span></td>
                    <td>{{ cat.parent?.nom || '-' }}</td>
                    <td class="text-right">
                      <a [routerLink]="['/categories', cat.id, 'edit']" class="btn btn--ghost btn--sm btn--icon"><i class="ph ph-pencil"></i></a>
                      <button class="btn btn--ghost btn--sm btn--icon text-error" (click)="confirmDelete(cat)"><i class="ph ph-trash"></i></button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <app-confirm-modal [show]="showDeleteModal()" title="Supprimer la catégorie" [message]="'Supprimer ' + (catToDelete()?.nom || '') + ' ?'" confirmLabel="Supprimer" confirmClass="btn--danger" (confirm)="deleteCategorie()" (cancel)="showDeleteModal.set(false)" />
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
    .search-box { position: relative; max-width: 300px;
      i { position: absolute; left: var(--space-3); top: 50%; transform: translateY(-50%); color: var(--neutral-400); }
      input { padding-left: var(--space-10); }
    }
    .loading-container, .empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--space-12); gap: var(--space-4); }
    .empty-state i { font-size: 4rem; color: var(--neutral-300); }
  `]
})
export class CategoriesListComponent implements OnInit {
  private categoriesService = inject(CategoriesService);
  private toast = inject(ToastService);

  categories = signal<Categorie[]>([]);
  isLoading = signal(true);
  searchTerm = '';
  showDeleteModal = signal(false);
  catToDelete = signal<Categorie | null>(null);

  ngOnInit() { this.loadCategories(); }

  loadCategories() {
    this.isLoading.set(true);
    this.categoriesService.getAll({ limit: 100 }).subscribe({
      next: (res) => { this.categories.set(res.data); this.isLoading.set(false); },
      error: () => { this.toast.error('Erreur', 'Impossible de charger les catégories'); this.isLoading.set(false); }
    });
  }

  filteredCategories(): Categorie[] {
    if (!this.searchTerm) return this.categories();
    return this.categories().filter(c => c.nom.toLowerCase().includes(this.searchTerm.toLowerCase()));
  }

  onSearch() {}

  confirmDelete(cat: Categorie) { this.catToDelete.set(cat); this.showDeleteModal.set(true); }

  deleteCategorie() {
    const cat = this.catToDelete();
    if (!cat) return;
    this.categoriesService.delete(cat.id).subscribe({
      next: () => { this.toast.success('Catégorie supprimée'); this.showDeleteModal.set(false); this.loadCategories(); },
      error: (err) => this.toast.error('Erreur', err.error?.message || 'Suppression impossible')
    });
  }
}
