/**
 * Page Profil utilisateur
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Mon profil</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Gérez vos informations personnelles</p>
        </div>
      </div>

      <!-- Avatar & Info rapide -->
      <div class="card p-6">
        <div class="flex flex-col sm:flex-row items-center gap-6">
          <div class="relative">
            <div class="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-3xl font-bold text-primary-600">
              {{ initials() }}
            </div>
            <button 
              type="button"
              class="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
              (click)="fileInput.click()"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </button>
            <input #fileInput type="file" class="hidden" accept="image/*" (change)="onPhotoSelected($event)" />
          </div>
          
          <div class="text-center sm:text-left">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ user()?.prenom }} {{ user()?.nom }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">{{ user()?.email }}</p>
            <div class="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span class="badge-primary">{{ getRoleLabel(user()?.role) }}</span>
              @if (isPremium()) {
                <span class="badge-premium">Premium</span>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Formulaire -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations personnelles</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="prenom" class="form-label">Prénom *</label>
              <input 
                type="text" 
                id="prenom" 
                formControlName="prenom" 
                class="form-input"
                [class.form-input-error]="isFieldInvalid('prenom')"
              />
              @if (isFieldInvalid('prenom')) {
                <p class="form-error">Prénom requis</p>
              }
            </div>

            <div>
              <label for="nom" class="form-label">Nom *</label>
              <input 
                type="text" 
                id="nom" 
                formControlName="nom" 
                class="form-input"
                [class.form-input-error]="isFieldInvalid('nom')"
              />
              @if (isFieldInvalid('nom')) {
                <p class="form-error">Nom requis</p>
              }
            </div>

            <div>
              <label for="email" class="form-label">Email *</label>
              <input 
                type="email" 
                id="email" 
                formControlName="email" 
                class="form-input"
                [class.form-input-error]="isFieldInvalid('email')"
              />
              @if (isFieldInvalid('email')) {
                <p class="form-error">Email invalide</p>
              }
            </div>

            <div>
              <label for="telephone" class="form-label">Téléphone</label>
              <input 
                type="tel" 
                id="telephone" 
                formControlName="telephone" 
                class="form-input"
                placeholder="+33 6 12 34 56 78"
              />
            </div>
          </div>
        </div>

        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Entreprise</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="entreprise" class="form-label">Nom de l'entreprise</label>
              <input 
                type="text" 
                id="entreprise" 
                formControlName="entreprise" 
                class="form-input"
              />
            </div>

            <div>
              <label for="poste" class="form-label">Poste / Fonction</label>
              <input 
                type="text" 
                id="poste" 
                formControlName="poste" 
                class="form-input"
              />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <button type="button" class="btn-secondary" (click)="resetForm()">
            Annuler
          </button>
          <button type="submit" class="btn-primary" [disabled]="form.invalid || isSaving()">
            @if (isSaving()) {
              <svg class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            }
            Enregistrer
          </button>
        </div>
      </form>

      <!-- Danger Zone -->
      <div class="card p-6 border-danger-200 dark:border-danger-800">
        <h3 class="text-lg font-semibold text-danger-600 mb-4">Zone de danger</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.
        </p>
        <button type="button" class="btn-danger" (click)="confirmDeleteAccount()">
          Supprimer mon compte
        </button>
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  isSaving = signal(false);

  user = computed(() => this.authService.user());
  isPremium = computed(() => this.authService.isPremium());
  
  initials = computed(() => {
    const u = this.user();
    if (!u) return '?';
    return (u.prenom?.charAt(0) || '') + (u.nom?.charAt(0) || '');
  });

  form: FormGroup = this.fb.group({
    prenom: ['', Validators.required],
    nom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    entreprise: [''],
    poste: [''],
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const u = this.user();
    if (u) {
      this.form.patchValue({
        prenom: u.prenom,
        nom: u.nom,
        email: u.email,
        telephone: u.telephone || '',
        entreprise: u.entreprise || '',
        poste: u.poste || '',
      });
    }
  }

  getRoleLabel(role?: string): string {
    const labels: Record<string, string> = {
      'ADMIN': 'Administrateur',
      'GESTIONNAIRE': 'Gestionnaire',
      'VENDEUR': 'Vendeur',
      'LECTEUR': 'Lecteur',
    };
    return labels[role || ''] || role || 'Utilisateur';
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  resetForm(): void {
    this.loadProfile();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.error('L\'image ne doit pas dépasser 5 Mo');
        return;
      }
      // Upload logic would go here
      this.notificationService.info('Upload de photo en cours...');
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => this.form.get(key)?.markAsTouched());
      return;
    }

    this.isSaving.set(true);
    
    // Simulate API call
    setTimeout(() => {
      this.notificationService.success('Profil mis à jour');
      this.isSaving.set(false);
    }, 1000);
  }

  confirmDeleteAccount(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      this.notificationService.warning('Suppression du compte...');
    }
  }
}
