import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EntrepotsService } from '@core/services/entrepots.service';
import { ToastService } from '@core/services/notifications.service';
import { Entrepot } from '@core/models';

@Component({
  selector: 'app-entrepot-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <div class="detail-page" style="max-width: 1000px;">
      @if (isLoading()) {
        <div class="card"><div class="loading-container"><span class="spinner spinner--lg"></span></div></div>
      } @else if (entrepot()) {
        <div class="page-header">
          <div class="page-header__left">
            <a routerLink="/entrepots" class="back-link"><i class="ph ph-arrow-left"></i></a>
            <div>
              <div class="header-badges">
                @if (entrepot()?.estPrincipal) { <span class="badge badge--primary">Principal</span> }
                <span class="badge" [class]="entrepot()?.estActif ? 'badge--success' : 'badge--secondary'">{{ entrepot()?.estActif ? 'Actif' : 'Inactif' }}</span>
              </div>
              <h1>{{ entrepot()?.nom }}</h1>
              @if (entrepot()?.adresse) { <p class="text-muted">{{ entrepot()?.adresse }}</p> }
            </div>
          </div>
          <div class="page-header__right">
            <a [routerLink]="['/entrepots', entrepot()?.id, 'edit']" class="btn btn--secondary"><i class="ph ph-pencil"></i> Modifier</a>
            <a routerLink="/transferts/new" [queryParams]="{from: entrepot()?.id}" class="btn btn--primary"><i class="ph ph-arrows-left-right"></i> Transfert</a>
          </div>
        </div>

        <div class="detail-grid">
          <div class="card">
            <h3 class="card__title mb-4"><i class="ph ph-info"></i> Informations</h3>
            <div class="info-list">
              <div class="info-item"><span class="info-item__label">Téléphone</span><span class="info-item__value">{{ entrepot()?.telephone || '-' }}</span></div>
              <div class="info-item"><span class="info-item__label">Capacité</span><span class="info-item__value">{{ entrepot()?.capacite || 'Non définie' }}</span></div>
              <div class="info-item"><span class="info-item__label">Responsable</span><span class="info-item__value">{{ entrepot()?.responsable?.nomComplet || '-' }}</span></div>
              <div class="info-item"><span class="info-item__label">Créé le</span><span class="info-item__value">{{ entrepot()?.dateCreation | date:'dd/MM/yyyy' }}</span></div>
            </div>
          </div>

          <div class="card">
            <h3 class="card__title mb-4"><i class="ph ph-chart-bar"></i> Stock</h3>
            <div class="stats-grid">
              <div class="stat"><span class="stat-value">{{ entrepot()?._count?.inventaires || 0 }}</span><span class="stat-label">Produits</span></div>
              <div class="stat"><span class="stat-value">{{ entrepot()?._count?.mouvementsOrigine || 0 }}</span><span class="stat-label">Mouvements</span></div>
            </div>
          </div>

          <div class="card full-width">
            <div class="card__header">
              <h3 class="card__title"><i class="ph ph-package"></i> Inventaire</h3>
              <a [routerLink]="['/inventaire']" [queryParams]="{entrepotId: entrepot()?.id}" class="btn btn--ghost btn--sm">Voir tout</a>
            </div>
            <div class="empty-mini"><p>Consultez l'inventaire complet dans le module dédié</p></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; margin-bottom: var(--space-6); }
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
export class EntrepotDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private entrepotsService = inject(EntrepotsService);
  private toast = inject(ToastService);

  entrepot = signal<Entrepot | null>(null);
  isLoading = signal(true);

  ngOnInit() { const id = this.route.snapshot.params['id']; if (id) this.loadEntrepot(+id); }

  loadEntrepot(id: number) {
    this.isLoading.set(true);
    this.entrepotsService.getById(id).subscribe({
      next: (e) => { this.entrepot.set(e); this.isLoading.set(false); },
      error: () => { this.toast.error('Erreur', 'Entrepôt introuvable'); this.router.navigate(['/entrepots']); }
    });
  }
}
