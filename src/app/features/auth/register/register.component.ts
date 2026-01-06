import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/components/toast/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card animate-slide-up">
        <!-- Logo & Title -->
        <div class="auth-header">
          <div class="auth-logo">
            <i class="ph-duotone ph-cube"></i>
          </div>
          <h1>Créer un compte</h1>
          <p>Rejoignez Stock Control</p>
        </div>

        <!-- Register Form -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-group__label" for="nomComplet">
              <i class="ph ph-identification-card"></i>
              Nom complet
            </label>
            <input
              type="text"
              id="nomComplet"
              formControlName="nomComplet"
              class="form-control"
              [class.form-control--error]="isFieldInvalid('nomComplet')"
              placeholder="Jean Dupont"
            />
          </div>

          <div class="form-group">
            <label class="form-group__label" for="nomUtilisateur">
              <i class="ph ph-user"></i>
              Nom d'utilisateur *
            </label>
            <input
              type="text"
              id="nomUtilisateur"
              formControlName="nomUtilisateur"
              class="form-control"
              [class.form-control--error]="isFieldInvalid('nomUtilisateur')"
              placeholder="jeandupont"
            />
            @if (isFieldInvalid('nomUtilisateur')) {
              <span class="form-group__error">
                Le nom d'utilisateur est requis (min. 3 caractères)
              </span>
            }
          </div>

          <div class="form-group">
            <label class="form-group__label" for="email">
              <i class="ph ph-envelope"></i>
              Email *
            </label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              [class.form-control--error]="isFieldInvalid('email')"
              placeholder="jean.dupont@email.com"
            />
            @if (isFieldInvalid('email')) {
              <span class="form-group__error">
                Adresse email invalide
              </span>
            }
          </div>

          <div class="form-group">
            <label class="form-group__label" for="motDePasse">
              <i class="ph ph-lock"></i>
              Mot de passe *
            </label>
            <div class="password-input">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="motDePasse"
                formControlName="motDePasse"
                class="form-control"
                [class.form-control--error]="isFieldInvalid('motDePasse')"
                placeholder="Min. 6 caractères"
              />
              <button 
                type="button" 
                class="password-toggle"
                (click)="showPassword = !showPassword"
              >
                <i class="ph" [class.ph-eye]="!showPassword" [class.ph-eye-slash]="showPassword"></i>
              </button>
            </div>
            @if (isFieldInvalid('motDePasse')) {
              <span class="form-group__error">
                Le mot de passe doit contenir au moins 6 caractères
              </span>
            }
          </div>

          <div class="form-group">
            <label class="form-group__label" for="confirmMotDePasse">
              <i class="ph ph-lock-key"></i>
              Confirmer le mot de passe *
            </label>
            <input
              type="password"
              id="confirmMotDePasse"
              formControlName="confirmMotDePasse"
              class="form-control"
              [class.form-control--error]="isFieldInvalid('confirmMotDePasse') || passwordMismatch"
              placeholder="Répétez le mot de passe"
            />
            @if (passwordMismatch) {
              <span class="form-group__error">
                Les mots de passe ne correspondent pas
              </span>
            }
          </div>

          <div class="form-group">
            <label class="form-check">
              <input type="checkbox" formControlName="acceptTerms" />
              <span class="form-check__label">
                J'accepte les <a href="#">conditions d'utilisation</a>
              </span>
            </label>
            @if (isFieldInvalid('acceptTerms')) {
              <span class="form-group__error">
                Vous devez accepter les conditions
              </span>
            }
          </div>

          <button 
            type="submit" 
            class="btn btn--primary btn--lg w-full"
            [disabled]="isLoading"
          >
            @if (isLoading) {
              <span class="spinner"></span>
              Création en cours...
            } @else {
              <i class="ph ph-user-plus"></i>
              Créer mon compte
            }
          </button>
        </form>

        <!-- Login Link -->
        <div class="auth-footer">
          <p>
            Déjà un compte ?
            <a routerLink="/auth/login">Se connecter</a>
          </p>
        </div>
      </div>

      <!-- Background Decoration -->
      <div class="auth-bg">
        <div class="auth-bg__shape auth-bg__shape--1"></div>
        <div class="auth-bg__shape auth-bg__shape--2"></div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-6);
      background: linear-gradient(135deg, var(--neutral-900) 0%, var(--neutral-800) 100%);
      position: relative;
      overflow: hidden;
    }

    .auth-card {
      width: 100%;
      max-width: 480px;
      background: var(--neutral-0);
      border-radius: var(--radius-2xl);
      padding: var(--space-8);
      box-shadow: var(--shadow-xl), 0 0 100px -20px rgba(0, 102, 255, 0.3);
      position: relative;
      z-index: 10;
    }

    .auth-header {
      text-align: center;
      margin-bottom: var(--space-6);
    }

    .auth-logo {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
      border-radius: var(--radius-xl);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--space-4);
      box-shadow: 0 8px 24px -8px var(--primary-500);

      i {
        font-size: 1.75rem;
        color: white;
      }
    }

    .auth-header h1 {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--neutral-900);
      margin-bottom: var(--space-1);
    }

    .auth-header p {
      color: var(--neutral-500);
      margin: 0;
      font-size: var(--text-sm);
    }

    .auth-form {
      margin-bottom: var(--space-5);
    }

    .form-group {
      margin-bottom: var(--space-4);
    }

    .form-group__label {
      display: flex;
      align-items: center;
      gap: var(--space-2);

      i {
        color: var(--neutral-400);
      }
    }

    .password-input {
      position: relative;

      .form-control {
        padding-right: var(--space-12);
      }
    }

    .password-toggle {
      position: absolute;
      right: var(--space-3);
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--neutral-400);
      cursor: pointer;
      padding: var(--space-2);

      &:hover {
        color: var(--neutral-600);
      }

      i {
        font-size: 1.25rem;
      }
    }

    .form-check__label a {
      color: var(--primary-600);
      
      &:hover {
        text-decoration: underline;
      }
    }

    .auth-footer {
      text-align: center;

      p {
        color: var(--neutral-500);
        margin: 0;
        font-size: var(--text-sm);

        a {
          color: var(--primary-600);
          font-weight: 500;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    .auth-bg {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .auth-bg__shape {
      position: absolute;
      border-radius: 50%;
      opacity: 0.1;

      &--1 {
        width: 500px;
        height: 500px;
        background: var(--primary-500);
        top: -150px;
        right: -150px;
      }

      &--2 {
        width: 350px;
        height: 350px;
        background: var(--secondary-500);
        bottom: -80px;
        left: -80px;
      }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor() {
    this.registerForm = this.fb.group({
      nomComplet: [''],
      nomUtilisateur: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmMotDePasse: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  get passwordMismatch(): boolean {
    const password = this.registerForm.get('motDePasse')?.value;
    const confirm = this.registerForm.get('confirmMotDePasse')?.value;
    return confirm && password !== confirm;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.passwordMismatch) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { nomComplet, nomUtilisateur, email, motDePasse } = this.registerForm.value;

    this.authService.register({ nomComplet, nomUtilisateur, email, motDePasse }).subscribe({
      next: () => {
        this.toast.success('Compte créé', 'Vous pouvez maintenant vous connecter');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading = false;
        const message = err.error?.message || 'Une erreur est survenue';
        this.toast.error('Échec de l\'inscription', message);
      }
    });
  }
}
