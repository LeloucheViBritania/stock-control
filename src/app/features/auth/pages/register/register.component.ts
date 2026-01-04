/**
 * Page d'inscription
 */
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Créer un compte</h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Commencez gratuitement, passez à Premium quand vous voulez
      </p>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-8 space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="prenom" class="form-label">Prénom</label>
            <input type="text" id="prenom" formControlName="prenom" class="form-input" placeholder="Jean" />
          </div>
          <div>
            <label for="nom" class="form-label">Nom</label>
            <input type="text" id="nom" formControlName="nom" class="form-input" placeholder="Dupont" />
          </div>
        </div>
        
        <div>
          <label for="email" class="form-label">Email</label>
          <input type="email" id="email" formControlName="email" class="form-input" placeholder="votre&#64;email.com" />
        </div>
        
        <div>
          <label for="entrepriseNom" class="form-label">Nom de l'entreprise (optionnel)</label>
          <input type="text" id="entrepriseNom" formControlName="entrepriseNom" class="form-input" placeholder="Ma Société SARL" />
        </div>
        
        <div>
          <label for="password" class="form-label">Mot de passe</label>
          <input type="password" id="password" formControlName="password" class="form-input" placeholder="••••••••" />
          <p class="form-hint">Minimum 8 caractères</p>
        </div>
        
        <div>
          <label for="confirmPassword" class="form-label">Confirmer le mot de passe</label>
          <input type="password" id="confirmPassword" formControlName="confirmPassword" class="form-input" placeholder="••••••••" />
        </div>
        
        <div>
          <label class="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" formControlName="acceptTerms" class="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500">
            <span class="text-sm text-gray-600 dark:text-gray-400">
              J'accepte les <a href="#" class="text-primary-600 hover:underline">conditions d'utilisation</a> 
              et la <a href="#" class="text-primary-600 hover:underline">politique de confidentialité</a>
            </span>
          </label>
        </div>
        
        <button type="submit" class="btn-primary w-full" [disabled]="form.invalid || isLoading">
          @if (isLoading) {
            Création...
          } @else {
            Créer mon compte
          }
        </button>
      </form>
      
      <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Déjà un compte ?
        <a routerLink="/auth/login" class="text-primary-600 hover:text-primary-500 font-medium">Se connecter</a>
      </p>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  isLoading = false;

  form: FormGroup = this.fb.group({
    prenom: ['', Validators.required],
    nom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    entrepriseNom: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    acceptTerms: [false, Validators.requiredTrue],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const { prenom, nom, email, entrepriseNom, password } = this.form.value;
    this.isLoading = true;
    this.authService.register({ prenom, nom, email, entrepriseNom, password }).subscribe({
      next: () => {
        this.notificationService.success('Compte créé avec succès !');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message || 'Erreur lors de l\'inscription');
      },
    });
  }
}
