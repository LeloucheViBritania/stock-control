import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { Utilisateur, Role, TierAbonnement } from '@core/models';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profil-page">
      <div class="page-header">
        <h1>Mon Profil</h1>
        <p class="text-muted">Gérez vos informations personnelles</p>
      </div>

      <div class="profil-grid">
        <!-- User Info Card -->
        <div class="card profil-card">
          <div class="profil-avatar">
            <div class="avatar">
              <span>{{ getInitials() }}</span>
            </div>
            <div class="profil-info">
              <h2>{{ user()?.nomComplet || user()?.nomUtilisateur }}</h2>
              <p class="text-muted">{{ user()?.email }}</p>
              <div class="profil-badges">
                <span class="badge" [class]="getRoleBadgeClass()">
                  {{ getRoleLabel() }}
                </span>
                <span class="badge" [class]="getTierBadgeClass()">
                  <i class="ph" [class.ph-crown]="isPremium()" [class.ph-user]="!isPremium()"></i>
                  {{ user()?.tierAbonnement }}
                </span>
              </div>
            </div>
          </div>

          <div class="profil-stats">
            <div class="stat-item">
              <span class="stat-value">{{ user()?.nomUtilisateur }}</span>
              <span class="stat-label">Nom d'utilisateur</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ formatDate(user()?.dateCreation) }}</span>
              <span class="stat-label">Membre depuis</span>
            </div>
            @if (isPremium() && user()?.dateExpiration) {
              <div class="stat-item">
                <span class="stat-value">{{ formatDate(user()?.dateExpiration) }}</span>
                <span class="stat-label">Expiration Premium</span>
              </div>
            }
          </div>
        </div>

        <!-- Edit Profile Form -->
        <div class="card">
          <div class="card__header">
            <h3 class="card__title">
              <i class="ph ph-user-circle"></i>
              Modifier mes informations
            </h3>
          </div>
          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
            <div class="form-group">
              <label class="form-group__label">Nom complet</label>
              <input
                type="text"
                formControlName="nomComplet"
                class="form-control"
                placeholder="Votre nom complet"
              />
            </div>

            <div class="form-group">
              <label class="form-group__label">Email</label>
              <input
                type="email"
                formControlName="email"
                class="form-control"
                [class.form-control--error]="isFieldInvalid('email')"
              />
              @if (isFieldInvalid('email')) {
                <span class="form-group__error">Email invalide</span>
              }
            </div>

            <button 
              type="submit" 
              class="btn btn--primary"
              [disabled]="profileForm.invalid || profileForm.pristine"
            >
              <i class="ph ph-check"></i>
              Enregistrer
            </button>
          </form>
        </div>

        <!-- Change Password -->
        <div class="card">
          <div class="card__header">
            <h3 class="card__title">
              <i class="ph ph-lock"></i>
              Changer le mot de passe
            </h3>
          </div>
          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
            <div class="form-group">
              <label class="form-group__label">Mot de passe actuel</label>
              <input
                type="password"
                formControlName="currentPassword"
                class="form-control"
                [class.form-control--error]="isPasswordFieldInvalid('currentPassword')"
              />
            </div>

            <div class="form-group">
              <label class="form-group__label">Nouveau mot de passe</label>
              <input
                type="password"
                formControlName="newPassword"
                class="form-control"
                [class.form-control--error]="isPasswordFieldInvalid('newPassword')"
              />
              @if (isPasswordFieldInvalid('newPassword')) {
                <span class="form-group__error">Min. 6 caractères</span>
              }
            </div>

            <div class="form-group">
              <label class="form-group__label">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                formControlName="confirmPassword"
                class="form-control"
                [class.form-control--error]="passwordMismatch()"
              />
              @if (passwordMismatch()) {
                <span class="form-group__error">Les mots de passe ne correspondent pas</span>
              }
            </div>

            <button 
              type="submit" 
              class="btn btn--secondary"
              [disabled]="passwordForm.invalid || isChangingPassword()"
            >
              @if (isChangingPassword()) {
                <span class="spinner spinner--sm"></span>
              } @else {
                <i class="ph ph-key"></i>
              }
              Changer le mot de passe
            </button>
          </form>
        </div>

        <!-- Account Status -->
        <div class="card">
          <div class="card__header">
            <h3 class="card__title">
              <i class="ph ph-info"></i>
              Statut du compte
            </h3>
          </div>
          <div class="status-list">
            <div class="status-item">
              <div class="status-icon status-icon--success">
                <i class="ph ph-check-circle"></i>
              </div>
              <div class="status-content">
                <span class="status-title">Compte actif</span>
                <span class="status-desc">Votre compte est en bon état</span>
              </div>
            </div>

            <div class="status-item">
              <div class="status-icon" [class.status-icon--success]="isPremium()" [class.status-icon--neutral]="!isPremium()">
                <i class="ph" [class.ph-crown]="isPremium()" [class.ph-user]="!isPremium()"></i>
              </div>
              <div class="status-content">
                <span class="status-title">Abonnement {{ user()?.tierAbonnement }}</span>
                <span class="status-desc">
                  @if (isPremium()) {
                    Accès à toutes les fonctionnalités
                  } @else {
                    Fonctionnalités de base uniquement
                  }
                </span>
              </div>
            </div>

            <div class="status-item">
              <div class="status-icon" [class]="getRoleIconClass()">
                <i class="ph ph-shield-check"></i>
              </div>
              <div class="status-content">
                <span class="status-title">Rôle : {{ getRoleLabel() }}</span>
                <span class="status-desc">{{ getRoleDescription() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profil-page {
      max-width: 1000px;
    }

    .page-header {
      margin-bottom: var(--space-8);

      h1 {
        margin-bottom: var(--space-2);
      }
    }

    .profil-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-6);
    }

    .profil-card {
      grid-column: span 2;
    }

    .profil-avatar {
      display: flex;
      align-items: center;
      gap: var(--space-6);
      margin-bottom: var(--space-6);
      padding-bottom: var(--space-6);
      border-bottom: 1px solid var(--neutral-200);
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: var(--text-2xl);
      font-weight: 600;
      font-family: var(--font-display);
    }

    .profil-info {
      h2 {
        font-size: var(--text-xl);
        margin-bottom: var(--space-1);
      }

      p {
        margin-bottom: var(--space-3);
      }
    }

    .profil-badges {
      display: flex;
      gap: var(--space-2);
    }

    .profil-stats {
      display: flex;
      gap: var(--space-8);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--neutral-900);
    }

    .stat-label {
      font-size: var(--text-sm);
      color: var(--neutral-500);
    }

    .status-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .status-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;

      &--success {
        background: var(--success-100);
        color: var(--success-600);
      }

      &--neutral {
        background: var(--neutral-100);
        color: var(--neutral-600);
      }

      &--warning {
        background: var(--warning-100);
        color: var(--warning-600);
      }

      &--primary {
        background: var(--primary-100);
        color: var(--primary-600);
      }
    }

    .status-content {
      display: flex;
      flex-direction: column;
    }

    .status-title {
      font-weight: 500;
      color: var(--neutral-800);
    }

    .status-desc {
      font-size: var(--text-sm);
      color: var(--neutral-500);
    }

    @media (max-width: 768px) {
      .profil-grid {
        grid-template-columns: 1fr;
      }

      .profil-card {
        grid-column: span 1;
      }

      .profil-avatar {
        flex-direction: column;
        text-align: center;
      }

      .profil-badges {
        justify-content: center;
      }

      .profil-stats {
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--space-6);
      }
    }
  `]
})
export class ProfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  user = this.authService.currentUser;
  isChangingPassword = signal(false);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  ngOnInit() {
    this.initForms();
  }

  initForms() {
    const user = this.user();
    
    this.profileForm = this.fb.group({
      nomComplet: [user?.nomComplet || ''],
      email: [user?.email || '', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  getInitials(): string {
    const user = this.user();
    if (!user) return '?';
    const name = user.nomComplet || user.nomUtilisateur;
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  isPremium(): boolean {
    return this.user()?.tierAbonnement === TierAbonnement.PREMIUM;
  }

  getRoleBadgeClass(): string {
    const role = this.user()?.role;
    switch (role) {
      case Role.ADMIN: return 'badge--error';
      case Role.GESTIONNAIRE: return 'badge--warning';
      default: return 'badge--secondary';
    }
  }

  getTierBadgeClass(): string {
    return this.isPremium() ? 'badge--primary' : 'badge--secondary';
  }

  getRoleLabel(): string {
    const role = this.user()?.role;
    switch (role) {
      case Role.ADMIN: return 'Administrateur';
      case Role.GESTIONNAIRE: return 'Gestionnaire';
      default: return 'Employé';
    }
  }

  getRoleDescription(): string {
    const role = this.user()?.role;
    switch (role) {
      case Role.ADMIN: return 'Accès complet à toutes les fonctionnalités';
      case Role.GESTIONNAIRE: return 'Gestion des stocks et des commandes';
      default: return 'Consultation et opérations de base';
    }
  }

  getRoleIconClass(): string {
    const role = this.user()?.role;
    switch (role) {
      case Role.ADMIN: return 'status-icon--primary';
      case Role.GESTIONNAIRE: return 'status-icon--warning';
      default: return 'status-icon--neutral';
    }
  }

  formatDate(date?: Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.profileForm.get(field);
    return control ? control.invalid && control.touched : false;
  }

  isPasswordFieldInvalid(field: string): boolean {
    const control = this.passwordForm.get(field);
    return control ? control.invalid && control.touched : false;
  }

  passwordMismatch(): boolean {
    const newPassword = this.passwordForm.get('newPassword')?.value;
    const confirm = this.passwordForm.get('confirmPassword')?.value;
    return confirm && newPassword !== confirm;
  }

  updateProfile() {
    if (this.profileForm.invalid) return;

    // TODO: Implement profile update API call
    this.toast.success('Profil mis à jour', 'Vos informations ont été enregistrées');
    this.profileForm.markAsPristine();
  }

  changePassword() {
    if (this.passwordForm.invalid || this.passwordMismatch()) return;

    this.isChangingPassword.set(true);
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.toast.success('Mot de passe modifié', 'Votre nouveau mot de passe est actif');
        this.passwordForm.reset();
        this.isChangingPassword.set(false);
      },
      error: (err) => {
        this.toast.error('Erreur', err.error?.message || 'Impossible de changer le mot de passe');
        this.isChangingPassword.set(false);
      }
    });
  }
}
