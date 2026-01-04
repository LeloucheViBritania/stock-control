/**
 * Formulaire création/modification catégorie
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoriesService, Categorie, CreateCategorieDto } from '../../services/categories.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-categorie-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <a routerLink="/categories" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ isEditMode() ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}
        </h1>
      </div>

      @if (isLoading()) {
        <div class="card p-12">
          <app-loading-spinner size="lg" />
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Informations générales -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations</h2>
            
            <div class="space-y-4">
              <!-- Nom -->
              <div>
                <label for="nom" class="form-label">Nom *</label>
                <input 
                  type="text" 
                  id="nom" 
                  formControlName="nom" 
                  class="form-input" 
                  [class.form-input-error]="isFieldInvalid('nom')"
                  placeholder="Nom de la catégorie"
                />
                @if (isFieldInvalid('nom')) {
                  <p class="form-error">Nom requis (min. 2 caractères)</p>
                }
              </div>

              <!-- Description -->
              <div>
                <label for="description" class="form-label">Description</label>
                <textarea 
                  id="description" 
                  formControlName="description" 
                  class="form-input" 
                  rows="3"
                  placeholder="Description optionnelle..."
                ></textarea>
              </div>

              <!-- Catégorie parente -->
              <div>
                <label for="parentId" class="form-label">Catégorie parente</label>
                <select id="parentId" formControlName="parentId" class="form-input">
                  <option [ngValue]="null">Aucune (catégorie racine)</option>
                  @for (cat of availableParents(); track cat.id) {
                    <option [ngValue]="cat.id" [disabled]="cat.id === categorie()?.id">
                      {{ getParentLabel(cat) }}
                    </option>
                  }
                </select>
                <p class="form-hint">Laissez vide pour créer une catégorie principale</p>
              </div>
            </div>
          </div>

          <!-- Apparence -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Apparence</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Couleur -->
              <div>
                <label class="form-label">Couleur</label>
                <div class="flex items-center gap-3">
                  <input 
                    type="color" 
                    formControlName="couleur" 
                    class="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input 
                    type="text" 
                    formControlName="couleur" 
                    class="form-input flex-1 font-mono"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <!-- Icône (emoji) -->
              <div>
                <label class="form-label">Icône (emoji)</label>
                <div class="flex items-center gap-3">
                  <input 
                    type="text" 
                    formControlName="icone" 
                    class="form-input w-20 text-center text-2xl"
                    maxlength="2"
                    placeholder="📦"
                  />
                  <div class="flex flex-wrap gap-1">
                    @for (emoji of suggestedEmojis; track emoji) {
                      <button 
                        type="button"
                        (click)="form.patchValue({ icone: emoji })"
                        class="w-8 h-8 text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        {{ emoji }}
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Aperçu -->
            <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p class="text-sm text-gray-500 mb-2">Aperçu</p>
              <div class="flex items-center gap-3">
                <div 
                  class="w-12 h-12 rounded-xl flex items-center justify-center"
                  [style.background-color]="(form.value.couleur || '#3b82f6') + '20'"
                >
                  @if (form.value.icone) {
                    <span class="text-2xl">{{ form.value.icone }}</span>
                  } @else {
                    <svg class="w-6 h-6" [style.color]="form.value.couleur || '#3b82f6'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                    </svg>
                  }
                </div>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ form.value.nom || 'Nom de la catégorie' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Ordre d'affichage -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Options</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="ordre" class="form-label">Ordre d'affichage</label>
                <input 
                  type="number" 
                  id="ordre" 
                  formControlName="ordre" 
                  class="form-input"
                  min="0"
                />
                <p class="form-hint">Plus le nombre est petit, plus la catégorie apparaît en premier</p>
              </div>

              <div class="flex items-center">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    formControlName="actif" 
                    class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="text-gray-900 dark:text-white">Catégorie active</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between">
            <a routerLink="/categories" class="btn-secondary">Annuler</a>
            <div class="flex gap-3">
              @if (isEditMode()) {
                <button type="button" class="btn-secondary" (click)="saveAndContinue()">
                  Enregistrer et continuer
                </button>
              }
              <button type="submit" class="btn-primary" [disabled]="form.invalid || isSaving()">
                @if (isSaving()) {
                  <svg class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                }
                {{ isEditMode() ? 'Mettre à jour' : 'Créer la catégorie' }}
              </button>
            </div>
          </div>
        </form>
      }
    </div>
  `,
})
export class CategorieFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoriesService = inject(CategoriesService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  categorie = signal<Categorie | null>(null);
  allCategories = signal<Categorie[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);

  suggestedEmojis = ['📦', '🏷️', '🛒', '🔧', '💻', '📱', '👕', '🏠', '🍔', '🎮', '📚', '🎨'];

  form: FormGroup = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    parentId: [null],
    couleur: ['#3b82f6'],
    icone: [''],
    ordre: [0],
    actif: [true],
  });

  isEditMode = computed(() => !!this.route.snapshot.params['id']);

  availableParents = computed(() => {
    const current = this.categorie();
    return this.allCategories().filter(c => {
      // Exclude self and children (to prevent circular references)
      if (current && c.id === current.id) return false;
      return true;
    });
  });

  ngOnInit(): void {
    this.loadCategories();
    
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadCategorie(id);
    }
  }

  loadCategories(): void {
    this.categoriesService.getAll().subscribe({
      next: (categories) => this.allCategories.set(categories),
    });
  }

  loadCategorie(id: string): void {
    this.isLoading.set(true);
    this.categoriesService.getById(id).subscribe({
      next: (categorie) => {
        this.categorie.set(categorie);
        this.form.patchValue({
          nom: categorie.nom,
          description: categorie.description,
          parentId: categorie.parentId,
          couleur: categorie.couleur || '#3b82f6',
          icone: categorie.icone,
          ordre: categorie.ordre,
          actif: categorie.actif,
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.error('Catégorie non trouvée');
        this.router.navigate(['/categories']);
      },
    });
  }

  getParentLabel(categorie: Categorie): string {
    // Build path for nested display
    let label = categorie.nom;
    if (categorie.parent) {
      label = `${categorie.parent.nom} > ${label}`;
    }
    return label;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => this.form.get(key)?.markAsTouched());
      return;
    }

    this.isSaving.set(true);
    const data = this.form.value as CreateCategorieDto;

    const save$ = this.isEditMode()
      ? this.categoriesService.update(this.categorie()!.id, data)
      : this.categoriesService.create(data);

    save$.subscribe({
      next: () => {
        this.notificationService.success(this.isEditMode() ? 'Catégorie mise à jour' : 'Catégorie créée');
        this.router.navigate(['/categories']);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.notificationService.error(err.message || 'Erreur');
      },
    });
  }

  saveAndContinue(): void {
    if (this.form.invalid) return;

    this.isSaving.set(true);
    const data = this.form.value as CreateCategorieDto;

    this.categoriesService.update(this.categorie()!.id, data).subscribe({
      next: () => {
        this.notificationService.success('Catégorie mise à jour');
        this.isSaving.set(false);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.notificationService.error(err.message || 'Erreur');
      },
    });
  }
}
