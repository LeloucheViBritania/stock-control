/**
 * Page mot de passe oublié
 */
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div>
      <a routerLink="/auth/login" class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-8">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Retour à la connexion
      </a>
      
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Mot de passe oublié ?</h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Entrez votre email et nous vous enverrons un lien de réinitialisation.
      </p>
      
      @if (!emailSent) {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div>
            <label for="email" class="form-label">Email</label>
            <input type="email" id="email" formControlName="email" class="form-input" placeholder="votre&#64;email.com" />
          </div>
          
          <button type="submit" class="btn-primary w-full" [disabled]="form.invalid || isLoading">
            @if (isLoading) {
              Envoi en cours...
            } @else {
              Envoyer le lien
            }
          </button>
        </form>
      } @else {
        <div class="mt-8 p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p class="font-medium text-success-800 dark:text-success-400">Email envoyé !</p>
              <p class="text-sm text-success-700 dark:text-success-500">
                Vérifiez votre boîte de réception et suivez les instructions.
              </p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  isLoading = false;
  emailSent = false;

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading = true;
    this.authService.forgotPassword(this.form.value.email).subscribe({
      next: () => {
        this.emailSent = true;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.error('Erreur lors de l\'envoi');
      },
    });
  }
}
