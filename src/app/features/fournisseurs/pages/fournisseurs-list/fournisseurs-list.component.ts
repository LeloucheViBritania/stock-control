/**
 * Liste des fournisseurs
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FournisseursService, Fournisseur, FournisseurFilters } from '../../services/fournisseurs.service';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-fournisseurs-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Fournisseurs</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">{{ totalItems() }} fournisseur{{ totalItems() > 1 ? 's' : '' }}</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Comparaison (visible mais PREMIUM pour détails) -->
          <button 
            type="button"
            class="btn-secondary flex items-center gap-2"
            [disabled]="selectedIds().length < 2"
            (click)="comparerFournisseurs()"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Comparer ({{ selectedIds().length }})
          </button>

          <a routerLink="nouveau" class="btn-primary flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouveau fournisseur
          </a>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Total</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats()?.totalFournisseurs || 0 }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Actifs</p>
          <p class="text-2xl font-bold text-success-600">{{ stats()?.fournisseursActifs || 0 }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Évaluation moyenne</p>
          <div class="flex items-center gap-2">
            <p class="text-2xl font-bold text-warning-500">{{ stats()?.evaluationMoyenne || 0 | number:'1.1-1' }}</p>
            <svg class="w-6 h-6 text-warning-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Délai moyen</p>
          <p class="text-2xl font-bold text-primary-600">{{ avgDelai() }} jours</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card p-4">
        <div class="flex flex-col lg:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="filters.search"
                (ngModelChange)="onSearchChange()"
                placeholder="Rechercher par nom, email..."
                class="form-input pl-10 w-full"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>

          <div class="w-full lg:w-40">
            <select [(ngModel)]="filters.evaluationMin" (ngModelChange)="loadFournisseurs()" class="form-input w-full">
              <option [ngValue]="undefined">Toutes notes</option>
              <option [ngValue]="4">4+ étoiles</option>
              <option [ngValue]="3">3+ étoiles</option>
              <option [ngValue]="2">2+ étoiles</option>
            </select>
          </div>

          <div class="w-full lg:w-36">
            <select [(ngModel)]="filters.actif" (ngModelChange)="loadFournisseurs()" class="form-input w-full">
              <option [ngValue]="undefined">Tous</option>
              <option [ngValue]="true">Actifs</option>
              <option [ngValue]="false">Inactifs</option>
            </select>
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
        } @else if (fournisseurs().length === 0) {
          <div class="p-12 text-center">
            <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Aucun fournisseur</h3>
            <a routerLink="nouveau" class="text-primary-600 hover:underline">Ajouter un fournisseur</a>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="table-header w-10">
                    <input 
                      type="checkbox"
                      [checked]="allSelected()"
                      (change)="toggleSelectAll()"
                      class="rounded border-gray-300 text-primary-600"
                    />
                  </th>
                  <th class="table-header">Fournisseur</th>
                  <th class="table-header">Contact</th>
                  <th class="table-header text-center">Évaluation</th>
                  <th class="table-header text-center">Délai livraison</th>
                  <th class="table-header text-right">Total achats</th>
                  <th class="table-header text-center">Statut</th>
                  <th class="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                @for (fournisseur of fournisseurs(); track fournisseur.id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td class="table-cell">
                      <input 
                        type="checkbox"
                        [checked]="isSelected(fournisseur.id)"
                        (change)="toggleSelect(fournisseur.id)"
                        class="rounded border-gray-300 text-primary-600"
                      />
                    </td>
                    <td class="table-cell">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-info-100 dark:bg-info-900/30 flex items-center justify-center">
                          <span class="font-semibold text-info-600">{{ fournisseur.nom.substring(0, 2).toUpperCase() }}</span>
                        </div>
                        <div>
                          <a [routerLink]="[fournisseur.id]" class="font-medium text-gray-900 dark:text-white hover:text-primary-600">
                            {{ fournisseur.nom }}
                          </a>
                          <p class="text-sm text-gray-500">{{ fournisseur.code }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="table-cell">
                      <div class="text-sm">
                        @if (fournisseur.email) {
                          <p class="text-gray-900 dark:text-white">{{ fournisseur.email }}</p>
                        }
                        <p class="text-gray-500">{{ fournisseur.telephone }}</p>
                      </div>
                    </td>
                    <td class="table-cell text-center">
                      <div class="flex items-center justify-center gap-1">
                        @for (star of [1,2,3,4,5]; track star) {
                          <svg 
                            class="w-4 h-4"
                            [class.text-warning-500]="star <= fournisseur.evaluation"
                            [class.text-gray-300]="star > fournisseur.evaluation"
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        }
                      </div>
                    </td>
                    <td class="table-cell text-center">
                      <span class="font-medium">{{ fournisseur.delaiLivraison }} jours</span>
                    </td>
                    <td class="table-cell text-right font-medium text-gray-900 dark:text-white">
                      {{ fournisseur.totalAchats | number:'1.0-0' }} €
                    </td>
                    <td class="table-cell text-center">
                      @if (fournisseur.actif) {
                        <span class="badge-success">Actif</span>
                      } @else {
                        <span class="badge-secondary">Inactif</span>
                      }
                    </td>
                    <td class="table-cell">
                      <div class="flex items-center justify-end gap-1">
                        <a [routerLink]="[fournisseur.id]" class="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Voir">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </a>
                        <a [routerLink]="[fournisseur.id, 'modifier']" class="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Modifier">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </a>
                        <button type="button" (click)="confirmDelete(fournisseur)" class="p-2 text-gray-500 hover:text-danger-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Supprimer">
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
export class FournisseursListComponent implements OnInit {
  private readonly fournisseursService = inject(FournisseursService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  Math = Math;

  fournisseurs = signal<Fournisseur[]>([]);
  stats = signal<any>(null);
  isLoading = signal(false);
  selectedIds = signal<string[]>([]);

  currentPage = signal(1);
  pageSize = signal(20);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  filters: FournisseurFilters = {};
  private searchTimeout: any;

  allSelected = computed(() => 
    this.fournisseurs().length > 0 && this.selectedIds().length === this.fournisseurs().length
  );

  avgDelai = computed(() => {
    const list = this.fournisseurs();
    if (list.length === 0) return 0;
    return Math.round(list.reduce((sum, f) => sum + f.delaiLivraison, 0) / list.length);
  });

  ngOnInit(): void {
    this.loadFournisseurs();
    this.loadStats();
  }

  loadFournisseurs(): void {
    this.isLoading.set(true);
    this.fournisseursService.getAll(this.currentPage(), this.pageSize(), this.filters).subscribe({
      next: (response) => {
        this.fournisseurs.set(response.data);
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
    this.fournisseursService.getGlobalStats().subscribe({
      next: (stats) => this.stats.set(stats),
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadFournisseurs();
    }, 300);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadFournisseurs();
    }
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.search || this.filters.evaluationMin || this.filters.actif !== undefined);
  }

  resetFilters(): void {
    this.filters = {};
    this.currentPage.set(1);
    this.loadFournisseurs();
  }

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
      this.selectedIds.set(this.fournisseurs().map(f => f.id));
    }
  }

  isSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  comparerFournisseurs(): void {
    if (this.selectedIds().length >= 2) {
      this.router.navigate(['/fournisseurs/comparer'], { 
        queryParams: { ids: this.selectedIds().join(',') } 
      });
    }
  }

  confirmDelete(fournisseur: Fournisseur): void {
    if (confirm(`Supprimer ${fournisseur.nom} ?`)) {
      this.fournisseursService.delete(fournisseur.id).subscribe({
        next: () => {
          this.notificationService.success('Fournisseur supprimé');
          this.loadFournisseurs();
          this.loadStats();
        },
        error: () => this.notificationService.error('Erreur'),
      });
    }
  }
}
