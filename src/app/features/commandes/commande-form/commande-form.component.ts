import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommandesService } from '@core/services/commandes.service';
import { ClientsService } from '@core/services/clients.service';
import { ProduitsService } from '@core/services/produits.service';
import { ToastService } from '@core/services/notifications.service';
import { Commande, Client, Produit } from '@core/models';

@Component({
  selector: 'app-commande-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CurrencyPipe],
  template: `
    <div class="form-page">
      <div class="page-header">
        <div class="page-header__left">
          <a routerLink="/commandes" class="back-link">
            <i class="ph ph-arrow-left"></i>
          </a>
          <div>
            <h1>{{ isEditMode() ? 'Modifier la commande' : 'Nouvelle commande' }}</h1>
            <p class="text-muted">{{ isEditMode() ? 'Modifiez les détails de la commande' : 'Créez une nouvelle commande client' }}</p>
          </div>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <!-- Client & Info -->
          <div class="card">
            <div class="card__header">
              <h3 class="card__title">
                <i class="ph ph-user"></i>
                Client & Informations
              </h3>
            </div>
            <div class="card__body">
              <div class="form-group">
                <label class="form-group__label">Client *</label>
                <select formControlName="clientId" class="form-control" [class.form-control--error]="isFieldInvalid('clientId')">
                  <option [ngValue]="null">Sélectionner un client</option>
                  @for (client of clients(); track client.id) {
                    <option [ngValue]="client.id">{{ client.nom }} - {{ client.telephone || client.email }}</option>
                  }
                </select>
                @if (isFieldInvalid('clientId')) {
                  <span class="form-group__error">Le client est requis</span>
                }
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-group__label">Date de commande</label>
                  <input type="date" formControlName="dateCommande" class="form-control" />
                </div>
                <div class="form-group">
                  <label class="form-group__label">Date de livraison souhaitée</label>
                  <input type="date" formControlName="dateLivraisonPrevue" class="form-control" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-group__label">Notes</label>
                <textarea formControlName="notes" class="form-control" rows="2" placeholder="Notes internes..."></textarea>
              </div>
            </div>
          </div>

          <!-- Lignes de commande -->
          <div class="card full-width">
            <div class="card__header">
              <h3 class="card__title">
                <i class="ph ph-list-plus"></i>
                Produits
              </h3>
              <button type="button" class="btn btn--primary btn--sm" (click)="ajouterLigne()">
                <i class="ph ph-plus"></i>
                Ajouter produit
              </button>
            </div>
            <div class="card__body p-0">
              @if (lignes.length === 0) {
                <div class="empty-lines">
                  <i class="ph ph-package"></i>
                  <p>Aucun produit ajouté</p>
                  <button type="button" class="btn btn--secondary btn--sm" (click)="ajouterLigne()">
                    <i class="ph ph-plus"></i>
                    Ajouter un produit
                  </button>
                </div>
              } @else {
                <table class="table">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th class="text-right" style="width: 120px;">Quantité</th>
                      <th class="text-right" style="width: 150px;">Prix unitaire</th>
                      <th class="text-right" style="width: 150px;">Total</th>
                      <th style="width: 60px;"></th>
                    </tr>
                  </thead>
                  <tbody formArrayName="lignes">
                    @for (ligne of lignes.controls; track $index; let i = $index) {
                      <tr [formGroupName]="i">
                        <td>
                          <select formControlName="produitId" class="form-control form-control--sm" (change)="onProduitChange(i)">
                            <option [ngValue]="null">Sélectionner...</option>
                            @for (produit of produits(); track produit.id) {
                              <option [ngValue]="produit.id">{{ produit.reference }} - {{ produit.nom }}</option>
                            }
                          </select>
                        </td>
                        <td class="text-right">
                          <input type="number" formControlName="quantite" class="form-control form-control--sm text-right" min="1" (input)="calculerTotal()" />
                        </td>
                        <td class="text-right">
                          <input type="number" formControlName="prixUnitaire" class="form-control form-control--sm text-right" min="0" (input)="calculerTotal()" />
                        </td>
                        <td class="text-right">
                          <strong>{{ getLigneTotal(i) | currency:'XOF':'symbol':'1.0-0' }}</strong>
                        </td>
                        <td>
                          <button type="button" class="btn btn--ghost btn--sm btn--icon text-error" (click)="supprimerLigne(i)">
                            <i class="ph ph-trash"></i>
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>
          </div>

          <!-- Totaux -->
          <div class="card totaux-card">
            <div class="totaux">
              <div class="totaux__row">
                <span>Sous-total</span>
                <span>{{ sousTotal() | currency:'XOF':'symbol':'1.0-0' }}</span>
              </div>
              <div class="totaux__row">
                <span>Remise</span>
                <div class="input-inline">
                  <input type="number" formControlName="remise" class="form-control form-control--sm" min="0" style="width: 100px;" (input)="calculerTotal()" />
                  <span>XOF</span>
                </div>
              </div>
              <div class="totaux__row">
                <span>Taxe</span>
                <span>{{ taxe() | currency:'XOF':'symbol':'1.0-0' }}</span>
              </div>
              <div class="totaux__row totaux__row--total">
                <span>Total</span>
                <span>{{ total() | currency:'XOF':'symbol':'1.0-0' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <a routerLink="/commandes" class="btn btn--secondary">Annuler</a>
          <button type="submit" class="btn btn--primary" [disabled]="form.invalid || lignes.length === 0 || isSubmitting()">
            @if (isSubmitting()) {
              <span class="spinner spinner--sm"></span>
            } @else {
              <i class="ph ph-check"></i>
            }
            {{ isEditMode() ? 'Enregistrer' : 'Créer la commande' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-page { max-width: 1000px; }
    .page-header { display: flex; gap: var(--space-4); margin-bottom: var(--space-6); }
    .back-link {
      display: flex; align-items: center; justify-content: center;
      width: 40px; height: 40px; border-radius: var(--radius-lg);
      background: var(--neutral-100); color: var(--neutral-600);
      &:hover { background: var(--neutral-200); }
    }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); }
    .full-width { grid-column: span 2; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .empty-lines { padding: var(--space-8); text-align: center; color: var(--neutral-400);
      i { font-size: 2.5rem; margin-bottom: var(--space-3); }
    }
    .totaux-card { grid-column: 2; }
    .totaux { display: flex; flex-direction: column; gap: var(--space-3); }
    .totaux__row {
      display: flex; justify-content: space-between; align-items: center;
      padding: var(--space-3) 0; border-bottom: 1px solid var(--neutral-100);
      &--total { border-top: 2px solid var(--neutral-300); border-bottom: none; padding-top: var(--space-4);
        font-size: var(--text-lg); font-weight: 700; color: var(--primary-600);
      }
    }
    .input-inline { display: flex; align-items: center; gap: var(--space-2); }
    .form-actions {
      display: flex; justify-content: flex-end; gap: var(--space-3);
      margin-top: var(--space-8); padding-top: var(--space-6); border-top: 1px solid var(--neutral-200);
    }
    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .full-width, .totaux-card { grid-column: span 1; }
    }
  `]
})
export class CommandeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private commandesService = inject(CommandesService);
  private clientsService = inject(ClientsService);
  private produitsService = inject(ProduitsService);
  private toast = inject(ToastService);

  form!: FormGroup;
  clients = signal<Client[]>([]);
  produits = signal<Produit[]>([]);
  
  isEditMode = signal(false);
  isLoading = signal(false);
  isSubmitting = signal(false);

  sousTotal = signal(0);
  taxe = signal(0);
  total = signal(0);

  get lignes(): FormArray {
    return this.form.get('lignes') as FormArray;
  }

  ngOnInit() {
    this.initForm();
    this.loadClients();
    this.loadProduits();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.loadCommande(+id);
    }
  }

  initForm() {
    this.form = this.fb.group({
      clientId: [null, Validators.required],
      dateCommande: [new Date().toISOString().split('T')[0]],
      dateLivraisonPrevue: [''],
      notes: [''],
      remise: [0],
      lignes: this.fb.array([])
    });
  }

  loadClients() {
    this.clientsService.getAll({ limit: 500 }).subscribe({
      next: (res) => this.clients.set(res.data)
    });
  }

  loadProduits() {
    this.produitsService.getAll({ limit: 500, estActif: true }).subscribe({
      next: (res) => this.produits.set(res.data)
    });
  }

  loadCommande(id: number) {
    this.isLoading.set(true);
    this.commandesService.getById(id).subscribe({
      next: (commande) => {
        this.form.patchValue({
          clientId: commande.clientId,
          dateCommande: commande.dateCommande?.toString().split('T')[0],
          dateLivraisonPrevue: commande.dateLivraisonPrevue?.toString().split('T')[0],
          notes: commande.notes,
          remise: commande.remise
        });
        commande.lignes?.forEach(l => {
          this.lignes.push(this.fb.group({
            produitId: [l.produitId, Validators.required],
            quantite: [l.quantite, [Validators.required, Validators.min(1)]],
            prixUnitaire: [l.prixUnitaire, Validators.required]
          }));
        });
        this.calculerTotal();
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Erreur', 'Commande introuvable');
        this.router.navigate(['/commandes']);
      }
    });
  }

  ajouterLigne() {
    this.lignes.push(this.fb.group({
      produitId: [null, Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prixUnitaire: [0, Validators.required]
    }));
  }

  supprimerLigne(index: number) {
    this.lignes.removeAt(index);
    this.calculerTotal();
  }

  onProduitChange(index: number) {
    const ligne = this.lignes.at(index);
    const produitId = ligne.get('produitId')?.value;
    const produit = this.produits().find(p => p.id === produitId);
    if (produit) {
      ligne.patchValue({ prixUnitaire: produit.prixVente });
      this.calculerTotal();
    }
  }

  getLigneTotal(index: number): number {
    const ligne = this.lignes.at(index);
    const qte = ligne.get('quantite')?.value || 0;
    const prix = ligne.get('prixUnitaire')?.value || 0;
    return qte * prix;
  }

  calculerTotal() {
    let sousTotal = 0;
    this.lignes.controls.forEach((_, i) => {
      sousTotal += this.getLigneTotal(i);
    });
    this.sousTotal.set(sousTotal);
    
    const remise = this.form.get('remise')?.value || 0;
    const taxeAmount = (sousTotal - remise) * 0.18; // 18% TVA
    this.taxe.set(taxeAmount);
    this.total.set(sousTotal - remise + taxeAmount);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return control ? control.invalid && control.touched : false;
  }

  onSubmit() {
    if (this.form.invalid || this.lignes.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const data = {
      ...this.form.value,
      lignes: this.lignes.value
    };

    const request$ = this.isEditMode()
      ? this.commandesService.update(this.route.snapshot.params['id'], data)
      : this.commandesService.create(data);

    request$.subscribe({
      next: (commande) => {
        this.toast.success(this.isEditMode() ? 'Commande modifiée' : 'Commande créée', `N° ${commande.numeroCommande}`);
        this.router.navigate(['/commandes', commande.id]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toast.error('Erreur', err.error?.message || 'Une erreur est survenue');
      }
    });
  }
}
