/**
 * Formulaire de création/modification de client
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClientsService, Client, CreateClientDto } from '../../services/clients.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <a routerLink="/clients" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ isEditMode() ? 'Modifier le client' : 'Nouveau client' }}
          </h1>
        </div>
      </div>

      @if (isLoading()) {
        <div class="card p-12">
          <app-loading-spinner size="lg" text="Chargement..." />
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Type de client -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Type de client</h2>
            <div class="flex gap-4">
              <label class="flex-1 relative cursor-pointer">
                <input type="radio" formControlName="type" value="PARTICULIER" class="sr-only peer">
                <div class="p-4 border-2 rounded-lg peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20 border-gray-200 dark:border-gray-700 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                      <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">Particulier</p>
                      <p class="text-sm text-gray-500">Client individuel</p>
                    </div>
                  </div>
                </div>
              </label>
              <label class="flex-1 relative cursor-pointer">
                <input type="radio" formControlName="type" value="ENTREPRISE" class="sr-only peer">
                <div class="p-4 border-2 rounded-lg peer-checked:border-info-500 peer-checked:bg-info-50 dark:peer-checked:bg-info-900/20 border-gray-200 dark:border-gray-700 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-info-100 dark:bg-info-900/30 rounded-full flex items-center justify-center">
                      <svg class="w-5 h-5 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">Entreprise</p>
                      <p class="text-sm text-gray-500">Client professionnel</p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Informations principales -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {{ isParticulier() ? 'Informations personnelles' : 'Informations entreprise' }}
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              @if (isParticulier()) {
                <!-- Prénom -->
                <div>
                  <label for="prenom" class="form-label">Prénom *</label>
                  <input type="text" id="prenom" formControlName="prenom" class="form-input" [class.form-input-error]="isFieldInvalid('prenom')" />
                  @if (isFieldInvalid('prenom')) {
                    <p class="form-error">Prénom requis</p>
                  }
                </div>
              }

              <!-- Nom / Raison sociale -->
              <div [class.md:col-span-2]="!isParticulier()">
                <label for="nom" class="form-label">{{ isParticulier() ? 'Nom *' : 'Raison sociale *' }}</label>
                <input type="text" id="nom" formControlName="nom" class="form-input" [class.form-input-error]="isFieldInvalid('nom')" />
                @if (isFieldInvalid('nom')) {
                  <p class="form-error">{{ isParticulier() ? 'Nom requis' : 'Raison sociale requise' }}</p>
                }
              </div>

              @if (!isParticulier()) {
                <!-- SIREN -->
                <div>
                  <label for="siren" class="form-label">SIREN</label>
                  <input type="text" id="siren" formControlName="siren" class="form-input" placeholder="123 456 789" maxlength="11" />
                </div>

                <!-- TVA Intracommunautaire -->
                <div>
                  <label for="tvaIntracommunautaire" class="form-label">N° TVA Intracommunautaire</label>
                  <input type="text" id="tvaIntracommunautaire" formControlName="tvaIntracommunautaire" class="form-input" placeholder="FR12345678901" />
                </div>
              }
            </div>
          </div>

          <!-- Coordonnées -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Coordonnées</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Email -->
              <div>
                <label for="email" class="form-label">Email</label>
                <input type="email" id="email" formControlName="email" class="form-input" [class.form-input-error]="isFieldInvalid('email')" placeholder="client@email.com" />
                @if (isFieldInvalid('email')) {
                  <p class="form-error">Email invalide</p>
                }
              </div>

              <!-- Téléphone -->
              <div>
                <label for="telephone" class="form-label">Téléphone *</label>
                <input type="tel" id="telephone" formControlName="telephone" class="form-input" [class.form-input-error]="isFieldInvalid('telephone')" placeholder="06 12 34 56 78" />
                @if (isFieldInvalid('telephone')) {
                  <p class="form-error">Téléphone requis</p>
                }
              </div>

              <!-- Téléphone secondaire -->
              <div>
                <label for="telephoneSecondaire" class="form-label">Téléphone secondaire</label>
                <input type="tel" id="telephoneSecondaire" formControlName="telephoneSecondaire" class="form-input" />
              </div>
            </div>
          </div>

          <!-- Adresse -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Adresse</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Adresse -->
              <div class="md:col-span-2">
                <label for="adresse" class="form-label">Adresse</label>
                <input type="text" id="adresse" formControlName="adresse" class="form-input" placeholder="123 rue de la Paix" />
              </div>

              <!-- Code postal -->
              <div>
                <label for="codePostal" class="form-label">Code postal</label>
                <input type="text" id="codePostal" formControlName="codePostal" class="form-input" placeholder="75001" maxlength="5" />
              </div>

              <!-- Ville -->
              <div>
                <label for="ville" class="form-label">Ville</label>
                <input type="text" id="ville" formControlName="ville" class="form-input" placeholder="Paris" />
              </div>

              <!-- Pays -->
              <div>
                <label for="pays" class="form-label">Pays</label>
                <select id="pays" formControlName="pays" class="form-input">
                  <option value="France">France</option>
                  <option value="Belgique">Belgique</option>
                  <option value="Suisse">Suisse</option>
                  <option value="Luxembourg">Luxembourg</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Contact (pour entreprise) -->
          @if (!isParticulier()) {
            <div class="card p-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact principal</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="contactNom" class="form-label">Nom du contact</label>
                  <input type="text" id="contactNom" formControlName="contactNom" class="form-input" />
                </div>
                <div>
                  <label for="contactEmail" class="form-label">Email du contact</label>
                  <input type="email" id="contactEmail" formControlName="contactEmail" class="form-input" />
                </div>
                <div>
                  <label for="contactTelephone" class="form-label">Téléphone du contact</label>
                  <input type="tel" id="contactTelephone" formControlName="contactTelephone" class="form-input" />
                </div>
              </div>
            </div>
          }

          <!-- Options commerciales -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Options commerciales</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="plafondCredit" class="form-label">Plafond de crédit</label>
                <div class="relative">
                  <input type="number" id="plafondCredit" formControlName="plafondCredit" class="form-input pr-8" min="0" step="100" />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                </div>
                <p class="form-hint">Montant maximum en compte client</p>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes internes</h2>
            <textarea id="notes" formControlName="notes" class="form-input" rows="3" placeholder="Notes privées sur le client..."></textarea>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between">
            <a routerLink="/clients" class="btn-secondary">Annuler</a>
            <button type="submit" class="btn-primary" [disabled]="form.invalid || isSaving()">
              @if (isSaving()) {
                <svg class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Enregistrement...
              } @else {
                {{ isEditMode() ? 'Mettre à jour' : 'Créer le client' }}
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
})
export class ClientFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clientsService = inject(ClientsService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  client = signal<Client | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);

  form: FormGroup = this.fb.group({
    type: ['PARTICULIER', Validators.required],
    nom: ['', [Validators.required, Validators.minLength(2)]],
    prenom: [''],
    email: ['', [Validators.email]],
    telephone: ['', Validators.required],
    telephoneSecondaire: [''],
    adresse: [''],
    ville: [''],
    codePostal: [''],
    pays: ['France'],
    siren: [''],
    tvaIntracommunautaire: [''],
    contactNom: [''],
    contactEmail: [''],
    contactTelephone: [''],
    plafondCredit: [0],
    notes: [''],
  });

  isEditMode = computed(() => !!this.route.snapshot.params['id']);
  isParticulier = computed(() => this.form.value.type === 'PARTICULIER');

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadClient(id);
    }

    // Valider prénom si particulier
    this.form.get('type')?.valueChanges.subscribe(type => {
      const prenomControl = this.form.get('prenom');
      if (type === 'PARTICULIER') {
        prenomControl?.setValidators([Validators.required]);
      } else {
        prenomControl?.clearValidators();
      }
      prenomControl?.updateValueAndValidity();
    });
  }

  loadClient(id: string): void {
    this.isLoading.set(true);
    this.clientsService.getById(id).subscribe({
      next: (client) => {
        this.client.set(client);
        this.form.patchValue({
          type: client.type,
          nom: client.nom,
          prenom: client.prenom,
          email: client.email,
          telephone: client.telephone,
          telephoneSecondaire: client.telephoneSecondaire,
          adresse: client.adresse,
          ville: client.ville,
          codePostal: client.codePostal,
          pays: client.pays,
          siren: client.siren,
          tvaIntracommunautaire: client.tvaIntracommunautaire,
          contactNom: client.contactNom,
          contactEmail: client.contactEmail,
          contactTelephone: client.contactTelephone,
          plafondCredit: client.plafondCredit,
          notes: client.notes,
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.error('Client non trouvé');
        this.router.navigate(['/clients']);
      },
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSaving.set(true);
    const data = this.form.value as CreateClientDto;

    const save$ = this.isEditMode()
      ? this.clientsService.update(this.client()!.id, data)
      : this.clientsService.create(data);

    save$.subscribe({
      next: () => {
        this.notificationService.success(this.isEditMode() ? 'Client mis à jour' : 'Client créé');
        this.router.navigate(['/clients']);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.notificationService.error(err.message || 'Erreur lors de l\'enregistrement');
      },
    });
  }
}
