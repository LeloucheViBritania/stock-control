/**
 * Formulaire entrepôt (PREMIUM)
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EntrepotsService, Entrepot, CreateEntrepotDto } from '../../services/entrepots.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-entrepot-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <a routerLink="/entrepots" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ isEditMode() ? 'Modifier l\\'entrepôt' : 'Nouvel entrepôt' }}
            </h1>
            <span class="badge-premium">Premium</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            {{ isEditMode() ? 'Modifiez les informations de l\\'entrepôt' : 'Ajoutez un nouvel entrepôt à votre réseau' }}
          </p>
        </div>
      </div>

      @if (isLoading()) {
        <div class="card p-12">
          <app-loading-spinner size="lg" />
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Informations générales -->
          <div class="card p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations générales</h2>
            <div class="grid gap-4 md:grid-cols-2">
              <div class="md:col-span-2">
                <label class="form-label required">Nom de l'entrepôt</label>
                <input type="text" formControlName="nom" class="form-input" placeholder="Ex: Entrepôt Principal Paris" />
                @if (isFieldInvalid('nom')) {
                  <p class="form-error">Le nom est requis</p>
                }
              </div>
              <div class="md:col-span-2">
                <label class="form-label">Description</label>
                <textarea formControlName="description" class="form-input" rows="2" placeholder="Description de l'entrepôt..."></textarea>
              </div>
              <div>
                <label class="form-label required">Type</label>
                <select formControlName="type" class="form-input">
                  <option value="PRINCIPAL">Principal</option>
                  <option value="SECONDAIRE">Secondaire</option>
                  <option value="TRANSIT">Transit</option>
                  <option value="RESERVE">Réserve</option>
                </select>
              </div>
              <div>
                <label class="form-label required">Capacité maximale (unités)</label>
                <input type="number" formControlName="capaciteMax" class="form-input" min="1" />
                @if (isFieldInvalid('capaciteMax')) {
                  <p class="form-error">La capacité est requise</p>
                }
              </div>
              <div>
                <label class="form-label">Surface (m²)</label>
                <input type="number" formControlName="surface" class="form-input" min="1" />
              </div>
              <div>
                <label class="form-label">Responsable</label>
                <input type="text" formControlName="responsable" class="form-input" placeholder="Nom du responsable" />
              </div>
            </div>
          </div>

          <!-- Adresse -->
          <div class="card p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Adresse</h2>
            <div class="grid gap-4 md:grid-cols-2">
              <div class="md:col-span-2">
                <label class="form-label required">Adresse</label>
                <input type="text" formControlName="adresse" class="form-input" placeholder="123 Rue de la Logistique" />
                @if (isFieldInvalid('adresse')) {
                  <p class="form-error">L'adresse est requise</p>
                }
              </div>
              <div>
                <label class="form-label required">Ville</label>
                <input type="text" formControlName="ville" class="form-input" placeholder="Paris" />
                @if (isFieldInvalid('ville')) {
                  <p class="form-error">La ville est requise</p>
                }
              </div>
              <div>
                <label class="form-label">Code postal</label>
                <input type="text" formControlName="codePostal" class="form-input" placeholder="75001" />
              </div>
              <div>
                <label class="form-label">Pays</label>
                <input type="text" formControlName="pays" class="form-input" value="France" />
              </div>
            </div>
          </div>

          <!-- Contact -->
          <div class="card p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact</h2>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="form-label">Téléphone</label>
                <input type="tel" formControlName="telephone" class="form-input" placeholder="+33 1 23 45 67 89" />
              </div>
              <div>
                <label class="form-label">Email</label>
                <input type="email" formControlName="email" class="form-input" placeholder="entrepot@example.com" />
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3">
            <a routerLink="/entrepots" class="btn-secondary">Annuler</a>
            <button type="submit" class="btn-primary" [disabled]="isSaving() || form.invalid">
              @if (isSaving()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Enregistrement...
              } @else {
                {{ isEditMode() ? 'Mettre à jour' : 'Créer l\\'entrepôt' }}
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
})
export class EntrepotFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly entrepotsService = inject(EntrepotsService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  form!: FormGroup;
  isEditMode = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  entrepotId = '';

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.entrepotId = id;
      this.isEditMode.set(true);
      this.loadEntrepot(id);
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      description: [''],
      type: ['SECONDAIRE'],
      capaciteMax: [1000, [Validators.required, Validators.min(1)]],
      surface: [null],
      responsable: [''],
      adresse: ['', Validators.required],
      ville: ['', Validators.required],
      codePostal: [''],
      pays: ['France'],
      telephone: [''],
      email: ['', Validators.email],
    });
  }

  loadEntrepot(id: string): void {
    this.isLoading.set(true);
    this.entrepotsService.getById(id).subscribe({
      next: (e) => {
        this.form.patchValue(e);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.error('Entrepôt non trouvé');
        this.router.navigate(['/entrepots']);
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const data = this.form.value as CreateEntrepotDto;

    const request$ = this.isEditMode()
      ? this.entrepotsService.update(this.entrepotId, data)
      : this.entrepotsService.create(data);

    request$.subscribe({
      next: () => {
        this.notificationService.success(this.isEditMode() ? 'Entrepôt mis à jour' : 'Entrepôt créé');
        this.router.navigate(['/entrepots']);
      },
      error: () => {
        this.isSaving.set(false);
        this.notificationService.error('Erreur lors de la sauvegarde');
      }
    });
  }
}
