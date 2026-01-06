import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InventairePhysiqueService } from '@core/services/inventaire-physique.service';
import { ToastService } from '@core/services/notifications.service';

@Component({
  selector: 'app-inventaire-physique-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <div class="detail-page" style="max-width: 1000px;">
      @if (isLoading()) {
        <div class="card"><div class="loading-container"><span class="spinner spinner--lg"></span></div></div>
      } @else if (session()) {
        <div class="page-header">
          <div class="page-header__left">
            <a routerLink="/inventaire-physique" class="back-link"><i class="ph ph-arrow-left"></i></a>
            <div>
              <div class="header-badges">
                <code class="ref-code">{{ session()?.reference }}</code>
                <span class="badge" [class]="getStatutBadge(session()!.statut)">{{ session()?.statut }}</span>
              </div>
              <h1>Session {{ session()?.reference }}</h1>
            </div>
          </div>
        </div>

        <div class="detail-grid">
          <div class="card">
            <h3 class="card__title mb-4"><i class="ph ph-info"></i> Informations</h3>
            <div class="info-list">
              <div class="info-item"><span class="info-item__label">Entrepôt</span><span class="info-item__value">{{ session()?.entrepot?.nom || '-' }}</span></div>
              <div class="info-item"><span class="info-item__label">Date début</span><span class="info-item__value">{{ session()?.dateDebut | date:'dd/MM/yyyy' }}</span></div>
              <div class="info-item"><span class="info-item__label">Date fin</span><span class="info-item__value">{{ session()?.dateFin | date:'dd/MM/yyyy' }}</span></div>
            </div>
          </div>

          <div class="card">
            <h3 class="card__title mb-4"><i class="ph ph-chart-bar"></i> Résumé</h3>
            <div class="stats-grid">
              <div class="stat"><span class="stat-value">{{ session()?._count?.lignes || 0 }}</span><span class="stat-label">Produits</span></div>
              <div class="stat"><span class="stat-value">-</span><span class="stat-label">Écarts</span></div>
            </div>
          </div>

          <div class="card full-width">
            <h3 class="card__title mb-4"><i class="ph ph-list"></i> Lignes de comptage</h3>
            <div class="coming-soon">
              <p>Détail des lignes de comptage à venir</p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; margin-bottom: var(--space-6); }
    .page-header__left { display: flex; gap: var(--space-4); }
    .back-link { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-lg); background: var(--neutral-100); &:hover { background: var(--neutral-200); } }
    .header-badges { display: flex; gap: var(--space-3); margin-bottom: var(--space-2); }
    .ref-code { font-family: var(--font-mono); background: var(--neutral-100); padding: var(--space-1) var(--space-3); border-radius: var(--radius-md); }
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
    .coming-soon { padding: var(--space-8); text-align: center; color: var(--neutral-500); }
    .loading-container { display: flex; justify-content: center; padding: var(--space-12); }
    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } .full-width { grid-column: span 1; } }
  `]
})
export class InventairePhysiqueDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(InventairePhysiqueService);
  private toast = inject(ToastService);

  session = signal<any>(null);
  isLoading = signal(true);

  ngOnInit() { const id = this.route.snapshot.params['id']; if (id) this.loadSession(+id); }

  loadSession(id: number) {
    this.isLoading.set(true);
    this.service.getById(id).subscribe({
      next: (s) => { this.session.set(s); this.isLoading.set(false); },
      error: () => { this.toast.error('Erreur', 'Session introuvable'); this.router.navigate(['/inventaire-physique']); }
    });
  }

  getStatutBadge(statut: string): string {
    return { EN_COURS: 'badge--info', TERMINE: 'badge--success', ANNULE: 'badge--error', BROUILLON: 'badge--secondary' }[statut] || 'badge--secondary';
  }
}
