import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProduitsService } from '@core/services/produits.service';
import { CategoriesService } from '@core/services/categories.service';
import { FournisseursService } from '@core/services/fournisseurs.service';
import { ToastService } from '@core/services/notifications.service';
import { Produit, Categorie, Fournisseur } from '@core/models';

@Component({
  selector: 'app-produit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-page">
      <!-- Header -->
      <div class="page-header">
        <div class="page-header__left">
          <a routerLink="/produits" class="back-link">
            <i class="ph ph-arrow-left"></i>
          </a>
          <div>
            <h1>{{ isEditMode() ? 'Modifier le produit' : 'Nouveau produit' }}</h1>
            <p class="text-muted">
              {{ isEditMode() ? 'Modifiez les informations du produit' : 'Ajoutez un nouveau produit au catalogue' }}
            </p>
          </div>
        </div>
      </div>

      @if (isLoading()) {
        <div class="card">
          <div class="loading-container">
            <span class="spinner spinner--lg"></span>
            <p>Chargement...</p>
          </div>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <!-- Informations générales -->
            <div class="card">
              <div class="card__header">
                <h3 class="card__title">
                  <i class="ph ph-info"></i>
                  Informations générales
                </h3>
              </div>
              <div class="card__body">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-group__label">Référence *</label>
                    <input 
                      type="text" 
                      formControlName="reference"
                      class="form-control"
                      [class.form-control--error]="isFieldInvalid('reference')"
                      placeholder="REF-001"
                    />
                    @if (isFieldInvalid('reference')) {
                      <span class="form-group__error">La référence est requise</span>
                    }
                  </div>
                  <div class="form-group">
                    <label class="form-group__label">Code-barres</label>
                    <input 
                      type="text" 
                      formControlName="codeBarre"
                      class="form-control"
                      placeholder="123456789"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-group__label">Nom du produit *</label>
                  <input 
                    type="text" 
                    formControlName="nom"
                    class="form-control"
                    [class.form-control--error]="isFieldInvalid('nom')"
                    placeholder="Nom du produit"
                  />
                  @if (isFieldInvalid('nom')) {
                    <span class="form-group__error">Le nom est requis</span>
                  }
                </div>

                <div class="form-group">
                  <label class="form-group__label">Description</label>
                  <textarea 
                    formControlName="description"
                    class="form-control"
                    rows="3"
                    placeholder="Description du produit..."
                  ></textarea>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-group__label">Catégorie</label>
                    <select formControlName="categorieId" class="form-control">
                      <option [ngValue]="null">Sélectionner une catégorie</option>
                      @for (cat of categories(); track cat.id) {
                        <option [ngValue]="cat.id">{{ cat.nom }}</option>
                      }
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-group__label">Marque</label>
                    <input 
                      type="text" 
                      formControlName="marque"
                      class="form-control"
                      placeholder="Marque"
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-group__label">Unité de mesure</label>
                    <select formControlName="uniteMesure" class="form-control">
                      <option value="unité">Unité</option>
                      <option value="kg">Kilogramme (kg)</option>
                      <option value="g">Gramme (g)</option>
                      <option value="l">Litre (l)</option>
                      <option value="ml">Millilitre (ml)</option>
                      <option value="m">Mètre (m)</option>
                      <option value="cm">Centimètre (cm)</option>
                      <option value="m²">Mètre carré (m²)</option>
                      <option value="pièce">Pièce</option>
                      <option value="carton">Carton</option>
                      <option value="palette">Palette</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-group__label">Poids (kg)</label>
                    <input 
                      type="number" 
                      formControlName="poids"
                      class="form-control"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-group__label">Dimensions (LxlxH)</label>
                    <input 
                      type="text" 
                      formControlName="dimensions"
                      class="form-control"
                      placeholder="20x10x5 cm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Prix et stock -->
            <div class="card">
              <div class="card__header">
                <h3 class="card__title">
                  <i class="ph ph-currency-circle-dollar"></i>
                  Prix et stock
                </h3>
              </div>
              <div class="card__body">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-group__label">Prix d'achat (coût)</label>
                    <div class="input-group">
                      <input 
                        type="number" 
                        formControlName="coutUnitaire"
                        class="form-control"
                        step="1"
                        min="0"
                        placeholder="0"
                      />
                      <span class="input-group__addon">XOF</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-group__label">Prix de vente *</label>
                    <div class="input-group">
                      <input 
                        type="number" 
                        formControlName="prixVente"
                        class="form-control"
                        [class.form-control--error]="isFieldInvalid('prixVente')"
                        step="1"
                        min="0"
                        placeholder="0"
                      />
                      <span class="input-group__addon">XOF</span>
                    </div>
                    @if (isFieldInvalid('prixVente')) {
                      <span class="form-group__error">Le prix de vente est requis</span>
                    }
                  </div>
                  <div class="form-group">
                    <label class="form-group__label">Taux de taxe (%)</label>
                    <input 
                      type="number" 
                      formControlName="tauxTaxe"
                      class="form-control"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="18"
                    />
                  </div>
                </div>

                @if (isEditMode()) {
                  <div class="stock-info">
                    <div class="stock-info__label">Stock actuel</div>
                    <div class="stock-info__value">{{ produit()?.quantiteStock || 0 }} {{ form.value.uniteMesure }}</div>
                    <p class="text-muted text-sm mt-2">
                      Pour modifier le stock, utilisez la fonction d'ajustement sur la page de détail.
                    </p>
                  </div>
                } @else {
                  <div class="form-group">
                    <label class="form-group__label">Stock initial</label>
                    <input 
                      type="number" 
                      formControlName="quantiteStock"
                      class="form-control"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                }

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-group__label">Stock minimum (alerte)</label>
                    <input 
                      type="number" 
                      formControlName="niveauStockMin"
                      class="form-control"
                      min="0"
                      placeholder="10"
                    />
                    <span class="form-group__hint">Alerte si le stock descend en dessous</span>
                  </div>
                  <div class="form-group">
                    <label class="form-group__label">Stock maximum</label>
                    <input 
                      type="number" 
                      formControlName="niveauStockMax"
                      class="form-control"
                      min="0"
                      placeholder="100"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-group__label">Point de commande</label>
                    <input 
                      type="number" 
                      formControlName="pointCommande"
                      class="form-control"
                      min="0"
                      placeholder="20"
                    />
                    <span class="form-group__hint">Seuil de réapprovisionnement</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Fournisseurs -->
            <div class="card full-width">
              <div class="card__header">
                <h3 class="card__title">
                  <i class="ph ph-truck"></i>
                  Fournisseurs
                </h3>
              </div>
              <div class="card__body">
                <p class="text-muted mb-4">
                  Vous pourrez associer des fournisseurs à ce produit après sa création.
                </p>
                
                @if (isEditMode() && produit()?.produitsFournisseurs?.length) {
                  <div class="fournisseurs-list">
                    @for (pf of produit()?.produitsFournisseurs; track pf.id) {
                      <div class="fournisseur-item">
                        <div class="fournisseur-item__info">
                          <span class="fournisseur-item__name">{{ pf.fournisseur?.nom }}</span>
                          @if (pf.estPrefere) {
                            <span class="badge badge--primary">Préféré</span>
                          }
                        </div>
                        <div class="fournisseur-item__details">
                          <span>{{ pf.prixUnitaire | number:'1.0-0' }} XOF</span>
                          <span>Délai: {{ pf.delaiLivraisonJours || '-' }} jours</span>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <a routerLink="/produits" class="btn btn--secondary">
              Annuler
            </a>
            <button 
              type="submit" 
              class="btn btn--primary"
              [disabled]="form.invalid || isSubmitting()"
            >
              @if (isSubmitting()) {
                <span class="spinner spinner--sm"></span>
                Enregistrement...
              } @else {
                <i class="ph ph-check"></i>
                {{ isEditMode() ? 'Enregistrer les modifications' : 'Créer le produit' }}
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .form-page {
      max-width: 900px;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .back-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-lg);
      background: var(--neutral-100);
      color: var(--neutral-600);
      transition: all var(--transition-fast);

      &:hover {
        background: var(--neutral-200);
        color: var(--neutral-800);
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-6);
    }

    .full-width {
      grid-column: span 2;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--space-4);
    }

    .input-group {
      display: flex;

      .form-control {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }

    .input-group__addon {
      display: flex;
      align-items: center;
      padding: 0 var(--space-4);
      background: var(--neutral-100);
      border: 1px solid var(--neutral-300);
      border-left: none;
      border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
      font-size: var(--text-sm);
      color: var(--neutral-600);
    }

    .stock-info {
      background: var(--neutral-50);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      margin-bottom: var(--space-4);
    }

    .stock-info__label {
      font-size: var(--text-sm);
      color: var(--neutral-500);
      margin-bottom: var(--space-1);
    }

    .stock-info__value {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: 600;
      color: var(--neutral-900);
    }

    .fournisseurs-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .fournisseur-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3) var(--space-4);
      background: var(--neutral-50);
      border-radius: var(--radius-lg);
    }

    .fournisseur-item__info {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .fournisseur-item__name {
      font-weight: 500;
    }

    .fournisseur-item__details {
      display: flex;
      gap: var(--space-4);
      font-size: var(--text-sm);
      color: var(--neutral-500);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      margin-top: var(--space-8);
      padding-top: var(--space-6);
      border-top: 1px solid var(--neutral-200);
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-12);
      gap: var(--space-4);
      color: var(--neutral-500);
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .full-width {
        grid-column: span 1;
      }

      .form-actions {
        flex-direction: column-reverse;

        .btn {
          width: 100%;
        }
      }
    }
  `]
})
export class ProduitFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private produitsService = inject(ProduitsService);
  private categoriesService = inject(CategoriesService);
  private toast = inject(ToastService);

  form!: FormGroup;
  categories = signal<Categorie[]>([]);
  produit = signal<Produit | null>(null);
  
  isLoading = signal(false);
  isSubmitting = signal(false);
  isEditMode = signal(false);

  ngOnInit() {
    this.initForm();
    this.loadCategories();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.loadProduit(+id);
    }
  }

  initForm() {
    this.form = this.fb.group({
      reference: ['', Validators.required],
      nom: ['', Validators.required],
      description: [''],
      categorieId: [null],
      marque: [''],
      uniteMesure: ['unité'],
      poids: [null],
      dimensions: [''],
      codeBarre: [''],
      coutUnitaire: [null],
      prixVente: [null, Validators.required],
      tauxTaxe: [18],
      quantiteStock: [0],
      niveauStockMin: [10],
      niveauStockMax: [null],
      pointCommande: [null]
    });
  }

  loadCategories() {
    this.categoriesService.getAll({ limit: 100 }).subscribe({
      next: (response) => this.categories.set(response.data),
      error: () => console.error('Failed to load categories')
    });
  }

  loadProduit(id: number) {
    this.isLoading.set(true);
    
    this.produitsService.getById(id).subscribe({
      next: (produit) => {
        this.produit.set(produit);
        this.form.patchValue({
          reference: produit.reference,
          nom: produit.nom,
          description: produit.description,
          categorieId: produit.categorieId,
          marque: produit.marque,
          uniteMesure: produit.uniteMesure,
          poids: produit.poids,
          dimensions: produit.dimensions,
          codeBarre: produit.codeBarre,
          coutUnitaire: produit.coutUnitaire,
          prixVente: produit.prixVente,
          tauxTaxe: produit.tauxTaxe,
          niveauStockMin: produit.niveauStockMin,
          niveauStockMax: produit.niveauStockMax,
          pointCommande: produit.pointCommande
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Erreur', 'Produit introuvable');
        this.router.navigate(['/produits']);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const data = this.form.value;

    const request$ = this.isEditMode()
      ? this.produitsService.update(this.produit()!.id, data)
      : this.produitsService.create(data);

    request$.subscribe({
      next: (produit) => {
        this.toast.success(
          this.isEditMode() ? 'Produit modifié' : 'Produit créé',
          `Le produit ${produit.nom} a été enregistré`
        );
        this.router.navigate(['/produits', produit.id]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toast.error('Erreur', err.error?.message || 'Une erreur est survenue');
      }
    });
  }
}
