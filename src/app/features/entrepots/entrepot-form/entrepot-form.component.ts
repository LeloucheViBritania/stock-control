import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EntrepotsService } from '@core/services/entrepots.service';
import { ToastService } from '@core/services/notifications.service';

@Component({
  selector: 'app-entrepot-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-page" style="max-width: 700px;">
      <div class="page-header">
        <a routerLink="/entrepots" class="back-link"><i class="ph ph-arrow-left"></i></a>
        <div><h1>{{ isEditMode() ? 'Modifier l\\'entrepôt' : 'Nouvel entrepôt' }}</h1></div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="card">
        <div class="form-group">
          <label class="form-group__label">Nom *</label>
          <input type="text" formControlName="nom" class="form-control" [class.form-control--error]="isFieldInvalid('nom')" placeholder="Nom de l'entrepôt" />
        </div>
        <div class="form-group">
          <label class="form-group__label">Adresse</label>
          <textarea formControlName="adresse" class="form-control" rows="2" placeholder="Adresse complète"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-group__label">Capacité</label>
            <input type="number" formControlName="capacite" class="form-control" min="0" placeholder="Capacité max" />
          </div>
          <div class="form-group">
            <label class="form-group__label">Téléphone</label>
            <input type="text" formControlName="telephone" class="form-control" placeholder="Téléphone" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-check">
            <input type="checkbox" formControlName="estPrincipal" />
            <span class="form-check__label">Entrepôt principal</span>
          </label>
        </div>
        <div class="form-group">
          <label class="form-check">
            <input type="checkbox" formControlName="estActif" />
            <span class="form-check__label">Entrepôt actif</span>
          </label>
        </div>

        <div class="form-actions">
          <a routerLink="/entrepots" class="btn btn--secondary">Annuler</a>
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
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .form-actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-6); padding-top: var(--space-6); border-top: 1px solid var(--neutral-200); }
  `]
})
export class EntrepotFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private entrepotsService = inject(EntrepotsService);
  private toast = inject(ToastService);

  form!: FormGroup;
  isEditMode = signal(false);
  isSubmitting = signal(false);

  ngOnInit() {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      adresse: [''],
      capacite: [null],
      telephone: [''],
      estPrincipal: [false],
      estActif: [true]
    });

    const id = this.route.snapshot.params['id'];
    if (id) { this.isEditMode.set(true); this.loadEntrepot(+id); }
  }

  loadEntrepot(id: number) {
    this.entrepotsService.getById(id).subscribe({
      next: (e) => this.form.patchValue(e),
      error: () => { this.toast.error('Erreur', 'Entrepôt introuvable'); this.router.navigate(['/entrepots']); }
    });
  }

  isFieldInvalid(field: string): boolean { const c = this.form.get(field); return c ? c.invalid && c.touched : false; }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSubmitting.set(true);
    const id = this.route.snapshot.params['id'];
    const request$ = this.isEditMode() ? this.entrepotsService.update(+id, this.form.value) : this.entrepotsService.create(this.form.value);
    request$.subscribe({
      next: (e) => { this.toast.success(this.isEditMode() ? 'Entrepôt modifié' : 'Entrepôt créé'); this.router.navigate(['/entrepots', e.id]); },
      error: (err) => { this.isSubmitting.set(false); this.toast.error('Erreur', err.error?.message); }
    });
  }
}
