import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UtilisateursService } from '@core/services/utilisateurs.service';
import { ToastService } from '@core/services/notifications.service';
import { Role, TierAbonnement } from '@core/models';

@Component({
  selector: 'app-utilisateur-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-page" style="max-width: 700px;">
      <div class="page-header">
        <a routerLink="/utilisateurs" class="back-link"><i class="ph ph-arrow-left"></i></a>
        <div><h1>{{ isEditMode() ? 'Modifier l\\'utilisateur' : 'Nouvel utilisateur' }}</h1></div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="card">
        <div class="form-row">
          <div class="form-group">
            <label class="form-group__label">Nom d'utilisateur *</label>
            <input type="text" formControlName="nomUtilisateur" class="form-control" [class.form-control--error]="isFieldInvalid('nomUtilisateur')" placeholder="nom_utilisateur" />
          </div>
          <div class="form-group">
            <label class="form-group__label">Nom complet</label>
            <input type="text" formControlName="nomComplet" class="form-control" placeholder="Prénom Nom" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-group__label">Email *</label>
          <input type="email" formControlName="email" class="form-control" [class.form-control--error]="isFieldInvalid('email')" placeholder="email@exemple.com" />
        </div>

        @if (!isEditMode()) {
          <div class="form-group">
            <label class="form-group__label">Mot de passe *</label>
            <input type="password" formControlName="motDePasse" class="form-control" [class.form-control--error]="isFieldInvalid('motDePasse')" placeholder="Minimum 6 caractères" />
          </div>
        }

        <div class="form-row">
          <div class="form-group">
            <label class="form-group__label">Rôle *</label>
            <select formControlName="role" class="form-control">
              <option value="EMPLOYE">Employé</option>
              <option value="GESTIONNAIRE">Gestionnaire</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-group__label">Abonnement</label>
            <select formControlName="tierAbonnement" class="form-control">
              <option value="GRATUIT">Gratuit</option>
              <option value="PREMIUM">Premium</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-check">
            <input type="checkbox" formControlName="estActif" />
            <span class="form-check__label">Compte actif</span>
          </label>
        </div>

        <div class="form-actions">
          <a routerLink="/utilisateurs" class="btn btn--secondary">Annuler</a>
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
    @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; } }
  `]
})
export class UtilisateurFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private utilisateursService = inject(UtilisateursService);
  private toast = inject(ToastService);

  form!: FormGroup;
  isEditMode = signal(false);
  isSubmitting = signal(false);

  ngOnInit() {
    this.form = this.fb.group({
      nomUtilisateur: ['', [Validators.required, Validators.minLength(3)]],
      nomComplet: [''],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      role: ['EMPLOYE', Validators.required],
      tierAbonnement: ['GRATUIT'],
      estActif: [true]
    });

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.form.get('motDePasse')?.clearValidators();
      this.form.get('motDePasse')?.updateValueAndValidity();
      this.loadUtilisateur(+id);
    }
  }

  loadUtilisateur(id: number) {
    this.utilisateursService.getById(id).subscribe({
      next: (u) => this.form.patchValue({ nomUtilisateur: u.nomUtilisateur, nomComplet: u.nomComplet, email: u.email, role: u.role, tierAbonnement: u.tierAbonnement, estActif: u.estActif }),
      error: () => { this.toast.error('Erreur', 'Utilisateur introuvable'); this.router.navigate(['/utilisateurs']); }
    });
  }

  isFieldInvalid(field: string): boolean { const c = this.form.get(field); return c ? c.invalid && c.touched : false; }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSubmitting.set(true);
    const id = this.route.snapshot.params['id'];
    const data = { ...this.form.value };
    if (this.isEditMode() && !data.motDePasse) delete data.motDePasse;

    const request$ = this.isEditMode() ? this.utilisateursService.update(+id, data) : this.utilisateursService.create(data);
    request$.subscribe({
      next: (u) => { this.toast.success(this.isEditMode() ? 'Utilisateur modifié' : 'Utilisateur créé'); this.router.navigate(['/utilisateurs', u.id]); },
      error: (err) => { this.isSubmitting.set(false); this.toast.error('Erreur', err.error?.message); }
    });
  }
}
