import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CategoriesService } from '@core/services/categories.service';
import { ToastService } from '@core/services/notifications.service';
import { Categorie } from '@core/models';

@Component({
  selector: 'app-categorie-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-page" style="max-width: 600px;">
      <div class="page-header">
        <a routerLink="/categories" class="back-link"><i class="ph ph-arrow-left"></i></a>
        <div><h1>{{ isEditMode() ? 'Modifier' : 'Nouvelle' }} catégorie</h1></div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="card">
        <div class="form-group">
          <label class="form-group__label">Nom *</label>
          <input type="text" formControlName="nom" class="form-control" [class.form-control--error]="isFieldInvalid('nom')" placeholder="Nom de la catégorie" />
          @if (isFieldInvalid('nom')) { <span class="form-group__error">Le nom est requis</span> }
        </div>

        <div class="form-group">
          <label class="form-group__label">Description</label>
          <textarea formControlName="description" class="form-control" rows="3" placeholder="Description..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-group__label">Catégorie parente</label>
          <select formControlName="parentId" class="form-control">
            <option [ngValue]="null">Aucune (catégorie racine)</option>
            @for (cat of categories(); track cat.id) {
              <option [ngValue]="cat.id">{{ cat.nom }}</option>
            }
          </select>
        </div>

        <div class="form-actions">
          <a routerLink="/categories" class="btn btn--secondary">Annuler</a>
          <button type="submit" class="btn btn--primary" [disabled]="form.invalid || isSubmitting()">
            @if (isSubmitting()) { <span class="spinner spinner--sm"></span> }
            {{ isEditMode() ? 'Enregistrer' : 'Créer' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page-header { display: flex; gap: var(--space-4); margin-bottom: var(--space-6); }
    .back-link { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-lg); background: var(--neutral-100); &:hover { background: var(--neutral-200); } }
    .form-actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-6); padding-top: var(--space-6); border-top: 1px solid var(--neutral-200); }
  `]
})
export class CategorieFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private categoriesService = inject(CategoriesService);
  private toast = inject(ToastService);

  form!: FormGroup;
  categories = signal<Categorie[]>([]);
  isEditMode = signal(false);
  isSubmitting = signal(false);

  ngOnInit() {
    this.form = this.fb.group({ nom: ['', Validators.required], description: [''], parentId: [null] });
    this.loadCategories();
    const id = this.route.snapshot.params['id'];
    if (id) { this.isEditMode.set(true); this.loadCategorie(+id); }
  }

  loadCategories() {
    this.categoriesService.getAll({ limit: 100 }).subscribe({ next: (res) => this.categories.set(res.data) });
  }

  loadCategorie(id: number) {
    this.categoriesService.getById(id).subscribe({
      next: (cat) => this.form.patchValue({ nom: cat.nom, description: cat.description, parentId: cat.parentId }),
      error: () => { this.toast.error('Erreur', 'Catégorie introuvable'); this.router.navigate(['/categories']); }
    });
  }

  isFieldInvalid(field: string): boolean { const c = this.form.get(field); return c ? c.invalid && c.touched : false; }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSubmitting.set(true);
    const data = this.form.value;
    const id = this.route.snapshot.params['id'];

    const request$ = this.isEditMode() ? this.categoriesService.update(+id, data) : this.categoriesService.create(data);
    request$.subscribe({
      next: () => { this.toast.success(this.isEditMode() ? 'Catégorie modifiée' : 'Catégorie créée'); this.router.navigate(['/categories']); },
      error: (err) => { this.isSubmitting.set(false); this.toast.error('Erreur', err.error?.message); }
    });
  }
}
