import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrevisionsService } from '@core/services/previsions.service';
import { ToastService } from '@core/services/notifications.service';

@Component({
  selector: 'app-previsions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="previsions-page">
      <div class="page-header">
        <div>
          <h1>Prévisions</h1>
          <p class="text-muted">Analysez les tendances et prévoyez vos besoins</p>
        </div>
        <button class="btn btn--primary" (click)="recalculerPrevisions()">
          <i class="ph ph-arrow-clockwise"></i>
          Recalculer
        </button>
      </div>

      @if (isLoading()) {
        <div class="card"><div class="loading-container"><span class="spinner spinner--lg"></span><p>Calcul des prévisions...</p></div></div>
      } @else {
        <div class="previsions-grid">
          <!-- Prévision de ventes -->
          <div class="card">
            <div class="card__header">
              <h3 class="card__title"><i class="ph ph-chart-line-up"></i> Prévision des Ventes</h3>
            </div>
            <div class="card__body">
              <div class="prevision-chart">
                <div class="chart-placeholder">
                  <i class="ph-duotone ph-chart-line"></i>
                  <p>Graphique des prévisions de ventes</p>
                </div>
              </div>
              <div class="prevision-stats">
                <div class="prev-stat"><span class="prev-stat__label">Prévision 30j</span><span class="prev-stat__value">+12%</span></div>
                <div class="prev-stat"><span class="prev-stat__label">Tendance</span><span class="prev-stat__value text-success">Hausse</span></div>
              </div>
            </div>
          </div>

          <!-- Prévision de stock -->
          <div class="card">
            <div class="card__header">
              <h3 class="card__title"><i class="ph ph-package"></i> Prévision de Stock</h3>
            </div>
            <div class="card__body">
              <div class="prevision-chart">
                <div class="chart-placeholder">
                  <i class="ph-duotone ph-chart-bar"></i>
                  <p>Graphique des niveaux de stock prévus</p>
                </div>
              </div>
              <div class="prevision-stats">
                <div class="prev-stat"><span class="prev-stat__label">Ruptures prévues</span><span class="prev-stat__value text-warning">{{ rupturesPrevues() }}</span></div>
                <div class="prev-stat"><span class="prev-stat__label">Alertes</span><span class="prev-stat__value text-error">{{ alertesPrevues() }}</span></div>
              </div>
            </div>
          </div>

          <!-- Top produits à commander -->
          <div class="card full-width">
            <div class="card__header">
              <h3 class="card__title"><i class="ph ph-arrow-circle-down"></i> Produits à Commander</h3>
            </div>
            <div class="card__body">
              @if (produitsACommander().length === 0) {
                <div class="empty-mini"><p>Aucun produit à commander pour le moment</p></div>
              } @else {
                <div class="table-container">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th class="text-right">Stock actuel</th>
                        <th class="text-right">Prévision 30j</th>
                        <th class="text-right">Qté suggérée</th>
                        <th>Urgence</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (prod of produitsACommander(); track prod.id) {
                        <tr>
                          <td><strong>{{ prod.nom }}</strong><br><small class="text-muted">{{ prod.reference }}</small></td>
                          <td class="text-right">{{ prod.stockActuel }}</td>
                          <td class="text-right">{{ prod.prevision30j }}</td>
                          <td class="text-right"><strong class="text-primary">{{ prod.qteSuggere }}</strong></td>
                          <td><span class="badge" [class]="prod.urgence === 'HAUTE' ? 'badge--error' : prod.urgence === 'MOYENNE' ? 'badge--warning' : 'badge--info'">{{ prod.urgence }}</span></td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
    .previsions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-6); }
    .full-width { grid-column: span 2; }
    .prevision-chart { margin-bottom: var(--space-6); }
    .chart-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; background: var(--neutral-50); border-radius: var(--radius-lg); color: var(--neutral-400);
      i { font-size: 3rem; margin-bottom: var(--space-3); }
    }
    .prevision-stats { display: flex; gap: var(--space-6); }
    .prev-stat { display: flex; flex-direction: column; }
    .prev-stat__label { font-size: var(--text-sm); color: var(--neutral-500); }
    .prev-stat__value { font-family: var(--font-display); font-size: var(--text-xl); font-weight: 600; }
    .loading-container { display: flex; flex-direction: column; align-items: center; padding: var(--space-12); gap: var(--space-4); }
    .empty-mini { padding: var(--space-8); text-align: center; color: var(--neutral-500); }
    @media (max-width: 768px) { .previsions-grid { grid-template-columns: 1fr; } .full-width { grid-column: span 1; } }
  `]
})
export class PrevisionsComponent implements OnInit {
  private previsionsService = inject(PrevisionsService);
  private toast = inject(ToastService);

  isLoading = signal(false);
  rupturesPrevues = signal(0);
  alertesPrevues = signal(0);
  produitsACommander = signal<any[]>([]);

  ngOnInit() {
    this.loadPrevisions();
  }

  loadPrevisions() {
    this.isLoading.set(true);
    this.previsionsService.getProduitsACommander().subscribe({
      next: (data: any[]) => {
        this.produitsACommander.set(data || []);
        this.rupturesPrevues.set(data?.filter((p: any) => p.urgence === 'HAUTE').length || 0);
        this.alertesPrevues.set(data?.length || 0);
        this.isLoading.set(false);
      },
      error: () => { this.isLoading.set(false); }
    });
  }

  recalculerPrevisions() {
    this.toast.info('Recalcul en cours', 'Les prévisions sont recalculées...');
    this.loadPrevisions();
  }
}
