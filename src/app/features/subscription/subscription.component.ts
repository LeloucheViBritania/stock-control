import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/notifications.service';
import { TierAbonnement } from '@core/models';
import { environment } from '@env/environment';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="subscription-page">
      <div class="page-header">
        <h1>Gestion de l'abonnement</h1>
        <p class="text-muted">Activez ou désactivez les fonctionnalités Premium</p>
      </div>

      <div class="subscription-grid">
        <!-- Current Status Card -->
        <div class="status-card" [class.status-card--premium]="isPremium()">
          <div class="status-card__icon">
            @if (isPremium()) {
              <i class="ph-duotone ph-crown"></i>
            } @else {
              <i class="ph-duotone ph-user"></i>
            }
          </div>
          <div class="status-card__content">
            <h2>{{ isPremium() ? 'Premium Actif' : 'Version Gratuite' }}</h2>
            <p>
              @if (isPremium()) {
                Vous avez accès à toutes les fonctionnalités avancées
              } @else {
                Activez Premium pour débloquer toutes les fonctionnalités
              }
            </p>
          </div>
          
          <!-- Toggle Switch -->
          <div class="toggle-container">
            <label class="toggle">
              <input 
                type="checkbox" 
                [checked]="isPremium()"
                (change)="togglePremium()"
                [disabled]="isLoading()"
              />
              <span class="toggle__slider"></span>
            </label>
            <span class="toggle-label">
              {{ isPremium() ? 'Premium activé' : 'Premium désactivé' }}
            </span>
          </div>
        </div>

        <!-- Features Comparison -->
        <div class="card features-card">
          <div class="card__header">
            <h3 class="card__title">
              <i class="ph ph-list-checks"></i>
              Fonctionnalités
            </h3>
          </div>
          <div class="features-list">
            <!-- FREE Features -->
            <div class="feature-section">
              <h4 class="feature-section__title">
                <span class="badge badge--secondary">Gratuit</span>
                Toujours inclus
              </h4>
              <ul class="feature-items">
                <li class="feature-item feature-item--included">
                  <i class="ph ph-check-circle"></i>
                  <span>Gestion des produits</span>
                </li>
                <li class="feature-item feature-item--included">
                  <i class="ph ph-check-circle"></i>
                  <span>Gestion des catégories</span>
                </li>
                <li class="feature-item feature-item--included">
                  <i class="ph ph-check-circle"></i>
                  <span>Gestion des clients</span>
                </li>
                <li class="feature-item feature-item--included">
                  <i class="ph ph-check-circle"></i>
                  <span>Gestion des fournisseurs</span>
                </li>
                <li class="feature-item feature-item--included">
                  <i class="ph ph-check-circle"></i>
                  <span>Commandes de base</span>
                </li>
                <li class="feature-item feature-item--included">
                  <i class="ph ph-check-circle"></i>
                  <span>Suivi des mouvements de stock</span>
                </li>
                <li class="feature-item feature-item--included">
                  <i class="ph ph-check-circle"></i>
                  <span>Tableau de bord</span>
                </li>
              </ul>
            </div>

            <!-- PREMIUM Features -->
            <div class="feature-section">
              <h4 class="feature-section__title">
                <span class="badge badge--primary">
                  <i class="ph ph-crown"></i>
                  Premium
                </span>
                Fonctionnalités avancées
              </h4>
              <ul class="feature-items">
                <li class="feature-item" [class.feature-item--included]="isPremium()" [class.feature-item--locked]="!isPremium()">
                  <i class="ph" [class.ph-check-circle]="isPremium()" [class.ph-lock]="!isPremium()"></i>
                  <span>Multi-entrepôts</span>
                </li>
                <li class="feature-item" [class.feature-item--included]="isPremium()" [class.feature-item--locked]="!isPremium()">
                  <i class="ph" [class.ph-check-circle]="isPremium()" [class.ph-lock]="!isPremium()"></i>
                  <span>Inventaire par entrepôt</span>
                </li>
                <li class="feature-item" [class.feature-item--included]="isPremium()" [class.feature-item--locked]="!isPremium()">
                  <i class="ph" [class.ph-check-circle]="isPremium()" [class.ph-lock]="!isPremium()"></i>
                  <span>Inventaire physique (comptage)</span>
                </li>
                <li class="feature-item" [class.feature-item--included]="isPremium()" [class.feature-item--locked]="!isPremium()">
                  <i class="ph" [class.ph-check-circle]="isPremium()" [class.ph-lock]="!isPremium()"></i>
                  <span>Transferts inter-entrepôts</span>
                </li>
                <li class="feature-item" [class.feature-item--included]="isPremium()" [class.feature-item--locked]="!isPremium()">
                  <i class="ph" [class.ph-check-circle]="isPremium()" [class.ph-lock]="!isPremium()"></i>
                  <span>Bons de commande achat</span>
                </li>
                <li class="feature-item" [class.feature-item--included]="isPremium()" [class.feature-item--locked]="!isPremium()">
                  <i class="ph" [class.ph-check-circle]="isPremium()" [class.ph-lock]="!isPremium()"></i>
                  <span>Ajustements de stock avancés</span>
                </li>
                <li class="feature-item" [class.feature-item--included]="isPremium()" [class.feature-item--locked]="!isPremium()">
                  <i class="ph" [class.ph-check-circle]="isPremium()" [class.ph-lock]="!isPremium()"></i>
                  <span>Prévisions et analyse</span>
                </li>
                <li class="feature-item" [class.feature-item--included]="isPremium()" [class.feature-item--locked]="!isPremium()">
                  <i class="ph" [class.ph-check-circle]="isPremium()" [class.ph-lock]="!isPremium()"></i>
                  <span>Suggestions de réapprovisionnement</span>
                </li>
                <li class="feature-item" [class.feature-item--included]="isPremium()" [class.feature-item--locked]="!isPremium()">
                  <i class="ph" [class.ph-check-circle]="isPremium()" [class.ph-lock]="!isPremium()"></i>
                  <span>Rapports avancés (PDF, Excel)</span>
                </li>
                <li class="feature-item" [class.feature-item--included]="isPremium()" [class.feature-item--locked]="!isPremium()">
                  <i class="ph" [class.ph-check-circle]="isPremium()" [class.ph-lock]="!isPremium()"></i>
                  <span>Journal d'audit complet</span>
                </li>
                <li class="feature-item" [class.feature-item--included]="isPremium()" [class.feature-item--locked]="!isPremium()">
                  <i class="ph" [class.ph-check-circle]="isPremium()" [class.ph-lock]="!isPremium()"></i>
                  <span>Notifications temps réel</span>
                </li>
                <li class="feature-item" [class.feature-item--included]="isPremium()" [class.feature-item--locked]="!isPremium()">
                  <i class="ph" [class.ph-check-circle]="isPremium()" [class.ph-lock]="!isPremium()"></i>
                  <span>Gestion clients avancée (blocage, notes)</span>
                </li>
                <li class="feature-item" [class.feature-item--included]="isPremium()" [class.feature-item--locked]="!isPremium()">
                  <i class="ph" [class.ph-check-circle]="isPremium()" [class.ph-lock]="!isPremium()"></i>
                  <span>Évaluations fournisseurs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Action Card -->
        <div class="card action-card">
          <div class="action-card__content">
            <h3>
              @if (isPremium()) {
                <i class="ph ph-check-circle text-success"></i>
                Premium est actif
              } @else {
                <i class="ph ph-sparkle text-warning"></i>
                Activez Premium maintenant
              }
            </h3>
            <p>
              @if (isPremium()) {
                Vous pouvez désactiver Premium à tout moment. Les données des fonctionnalités Premium seront conservées.
              } @else {
                Débloquez toutes les fonctionnalités avancées en activant Premium. Aucun engagement, désactivez quand vous voulez.
              }
            </p>
          </div>
          <button 
            class="btn btn--lg"
            [class.btn--primary]="!isPremium()"
            [class.btn--secondary]="isPremium()"
            (click)="togglePremium()"
            [disabled]="isLoading()"
          >
            @if (isLoading()) {
              <span class="spinner"></span>
              Chargement...
            } @else if (isPremium()) {
              <i class="ph ph-power"></i>
              Désactiver Premium
            } @else {
              <i class="ph ph-crown"></i>
              Activer Premium
            }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subscription-page {
      max-width: 900px;
    }

    .page-header {
      margin-bottom: var(--space-8);
    }

    .subscription-grid {
      display: grid;
      gap: var(--space-6);
    }

    .status-card {
      display: flex;
      align-items: center;
      gap: var(--space-6);
      padding: var(--space-8);
      background: linear-gradient(135deg, var(--neutral-100) 0%, var(--neutral-200) 100%);
      border-radius: var(--radius-2xl);
      border: 2px solid var(--neutral-300);

      &--premium {
        background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%);
        border-color: var(--primary-600);
        color: white;

        .status-card__icon {
          background: rgba(255, 255, 255, 0.2);
          color: var(--secondary-400);
        }

        p {
          color: rgba(255, 255, 255, 0.8);
        }

        .toggle-label {
          color: rgba(255, 255, 255, 0.9);
        }
      }
    }

    .status-card__icon {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-xl);
      background: var(--neutral-0);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      i {
        font-size: 2.5rem;
        color: var(--primary-500);
      }
    }

    .status-card__content {
      flex: 1;

      h2 {
        font-size: var(--text-2xl);
        margin-bottom: var(--space-2);
      }

      p {
        margin: 0;
        color: var(--neutral-600);
      }
    }

    .toggle-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
    }

    .toggle {
      position: relative;
      display: inline-block;
      width: 64px;
      height: 34px;

      input {
        opacity: 0;
        width: 0;
        height: 0;

        &:checked + .toggle__slider {
          background: var(--success-500);
        }

        &:checked + .toggle__slider::before {
          transform: translateX(30px);
        }

        &:disabled + .toggle__slider {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }

    .toggle__slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background: var(--neutral-400);
      border-radius: 34px;
      transition: all var(--transition-base);

      &::before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background: white;
        border-radius: 50%;
        transition: all var(--transition-base);
        box-shadow: var(--shadow-md);
      }
    }

    .toggle-label {
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--neutral-700);
    }

    .features-card {
      .card__body {
        padding: 0;
      }
    }

    .features-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
    }

    .feature-section {
      padding: var(--space-6);

      &:first-child {
        border-right: 1px solid var(--neutral-200);
      }
    }

    .feature-section__title {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: var(--text-base);
      font-weight: 600;
      margin-bottom: var(--space-5);
      color: var(--neutral-700);
    }

    .feature-items {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: var(--text-sm);

      i {
        font-size: 1.25rem;
        flex-shrink: 0;
      }

      &--included {
        color: var(--neutral-800);

        i {
          color: var(--success-500);
        }
      }

      &--locked {
        color: var(--neutral-400);

        i {
          color: var(--neutral-300);
        }
      }
    }

    .action-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-6);
    }

    .action-card__content {
      h3 {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--text-lg);
        margin-bottom: var(--space-2);
      }

      p {
        margin: 0;
        color: var(--neutral-600);
        max-width: 500px;
      }
    }

    @media (max-width: 768px) {
      .status-card {
        flex-direction: column;
        text-align: center;
      }

      .features-list {
        grid-template-columns: 1fr;
      }

      .feature-section:first-child {
        border-right: none;
        border-bottom: 1px solid var(--neutral-200);
      }

      .action-card {
        flex-direction: column;
        text-align: center;

        .action-card__content p {
          max-width: 100%;
        }
      }
    }
  `]
})
export class SubscriptionComponent {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  isLoading = signal(false);

  isPremium(): boolean {
    return this.authService.currentUser()?.tierAbonnement === TierAbonnement.PREMIUM;
  }

  togglePremium(): void {
    this.isLoading.set(true);
    const newTier = this.isPremium() ? TierAbonnement.GRATUIT : TierAbonnement.PREMIUM;

    // Appel API pour changer le tier
    this.http.patch(`${environment.apiUrl}/utilisateurs/tier`, { 
      tierAbonnement: newTier 
    }).subscribe({
      next: () => {
        // Rafraîchir le profil utilisateur
        this.authService.getProfile().subscribe({
          next: () => {
            this.isLoading.set(false);
            if (newTier === TierAbonnement.PREMIUM) {
              this.toast.success('Premium activé !', 'Vous avez maintenant accès à toutes les fonctionnalités');
            } else {
              this.toast.info('Premium désactivé', 'Vous êtes revenu à la version gratuite');
            }
          },
          error: () => {
            this.isLoading.set(false);
            // Forcer le reload pour mettre à jour le user
            window.location.reload();
          }
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toast.error('Erreur', err.error?.message || 'Impossible de modifier l\'abonnement');
      }
    });
  }
}
