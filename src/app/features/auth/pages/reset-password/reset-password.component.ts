/**
 * Page réinitialisation mot de passe
 */
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Nouveau mot de passe</h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Choisissez un nouveau mot de passe sécurisé.
      </p>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
        <div>
          <label for="password" class="form-label">Nouveau mot de passe</label>
          <input type="password" id="password" formControlName="password" class="form-input" placeholder="••••••••" />
          <p class="form-hint">Minimum 8 caractères</p>
        </div>
        
        <div>
          <label for="confirmPassword" class="form-label">Confirmer le mot de passe</label>
          <input type="password" id="confirmPassword" formControlName="confirmPassword" class="form-input" placeholder="••••••••" />
        </div>
        
        <button type="submit" class="btn-primary w-full" [disabled]="form.invalid || isLoading">
          @if (isLoading) {
            Modification...
          } @else {
            Modifier le mot de passe
          }
        </button>
      </form>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);

  isLoading = false;
  private token = '';

  form: FormGroup = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) {
      this.router.navigate(['/auth/login']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    if (this.form.value.password !== this.form.value.confirmPassword) {
      this.notificationService.error('Les mots de passe ne correspondent pas');
      return;
    }
    this.isLoading = true;
    this.authService.resetPassword(this.token, this.form.value.password).subscribe({
      next: () => {
        this.notificationService.success('Mot de passe modifié avec succès !');
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.error('Lien invalide ou expiré');
      },
    });
  }
}
