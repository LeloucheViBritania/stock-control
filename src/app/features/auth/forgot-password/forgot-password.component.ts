import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/components/toast/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card animate-slide-up">
        <div class="auth-header">
          <div class="auth-logo">
            <i class="ph-duotone ph-key"></i>
          </div>
          <h1>Mot de passe oublié</h1>
          <p>Entrez votre email pour recevoir un lien de réinitialisation</p>
        </div>

        @if (!emailSent()) {
          <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label class="form-group__label" for="email">
                <i class="ph ph-envelope"></i>
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                formControlName="email"
                class="form-control"
                [class.form-control--error]="isFieldInvalid('email')"
                placeholder="votre@email.com"
              />
              @if (isFieldInvalid('email')) {
                <span class="form-group__error">Adresse email invalide</span>
              }
            </div>

            <button 
              type="submit" 
              class="btn btn--primary btn--lg w-full"
              [disabled]="isLoading()"
            >
              @if (isLoading()) {
                <span class="spinner"></span>
                Envoi en cours...
              } @else {
                <i class="ph ph-paper-plane-tilt"></i>
                Envoyer le lien
              }
            </button>
          </form>
        } @else {
          <div class="success-message">
            <div class="success-icon">
              <i class="ph-duotone ph-check-circle"></i>
            </div>
            <h3>Email envoyé !</h3>
            <p>
              Si un compte existe avec l'adresse <strong>{{ forgotForm.value.email }}</strong>,
              vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
            </p>
            <button class="btn btn--secondary" (click)="emailSent.set(false)">
              <i class="ph ph-arrow-left"></i>
              Réessayer avec un autre email
            </button>
          </div>
        }

        <div class="auth-footer">
          <p>
            <a routerLink="/auth/login">
              <i class="ph ph-arrow-left"></i>
              Retour à la connexion
            </a>
          </p>
        </div>
      </div>

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
      max-width: 440px;
      background: var(--neutral-0);
      border-radius: var(--radius-2xl);
      padding: var(--space-10);
      box-shadow: var(--shadow-xl);
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
      background: linear-gradient(135deg, var(--warning-500) 0%, var(--warning-600) 100%);
      border-radius: var(--radius-xl);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--space-5);
      box-shadow: 0 8px 24px -8px var(--warning-500);

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

    .success-message {
      text-align: center;
      padding: var(--space-6) 0;
    }

    .success-icon {
      width: 80px;
      height: 80px;
      background: var(--success-100);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--space-5);

      i {
        font-size: 2.5rem;
        color: var(--success-600);
      }
    }

    .success-message h3 {
      font-size: var(--text-xl);
      margin-bottom: var(--space-3);
    }

    .success-message p {
      color: var(--neutral-600);
      margin-bottom: var(--space-6);
      line-height: 1.6;
    }

    .auth-footer {
      text-align: center;
      margin-top: var(--space-6);

      a {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        color: var(--primary-600);
        font-weight: 500;

        &:hover {
          text-decoration: underline;
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
        background: var(--warning-500);
        top: -150px;
        right: -150px;
      }

      &--2 {
        width: 350px;
        height: 350px;
        background: var(--primary-500);
        bottom: -80px;
        left: -80px;
      }
    }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  forgotForm: FormGroup;
  isLoading = signal(false);
  emailSent = signal(false);

  constructor() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.forgotForm.get(field);
    return control ? control.invalid && control.touched : false;
  }

  onSubmit() {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { email } = this.forgotForm.value;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.emailSent.set(true);
      },
      error: () => {
        // Always show success to prevent email enumeration
        this.isLoading.set(false);
        this.emailSent.set(true);
      }
    });
  }
}
