import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProduitsService } from '@core/services/produits.service';
import { MouvementsStockService } from '@core/services/mouvements-stock.service';
import { ToastService } from '@core/services/notifications.service';
import { Produit, MouvementStock, ProduitFournisseur } from '@core/models';
import { ConfirmModalComponent } from '@shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-produit-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPipe, DatePipe, ConfirmModalComponent],
  template: `
    <div class="detail-page">
      @if (isLoading()) {
        <div class="card">
          <div class="loading-container">
            <span class="spinner spinner--lg"></span>
            <p>Chargement du produit...</p>
          </div>
        </div>
      } @else if (produit()) {
        <!-- Header -->
        <div class="page-header">
          <div class="page-header__left">
            <a routerLink="/produits" class="back-link">
              <i class="ph ph-arrow-left"></i>
            </a>
            <div>
              <div class="d-flex align-center gap-3">
                <h1>{{ produit()!.nom }}</h1>
                @if (!produit()!.estActif) {
                  <span class="badge badge--secondary">Inactif</span>
                }
              </div>
              <p class="text-muted">
                <code>{{ produit()!.reference }}</code>
                @if (produit()!.marque) {
                  · {{ produit()!.marque }}
                }
              </p>
            </div>
          </div>
          <div class="page-header__right">
            <button class="btn btn--secondary" (click)="openAjustementModal()">
              <i class="ph ph-plus-minus"></i>
              Ajuster stock
            </button>
            <a [routerLink]="['/produits', produit()!.id, 'edit']" class="btn btn--primary">
              <i class="ph ph-pencil"></i>
              Modifier
            </a>
          </div>
        </div>

        <!-- Content Grid -->
        <div class="detail-grid">
          <!-- Stock Card -->
          <div class="card stock-card">
            <div class="stock-display">
              <div class="stock-value" [class.stock-low]="isStockFaible()" [class.stock-out]="produit()!.quantiteStock === 0">
                {{ produit()!.quantiteStock }}
              </div>
              <div class="stock-unit">{{ produit()!.uniteMesure }}</div>
              <div class="stock-label">En stock</div>
            </div>
            <div class="stock-meta">
              <div class="stock-meta__item">
                <span class="label">Stock min</span>
                <span class="value">{{ produit()!.niveauStockMin }}</span>
              </div>
              @if (produit()!.niveauStockMax) {
                <div class="stock-meta__item">
                  <span class="label">Stock max</span>
                  <span class="value">{{ produit()!.niveauStockMax }}</span>
                </div>
              }
              @if (produit()!.pointCommande) {
                <div class="stock-meta__item">
                  <span class="label">Point commande</span>
                  <span class="value">{{ produit()!.pointCommande }}</span>
                </div>
              }
            </div>
            @if (isStockFaible()) {
              <div class="stock-alert">
                <i class="ph ph-warning"></i>
                Stock en dessous du minimum
              </div>
            }
          </div>

          <!-- Info Card -->
          <div class="card">
            <div class="card__header">
              <h3 class="card__title">Informations</h3>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Catégorie</span>
                <span class="info-value">{{ produit()!.categorie?.nom || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Code-barres</span>
                <span class="info-value">{{ produit()!.codeBarre || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Poids</span>
                <span class="info-value">{{ produit()!.poids ? produit()!.poids + ' kg' : '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Dimensions</span>
                <span class="info-value">{{ produit()!.dimensions || '-' }}</span>
              </div>
            </div>
            @if (produit()!.description) {
              <div class="description">
                <span class="info-label">Description</span>
                <p>{{ produit()!.description }}</p>
              </div>
            }
          </div>

          <!-- Prix Card -->
          <div class="card">
            <div class="card__header">
              <h3 class="card__title">Prix</h3>
            </div>
            <div class="price-grid">
              <div class="price-item">
                <span class="price-label">Prix d'achat</span>
                <span class="price-value">{{ produit()!.coutUnitaire | currency:'XOF':'symbol':'1.0-0' }}</span>
              </div>
              <div class="price-item price-item--main">
                <span class="price-label">Prix de vente</span>
                <span class="price-value">{{ produit()!.prixVente | currency:'XOF':'symbol':'1.0-0' }}</span>
              </div>
              <div class="price-item">
                <span class="price-label">Taux taxe</span>
                <span class="price-value">{{ produit()!.tauxTaxe }}%</span>
              </div>
              <div class="price-item">
                <span class="price-label">Marge</span>
                <span class="price-value" [class.text-success]="getMarge() > 0">
                  {{ getMarge() | number:'1.0-0' }}%
                </span>
              </div>
            </div>
            <div class="valeur-stock">
              <span>Valeur du stock</span>
              <strong>{{ getValeurStock() | currency:'XOF':'symbol':'1.0-0' }}</strong>
            </div>
          </div>

          <!-- Fournisseurs -->
          <div class="card">
            <div class="card__header">
              <h3 class="card__title">Fournisseurs ({{ fournisseurs().length }})</h3>
              <button class="btn btn--ghost btn--sm" (click)="showAddFournisseur.set(true)">
                <i class="ph ph-plus"></i>
                Ajouter
              </button>
            </div>
            @if (fournisseurs().length === 0) {
              <div class="empty-mini">
                <i class="ph ph-truck"></i>
                <p>Aucun fournisseur associé</p>
              </div>
            } @else {
              <div class="fournisseurs-list">
                @for (pf of fournisseurs(); track pf.id) {
                  <div class="fournisseur-row">
                    <div class="fournisseur-info">
                      <span class="fournisseur-name">{{ pf.fournisseur?.nom }}</span>
                      @if (pf.estPrefere) {
                        <span class="badge badge--primary badge--sm">Préféré</span>
                      }
                      @if (pf.referenceFournisseur) {
                        <code class="ref-mini">{{ pf.referenceFournisseur }}</code>
                      }
                    </div>
                    <div class="fournisseur-details">
                      <span class="fournisseur-price">{{ pf.prixUnitaire | currency:'XOF':'symbol':'1.0-0' }}</span>
                      <span class="fournisseur-delay">{{ pf.delaiLivraisonJours || '-' }}j</span>
                      <div class="fournisseur-actions">
                        @if (!pf.estPrefere) {
                          <button 
                            class="btn btn--ghost btn--sm btn--icon" 
                            title="Définir comme préféré"
                            (click)="setFournisseurPrefere(pf)"
                          >
                            <i class="ph ph-star"></i>
                          </button>
                        }
                        <button 
                          class="btn btn--ghost btn--sm btn--icon text-error" 
                          title="Retirer"
                          (click)="removeFournisseur(pf)"
                        >
                          <i class="ph ph-x"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Mouvements récents -->
          <div class="card full-width">
            <div class="card__header">
              <h3 class="card__title">Mouvements récents</h3>
              <a [routerLink]="['/mouvements-stock']" [queryParams]="{produitId: produit()!.id}" class="btn btn--ghost btn--sm">
                Voir tout
                <i class="ph ph-arrow-right"></i>
              </a>
            </div>
            @if (mouvements().length === 0) {
              <div class="empty-mini">
                <i class="ph ph-arrows-left-right"></i>
                <p>Aucun mouvement enregistré</p>
              </div>
            } @else {
              <div class="table-container">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Quantité</th>
                      <th>Raison</th>
                      <th>Par</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (mvt of mouvements(); track mvt.id) {
                      <tr>
                        <td>{{ mvt.dateMouvement | date:'dd/MM/yyyy HH:mm' }}</td>
                        <td>
                          <span class="badge" [class]="getMouvementBadgeClass(mvt.typeMouvement)">
                            {{ mvt.typeMouvement }}
                          </span>
                        </td>
                        <td>
                          <span [class]="getMouvementQtyClass(mvt.typeMouvement)">
                            {{ getMouvementSign(mvt.typeMouvement) }}{{ mvt.quantite }}
                          </span>
                        </td>
                        <td>{{ mvt.raison || '-' }}</td>
                        <td>{{ mvt.utilisateur?.nomUtilisateur || '-' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>

        <!-- Ajustement Modal -->
        @if (showAjustementModal()) {
          <div class="modal-backdrop" (click)="closeAjustementModal()">
            <div class="modal" (click)="$event.stopPropagation()">
              <div class="modal__header">
                <h3 class="modal__title">Ajuster le stock</h3>
                <button class="modal__close" (click)="closeAjustementModal()">
                  <i class="ph ph-x"></i>
                </button>
              </div>
              <div class="modal__body">
                <p class="mb-4">
                  Stock actuel: <strong>{{ produit()!.quantiteStock }} {{ produit()!.uniteMesure }}</strong>
                </p>

                <div class="form-group">
                  <label class="form-group__label">Type d'ajustement</label>
                  <div class="btn-group">
                    <button 
                      class="btn" 
                      [class.btn--success]="ajustementType() === 'entree'"
                      [class.btn--secondary]="ajustementType() !== 'entree'"
                      (click)="ajustementType.set('entree')"
                    >
                      <i class="ph ph-plus"></i>
                      Entrée
                    </button>
                    <button 
                      class="btn" 
                      [class.btn--danger]="ajustementType() === 'sortie'"
                      [class.btn--secondary]="ajustementType() !== 'sortie'"
                      (click)="ajustementType.set('sortie')"
                    >
                      <i class="ph ph-minus"></i>
                      Sortie
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-group__label">Quantité *</label>
                  <input 
                    type="number" 
                    [(ngModel)]="ajustementQuantite"
                    class="form-control"
                    min="1"
                  />
                </div>

                <div class="form-group">
                  <label class="form-group__label">Raison *</label>
                  <textarea 
                    [(ngModel)]="ajustementRaison"
                    class="form-control"
                    rows="2"
                    placeholder="Motif de l'ajustement..."
                  ></textarea>
                </div>

                <div class="preview-box">
                  <span>Nouveau stock:</span>
                  <strong>{{ getNewStock() }} {{ produit()!.uniteMesure }}</strong>
                </div>
              </div>
              <div class="modal__footer">
                <button class="btn btn--secondary" (click)="closeAjustementModal()">Annuler</button>
                <button 
                  class="btn btn--primary" 
                  (click)="submitAjustement()"
                  [disabled]="!ajustementQuantite || !ajustementRaison || isSubmitting()"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .detail-page {
      max-width: 1100px;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .page-header__left {
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
    }

    .page-header__right {
      display: flex;
      gap: var(--space-3);
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
      }
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-6);
    }

    .full-width {
      grid-column: span 2;
    }

    .stock-card {
      background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
      color: white;
    }

    .stock-display {
      text-align: center;
      padding: var(--space-6) 0;
    }

    .stock-value {
      font-family: var(--font-display);
      font-size: 4rem;
      font-weight: 700;
      line-height: 1;

      &.stock-low {
        color: var(--warning-300);
      }

      &.stock-out {
        color: var(--error-300);
      }
    }

    .stock-unit {
      font-size: var(--text-lg);
      opacity: 0.8;
      margin-top: var(--space-1);
    }

    .stock-label {
      font-size: var(--text-sm);
      opacity: 0.7;
      margin-top: var(--space-2);
    }

    .stock-meta {
      display: flex;
      justify-content: center;
      gap: var(--space-8);
      padding: var(--space-4);
      border-top: 1px solid rgba(255,255,255,0.2);
    }

    .stock-meta__item {
      text-align: center;

      .label {
        display: block;
        font-size: var(--text-xs);
        opacity: 0.7;
      }

      .value {
        font-weight: 600;
      }
    }

    .stock-alert {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-3);
      background: rgba(255,255,255,0.15);
      font-size: var(--text-sm);
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .info-label {
      font-size: var(--text-sm);
      color: var(--neutral-500);
    }

    .info-value {
      font-weight: 500;
      color: var(--neutral-800);
    }

    .description {
      margin-top: var(--space-4);
      padding-top: var(--space-4);
      border-top: 1px solid var(--neutral-200);

      p {
        margin-top: var(--space-2);
        color: var(--neutral-700);
      }
    }

    .price-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);
    }

    .price-item {
      text-align: center;
      padding: var(--space-3);
      background: var(--neutral-50);
      border-radius: var(--radius-lg);

      &--main {
        background: var(--primary-50);
        border: 1px solid var(--primary-200);
      }
    }

    .price-label {
      display: block;
      font-size: var(--text-xs);
      color: var(--neutral-500);
      margin-bottom: var(--space-1);
    }

    .price-value {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--neutral-900);
    }

    .valeur-stock {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: var(--space-4);
      padding-top: var(--space-4);
      border-top: 1px solid var(--neutral-200);

      strong {
        font-family: var(--font-display);
        font-size: var(--text-xl);
      }
    }

    .fournisseurs-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .fournisseur-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3);
      background: var(--neutral-50);
      border-radius: var(--radius-lg);
    }

    .fournisseur-info {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .fournisseur-name {
      font-weight: 500;
    }

    .ref-mini {
      font-size: var(--text-xs);
      background: var(--neutral-200);
      padding: 2px 6px;
      border-radius: var(--radius-sm);
    }

    .fournisseur-details {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .fournisseur-price {
      font-family: var(--font-mono);
      font-weight: 500;
    }

    .fournisseur-delay {
      font-size: var(--text-sm);
      color: var(--neutral-500);
    }

    .fournisseur-actions {
      display: flex;
      gap: var(--space-1);
    }

    .empty-mini {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--space-8);
      color: var(--neutral-400);

      i {
        font-size: 2rem;
        margin-bottom: var(--space-2);
      }

      p {
        margin: 0;
        font-size: var(--text-sm);
      }
    }

    .btn-group {
      display: flex;
      gap: var(--space-2);
    }

    .preview-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4);
      background: var(--neutral-100);
      border-radius: var(--radius-lg);

      strong {
        font-family: var(--font-display);
        font-size: var(--text-xl);
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--space-12);
      gap: var(--space-4);
      color: var(--neutral-500);
    }

    @media (max-width: 768px) {
      .detail-grid {
        grid-template-columns: 1fr;
      }

      .full-width {
        grid-column: span 1;
      }

      .page-header {
        flex-direction: column;
      }

      .page-header__right {
        width: 100%;
      }
    }
  `]
})
export class ProduitDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private produitsService = inject(ProduitsService);
  private mouvementsService = inject(MouvementsStockService);
  private toast = inject(ToastService);

  produit = signal<Produit | null>(null);
  fournisseurs = signal<ProduitFournisseur[]>([]);
  mouvements = signal<MouvementStock[]>([]);
  isLoading = signal(true);

  // Ajustement modal
  showAjustementModal = signal(false);
  showAddFournisseur = signal(false);
  ajustementType = signal<'entree' | 'sortie'>('entree');
  ajustementQuantite: number | null = null;
  ajustementRaison = '';
  isSubmitting = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadProduit(+id);
    }
  }

  loadProduit(id: number) {
    this.isLoading.set(true);

    this.produitsService.getById(id).subscribe({
      next: (produit) => {
        this.produit.set(produit);
        this.loadFournisseurs(id);
        this.loadMouvements(id);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Erreur', 'Produit introuvable');
        this.router.navigate(['/produits']);
      }
    });
  }

  loadFournisseurs(produitId: number) {
    this.produitsService.getFournisseurs(produitId).subscribe({
      next: (fournisseurs) => this.fournisseurs.set(fournisseurs),
      error: () => console.error('Failed to load fournisseurs')
    });
  }

  loadMouvements(produitId: number) {
    this.mouvementsService.getByProduit(produitId, { limit: 10 }).subscribe({
      next: (response) => this.mouvements.set(response.data),
      error: () => console.error('Failed to load mouvements')
    });
  }

  isStockFaible(): boolean {
    const p = this.produit();
    return p ? p.quantiteStock <= p.niveauStockMin : false;
  }

  getMarge(): number {
    const p = this.produit();
    if (!p || !p.coutUnitaire || !p.prixVente) return 0;
    return ((p.prixVente - p.coutUnitaire) / p.coutUnitaire) * 100;
  }

  getValeurStock(): number {
    const p = this.produit();
    if (!p) return 0;
    return p.quantiteStock * (p.coutUnitaire || p.prixVente || 0);
  }

  getMouvementBadgeClass(type: string): string {
    switch (type) {
      case 'ENTREE': return 'badge--success';
      case 'SORTIE': return 'badge--error';
      case 'TRANSFERT': return 'badge--info';
      case 'AJUSTEMENT': return 'badge--warning';
      default: return 'badge--secondary';
    }
  }

  getMouvementQtyClass(type: string): string {
    return type === 'ENTREE' || type === 'RETOUR' ? 'text-success font-semibold' : 'text-error font-semibold';
  }

  getMouvementSign(type: string): string {
    return type === 'ENTREE' || type === 'RETOUR' ? '+' : '-';
  }

  // Ajustement
  openAjustementModal() {
    this.ajustementType.set('entree');
    this.ajustementQuantite = null;
    this.ajustementRaison = '';
    this.showAjustementModal.set(true);
  }

  closeAjustementModal() {
    this.showAjustementModal.set(false);
  }

  getNewStock(): number {
    const current = this.produit()?.quantiteStock || 0;
    const qty = this.ajustementQuantite || 0;
    return this.ajustementType() === 'entree' ? current + qty : current - qty;
  }

  submitAjustement() {
    const p = this.produit();
    if (!p || !this.ajustementQuantite || !this.ajustementRaison) return;

    this.isSubmitting.set(true);

    this.produitsService.ajusterStock(p.id, {
      type: this.ajustementType(),
      quantite: this.ajustementQuantite,
      raison: this.ajustementRaison
    }).subscribe({
      next: (updated) => {
        this.produit.set(updated);
        this.loadMouvements(p.id);
        this.toast.success('Stock ajusté', `Nouveau stock: ${updated.quantiteStock}`);
        this.closeAjustementModal();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.toast.error('Erreur', err.error?.message || 'Impossible d\'ajuster le stock');
        this.isSubmitting.set(false);
      }
    });
  }

  // Fournisseurs
  setFournisseurPrefere(pf: ProduitFournisseur) {
    this.produitsService.setFournisseurPrefere(this.produit()!.id, pf.fournisseurId).subscribe({
      next: () => {
        this.loadFournisseurs(this.produit()!.id);
        this.toast.success('Fournisseur préféré', 'Le fournisseur a été défini comme préféré');
      },
      error: () => this.toast.error('Erreur', 'Impossible de définir le fournisseur préféré')
    });
  }

  removeFournisseur(pf: ProduitFournisseur) {
    this.produitsService.retirerFournisseur(this.produit()!.id, pf.fournisseurId).subscribe({
      next: () => {
        this.loadFournisseurs(this.produit()!.id);
        this.toast.success('Fournisseur retiré', 'Le fournisseur a été retiré du produit');
      },
      error: () => this.toast.error('Erreur', 'Impossible de retirer le fournisseur')
    });
  }
}
