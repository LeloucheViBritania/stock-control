/**
 * Page Sécurité utilisateur
 */
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Sécurité</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">Gérez la sécurité de votre compte</p>
      </div>

      <!-- Changer le mot de passe -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Changer le mot de passe</h3>
        
        <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="space-y-4">
          <div>
            <label for="currentPassword" class="form-label">Mot de passe actuel *</label>
            <input 
              type="password" 
              id="currentPassword" 
              formControlName="currentPassword" 
              class="form-input"
              [class.form-input-error]="isFieldInvalid('currentPassword')"
            />
            @if (isFieldInvalid('currentPassword')) {
              <p class="form-error">Mot de passe actuel requis</p>
            }
          </div>

          <div>
            <label for="newPassword" class="form-label">Nouveau mot de passe *</label>
            <input 
              type="password" 
              id="newPassword" 
              formControlName="newPassword" 
              class="form-input"
              [class.form-input-error]="isFieldInvalid('newPassword')"
            />
            @if (isFieldInvalid('newPassword')) {
              <p class="form-error">Minimum 8 caractères</p>
            }
            <div class="mt-2">
              <div class="flex gap-1">
                @for (i of [1, 2, 3, 4]; track i) {
                  <div 
                    class="h-1 flex-1 rounded"
                    [class.bg-danger-500]="passwordStrength() >= i && passwordStrength() <= 1"
                    [class.bg-warning-500]="passwordStrength() >= i && passwordStrength() === 2"
                    [class.bg-success-400]="passwordStrength() >= i && passwordStrength() === 3"
                    [class.bg-success-600]="passwordStrength() >= i && passwordStrength() >= 4"
                    [class.bg-gray-200]="passwordStrength() < i"
                  ></div>
                }
              </div>
              <p class="text-xs text-gray-500 mt-1">
                {{ getPasswordStrengthLabel() }}
              </p>
            </div>
          </div>

          <div>
            <label for="confirmPassword" class="form-label">Confirmer le mot de passe *</label>
            <input 
              type="password" 
              id="confirmPassword" 
              formControlName="confirmPassword" 
              class="form-input"
              [class.form-input-error]="isFieldInvalid('confirmPassword') || passwordMismatch()"
            />
            @if (passwordMismatch()) {
              <p class="form-error">Les mots de passe ne correspondent pas</p>
            }
          </div>

          <button 
            type="submit" 
            class="btn-primary"
            [disabled]="passwordForm.invalid || isChangingPassword()"
          >
            @if (isChangingPassword()) {
              <svg class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            }
            Changer le mot de passe
          </button>
        </form>
      </div>

      <!-- Sessions actives -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Sessions actives</h3>
          <button type="button" class="text-sm text-danger-600 hover:underline" (click)="revokeAllSessions()">
            Déconnecter toutes les sessions
          </button>
        </div>
        
        <div class="space-y-4">
          @for (session of sessions(); track session.id) {
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                  @if (session.device === 'desktop') {
                    <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  } @else {
                    <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                  }
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ session.browser }} sur {{ session.os }}
                    @if (session.current) {
                      <span class="ml-2 badge-success">Session actuelle</span>
                    }
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ session.location }} • {{ session.lastActive | date:'dd/MM/yyyy HH:mm' }}
                  </p>
                </div>
              </div>
              @if (!session.current) {
                <button 
                  type="button" 
                  class="text-sm text-danger-600 hover:underline"
                  (click)="revokeSession(session.id)"
                >
                  Révoquer
                </button>
              }
            </div>
          }
        </div>
      </div>

      <!-- Authentification à deux facteurs -->
      <div class="card p-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Authentification à deux facteurs
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
              Ajoutez une couche de sécurité supplémentaire à votre compte
            </p>
          </div>
          @if (twoFactorEnabled()) {
            <span class="badge-success">Activée</span>
          } @else {
            <span class="badge-secondary">Désactivée</span>
          }
        </div>

        <div class="mt-4">
          @if (twoFactorEnabled()) {
            <button type="button" class="btn-danger" (click)="disable2FA()">
              Désactiver la 2FA
            </button>
          } @else {
            <button type="button" class="btn-primary" (click)="enable2FA()">
              Activer la 2FA
            </button>
          }
        </div>
      </div>

      <!-- Historique de connexion -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Historique de connexion
        </h3>
        
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                <th class="pb-3 font-medium">Date</th>
                <th class="pb-3 font-medium">Appareil</th>
                <th class="pb-3 font-medium">Localisation</th>
                <th class="pb-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              @for (log of loginHistory(); track log.id) {
                <tr>
                  <td class="py-3 text-gray-900 dark:text-white">{{ log.date | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="py-3 text-gray-600 dark:text-gray-400">{{ log.device }}</td>
                  <td class="py-3 text-gray-600 dark:text-gray-400">{{ log.location }}</td>
                  <td class="py-3">
                    @if (log.success) {
                      <span class="badge-success">Réussi</span>
                    } @else {
                      <span class="badge-danger">Échec</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class SecurityComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  isChangingPassword = signal(false);
  twoFactorEnabled = signal(false);
  passwordStrength = signal(0);

  sessions = signal([
    { id: '1', device: 'desktop', browser: 'Chrome', os: 'Windows 11', location: 'Paris, France', lastActive: new Date(), current: true },
    { id: '2', device: 'mobile', browser: 'Safari', os: 'iOS 17', location: 'Lyon, France', lastActive: new Date(Date.now() - 86400000), current: false },
  ]);

  loginHistory = signal([
    { id: '1', date: new Date(), device: 'Chrome / Windows', location: 'Paris, France', success: true },
    { id: '2', date: new Date(Date.now() - 3600000), device: 'Safari / iOS', location: 'Lyon, France', success: true },
    { id: '3', date: new Date(Date.now() - 86400000), device: 'Firefox / MacOS', location: 'Marseille, France', success: false },
  ]);

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  constructor() {
    this.passwordForm.get('newPassword')?.valueChanges.subscribe(value => {
      this.passwordStrength.set(this.calculatePasswordStrength(value || ''));
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.passwordForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  passwordMismatch(): boolean {
    const newPassword = this.passwordForm.get('newPassword')?.value;
    const confirmPassword = this.passwordForm.get('confirmPassword')?.value;
    return confirmPassword && newPassword !== confirmPassword;
  }

  calculatePasswordStrength(password: string): number {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    return strength;
  }

  getPasswordStrengthLabel(): string {
    const labels = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];
    return labels[this.passwordStrength()] || '';
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid || this.passwordMismatch()) return;

    this.isChangingPassword.set(true);
    
    setTimeout(() => {
      this.notificationService.success('Mot de passe modifié');
      this.passwordForm.reset();
      this.isChangingPassword.set(false);
    }, 1500);
  }

  revokeSession(sessionId: string): void {
    this.sessions.update(sessions => sessions.filter(s => s.id !== sessionId));
    this.notificationService.success('Session révoquée');
  }

  revokeAllSessions(): void {
    if (confirm('Êtes-vous sûr de vouloir déconnecter toutes les autres sessions ?')) {
      this.sessions.update(sessions => sessions.filter(s => s.current));
      this.notificationService.success('Toutes les autres sessions ont été révoquées');
    }
  }

  enable2FA(): void {
    this.notificationService.info('Configuration de la 2FA...');
    // Rediriger vers un flow de configuration 2FA
    setTimeout(() => {
      this.twoFactorEnabled.set(true);
      this.notificationService.success('2FA activée');
    }, 1000);
  }

  disable2FA(): void {
    if (confirm('Êtes-vous sûr de vouloir désactiver la 2FA ?')) {
      this.twoFactorEnabled.set(false);
      this.notificationService.warning('2FA désactivée');
    }
  }
}
