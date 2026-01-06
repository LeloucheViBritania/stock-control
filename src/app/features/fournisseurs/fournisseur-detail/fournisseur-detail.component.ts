import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FournisseursService } from '@core/services/fournisseurs.service';
import { ToastService } from '@core/services/notifications.service';
import { Fournisseur } from '@core/models';

@Component({
  selector: 'app-fournisseur-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="detail-page" style="max-width: 1000px;">
      @if (isLoading()) {
        <div class="card"><div class="loading-container"><span class="spinner spinner--lg"></span></div></div>
      } @else if (fournisseur()) {
        <div class="page-header">
          <div class="page-header__left">
            <a routerLink="/fournisseurs" class="back-link"><i class="ph ph-arrow-left"></i></a>
            <div>
              <div class="header-badges">
                <span class="badge" [class]="fournisseur()?.estActif ? 'badge--success' : 'badge--secondary'">{{ fournisseur()?.estActif ? 'Actif' : 'Inactif' }}</span>
                @if (fournisseur()?.noteGlobale) {
                  <span class="badge badge--warning"><i class="ph-fill ph-star"></i> {{ fournisseur()?.noteGlobale | number:'1.1-1' }}</span>
                }
              </div>
              <h1>{{ fournisseur()?.nom }}</h1>
              @if (fournisseur()?.siret) { <p class="text-muted">SIRET: {{ fournisseur()?.siret }}</p> }
            </div>
          </div>
          <div class="page-header__right">
            <a [routerLink]="['/fournisseurs', fournisseur()?.id, 'edit']" class="btn btn--secondary"><i class="ph ph-pencil"></i> Modifier</a>
          </div>
        </div>

        <div class="detail-grid">
          <div class="card">
            <h3 class="card__title mb-4"><i class="ph ph-identification-card"></i> Coordonnées</h3>
            <div class="info-list">
              <div class="info-item"><span class="info-item__label">Email</span><span class="info-item__value">{{ fournisseur()?.email || '-' }}</span></div>
              <div class="info-item"><span class="info-item__label">Téléphone</span><span class="info-item__value">{{ fournisseur()?.telephone || '-' }}</span></div>
              <div class="info-item"><span class="info-item__label">Contact</span><span class="info-item__value">{{ fournisseur()?.contactPrincipal || '-' }}</span></div>
              <div class="info-item"><span class="info-item__label">Adresse</span><span class="info-item__value">{{ fournisseur()?.adresse || '-' }}</span></div>
              <div class="info-item"><span class="info-item__label">Délai moyen</span><span class="info-item__value">{{ fournisseur()?.delaiLivraisonMoyen || '-' }} jours</span></div>
            </div>
          </div>

          <div class="card">
            <h3 class="card__title mb-4"><i class="ph ph-chart-bar"></i> Statistiques</h3>
            <div class="stats-grid">
              <div class="stat"><span class="stat-value">{{ fournisseur()?._count?.produitsFournisseurs || 0 }}</span><span class="stat-label">Produits</span></div>
              <div class="stat"><span class="stat-value">{{ fournisseur()?._count?.bonsCommande || 0 }}</span><span class="stat-label">Commandes</span></div>
            </div>
          </div>

          <div class="card full-width">
            <div class="card__header">
              <h3 class="card__title"><i class="ph ph-package"></i> Produits fournis</h3>
            </div>
            @if (!fournisseur()?.produitsFournisseurs?.length) {
              <div class="empty-mini"><p>Aucun produit associé</p></div>
            } @else {
              <table class="table">
                <thead><tr><th>Produit</th><th class="text-right">Prix</th><th class="text-right">Délai</th><th>Préféré</th></tr></thead>
                <tbody>
                  @for (pf of fournisseur()?.produitsFournisseurs?.slice(0, 10); track pf.id) {
                    <tr>
                      <td><a [routerLink]="['/produits', pf.produitId]">{{ pf.produit?.nom }}</a></td>
                      <td class="text-right">{{ pf.prixUnitaire | currency:'XOF':'symbol':'1.0-0' }}</td>
                      <td class="text-right">{{ pf.delaiLivraisonJours || '-' }} j</td>
                      <td>@if (pf.estPrefere) { <span class="badge badge--primary badge--sm">Préféré</span> }</td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; margin-bottom: var(--space-6); gap: var(--space-4); }
    .page-header__left { display: flex; gap: var(--space-4); }
    .page-header__right { display: flex; gap: var(--space-3); }
    .back-link { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-lg); background: var(--neutral-100); &:hover { background: var(--neutral-200); } }
    .header-badges { display: flex; gap: var(--space-2); margin-bottom: var(--space-2); }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); }
    .full-width { grid-column: span 2; }
    .info-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .info-item { display: flex; justify-content: space-between; padding-bottom: var(--space-3); border-bottom: 1px solid var(--neutral-100); }
    .info-item__label { color: var(--neutral-500); }
    .info-item__value { font-weight: 500; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); }
    .stat { text-align: center; padding: var(--space-4); background: var(--neutral-50); border-radius: var(--radius-lg); }
    .stat-value { display: block; font-family: var(--font-display); font-size: var(--text-xl); font-weight: 600; }
    .stat-label { font-size: var(--text-sm); color: var(--neutral-500); }
    .loading-container { display: flex; justify-content: center; padding: var(--space-12); }
    .empty-mini { padding: var(--space-6); text-align: center; color: var(--neutral-500); }
    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } .full-width { grid-column: span 1; } }
  `]
})
export class FournisseurDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fournisseursService = inject(FournisseursService);
  private toast = inject(ToastService);

  fournisseur = signal<Fournisseur | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) this.loadFournisseur(+id);
  }

  loadFournisseur(id: number) {
    this.isLoading.set(true);
    this.fournisseursService.getById(id).subscribe({
      next: (f) => { this.fournisseur.set(f); this.isLoading.set(false); },
      error: () => { this.toast.error('Erreur', 'Fournisseur introuvable'); this.router.navigate(['/fournisseurs']); }
    });
  }
}
