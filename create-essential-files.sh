#!/bin/bash

# ===========================================
# SCRIPT DE CRÉATION DES FICHIERS ESSENTIELS
# ===========================================

cd /home/claude/gestion-stock-frontend

# ============ REGISTER COMPONENT ============
cat > src/app/features/auth/pages/register/register.component.ts << 'EOF'
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
  template: \`
    <div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Créer un compte</h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Inscrivez-vous pour commencer</p>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="prenom" class="form-label">Prénom</label>
            <input type="text" id="prenom" formControlName="prenom" class="form-input" placeholder="Jean"/>
          </div>
          <div>
            <label for="nom" class="form-label">Nom</label>
            <input type="text" id="nom" formControlName="nom" class="form-input" placeholder="Dupont"/>
          </div>
        </div>
        
        <div>
          <label for="email" class="form-label">Email</label>
          <input type="email" id="email" formControlName="email" class="form-input" placeholder="votre@email.com"/>
        </div>
        
        <div>
          <label for="password" class="form-label">Mot de passe</label>
          <input type="password" id="password" formControlName="password" class="form-input" placeholder="••••••••"/>
        </div>
        
        <div>
          <label for="confirmPassword" class="form-label">Confirmer le mot de passe</label>
          <input type="password" id="confirmPassword" formControlName="confirmPassword" class="form-input" placeholder="••••••••"/>
        </div>
        
        <button type="submit" class="btn-primary w-full" [disabled]="form.invalid || isLoading">
          @if (isLoading) { Inscription... } @else { S'inscrire }
        </button>
      </form>
      
      <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Déjà un compte ? <a routerLink="/auth/login" class="text-primary-600 font-medium">Se connecter</a>
      </p>
    </div>
  \`,
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
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading = true;
    const { email, password, nom, prenom } = this.form.value;
    this.authService.register({ email, password, nom, prenom }).subscribe({
      next: () => {
        this.notificationService.success('Inscription réussie !');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.error(err.message || 'Erreur lors de l\'inscription');
      },
    });
  }
}
EOF

# ============ FORGOT PASSWORD COMPONENT ============
cat > src/app/features/auth/pages/forgot-password/forgot-password.component.ts << 'EOF'
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
  template: \`
    <div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Mot de passe oublié</h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Entrez votre email pour recevoir un lien de réinitialisation</p>
      
      @if (!emailSent) {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div>
            <label for="email" class="form-label">Email</label>
            <input type="email" id="email" formControlName="email" class="form-input" placeholder="votre@email.com"/>
          </div>
          <button type="submit" class="btn-primary w-full" [disabled]="form.invalid || isLoading">
            @if (isLoading) { Envoi... } @else { Envoyer le lien }
          </button>
        </form>
      } @else {
        <div class="mt-8 p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
          <p class="text-success-700 dark:text-success-400">Un email a été envoyé à {{ form.value.email }}</p>
        </div>
      }
      
      <p class="mt-6 text-center">
        <a routerLink="/auth/login" class="text-primary-600 font-medium">Retour à la connexion</a>
      </p>
    </div>
  \`,
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
EOF

# ============ RESET PASSWORD COMPONENT ============
cat > src/app/features/auth/pages/reset-password/reset-password.component.ts << 'EOF'
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: \`
    <div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Réinitialiser le mot de passe</h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Entrez votre nouveau mot de passe</p>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
        <div>
          <label for="password" class="form-label">Nouveau mot de passe</label>
          <input type="password" id="password" formControlName="password" class="form-input"/>
        </div>
        <div>
          <label for="confirmPassword" class="form-label">Confirmer</label>
          <input type="password" id="confirmPassword" formControlName="confirmPassword" class="form-input"/>
        </div>
        <button type="submit" class="btn-primary w-full" [disabled]="form.invalid || isLoading">
          @if (isLoading) { Réinitialisation... } @else { Réinitialiser }
        </button>
      </form>
    </div>
  \`,
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  isLoading = false;

  form: FormGroup = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading = true;
    const token = this.route.snapshot.queryParams['token'];
    this.authService.resetPassword(token, this.form.value.password).subscribe({
      next: () => {
        this.notificationService.success('Mot de passe réinitialisé !');
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.error('Erreur lors de la réinitialisation');
      },
    });
  }
}
EOF

# ============ DASHBOARD HOME COMPONENT ============
cat > src/app/features/dashboard/pages/dashboard-home/dashboard-home.component.ts << 'EOF'
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: \`
    <div class="space-y-6">
      <div class="page-header">
        <h1 class="page-title">Tableau de bord</h1>
        <p class="page-subtitle">Bienvenue, {{ authService.user()?.prenom }} !</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @for (stat of stats(); track stat.label) {
          <div class="card card-body">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ stat.value }}</p>
              </div>
              <div class="w-12 h-12 rounded-lg flex items-center justify-center" [class]="stat.bgColor">
                <span [innerHTML]="stat.icon" class="w-6 h-6" [class]="stat.iconColor"></span>
              </div>
            </div>
            @if (stat.change) {
              <p class="mt-2 text-sm" [class.text-success-600]="stat.change > 0" [class.text-danger-600]="stat.change < 0">
                {{ stat.change > 0 ? '+' : '' }}{{ stat.change }}% vs mois dernier
              </p>
            }
          </div>
        }
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <div class="card-header">
          <h3 class="font-semibold text-gray-900 dark:text-white">Actions rapides</h3>
        </div>
        <div class="card-body grid grid-cols-2 md:grid-cols-4 gap-4">
          <a routerLink="/produits/nouveau" class="p-4 text-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div class="w-10 h-10 mx-auto bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-2">
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Nouveau produit</span>
          </a>
          <a routerLink="/commandes/nouveau" class="p-4 text-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div class="w-10 h-10 mx-auto bg-success-100 dark:bg-success-900/30 rounded-lg flex items-center justify-center mb-2">
              <svg class="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Nouvelle commande</span>
          </a>
          <a routerLink="/produits/stock-faible" class="p-4 text-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div class="w-10 h-10 mx-auto bg-warning-100 dark:bg-warning-900/30 rounded-lg flex items-center justify-center mb-2">
              <svg class="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Stock faible</span>
          </a>
          <a routerLink="/rapports" class="p-4 text-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div class="w-10 h-10 mx-auto bg-info-100 dark:bg-info-900/30 rounded-lg flex items-center justify-center mb-2">
              <svg class="w-5 h-5 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Rapports</span>
          </a>
        </div>
      </div>
    </div>
  \`,
})
export class DashboardHomeComponent implements OnInit {
  readonly authService = inject(AuthService);
  
  stats = signal([
    { label: 'Produits', value: '0', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>', bgColor: 'bg-primary-100 dark:bg-primary-900/30', iconColor: 'text-primary-600', change: 12 },
    { label: 'Commandes', value: '0', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>', bgColor: 'bg-success-100 dark:bg-success-900/30', iconColor: 'text-success-600', change: 8 },
    { label: 'Alertes stock', value: '0', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>', bgColor: 'bg-warning-100 dark:bg-warning-900/30', iconColor: 'text-warning-600', change: -5 },
    { label: 'Clients', value: '0', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>', bgColor: 'bg-info-100 dark:bg-info-900/30', iconColor: 'text-info-600', change: 15 },
  ]);

  ngOnInit(): void {
    // Load stats from API
  }
}
EOF

echo "Fichiers auth et dashboard créés"
