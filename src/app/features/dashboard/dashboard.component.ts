import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '@core/services/dashboard.service';
import { AuthService } from '@core/services/auth.service';
import { DashboardStats, AlerteStock, StatutCommande } from '@core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe, CurrencyPipe],
  template: `
    <div class="dashboard">
      <!-- Welcome Header -->
      <div class="dashboard-header">
        <div class="welcome">
          <h1>Bonjour, {{ getUserName() }} 👋</h1>
          <p class="text-muted">Voici un aperçu de votre activité aujourd'hui</p>
        </div>
        <div class="header-actions">
          <button class="btn btn--outline" routerLink="/commandes/new">
            <i class="ph ph-plus"></i>
            Nouvelle commande
          </button>
          <button class="btn btn--primary" routerLink="/produits/new">
            <i class="ph ph-package"></i>
            Ajouter produit
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card animate-slide-up stagger-1">
          <div class="stat-card__header">
            <div class="stat-card__icon stat-card__icon--primary">
              <i class="ph-duotone ph-package"></i>
            </div>
            @if (stats()?.totalProduits) {
              <div class="stat-card__trend stat-card__trend--up">
                <i class="ph ph-trend-up"></i>
                {{ stats()?.produitsActifs }} actifs
              </div>
            }
          </div>
          <div class="stat-card__value">{{ stats()?.totalProduits || 0 }}</div>
          <div class="stat-card__label">Produits</div>
        </div>

        <div class="stat-card animate-slide-up stagger-2">
          <div class="stat-card__header">
            <div class="stat-card__icon stat-card__icon--warning">
              <i class="ph-duotone ph-warning-circle"></i>
            </div>
            @if ((stats()?.stockFaible || 0) > 0) {
              <div class="stat-card__trend stat-card__trend--down">
                <i class="ph ph-arrow-down"></i>
                À surveiller
              </div>
            }
          </div>
          <div class="stat-card__value">{{ stats()?.stockFaible || 0 }}</div>
          <div class="stat-card__label">Stock faible</div>
        </div>

        <div class="stat-card animate-slide-up stagger-3">
          <div class="stat-card__header">
            <div class="stat-card__icon stat-card__icon--success">
              <i class="ph-duotone ph-shopping-cart"></i>
            </div>
          </div>
          <div class="stat-card__value">{{ stats()?.commandesEnCours || 0 }}</div>
          <div class="stat-card__label">Commandes en cours</div>
        </div>

        <div class="stat-card animate-slide-up stagger-4">
          <div class="stat-card__header">
            <div class="stat-card__icon stat-card__icon--primary">
              <i class="ph-duotone ph-wallet"></i>
            </div>
          </div>
          <div class="stat-card__value">{{ stats()?.valeurTotaleStock | currency:'XOF':'symbol':'1.0-0' }}</div>
          <div class="stat-card__label">Valeur du stock</div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="dashboard-grid">
        <!-- Low Stock Alerts -->
        <div class="card animate-slide-up">
          <div class="card__header">
            <h3 class="card__title">
              <i class="ph ph-warning text-warning"></i>
              Alertes stock faible
            </h3>
            <a routerLink="/produits" [queryParams]="{stockFaible: true}" class="btn btn--ghost btn--sm">
              Voir tout
              <i class="ph ph-arrow-right"></i>
            </a>
          </div>
          <div class="card__body">
            @if (isLoading()) {
              <div class="loading-placeholder">
                @for (i of [1,2,3]; track i) {
                  <div class="skeleton-row"></div>
                }
              </div>
            } @else if (alertes().length === 0) {
              <div class="empty-state">
                <i class="ph-duotone ph-check-circle text-success"></i>
                <p>Aucune alerte de stock</p>
              </div>
            } @else {
              <div class="alert-list">
                @for (alerte of alertes().slice(0, 5); track alerte.id) {
                  <div class="alert-item">
                    <div class="alert-item__info">
                      <span class="alert-item__name">{{ alerte.produit.nom }}</span>
                      <span class="alert-item__ref text-muted">{{ alerte.produit.reference }}</span>
                    </div>
                    <div class="alert-item__stock">
                      <span class="badge badge--error">
                        {{ alerte.quantiteActuelle }} / {{ alerte.seuilMinimum }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="card animate-slide-up">
          <div class="card__header">
            <h3 class="card__title">
              <i class="ph ph-clipboard-text"></i>
              Commandes récentes
            </h3>
            <a routerLink="/commandes" class="btn btn--ghost btn--sm">
              Voir tout
              <i class="ph ph-arrow-right"></i>
            </a>
          </div>
          <div class="card__body">
            @if (isLoading()) {
              <div class="loading-placeholder">
                @for (i of [1,2,3]; track i) {
                  <div class="skeleton-row"></div>
                }
              </div>
            } @else if (commandesRecentes().length === 0) {
              <div class="empty-state">
                <i class="ph-duotone ph-clipboard"></i>
                <p>Aucune commande récente</p>
              </div>
            } @else {
              <div class="orders-list">
                @for (commande of commandesRecentes().slice(0, 5); track commande.id) {
                  <div class="order-item" [routerLink]="['/commandes', commande.id]">
                    <div class="order-item__info">
                      <span class="order-item__number">{{ commande.numeroCommande }}</span>
                      <span class="order-item__client text-muted">
                        {{ commande.client?.nom || 'Client anonyme' }}
                      </span>
                    </div>
                    <div class="order-item__meta">
                      <span class="badge" [class]="getStatutClass(commande.statut)">
                        {{ getStatutLabel(commande.statut) }}
                      </span>
                      <span class="order-item__amount">
                        {{ commande.montantTotal | currency:'XOF':'symbol':'1.0-0' }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card animate-slide-up">
          <div class="card__header">
            <h3 class="card__title">
              <i class="ph ph-lightning"></i>
              Actions rapides
            </h3>
          </div>
          <div class="card__body">
            <div class="quick-actions">
              <a routerLink="/produits/new" class="quick-action">
                <div class="quick-action__icon bg-primary-light">
                  <i class="ph ph-plus"></i>
                </div>
                <span>Nouveau produit</span>
              </a>
              <a routerLink="/commandes/new" class="quick-action">
                <div class="quick-action__icon bg-success-light">
                  <i class="ph ph-shopping-cart-simple"></i>
                </div>
                <span>Nouvelle commande</span>
              </a>
              <a routerLink="/clients/new" class="quick-action">
                <div class="quick-action__icon bg-warning-light">
                  <i class="ph ph-user-plus"></i>
                </div>
                <span>Nouveau client</span>
              </a>
              <a routerLink="/mouvements-stock" class="quick-action">
                <div class="quick-action__icon bg-info-light">
                  <i class="ph ph-arrows-left-right"></i>
                </div>
                <span>Mouvements</span>
              </a>
              @if (authService.isPremium()) {
                <a routerLink="/transferts/new" class="quick-action">
                  <div class="quick-action__icon bg-error-light">
                    <i class="ph ph-truck"></i>
                  </div>
                  <span>Transfert stock</span>
                </a>
                <a routerLink="/rapports" class="quick-action">
                  <div class="quick-action__icon bg-neutral-light">
                    <i class="ph ph-chart-line-up"></i>
                  </div>
                  <span>Rapports</span>
                </a>
              }
            </div>
          </div>
        </div>

        <!-- Recent Movements -->
        <div class="card animate-slide-up">
          <div class="card__header">
            <h3 class="card__title">
              <i class="ph ph-arrows-left-right"></i>
              Derniers mouvements
            </h3>
            <a routerLink="/mouvements-stock" class="btn btn--ghost btn--sm">
              Voir tout
              <i class="ph ph-arrow-right"></i>
            </a>
          </div>
          <div class="card__body">
            @if (isLoading()) {
              <div class="loading-placeholder">
                @for (i of [1,2,3]; track i) {
                  <div class="skeleton-row"></div>
                }
              </div>
            } @else if (mouvementsRecents().length === 0) {
              <div class="empty-state">
                <i class="ph-duotone ph-arrows-left-right"></i>
                <p>Aucun mouvement récent</p>
              </div>
            } @else {
              <div class="movements-list">
                @for (mouvement of mouvementsRecents().slice(0, 5); track mouvement.id) {
                  <div class="movement-item">
                    <div class="movement-item__icon" [class]="getMouvementIconClass(mouvement.typeMouvement)">
                      <i class="ph" [class]="getMouvementIcon(mouvement.typeMouvement)"></i>
                    </div>
                    <div class="movement-item__info">
                      <span class="movement-item__product">{{ mouvement.produit?.nom }}</span>
                      <span class="movement-item__type text-muted">{{ mouvement.typeMouvement }}</span>
                    </div>
                    <div class="movement-item__qty" [class]="getMouvementQtyClass(mouvement.typeMouvement)">
                      {{ getMouvementSign(mouvement.typeMouvement) }}{{ mouvement.quantite }}
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Premium Banner (for FREE users) -->
      @if (!authService.isPremium()) {
        <div class="premium-banner animate-slide-up">
          <div class="premium-banner__content">
            <div class="premium-banner__icon">
              <i class="ph-duotone ph-crown"></i>
            </div>
            <div class="premium-banner__text">
              <h3>Passez à Premium</h3>
              <p>Débloquez les entrepôts multiples, les transferts de stock, les rapports avancés et plus encore.</p>
            </div>
          </div>
          <a routerLink="/subscription" class="btn btn--primary">
            <i class="ph ph-sparkle"></i>
            Activer Premium
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard {
      animation: fadeIn 0.3s ease-out;
    }

    .dashboard-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-8);
      gap: var(--space-4);
    }

    .welcome h1 {
      font-size: var(--text-2xl);
      margin-bottom: var(--space-1);
    }

    .header-actions {
      display: flex;
      gap: var(--space-3);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-6);
      margin-bottom: var(--space-8);
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-6);
    }

    .alert-list, .orders-list, .movements-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .alert-item, .order-item, .movement-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3);
      background: var(--neutral-50);
      border-radius: var(--radius-lg);
      transition: all var(--transition-fast);

      &:hover {
        background: var(--neutral-100);
      }
    }

    .alert-item__info, .order-item__info {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .alert-item__name, .order-item__number {
      font-weight: 500;
      color: var(--neutral-900);
    }

    .alert-item__ref, .order-item__client {
      font-size: var(--text-sm);
    }

    .order-item {
      cursor: pointer;
    }

    .order-item__meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--space-1);
    }

    .order-item__amount {
      font-weight: 500;
      font-family: var(--font-mono);
    }

    .movement-item {
      gap: var(--space-3);
    }

    .movement-item__icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.bg-success {
        background: var(--success-100);
        color: var(--success-600);
      }

      &.bg-error {
        background: var(--error-100);
        color: var(--error-600);
      }

      &.bg-warning {
        background: var(--warning-100);
        color: var(--warning-600);
      }

      &.bg-info {
        background: var(--info-100);
        color: var(--info-600);
      }
    }

    .movement-item__info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .movement-item__product {
      font-weight: 500;
      color: var(--neutral-800);
    }

    .movement-item__type {
      font-size: var(--text-xs);
      text-transform: uppercase;
    }

    .movement-item__qty {
      font-weight: 600;
      font-family: var(--font-mono);

      &.text-success {
        color: var(--success-600);
      }

      &.text-error {
        color: var(--error-600);
      }
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-3);
    }

    .quick-action {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-4);
      background: var(--neutral-50);
      border-radius: var(--radius-lg);
      text-decoration: none;
      color: var(--neutral-700);
      transition: all var(--transition-fast);

      &:hover {
        background: var(--neutral-100);
        transform: translateY(-2px);
      }

      span {
        font-size: var(--text-sm);
        font-weight: 500;
        text-align: center;
      }
    }

    .quick-action__icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;

      &.bg-primary-light {
        background: var(--primary-100);
        color: var(--primary-600);
      }

      &.bg-success-light {
        background: var(--success-100);
        color: var(--success-600);
      }

      &.bg-warning-light {
        background: var(--warning-100);
        color: var(--warning-600);
      }

      &.bg-info-light {
        background: var(--info-100);
        color: var(--info-600);
      }

      &.bg-error-light {
        background: var(--error-100);
        color: var(--error-600);
      }

      &.bg-neutral-light {
        background: var(--neutral-200);
        color: var(--neutral-600);
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-8);
      color: var(--neutral-400);

      i {
        font-size: 2.5rem;
        margin-bottom: var(--space-3);
      }

      p {
        margin: 0;
        color: var(--neutral-500);
      }
    }

    .loading-placeholder {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .skeleton-row {
      height: 48px;
      background: linear-gradient(90deg, var(--neutral-100) 25%, var(--neutral-200) 50%, var(--neutral-100) 75%);
      background-size: 200% 100%;
      border-radius: var(--radius-lg);
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .premium-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-6);
      background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
      border-radius: var(--radius-xl);
      margin-top: var(--space-8);
      color: white;
    }

    .premium-banner__content {
      display: flex;
      align-items: center;
      gap: var(--space-5);
    }

    .premium-banner__icon {
      width: 56px;
      height: 56px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 1.75rem;
        color: var(--secondary-400);
      }
    }

    .premium-banner__text {
      h3 {
        color: white;
        margin-bottom: var(--space-1);
      }

      p {
        color: rgba(255, 255, 255, 0.8);
        margin: 0;
        max-width: 500px;
      }
    }

    .premium-banner .btn {
      background: white;
      color: var(--primary-600);
      flex-shrink: 0;

      &:hover {
        background: var(--neutral-100);
      }
    }

    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-actions {
        width: 100%;
        
        .btn {
          flex: 1;
        }
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions {
        grid-template-columns: repeat(2, 1fr);
      }

      .premium-banner {
        flex-direction: column;
        text-align: center;
        gap: var(--space-5);
      }

      .premium-banner__content {
        flex-direction: column;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  protected authService = inject(AuthService);

  stats = signal<DashboardStats | null>(null);
  alertes = signal<AlerteStock[]>([]);
  commandesRecentes = signal<any[]>([]);
  mouvementsRecents = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading.set(true);

    // Load stats
    this.dashboardService.getStatistiques().subscribe({
      next: (stats) => this.stats.set(stats),
      error: () => console.error('Failed to load stats')
    });

    // Load alerts
    this.dashboardService.getAlertesStock().subscribe({
      next: (alertes) => this.alertes.set(alertes),
      error: () => console.error('Failed to load alerts')
    });

    // Load recent orders
    this.dashboardService.getCommandesRecentes(5).subscribe({
      next: (commandes) => this.commandesRecentes.set(commandes),
      error: () => console.error('Failed to load orders')
    });

    // Load recent movements
    this.dashboardService.getMouvementsRecents(5).subscribe({
      next: (mouvements) => {
        this.mouvementsRecents.set(mouvements);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  getUserName(): string {
    const user = this.authService.currentUser();
    return user?.nomComplet || user?.nomUtilisateur || 'Utilisateur';
  }

  getStatutClass(statut: StatutCommande): string {
    switch (statut) {
      case StatutCommande.EN_ATTENTE: return 'badge--warning';
      case StatutCommande.EN_TRAITEMENT: return 'badge--info';
      case StatutCommande.EXPEDIE: return 'badge--primary';
      case StatutCommande.LIVRE: return 'badge--success';
      case StatutCommande.ANNULE: return 'badge--error';
      default: return 'badge--secondary';
    }
  }

  getStatutLabel(statut: StatutCommande): string {
    switch (statut) {
      case StatutCommande.EN_ATTENTE: return 'En attente';
      case StatutCommande.EN_TRAITEMENT: return 'En traitement';
      case StatutCommande.EXPEDIE: return 'Expédié';
      case StatutCommande.LIVRE: return 'Livré';
      case StatutCommande.ANNULE: return 'Annulé';
      default: return statut;
    }
  }

  getMouvementIcon(type: string): string {
    switch (type) {
      case 'ENTREE': return 'ph-arrow-down';
      case 'SORTIE': return 'ph-arrow-up';
      case 'TRANSFERT': return 'ph-arrows-left-right';
      case 'AJUSTEMENT': return 'ph-sliders';
      case 'RETOUR': return 'ph-arrow-u-up-left';
      default: return 'ph-arrows-left-right';
    }
  }

  getMouvementIconClass(type: string): string {
    switch (type) {
      case 'ENTREE': return 'bg-success';
      case 'SORTIE': return 'bg-error';
      case 'TRANSFERT': return 'bg-info';
      case 'AJUSTEMENT': return 'bg-warning';
      case 'RETOUR': return 'bg-info';
      default: return 'bg-info';
    }
  }

  getMouvementQtyClass(type: string): string {
    return type === 'ENTREE' || type === 'RETOUR' ? 'text-success' : 'text-error';
  }

  getMouvementSign(type: string): string {
    return type === 'ENTREE' || type === 'RETOUR' ? '+' : '-';
  }
}
