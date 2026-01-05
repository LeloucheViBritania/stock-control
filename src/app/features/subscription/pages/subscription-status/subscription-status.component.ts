/**
 * Page de statut d'abonnement
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-subscription-status',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      @if (showSuccess()) {
        <div class="card p-8 text-center max-w-lg mx-auto">
          <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-success-400 to-success-600 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Bienvenue dans Premium !</h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">Votre abonnement a été activé avec succès.</p>
          <a routerLink="/dashboard" class="btn-primary mt-6">Découvrir les fonctionnalités</a>
        </div>
      } @else {
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Mon abonnement</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Gérez votre abonnement et vos factures</p>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-3">
          <div class="lg:col-span-2 space-y-6">
            <!-- Plan actuel -->
            <div class="card p-6">
              <div class="flex items-start justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Plan actuel</h2>
                  <div class="flex items-center gap-3 mt-2">
                    <span class="text-2xl font-bold">{{ isPremium() ? 'Premium' : 'Gratuit' }}</span>
                    @if (isPremium()) {
                      <span class="badge-premium">Premium</span>
                    }
                  </div>
                  @if (isPremium()) {
                    <p class="text-sm text-gray-500 mt-1">Renouvellement le 15 février 2025</p>
                  }
                </div>
                @if (!isPremium()) {
                  <a routerLink="/abonnement" class="btn bg-gradient-to-r from-warning-500 to-warning-600 text-white">
                    Passer à Premium
                  </a>
                }
              </div>
            </div>

            @if (isPremium()) {
              <!-- Usage -->
              <div class="card p-6">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Utilisation</h2>
                <div class="space-y-4">
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span>Produits</span>
                      <span>1,250 / Illimité</span>
                    </div>
                    <div class="h-2 bg-gray-200 rounded-full"><div class="h-full bg-primary-500 rounded-full w-1/4"></div></div>
                  </div>
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span>Entrepôts</span>
                      <span>3 / 5</span>
                    </div>
                    <div class="h-2 bg-gray-200 rounded-full"><div class="h-full bg-primary-500 rounded-full w-3/5"></div></div>
                  </div>
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span>Utilisateurs</span>
                      <span>5 / 10</span>
                    </div>
                    <div class="h-2 bg-gray-200 rounded-full"><div class="h-full bg-primary-500 rounded-full w-1/2"></div></div>
                  </div>
                </div>
              </div>

              <!-- Factures -->
              <div class="card p-6">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Historique des factures</h2>
                <div class="space-y-3">
                  @for (facture of factures; track facture.id) {
                    <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p class="font-medium">{{ facture.numero }}</p>
                        <p class="text-sm text-gray-500">{{ facture.date | date:'dd MMMM yyyy' }}</p>
                      </div>
                      <div class="flex items-center gap-4">
                        <span class="font-semibold">{{ facture.montant | number:'1.2-2' }} €</span>
                        <button type="button" class="text-primary-600 hover:underline text-sm">Télécharger</button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <div class="space-y-6">
            <!-- Méthode de paiement -->
            @if (isPremium()) {
              <div class="card p-6">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Méthode de paiement</h2>
                <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div class="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                    <span class="text-white text-xs font-bold">VISA</span>
                  </div>
                  <div>
                    <p class="font-medium">•••• •••• •••• 4242</p>
                    <p class="text-sm text-gray-500">Expire 12/26</p>
                  </div>
                </div>
                <button type="button" class="text-primary-600 hover:underline text-sm mt-3">Modifier</button>
              </div>

              <!-- Actions -->
              <div class="card p-6">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h2>
                <div class="space-y-3">
                  <button type="button" class="btn-secondary w-full">Changer de plan</button>
                  <button type="button" class="text-danger-600 hover:underline text-sm w-full text-center">Annuler l'abonnement</button>
                </div>
              </div>
            }

            <!-- Support -->
            <div class="card p-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Besoin d'aide ?</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Notre équipe est disponible pour vous aider.</p>
              <a href="mailto:support@gestionstock.com" class="btn-secondary w-full">Contacter le support</a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class SubscriptionStatusComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  showSuccess = signal(false);

  factures = [
    { id: '1', numero: 'FAC-2025-001', date: new Date(), montant: 34.80 },
    { id: '2', numero: 'FAC-2024-012', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), montant: 34.80 },
    { id: '3', numero: 'FAC-2024-011', date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), montant: 34.80 },
  ];

  ngOnInit(): void {
    if (this.route.snapshot.queryParams['success'] === 'true') {
      this.showSuccess.set(true);
    }
  }

  isPremium(): boolean {
    return this.authService.isPremium();
  }
}
