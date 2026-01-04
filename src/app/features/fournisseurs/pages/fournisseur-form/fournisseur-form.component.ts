/**
 * Formulaire de création/modification de fournisseur
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FournisseursService, Fournisseur, CreateFournisseurDto } from '../../services/fournisseurs.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-fournisseur-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <a routerLink="/fournisseurs" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ isEditMode() ? 'Modifier le fournisseur' : 'Nouveau fournisseur' }}
        </h1>
      </div>

      @if (isLoading()) {
        <div class="card p-12">
          <app-loading-spinner size="lg" />
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Informations générales -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations générales</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label class="form-label">Nom / Raison sociale *</label>
                <input type="text" formControlName="nom" class="form-input" [class.form-input-error]="isFieldInvalid('nom')" />
                @if (isFieldInvalid('nom')) {
                  <p class="form-error">Nom requis</p>
                }
              </div>

              <div>
                <label class="form-label">SIREN</label>
                <input type="text" formControlName="siren" class="form-input" placeholder="123 456 789" />
              </div>

              <div>
                <label class="form-label">N° TVA Intracommunautaire</label>
                <input type="text" formControlName="tvaIntracommunautaire" class="form-input" />
              </div>
            </div>
          </div>

          <!-- Coordonnées -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Coordonnées</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="form-label">Email</label>
                <input type="email" formControlName="email" class="form-input" [class.form-input-error]="isFieldInvalid('email')" />
              </div>

              <div>
                <label class="form-label">Téléphone *</label>
                <input type="tel" formControlName="telephone" class="form-input" [class.form-input-error]="isFieldInvalid('telephone')" />
                @if (isFieldInvalid('telephone')) {
                  <p class="form-error">Téléphone requis</p>
                }
              </div>

              <div>
                <label class="form-label">Fax</label>
                <input type="tel" formControlName="fax" class="form-input" />
              </div>

              <div>
                <label class="form-label">Site web</label>
                <input type="url" formControlName="siteWeb" class="form-input" placeholder="https://" />
              </div>

              <div class="md:col-span-2">
                <label class="form-label">Adresse</label>
                <input type="text" formControlName="adresse" class="form-input" />
              </div>

              <div>
                <label class="form-label">Code postal</label>
                <input type="text" formControlName="codePostal" class="form-input" maxlength="5" />
              </div>

              <div>
                <label class="form-label">Ville</label>
                <input type="text" formControlName="ville" class="form-input" />
              </div>

              <div>
                <label class="form-label">Pays</label>
                <select formControlName="pays" class="form-input">
                  <option value="France">France</option>
                  <option value="Belgique">Belgique</option>
                  <option value="Suisse">Suisse</option>
                  <option value="Allemagne">Allemagne</option>
                  <option value="Espagne">Espagne</option>
                  <option value="Italie">Italie</option>
                  <option value="Chine">Chine</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Contact -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact principal</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="form-label">Nom du contact</label>
                <input type="text" formControlName="contactNom" class="form-input" />
              </div>

              <div>
                <label class="form-label">Poste / Fonction</label>
                <input type="text" formControlName="contactPoste" class="form-input" />
              </div>

              <div>
                <label class="form-label">Email</label>
                <input type="email" formControlName="contactEmail" class="form-input" />
              </div>

              <div>
                <label class="form-label">Téléphone</label>
                <input type="tel" formControlName="contactTelephone" class="form-input" />
              </div>
            </div>
          </div>

          <!-- Conditions commerciales -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conditions commerciales</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="form-label">Délai de livraison (jours)</label>
                <input type="number" formControlName="delaiLivraison" class="form-input" min="0" />
              </div>

              <div>
                <label class="form-label">Conditions de paiement</label>
                <select formControlName="conditionsPaiement" class="form-input">
                  <option value="">Non définies</option>
                  <option value="30_JOURS">30 jours</option>
                  <option value="60_JOURS">60 jours</option>
                  <option value="COMPTANT">Comptant</option>
                  <option value="FIN_DE_MOIS">Fin de mois</option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label class="form-label">Notes internes</label>
                <textarea formControlName="notes" class="form-input" rows="3" placeholder="Notes sur ce fournisseur..."></textarea>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between">
            <a routerLink="/fournisseurs" class="btn-secondary">Annuler</a>
            <button type="submit" class="btn-primary" [disabled]="form.invalid || isSaving()">
              @if (isSaving()) {
                <svg class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              }
              {{ isEditMode() ? 'Mettre à jour' : 'Créer le fournisseur' }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
})
export class FournisseurFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly fournisseursService = inject(FournisseursService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  fournisseur = signal<Fournisseur | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);

  form: FormGroup = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', Validators.email],
    telephone: ['', Validators.required],
    fax: [''],
    siteWeb: [''],
    adresse: [''],
    ville: [''],
    codePostal: [''],
    pays: ['France'],
    siren: [''],
    tvaIntracommunautaire: [''],
    contactNom: [''],
    contactEmail: [''],
    contactTelephone: [''],
    contactPoste: [''],
    delaiLivraison: [7],
    conditionsPaiement: [''],
    notes: [''],
  });

  isEditMode = computed(() => !!this.route.snapshot.params['id']);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadFournisseur(id);
    }
  }

  loadFournisseur(id: string): void {
    this.isLoading.set(true);
    this.fournisseursService.getById(id).subscribe({
      next: (fournisseur) => {
        this.fournisseur.set(fournisseur);
        this.form.patchValue(fournisseur);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.error('Fournisseur non trouvé');
        this.router.navigate(['/fournisseurs']);
      },
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => this.form.get(key)?.markAsTouched());
      return;
    }

    this.isSaving.set(true);
    const data = this.form.value as CreateFournisseurDto;

    const save$ = this.isEditMode()
      ? this.fournisseursService.update(this.fournisseur()!.id, data)
      : this.fournisseursService.create(data);

    save$.subscribe({
      next: () => {
        this.notificationService.success(this.isEditMode() ? 'Fournisseur mis à jour' : 'Fournisseur créé');
        this.router.navigate(['/fournisseurs']);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.notificationService.error(err.message || 'Erreur');
      },
    });
  }
}
