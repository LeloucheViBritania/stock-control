/**
 * Formulaire de création/modification de produit
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProduitsService, Produit, CreateProduitDto } from '../../services/produits.service';
import { CategoriesService, Categorie } from '@features/categories/services/categories.service';
import { FournisseursService, Fournisseur } from '@features/fournisseurs/services/fournisseurs.service';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-produit-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <a routerLink="/produits" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ isEditMode() ? 'Modifier le produit' : 'Nouveau produit' }}
          </h1>
          @if (isEditMode() && produit()) {
            <p class="text-gray-600 dark:text-gray-400">{{ produit()?.reference }}</p>
          }
        </div>
      </div>

      @if (isLoading()) {
        <div class="card p-12">
          <app-loading-spinner size="lg" text="Chargement..." />
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Informations générales -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations générales</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Référence -->
              <div>
                <label for="reference" class="form-label">Référence *</label>
                <div class="flex gap-2">
                  <input
                    type="text"
                    id="reference"
                    formControlName="reference"
                    class="form-input flex-1"
                    [class.form-input-error]="isFieldInvalid('reference')"
                    placeholder="REF-001"
                  />
                  <button 
                    type="button" 
                    class="btn-secondary"
                    (click)="generateReference()"
                    title="Générer automatiquement"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                  </button>
                </div>
                @if (isFieldInvalid('reference')) {
                  <p class="form-error">Référence requise et unique</p>
                }
              </div>

              <!-- Nom -->
              <div>
                <label for="nom" class="form-label">Nom du produit *</label>
                <input
                  type="text"
                  id="nom"
                  formControlName="nom"
                  class="form-input"
                  [class.form-input-error]="isFieldInvalid('nom')"
                  placeholder="Nom du produit"
                />
                @if (isFieldInvalid('nom')) {
                  <p class="form-error">Nom requis (min 2 caractères)</p>
                }
              </div>

              <!-- Catégorie -->
              <div>
                <label for="categorieId" class="form-label">Catégorie *</label>
                <select
                  id="categorieId"
                  formControlName="categorieId"
                  class="form-input"
                  [class.form-input-error]="isFieldInvalid('categorieId')"
                >
                  <option value="">Sélectionner une catégorie</option>
                  @for (cat of categories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.nom }}</option>
                  }
                </select>
                @if (isFieldInvalid('categorieId')) {
                  <p class="form-error">Catégorie requise</p>
                }
              </div>

              <!-- Fournisseur principal -->
              <div>
                <label for="fournisseurPrincipalId" class="form-label">Fournisseur principal</label>
                <select
                  id="fournisseurPrincipalId"
                  formControlName="fournisseurPrincipalId"
                  class="form-input"
                >
                  <option value="">Aucun fournisseur</option>
                  @for (f of fournisseurs(); track f.id) {
                    <option [value]="f.id">{{ f.nom }}</option>
                  }
                </select>
              </div>

              <!-- Description -->
              <div class="md:col-span-2">
                <label for="description" class="form-label">Description</label>
                <textarea
                  id="description"
                  formControlName="description"
                  class="form-input"
                  rows="3"
                  placeholder="Description du produit..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Prix et TVA -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Prix et fiscalité</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Prix d'achat -->
              <div>
                <label for="prixAchat" class="form-label">Prix d'achat HT *</label>
                <div class="relative">
                  <input
                    type="number"
                    id="prixAchat"
                    formControlName="prixAchat"
                    class="form-input pr-8"
                    [class.form-input-error]="isFieldInvalid('prixAchat')"
                    step="0.01"
                    min="0"
                  />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                </div>
                @if (isFieldInvalid('prixAchat')) {
                  <p class="form-error">Prix d'achat requis</p>
                }
              </div>

              <!-- Prix de vente -->
              <div>
                <label for="prixVente" class="form-label">Prix de vente HT *</label>
                <div class="relative">
                  <input
                    type="number"
                    id="prixVente"
                    formControlName="prixVente"
                    class="form-input pr-8"
                    [class.form-input-error]="isFieldInvalid('prixVente')"
                    step="0.01"
                    min="0"
                  />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                </div>
                @if (isFieldInvalid('prixVente')) {
                  <p class="form-error">Prix de vente requis</p>
                }
              </div>

              <!-- TVA -->
              <div>
                <label for="tva" class="form-label">TVA (%)</label>
                <select id="tva" formControlName="tva" class="form-input">
                  <option [value]="20">20%</option>
                  <option [value]="10">10%</option>
                  <option [value]="5.5">5.5%</option>
                  <option [value]="2.1">2.1%</option>
                  <option [value]="0">0%</option>
                </select>
              </div>
            </div>

            <!-- Marge calculée -->
            @if (form.value.prixAchat && form.value.prixVente) {
              <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Marge brute</span>
                  <span 
                    class="font-semibold"
                    [class.text-success-600]="calculatedMargin() > 0"
                    [class.text-danger-600]="calculatedMargin() <= 0"
                  >
                    {{ calculatedMargin() | number:'1.2-2' }} € ({{ calculatedMarginPercent() | number:'1.1-1' }}%)
                  </span>
                </div>
              </div>
            }
          </div>

          <!-- Stock et seuils -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gestion du stock</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <!-- Quantité initiale (création uniquement) -->
              @if (!isEditMode()) {
                <div>
                  <label for="quantiteStock" class="form-label">Quantité initiale</label>
                  <input
                    type="number"
                    id="quantiteStock"
                    formControlName="quantiteStock"
                    class="form-input"
                    min="0"
                  />
                </div>
              }

              <!-- Seuil d'alerte -->
              <div>
                <label for="seuilAlerte" class="form-label">Seuil d'alerte *</label>
                <input
                  type="number"
                  id="seuilAlerte"
                  formControlName="seuilAlerte"
                  class="form-input"
                  [class.form-input-error]="isFieldInvalid('seuilAlerte')"
                  min="0"
                />
                <p class="form-hint">Alerte stock faible</p>
              </div>

              <!-- Seuil critique -->
              <div>
                <label for="seuilCritique" class="form-label">Seuil critique</label>
                <input
                  type="number"
                  id="seuilCritique"
                  formControlName="seuilCritique"
                  class="form-input"
                  min="0"
                />
                <p class="form-hint">Alerte stock critique</p>
              </div>

              <!-- Unité -->
              <div>
                <label for="unite" class="form-label">Unité de mesure</label>
                <select id="unite" formControlName="unite" class="form-input">
                  <option value="unité">Unité</option>
                  <option value="kg">Kilogramme (kg)</option>
                  <option value="g">Gramme (g)</option>
                  <option value="L">Litre (L)</option>
                  <option value="mL">Millilitre (mL)</option>
                  <option value="m">Mètre (m)</option>
                  <option value="cm">Centimètre (cm)</option>
                  <option value="pièce">Pièce</option>
                  <option value="carton">Carton</option>
                  <option value="palette">Palette</option>
                </select>
              </div>
            </div>

            <!-- Entrepôt (PREMIUM) -->
            <div class="mt-6 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg relative">
              @if (!isPremium()) {
                <div class="absolute inset-0 bg-gray-100/80 dark:bg-gray-800/80 rounded-lg flex items-center justify-center z-10">
                  <div class="text-center">
                    <span class="badge-premium mb-2">Premium</span>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      Gestion multi-entrepôts
                    </p>
                    <a routerLink="/abonnement" class="text-primary-600 text-sm hover:underline">
                      Passer à Premium →
                    </a>
                  </div>
                </div>
              }
              <label class="form-label">Entrepôt</label>
              <select class="form-input" [disabled]="!isPremium()">
                <option value="">Entrepôt principal</option>
              </select>
            </div>
          </div>

          <!-- Identification -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Identification</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Code-barres -->
              <div>
                <label for="codeBarres" class="form-label">Code-barres</label>
                <div class="flex gap-2">
                  <input
                    type="text"
                    id="codeBarres"
                    formControlName="codeBarres"
                    class="form-input flex-1"
                    placeholder="EAN13, UPC..."
                  />
                  <button 
                    type="button" 
                    class="btn-secondary"
                    (click)="generateBarcode()"
                    title="Générer automatiquement"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Emplacement -->
              <div>
                <label for="emplacement" class="form-label">Emplacement</label>
                <input
                  type="text"
                  id="emplacement"
                  formControlName="emplacement"
                  class="form-input"
                  placeholder="Allée A, Étagère 3..."
                />
              </div>
            </div>
          </div>

          <!-- Image (simple pour FREE) -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Image</h2>
            
            <div class="flex items-start gap-6">
              <!-- Preview -->
              <div class="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                @if (imagePreview()) {
                  <img [src]="imagePreview()" alt="Preview" class="w-full h-full object-cover" />
                } @else {
                  <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                }
              </div>

              <div class="flex-1">
                <input
                  type="file"
                  #fileInput
                  (change)="onFileSelected($event)"
                  accept="image/jpeg,image/png,image/gif"
                  class="hidden"
                />
                <button 
                  type="button" 
                  class="btn-secondary"
                  (click)="fileInput.click()"
                >
                  Choisir une image
                </button>
                <p class="mt-2 text-sm text-gray-500">JPG, PNG ou GIF. Max 5 Mo.</p>
              </div>
            </div>
          </div>

          <!-- Statut -->
          <div class="card p-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Statut</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Un produit inactif ne sera pas visible dans les commandes
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" formControlName="actif" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  {{ form.value.actif ? 'Actif' : 'Inactif' }}
                </span>
              </label>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between">
            <a routerLink="/produits" class="btn-secondary">
              Annuler
            </a>
            <div class="flex items-center gap-3">
              @if (isEditMode()) {
                <button 
                  type="button" 
                  class="btn-secondary"
                  (click)="saveAndContinue()"
                  [disabled]="form.invalid || isSaving()"
                >
                  Enregistrer et continuer
                </button>
              }
              <button 
                type="submit" 
                class="btn-primary"
                [disabled]="form.invalid || isSaving()"
              >
                @if (isSaving()) {
                  <svg class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Enregistrement...
                } @else {
                  {{ isEditMode() ? 'Mettre à jour' : 'Créer le produit' }}
                }
              </button>
            </div>
          </div>
        </form>
      }
    </div>
  `,
})
export class ProduitFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly produitsService = inject(ProduitsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly fournisseursService = inject(FournisseursService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // State
  produit = signal<Produit | null>(null);
  categories = signal<Categorie[]>([]);
  fournisseurs = signal<Fournisseur[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;

  // Form
  form: FormGroup = this.fb.group({
    reference: ['', [Validators.required, Validators.minLength(2)]],
    nom: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    categorieId: ['', Validators.required],
    fournisseurPrincipalId: [''],
    prixAchat: [0, [Validators.required, Validators.min(0)]],
    prixVente: [0, [Validators.required, Validators.min(0)]],
    tva: [20],
    quantiteStock: [0],
    seuilAlerte: [10, [Validators.required, Validators.min(0)]],
    seuilCritique: [5],
    unite: ['unité'],
    codeBarres: [''],
    emplacement: [''],
    actif: [true],
  });

  // Computed
  isEditMode = computed(() => !!this.route.snapshot.params['id']);
  isPremium = computed(() => this.authService.isPremium());

  calculatedMargin = computed(() => {
    const achat = this.form.value.prixAchat || 0;
    const vente = this.form.value.prixVente || 0;
    return vente - achat;
  });

  calculatedMarginPercent = computed(() => {
    const achat = this.form.value.prixAchat || 0;
    if (achat === 0) return 0;
    return (this.calculatedMargin() / achat) * 100;
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadFournisseurs();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadProduit(id);
    }
  }

  loadProduit(id: string): void {
    this.isLoading.set(true);
    this.produitsService.getById(id).subscribe({
      next: (produit) => {
        this.produit.set(produit);
        this.form.patchValue({
          reference: produit.reference,
          nom: produit.nom,
          description: produit.description,
          categorieId: produit.categorieId,
          fournisseurPrincipalId: produit.fournisseurPrincipalId || '',
          prixAchat: produit.prixAchat,
          prixVente: produit.prixVente,
          tva: produit.tva,
          seuilAlerte: produit.seuilAlerte,
          seuilCritique: produit.seuilCritique,
          unite: produit.unite,
          codeBarres: produit.codeBarres,
          emplacement: produit.emplacement,
          actif: produit.actif,
        });
        if (produit.image) {
          this.imagePreview.set(produit.image);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.error('Erreur lors du chargement du produit');
        this.router.navigate(['/produits']);
      },
    });
  }

  loadCategories(): void {
    this.categoriesService.getAll().subscribe({
      next: (categories) => this.categories.set(categories),
    });
  }

  loadFournisseurs(): void {
    this.fournisseursService.getAllSimple().subscribe({
      next: (fournisseurs) => this.fournisseurs.set(fournisseurs),
    });
  }

  generateReference(): void {
    const timestamp = Date.now().toString(36).toUpperCase();
    this.form.patchValue({ reference: `PRD-${timestamp}` });
  }

  generateBarcode(): void {
    this.produitsService.generateBarcode().subscribe({
      next: (result) => {
        this.form.patchValue({ codeBarres: result.barcode });
      },
      error: () => {
        // Générer localement si l'API échoue
        const barcode = '590' + Math.random().toString().slice(2, 12);
        this.form.patchValue({ codeBarres: barcode });
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.error('Image trop volumineuse (max 5 Mo)');
        return;
      }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    const data = this.form.value as CreateProduitDto;

    const save$ = this.isEditMode()
      ? this.produitsService.update(this.produit()!.id, data)
      : this.produitsService.create(data);

    save$.subscribe({
      next: (result) => {
        // Upload image si sélectionnée
        if (this.selectedFile) {
          this.produitsService.uploadImage(result.id, this.selectedFile).subscribe();
        }
        this.notificationService.success(
          this.isEditMode() ? 'Produit mis à jour' : 'Produit créé'
        );
        this.router.navigate(['/produits']);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.notificationService.error(err.message || 'Erreur lors de l\'enregistrement');
      },
    });
  }

  saveAndContinue(): void {
    if (this.form.invalid) return;

    this.isSaving.set(true);
    const data = this.form.value as CreateProduitDto;

    this.produitsService.update(this.produit()!.id, data).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.notificationService.success('Produit mis à jour');
      },
      error: () => {
        this.isSaving.set(false);
        this.notificationService.error('Erreur lors de la mise à jour');
      },
    });
  }
}
