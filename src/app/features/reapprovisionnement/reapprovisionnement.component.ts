import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/notifications.service';
import { ProduitsService } from '@core/services/produits.service';

@Component({
  selector: 'app-reapprovisionnement',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <div class="reappro-page">
      <div class="page-header">
        <div>
          <h1>Réapprovisionnement</h1>
          <p class="text-muted">Suggestions automatiques de commandes fournisseurs</p>
        </div>
        <div class="header-actions">
          <button class="btn btn--secondary" (click)="actualiser()"><i class="ph ph-arrow-clockwise"></i> Actualiser</button>
          <button class="btn btn--primary" (click)="creerBonsCommande()" [disabled]="selectionnes().length === 0">
            <i class="ph ph-shopping-cart"></i>
            Créer bons de commande ({{ selectionnes().length }})
          </button>
        </div>
      </div>

      @if (isLoading()) {
        <div class="card"><div class="loading-container"><span class="spinner spinner--lg"></span></div></div>
      } @else if (suggestions().length === 0) {
        <div class="card empty-state">
          <i class="ph-duotone ph-check-circle"></i>
          <h3>Aucune suggestion</h3>
          <p>Tous vos produits sont suffisamment approvisionnés</p>
        </div>
      } @else {
        <div class="card">
          <div class="table-header">
            <label class="form-check">
              <input type="checkbox" [checked]="toutSelectionne()" (change)="toggleTout()" />
              <span class="form-check__label">Tout sélectionner</span>
            </label>
            <span class="text-muted">{{ suggestions().length }} suggestion(s)</span>
          </div>
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 40px;"></th>
                  <th>Produit</th>
                  <th>Fournisseur</th>
                  <th class="text-right">Stock</th>
                  <th class="text-right">Min</th>
                  <th class="text-right">Qté suggérée</th>
                  <th class="text-right">Prix unit.</th>
                  <th class="text-right">Total</th>
                  <th>Urgence</th>
                </tr>
              </thead>
              <tbody>
                @for (sugg of suggestions(); track sugg.produitId) {
                  <tr [class.row-selected]="estSelectionne(sugg.produitId)">
                    <td>
                      <input type="checkbox" [checked]="estSelectionne(sugg.produitId)" (change)="toggleSelection(sugg.produitId)" />
                    </td>
                    <td>
                      <div class="product-cell">
                        <span class="product-name">{{ sugg.produit?.nom }}</span>
                        <span class="product-ref text-muted">{{ sugg.produit?.reference }}</span>
                      </div>
                    </td>
                    <td>{{ sugg.fournisseur?.nom || 'Non défini' }}</td>
                    <td class="text-right">
                      <span [class.text-error]="sugg.stockActuel === 0" [class.text-warning]="sugg.stockActuel > 0 && sugg.stockActuel <= sugg.seuilMin">
                        {{ sugg.stockActuel }}
                      </span>
                    </td>
                    <td class="text-right">{{ sugg.seuilMin }}</td>
                    <td class="text-right">
                      <input type="number" [(ngModel)]="sugg.quantiteSuggeree" class="form-control form-control--sm text-right" style="width: 80px;" min="1" />
                    </td>
                    <td class="text-right">{{ sugg.prixUnitaire | currency:'XOF':'symbol':'1.0-0' }}</td>
                    <td class="text-right"><strong>{{ sugg.quantiteSuggeree * sugg.prixUnitaire | currency:'XOF':'symbol':'1.0-0' }}</strong></td>
                    <td>
                      <span class="badge" [class]="getUrgenceBadge(sugg.urgence)">{{ sugg.urgence }}</span>
                    </td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="7" class="text-right"><strong>Total estimé:</strong></td>
                  <td class="text-right"><strong class="text-primary">{{ getTotalEstime() | currency:'XOF':'symbol':'1.0-0' }}</strong></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
    .header-actions { display: flex; gap: var(--space-3); }
    .table-header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-4) var(--space-6); border-bottom: 1px solid var(--neutral-200); }
    .product-cell { display: flex; flex-direction: column; }
    .product-name { font-weight: 500; }
    .product-ref { font-size: var(--text-sm); }
    .row-selected { background: var(--primary-50); }
    .loading-container, .empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--space-12); gap: var(--space-4); text-align: center; }
    .empty-state i { font-size: 4rem; color: var(--success-400); }
  `]
})
export class ReapprovisionnementComponent implements OnInit {
  private produitsService = inject(ProduitsService);
  private toast = inject(ToastService);

  suggestions = signal<any[]>([]);
  selectionnes = signal<number[]>([]);
  isLoading = signal(true);

  ngOnInit() { this.loadSuggestions(); }

  loadSuggestions() {
    this.isLoading.set(true);
    this.produitsService.getStockFaible().subscribe({
      next: (produits) => {
        const suggestions = produits.map(p => ({
          produitId: p.id,
          produit: p,
          fournisseur: p.produitsFournisseurs?.find(pf => pf.estPrefere)?.fournisseur || p.produitsFournisseurs?.[0]?.fournisseur,
          stockActuel: p.quantiteStock,
          seuilMin: p.niveauStockMin,
          quantiteSuggeree: Math.max((p.pointCommande || p.niveauStockMin * 2) - p.quantiteStock, 1),
          prixUnitaire: p.produitsFournisseurs?.find(pf => pf.estPrefere)?.prixUnitaire || p.coutUnitaire || 0,
          urgence: p.quantiteStock === 0 ? 'CRITIQUE' : p.quantiteStock <= p.niveauStockMin / 2 ? 'HAUTE' : 'NORMALE'
        }));
        this.suggestions.set(suggestions);
        this.isLoading.set(false);
      },
      error: () => { this.toast.error('Erreur', 'Impossible de charger les suggestions'); this.isLoading.set(false); }
    });
  }

  actualiser() { this.selectionnes.set([]); this.loadSuggestions(); }

  estSelectionne(id: number): boolean { return this.selectionnes().includes(id); }
  toutSelectionne(): boolean { return this.suggestions().length > 0 && this.selectionnes().length === this.suggestions().length; }

  toggleSelection(id: number) {
    if (this.estSelectionne(id)) {
      this.selectionnes.update(s => s.filter(i => i !== id));
    } else {
      this.selectionnes.update(s => [...s, id]);
    }
  }

  toggleTout() {
    if (this.toutSelectionne()) {
      this.selectionnes.set([]);
    } else {
      this.selectionnes.set(this.suggestions().map(s => s.produitId));
    }
  }

  getTotalEstime(): number {
    return this.suggestions()
      .filter(s => this.estSelectionne(s.produitId))
      .reduce((sum, s) => sum + (s.quantiteSuggeree * s.prixUnitaire), 0);
  }

  getUrgenceBadge(urgence: string): string {
    const map: Record<string, string> = { CRITIQUE: 'badge--error', HAUTE: 'badge--warning', NORMALE: 'badge--info' };
    return map[urgence] || 'badge--secondary';
  }

  creerBonsCommande() {
    const selected = this.suggestions().filter(s => this.estSelectionne(s.produitId));
    if (selected.length === 0) return;
    
    this.toast.success('Bons de commande créés', `${selected.length} bon(s) de commande généré(s)`);
    // TODO: Implémenter la création réelle des bons de commande
  }
}
