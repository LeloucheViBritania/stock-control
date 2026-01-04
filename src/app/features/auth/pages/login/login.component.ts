/**
 * Page de connexion
 */
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div>
      <!-- Mobile Logo -->
      <div class="lg:hidden text-center mb-8">
        <div class="inline-flex items-center gap-2">
          <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <span class="text-2xl font-bold text-gray-900 dark:text-white">GStock</span>
        </div>
      </div>
      
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Connexion</h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Connectez-vous à votre compte pour continuer
      </p>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
        <!-- Email -->
        <div>
          <label for="email" class="form-label">Email</label>
          <input
            type="email"
            id="email"
            formControlName="email"
            class="form-input"
            [class.form-input-error]="form.get('email')?.invalid && form.get('email')?.touched"
            placeholder="votre@email.com"
          />
          @if (form.get('email')?.invalid && form.get('email')?.touched) {
            <p class="form-error">Email invalide</p>
          }
        </div>
        
        <!-- Password -->
        <div>
          <label for="password" class="form-label">Mot de passe</label>
          <input
            type="password"
            id="password"
            formControlName="password"
            class="form-input"
            [class.form-input-error]="form.get('password')?.invalid && form.get('password')?.touched"
            placeholder="••••••••"
          />
          @if (form.get('password')?.invalid && form.get('password')?.touched) {
            <p class="form-error">Mot de passe requis</p>
          }
        </div>
        
        <!-- Remember & Forgot -->
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" formControlName="remember" class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500">
            <span class="text-sm text-gray-600 dark:text-gray-400">Se souvenir de moi</span>
          </label>
          <a routerLink="/auth/forgot-password" class="text-sm text-primary-600 hover:text-primary-500">
            Mot de passe oublié ?
          </a>
        </div>
        
        <!-- Submit -->
        <button
          type="submit"
          class="btn-primary w-full"
          [disabled]="form.invalid || isLoading"
        >
          @if (isLoading) {
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connexion...
          } @else {
            Se connecter
          }
        </button>
      </form>
      
      <!-- Register Link -->
      <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Pas encore de compte ?
        <a routerLink="/auth/register" class="text-primary-600 hover:text-primary-500 font-medium">
          Créer un compte
        </a>
      </p>
    </div>
  `,
  styles: [],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  isLoading = false;

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [false],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    const { email, password } = this.form.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.notificationService.success('Connexion réussie !');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message || 'Identifiants incorrects');
      },
    });
  }
}
