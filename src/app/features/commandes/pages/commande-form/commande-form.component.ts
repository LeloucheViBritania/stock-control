/**
 * Formulaire de création de commande avec panier
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommandesService, Commande, CreateCommandeDto, LigneCommande } from '../../services/commandes.service';
import { ClientsService, Client } from '@features/clients/services/clients.service';
import { ProduitsService, Produit } from '@features/produits/services/produits.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

interface PanierItem {
  produit: Produit;
  quantite: number;
  prixUnitaire: number;
  remise: number;
}

@Component({
  selector: 'app-commande-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <a routerLink="/commandes" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Nouvelle commande</h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Formulaire principal -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Client -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Client</h2>
            
            @if (selectedClient()) {
              <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <span class="font-semibold text-primary-600">
                      {{ selectedClient()?.prenom?.charAt(0) || selectedClient()?.nom?.charAt(0) }}{{ selectedClient()?.nom?.charAt(0) }}
                    </span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ selectedClient()?.prenom ? selectedClient()?.prenom + ' ' + selectedClient()?.nom : selectedClient()?.nom }}
                    </p>
                    <p class="text-sm text-gray-500">{{ selectedClient()?.email || selectedClient()?.telephone }}</p>
                  </div>
                </div>
                <button type="button" (click)="clearClient()" class="text-gray-400 hover:text-gray-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            } @else {
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="clientSearch"
                  (ngModelChange)="searchClients()"
                  (focus)="showClientDropdown.set(true)"
                  placeholder="Rechercher un client par nom, email ou téléphone..."
                  class="form-input w-full"
                />
                
                @if (showClientDropdown() && (clientResults().length > 0 || clientSearch)) {
                  <div class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                    @if (clientResults().length === 0) {
                      <div class="p-4 text-center text-gray-500">
                        <p>Aucun client trouvé</p>
                        <a routerLink="/clients/nouveau" class="text-primary-600 hover:underline text-sm">
                          + Créer un nouveau client
                        </a>
                      </div>
                    } @else {
                      @for (client of clientResults(); track client.id) {
                        <button
                          type="button"
                          (click)="selectClient(client)"
                          class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                        >
                          <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                            {{ client.prenom?.charAt(0) || client.nom.charAt(0) }}
                          </div>
                          <div>
                            <p class="font-medium text-gray-900 dark:text-white">
                              {{ client.prenom ? client.prenom + ' ' + client.nom : client.nom }}
                            </p>
                            <p class="text-sm text-gray-500">{{ client.email || client.telephone }}</p>
                          </div>
                        </button>
                      }
                    }
                  </div>
                }
              </div>
            }
          </div>

          <!-- Produits -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Produits</h2>
            
            <!-- Recherche produit -->
            <div class="relative mb-4">
              <input
                type="text"
                [(ngModel)]="produitSearch"
                (ngModelChange)="searchProduits()"
                (focus)="showProduitDropdown.set(true)"
                placeholder="Rechercher un produit par nom ou référence..."
                class="form-input w-full"
              />
              
              @if (showProduitDropdown() && produitResults().length > 0) {
                <div class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                  @for (produit of produitResults(); track produit.id) {
                    <button
                      type="button"
                      (click)="addToPanier(produit)"
                      class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                      [disabled]="produit.quantiteStock === 0"
                    >
                      <div class="flex items-center gap-3">
                        @if (produit.image) {
                          <img [src]="produit.image" class="w-10 h-10 rounded object-cover" />
                        } @else {
                          <div class="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                            </svg>
                          </div>
                        }
                        <div>
                          <p class="font-medium text-gray-900 dark:text-white">{{ produit.nom }}</p>
                          <p class="text-sm text-gray-500">{{ produit.reference }} • Stock: {{ produit.quantiteStock }}</p>
                        </div>
                      </div>
                      <span class="font-semibold text-primary-600">{{ produit.prixVente | number:'1.2-2' }} €</span>
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Panier -->
            @if (panier().length === 0) {
              <div class="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                <svg class="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
                <p class="mt-4 text-gray-500">Aucun produit dans le panier</p>
                <p class="text-sm text-gray-400">Utilisez la barre de recherche ci-dessus</p>
              </div>
            } @else {
              <div class="space-y-3">
                @for (item of panier(); track item.produit.id; let i = $index) {
                  <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <!-- Image -->
                    @if (item.produit.image) {
                      <img [src]="item.produit.image" class="w-12 h-12 rounded object-cover" />
                    } @else {
                      <div class="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                        </svg>
                      </div>
                    }

                    <!-- Infos -->
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-gray-900 dark:text-white truncate">{{ item.produit.nom }}</p>
                      <p class="text-sm text-gray-500">{{ item.produit.reference }}</p>
                    </div>

                    <!-- Prix unitaire -->
                    <div class="w-24">
                      <label class="text-xs text-gray-500">Prix unit.</label>
                      <input
                        type="number"
                        [(ngModel)]="item.prixUnitaire"
                        class="form-input py-1 text-sm w-full"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <!-- Quantité -->
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        (click)="decrementQuantite(i)"
                        class="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                        </svg>
                      </button>
                      <input
                        type="number"
                        [(ngModel)]="item.quantite"
                        class="w-16 text-center form-input py-1"
                        min="1"
                        [max]="item.produit.quantiteStock"
                      />
                      <button
                        type="button"
                        (click)="incrementQuantite(i)"
                        [disabled]="item.quantite >= item.produit.quantiteStock"
                        class="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                      </button>
                    </div>

                    <!-- Sous-total -->
                    <div class="w-24 text-right">
                      <p class="font-semibold text-gray-900 dark:text-white">
                        {{ item.quantite * item.prixUnitaire | number:'1.2-2' }} €
                      </p>
                    </div>

                    <!-- Supprimer -->
                    <button
                      type="button"
                      (click)="removeFromPanier(i)"
                      class="p-2 text-gray-400 hover:text-danger-600"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Options -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Options</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="form-label">Date de livraison souhaitée</label>
                <input type="date" [(ngModel)]="dateLivraison" class="form-input w-full" />
              </div>
              
              <div>
                <label class="form-label">Mode de paiement</label>
                <select [(ngModel)]="modePaiement" class="form-input w-full">
                  <option value="">Non défini</option>
                  <option value="ESPECES">Espèces</option>
                  <option value="CARTE">Carte bancaire</option>
                  <option value="VIREMENT">Virement</option>
                  <option value="CHEQUE">Chèque</option>
                  <option value="CREDIT">Crédit</option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label class="form-label">Adresse de livraison</label>
                <textarea [(ngModel)]="adresseLivraison" class="form-input w-full" rows="2" placeholder="Laisser vide pour utiliser l'adresse du client"></textarea>
              </div>

              <div class="md:col-span-2">
                <label class="form-label">Notes</label>
                <textarea [(ngModel)]="notes" class="form-input w-full" rows="2" placeholder="Instructions spéciales..."></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Récapitulatif -->
        <div class="lg:col-span-1">
          <div class="card p-6 sticky top-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Récapitulatif</h2>
            
            <div class="space-y-3">
              <div class="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Sous-total HT</span>
                <span>{{ sousTotal() | number:'1.2-2' }} €</span>
              </div>

              <!-- Remise globale -->
              <div class="flex items-center justify-between">
                <span class="text-gray-600 dark:text-gray-400">Remise (%)</span>
                <input
                  type="number"
                  [(ngModel)]="remiseGlobale"
                  class="w-20 form-input py-1 text-sm text-right"
                  min="0"
                  max="100"
                />
              </div>

              @if (remiseGlobale > 0) {
                <div class="flex justify-between text-danger-600">
                  <span>- Remise</span>
                  <span>-{{ montantRemise() | number:'1.2-2' }} €</span>
                </div>
              }

              <div class="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Total HT</span>
                <span>{{ totalHT() | number:'1.2-2' }} €</span>
              </div>

              <div class="flex justify-between text-gray-600 dark:text-gray-400">
                <span>TVA (20%)</span>
                <span>{{ montantTVA() | number:'1.2-2' }} €</span>
              </div>

              <div class="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div class="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total TTC</span>
                  <span class="text-primary-600">{{ totalTTC() | number:'1.2-2' }} €</span>
                </div>
              </div>

              <div class="flex items-center gap-2 text-sm text-gray-500 mt-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ panier().length }} article(s)
              </div>
            </div>

            <div class="mt-6 space-y-3">
              <button
                type="button"
                (click)="saveAsBrouillon()"
                [disabled]="!canSave() || isSaving()"
                class="btn-secondary w-full"
              >
                Enregistrer comme brouillon
              </button>
              
              <button
                type="button"
                (click)="saveAndConfirm()"
                [disabled]="!canSave() || isSaving()"
                class="btn-primary w-full"
              >
                @if (isSaving()) {
                  <svg class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                }
                Confirmer la commande
              </button>
            </div>

            @if (!selectedClient() || panier().length === 0) {
              <p class="mt-4 text-sm text-center text-gray-500">
                @if (!selectedClient()) {
                  Sélectionnez un client
                } @else {
                  Ajoutez des produits au panier
                }
              </p>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CommandeFormComponent implements OnInit {
  private readonly commandesService = inject(CommandesService);
  private readonly clientsService = inject(ClientsService);
  private readonly produitsService = inject(ProduitsService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Client
  selectedClient = signal<Client | null>(null);
  clientSearch = '';
  clientResults = signal<Client[]>([]);
  showClientDropdown = signal(false);
  private clientSearchTimeout: any;

  // Produits
  produitSearch = '';
  produitResults = signal<Produit[]>([]);
  showProduitDropdown = signal(false);
  private produitSearchTimeout: any;

  // Panier
  panier = signal<PanierItem[]>([]);

  // Options
  dateLivraison = '';
  modePaiement = '';
  adresseLivraison = '';
  notes = '';
  remiseGlobale = 0;

  // State
  isSaving = signal(false);

  // Computed
  sousTotal = computed(() => {
    return this.panier().reduce((sum, item) => sum + (item.quantite * item.prixUnitaire), 0);
  });

  montantRemise = computed(() => {
    return this.sousTotal() * (this.remiseGlobale / 100);
  });

  totalHT = computed(() => {
    return this.sousTotal() - this.montantRemise();
  });

  montantTVA = computed(() => {
    return this.totalHT() * 0.20;
  });

  totalTTC = computed(() => {
    return this.totalHT() + this.montantTVA();
  });

  canSave = computed(() => {
    return this.selectedClient() && this.panier().length > 0;
  });

  ngOnInit(): void {
    // Pre-fill client from query param
    const clientId = this.route.snapshot.queryParams['clientId'];
    if (clientId) {
      this.clientsService.getById(clientId).subscribe({
        next: (client) => this.selectedClient.set(client),
      });
    }

    // Close dropdowns on click outside
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.relative')) {
        this.showClientDropdown.set(false);
        this.showProduitDropdown.set(false);
      }
    });
  }

  // Client search
  searchClients(): void {
    clearTimeout(this.clientSearchTimeout);
    if (!this.clientSearch) {
      this.clientResults.set([]);
      return;
    }
    this.clientSearchTimeout = setTimeout(() => {
      this.clientsService.search(this.clientSearch, 5).subscribe({
        next: (clients) => this.clientResults.set(clients),
      });
    }, 200);
  }

  selectClient(client: Client): void {
    this.selectedClient.set(client);
    this.clientSearch = '';
    this.clientResults.set([]);
    this.showClientDropdown.set(false);
  }

  clearClient(): void {
    this.selectedClient.set(null);
  }

  // Product search
  searchProduits(): void {
    clearTimeout(this.produitSearchTimeout);
    if (!this.produitSearch) {
      this.produitResults.set([]);
      return;
    }
    this.produitSearchTimeout = setTimeout(() => {
      this.produitsService.search(this.produitSearch, 10).subscribe({
        next: (produits) => this.produitResults.set(produits.filter(p => p.quantiteStock > 0)),
      });
    }, 200);
  }

  addToPanier(produit: Produit): void {
    const existing = this.panier().find(item => item.produit.id === produit.id);
    if (existing) {
      if (existing.quantite < produit.quantiteStock) {
        existing.quantite++;
        this.panier.set([...this.panier()]);
      }
    } else {
      this.panier.set([...this.panier(), {
        produit,
        quantite: 1,
        prixUnitaire: produit.prixVente,
        remise: 0,
      }]);
    }
    this.produitSearch = '';
    this.produitResults.set([]);
    this.showProduitDropdown.set(false);
  }

  removeFromPanier(index: number): void {
    const newPanier = [...this.panier()];
    newPanier.splice(index, 1);
    this.panier.set(newPanier);
  }

  incrementQuantite(index: number): void {
    const item = this.panier()[index];
    if (item.quantite < item.produit.quantiteStock) {
      item.quantite++;
      this.panier.set([...this.panier()]);
    }
  }

  decrementQuantite(index: number): void {
    const item = this.panier()[index];
    if (item.quantite > 1) {
      item.quantite--;
      this.panier.set([...this.panier()]);
    }
  }

  private buildCommandeData(): CreateCommandeDto {
    return {
      clientId: this.selectedClient()!.id,
      dateLivraisonPrevue: this.dateLivraison ? new Date(this.dateLivraison) : undefined,
      adresseLivraison: this.adresseLivraison || undefined,
      lignes: this.panier().map(item => ({
        produitId: item.produit.id,
        quantite: item.quantite,
        prixUnitaire: item.prixUnitaire,
        remise: item.remise,
      })),
      remiseGlobale: this.remiseGlobale,
      modePaiement: this.modePaiement || undefined,
      notes: this.notes || undefined,
    };
  }

  saveAsBrouillon(): void {
    if (!this.canSave()) return;
    
    this.isSaving.set(true);
    this.commandesService.create(this.buildCommandeData()).subscribe({
      next: (commande) => {
        this.notificationService.success('Commande enregistrée');
        this.router.navigate(['/commandes', commande.id]);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.notificationService.error(err.message || 'Erreur');
      },
    });
  }

  saveAndConfirm(): void {
    if (!this.canSave()) return;
    
    this.isSaving.set(true);
    this.commandesService.create(this.buildCommandeData()).subscribe({
      next: (commande) => {
        // Confirmer immédiatement
        this.commandesService.confirmer(commande.id).subscribe({
          next: () => {
            this.notificationService.success('Commande confirmée');
            this.router.navigate(['/commandes', commande.id]);
          },
          error: () => {
            this.notificationService.warning('Commande créée mais non confirmée');
            this.router.navigate(['/commandes', commande.id]);
          },
        });
      },
      error: (err) => {
        this.isSaving.set(false);
        this.notificationService.error(err.message || 'Erreur');
      },
    });
  }
}
