import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/components/toast/toast.service';

@Component({
  selector: 'app-login',
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
          <h1>Stock Control</h1>
          <p>Connectez-vous à votre compte</p>
        </div>

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-group__label" for="nomUtilisateur">
              <i class="ph ph-user"></i>
              Nom d'utilisateur
            </label>
            <input
              type="text"
              id="nomUtilisateur"
              formControlName="nomUtilisateur"
              class="form-control"
              [class.form-control--error]="isFieldInvalid('nomUtilisateur')"
              placeholder="Entrez votre nom d'utilisateur"
              autocomplete="username"
            />
            @if (isFieldInvalid('nomUtilisateur')) {
              <span class="form-group__error">
                Le nom d'utilisateur est requis
              </span>
            }
          </div>

          <div class="form-group">
            <label class="form-group__label" for="motDePasse">
              <i class="ph ph-lock"></i>
              Mot de passe
            </label>
            <div class="password-input">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="motDePasse"
                formControlName="motDePasse"
                class="form-control"
                [class.form-control--error]="isFieldInvalid('motDePasse')"
                placeholder="Entrez votre mot de passe"
                autocomplete="current-password"
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
                Le mot de passe est requis
              </span>
            }
          </div>

          <div class="form-options">
            <label class="form-check">
              <input type="checkbox" formControlName="rememberMe" />
              <span class="form-check__label">Se souvenir de moi</span>
            </label>
            <a routerLink="/auth/forgot-password" class="forgot-link">
              Mot de passe oublié ?
            </a>
          </div>

          <button 
            type="submit" 
            class="btn btn--primary btn--lg w-full"
            [disabled]="isLoading"
          >
            @if (isLoading) {
              <span class="spinner"></span>
              Connexion...
            } @else {
              <i class="ph ph-sign-in"></i>
              Se connecter
            }
          </button>
        </form>

        <!-- Demo Accounts -->
        <div class="demo-accounts">
          <p class="demo-title">Comptes de démonstration :</p>
          <div class="demo-list">
            <button class="demo-btn" (click)="fillDemo('admin', 'admin123')">
              <span class="demo-role">Admin</span>
              <span class="demo-info">admin / admin123</span>
            </button>
            <button class="demo-btn" (click)="fillDemo('gestionnaire', 'gestionnaire123')">
              <span class="demo-role">Gestionnaire</span>
              <span class="demo-info">gestionnaire / gestionnaire123</span>
            </button>
            <button class="demo-btn" (click)="fillDemo('employe', 'employe123')">
              <span class="demo-role">Employé</span>
              <span class="demo-info">employe / employe123</span>
            </button>
          </div>
        </div>

        <!-- Register Link -->
        <div class="auth-footer">
          <p>
            Pas encore de compte ?
            <a routerLink="/auth/register">Créer un compte</a>
          </p>
        </div>
      </div>

      <!-- Background Decoration -->
      <div class="auth-bg">
        <div class="auth-bg__shape auth-bg__shape--1"></div>
        <div class="auth-bg__shape auth-bg__shape--2"></div>
        <div class="auth-bg__shape auth-bg__shape--3"></div>
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
      max-width: 440px;
      background: var(--neutral-0);
      border-radius: var(--radius-2xl);
      padding: var(--space-10);
      box-shadow: var(--shadow-xl), 0 0 100px -20px rgba(0, 102, 255, 0.3);
      position: relative;
      z-index: 10;
    }

    .auth-header {
      text-align: center;
      margin-bottom: var(--space-8);
    }

    .auth-logo {
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
      border-radius: var(--radius-xl);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--space-5);
      box-shadow: 0 8px 24px -8px var(--primary-500);

      i {
        font-size: 2rem;
        color: white;
      }
    }

    .auth-header h1 {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: 700;
      color: var(--neutral-900);
      margin-bottom: var(--space-2);
    }

    .auth-header p {
      color: var(--neutral-500);
      margin: 0;
    }

    .auth-form {
      margin-bottom: var(--space-6);
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
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color var(--transition-fast);

      &:hover {
        color: var(--neutral-600);
      }

      i {
        font-size: 1.25rem;
      }
    }

    .form-options {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-6);
    }

    .forgot-link {
      font-size: var(--text-sm);
      color: var(--primary-600);

      &:hover {
        color: var(--primary-700);
        text-decoration: underline;
      }
    }

    .demo-accounts {
      background: var(--neutral-50);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .demo-title {
      font-size: var(--text-xs);
      color: var(--neutral-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: var(--space-3);
    }

    .demo-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .demo-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: var(--space-2) var(--space-3);
      background: var(--neutral-0);
      border: 1px solid var(--neutral-200);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        border-color: var(--primary-300);
        background: var(--primary-50);
      }
    }

    .demo-role {
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--neutral-700);
    }

    .demo-info {
      font-size: var(--text-xs);
      color: var(--neutral-500);
      font-family: var(--font-mono);
    }

    .auth-footer {
      text-align: center;

      p {
        color: var(--neutral-500);
        margin: 0;

        a {
          color: var(--primary-600);
          font-weight: 500;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    // Background decorations
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
        width: 600px;
        height: 600px;
        background: var(--primary-500);
        top: -200px;
        right: -200px;
      }

      &--2 {
        width: 400px;
        height: 400px;
        background: var(--secondary-500);
        bottom: -100px;
        left: -100px;
      }

      &--3 {
        width: 300px;
        height: 300px;
        background: var(--primary-400);
        top: 50%;
        left: 20%;
        transform: translateY(-50%);
      }
    }

    @media (max-width: 480px) {
      .auth-card {
        padding: var(--space-6);
      }

      .form-options {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-3);
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor() {
    this.loginForm = this.fb.group({
      nomUtilisateur: ['', Validators.required],
      motDePasse: ['', Validators.required],
      rememberMe: [false]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  fillDemo(username: string, password: string): void {
    this.loginForm.patchValue({
      nomUtilisateur: username,
      motDePasse: password
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { nomUtilisateur, motDePasse } = this.loginForm.value;

    this.authService.login({ nomUtilisateur, motDePasse }).subscribe({
      next: () => {
        this.toast.success('Connexion réussie', 'Bienvenue !');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        const message = err.error?.message || 'Identifiants incorrects';
        this.toast.error('Échec de connexion', message);
      }
    });
  }
}
