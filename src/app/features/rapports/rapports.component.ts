import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RapportsService } from '@core/services/rapports.service';
import { ToastService } from '@core/services/notifications.service';

@Component({
  selector: 'app-rapports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rapports-page">
      <div class="page-header">
        <div>
          <h1>Rapports</h1>
          <p class="text-muted">Générez et exportez vos rapports d'activité</p>
        </div>
      </div>

      <div class="rapports-grid">
        <!-- Rapport Ventes -->
        <div class="rapport-card card" (click)="genererRapport('ventes')">
          <div class="rapport-card__icon bg-success-light"><i class="ph-duotone ph-chart-line-up"></i></div>
          <div class="rapport-card__content">
            <h3>Rapport des Ventes</h3>
            <p>Analyse des ventes par période, produit, client</p>
          </div>
          <i class="ph ph-arrow-right"></i>
        </div>

        <!-- Rapport Stock -->
        <div class="rapport-card card" (click)="genererRapport('stock')">
          <div class="rapport-card__icon bg-primary-light"><i class="ph-duotone ph-package"></i></div>
          <div class="rapport-card__content">
            <h3>Rapport de Stock</h3>
            <p>État des stocks, valorisation, mouvements</p>
          </div>
          <i class="ph ph-arrow-right"></i>
        </div>

        <!-- Rapport Clients -->
        <div class="rapport-card card" (click)="genererRapport('clients')">
          <div class="rapport-card__icon bg-info-light"><i class="ph-duotone ph-users"></i></div>
          <div class="rapport-card__content">
            <h3>Rapport Clients</h3>
            <p>Top clients, encours, historique d'achats</p>
          </div>
          <i class="ph ph-arrow-right"></i>
        </div>

        <!-- Rapport Fournisseurs -->
        <div class="rapport-card card" (click)="genererRapport('fournisseurs')">
          <div class="rapport-card__icon bg-warning-light"><i class="ph-duotone ph-truck"></i></div>
          <div class="rapport-card__content">
            <h3>Rapport Fournisseurs</h3>
            <p>Performance fournisseurs, achats, délais</p>
          </div>
          <i class="ph ph-arrow-right"></i>
        </div>

        <!-- Rapport Inventaire -->
        <div class="rapport-card card" (click)="genererRapport('inventaire')">
          <div class="rapport-card__icon bg-error-light"><i class="ph-duotone ph-clipboard-text"></i></div>
          <div class="rapport-card__content">
            <h3>Rapport d'Inventaire</h3>
            <p>Inventaire par entrepôt, écarts, ajustements</p>
          </div>
          <i class="ph ph-arrow-right"></i>
        </div>

        <!-- Rapport Financier -->
        <div class="rapport-card card" (click)="genererRapport('financier')">
          <div class="rapport-card__icon bg-neutral-light"><i class="ph-duotone ph-currency-circle-dollar"></i></div>
          <div class="rapport-card__content">
            <h3>Rapport Financier</h3>
            <p>Chiffre d'affaires, marges, rentabilité</p>
          </div>
          <i class="ph ph-arrow-right"></i>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="card mt-8">
        <div class="card__header">
          <h3 class="card__title"><i class="ph ph-chart-bar"></i> Aperçu rapide</h3>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">CA du mois</span>
            <span class="stat-value">{{ caMonth() | number:'1.0-0' }} XOF</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Commandes</span>
            <span class="stat-value">{{ commandesMonth() }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Valeur stock</span>
            <span class="stat-value">{{ stockValue() | number:'1.0-0' }} XOF</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Produits en alerte</span>
            <span class="stat-value text-warning">{{ alertesProduits() }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: var(--space-6); }
    .rapports-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: var(--space-6); }
    .rapport-card { display: flex; align-items: center; gap: var(--space-5); cursor: pointer; transition: all var(--transition-fast);
      &:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); border-color: var(--primary-300); }
    }
    .rapport-card__icon { width: 56px; height: 56px; border-radius: var(--radius-xl); display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      i { font-size: 1.75rem; }
    }
    .bg-success-light { background: var(--success-100); color: var(--success-600); }
    .bg-primary-light { background: var(--primary-100); color: var(--primary-600); }
    .bg-info-light { background: var(--info-100); color: var(--info-600); }
    .bg-warning-light { background: var(--warning-100); color: var(--warning-600); }
    .bg-error-light { background: var(--error-100); color: var(--error-600); }
    .bg-neutral-light { background: var(--neutral-200); color: var(--neutral-600); }
    .rapport-card__content { flex: 1;
      h3 { margin-bottom: var(--space-1); font-size: var(--text-base); }
      p { margin: 0; font-size: var(--text-sm); color: var(--neutral-500); }
    }
    .rapport-card > i { color: var(--neutral-400); }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-6); }
    .stat-item { display: flex; flex-direction: column; text-align: center; }
    .stat-label { font-size: var(--text-sm); color: var(--neutral-500); margin-bottom: var(--space-1); }
    .stat-value { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 600; }
    @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
  `]
})
export class RapportsComponent {
  private rapportsService = inject(RapportsService);
  private toast = inject(ToastService);

  caMonth = signal(0);
  commandesMonth = signal(0);
  stockValue = signal(0);
  alertesProduits = signal(0);

  genererRapport(type: string) {
    this.toast.info('Génération en cours', `Le rapport ${type} est en cours de création...`);
    
    this.rapportsService.generer(type as any, { format: 'pdf' }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport_${type}_${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toast.success('Rapport généré', 'Le téléchargement a démarré');
      },
      error: () => this.toast.error('Erreur', 'Impossible de générer le rapport')
    });
  }
}
