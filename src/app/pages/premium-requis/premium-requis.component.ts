/**
 * Page affichée quand une fonctionnalité Premium est requise
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface Feature {
  name: string;
  free: boolean | string;
  premium: boolean | string;
}

@Component({
  selector: 'app-premium-requis',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-warning-400 to-warning-600 mb-6">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Fonctionnalité Premium
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {{ getFeatureMessage() }}
          </p>
        </div>

        <!-- Plans comparison -->
        <div class="grid md:grid-cols-2 gap-8 mb-12">
          <!-- Plan Gratuit -->
          <div class="card p-8 border-2 border-gray-200 dark:border-gray-700">
            <div class="text-center mb-6">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Gratuit</h2>
              <div class="mt-4">
                <span class="text-4xl font-bold text-gray-900 dark:text-white">0€</span>
                <span class="text-gray-500">/mois</span>
              </div>
              <p class="text-sm text-gray-500 mt-2">Pour démarrer</p>
            </div>

            <ul class="space-y-4 mb-8">
              @for (feature of features; track feature.name) {
                <li class="flex items-start gap-3">
                  @if (feature.free === true) {
                    <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-gray-700 dark:text-gray-300">{{ feature.name }}</span>
                  } @else if (feature.free === false) {
                    <svg class="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    <span class="text-gray-400">{{ feature.name }}</span>
                  } @else {
                    <svg class="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-gray-700 dark:text-gray-300">{{ feature.name }} <span class="text-gray-400">({{ feature.free }})</span></span>
                  }
                </li>
              }
            </ul>

            <div class="text-center">
              <span class="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg font-medium">
                Plan actuel
              </span>
            </div>
          </div>

          <!-- Plan Premium -->
          <div class="card p-8 border-2 border-warning-500 relative overflow-hidden">
            <div class="absolute top-0 right-0 bg-warning-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              RECOMMANDÉ
            </div>

            <div class="text-center mb-6">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Premium</h2>
              <div class="mt-4">
                <span class="text-4xl font-bold text-warning-600">29€</span>
                <span class="text-gray-500">/mois</span>
              </div>
              <p class="text-sm text-gray-500 mt-2">Toutes les fonctionnalités</p>
            </div>

            <ul class="space-y-4 mb-8">
              @for (feature of features; track feature.name) {
                <li class="flex items-start gap-3">
                  @if (feature.premium === true) {
                    <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-gray-700 dark:text-gray-300 font-medium">{{ feature.name }}</span>
                  } @else {
                    <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-gray-700 dark:text-gray-300 font-medium">{{ feature.name }} <span class="text-success-600">({{ feature.premium }})</span></span>
                  }
                </li>
              }
            </ul>

            <div class="text-center">
              <a routerLink="/abonnement" class="btn bg-gradient-to-r from-warning-500 to-warning-600 text-white hover:from-warning-600 hover:to-warning-700 w-full justify-center text-lg py-3">
                Passer à Premium
              </a>
            </div>
          </div>
        </div>

        <!-- Features highlights -->
        <div class="card p-8 mb-12">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Ce que Premium vous apporte
          </h3>
          
          <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="w-16 h-16 mx-auto bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Multi-entrepôts</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Gérez plusieurs emplacements de stockage avec transferts automatiques
              </p>
            </div>

            <div class="text-center">
              <div class="w-16 h-16 mx-auto bg-success-100 dark:bg-success-900/30 rounded-xl flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Rapports avancés</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Analyses détaillées, prévisions et tableaux de bord personnalisés
              </p>
            </div>

            <div class="text-center">
              <div class="w-16 h-16 mx-auto bg-warning-100 dark:bg-warning-900/30 rounded-xl flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Export illimité</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Exportez vos données en CSV, Excel ou PDF sans limite
              </p>
            </div>
          </div>
        </div>

        <!-- Back link -->
        <div class="text-center">
          <a routerLink="/" class="text-gray-600 dark:text-gray-400 hover:text-primary-600 inline-flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Retour au tableau de bord
          </a>
        </div>
      </div>
    </div>
  `,
})
export class PremiumRequisComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  requestedFeature = signal<string>('');

  features: Feature[] = [
    { name: 'Gestion des produits', free: true, premium: true },
    { name: 'Gestion des clients', free: true, premium: true },
    { name: 'Gestion des commandes', free: true, premium: true },
    { name: 'Suivi des mouvements', free: true, premium: true },
    { name: 'Produits', free: '100 max', premium: 'Illimité' },
    { name: 'Entrepôts', free: '1', premium: 'Illimité' },
    { name: 'Export données', free: false, premium: true },
    { name: 'Import en masse', free: false, premium: true },
    { name: 'Rapports avancés', free: false, premium: true },
    { name: 'Inventaires physiques', free: false, premium: true },
    { name: 'Génération PDF', free: false, premium: true },
    { name: 'API access', free: false, premium: true },
    { name: 'Support prioritaire', free: false, premium: true },
  ];

  featureMessages: Record<string, string> = {
    'export': 'L\'export des données en Excel, CSV ou PDF est une fonctionnalité Premium.',
    'import': 'L\'import en masse de produits est une fonctionnalité Premium.',
    'multi-entrepots': 'La gestion multi-entrepôts est une fonctionnalité Premium.',
    'rapports': 'Les rapports avancés sont réservés aux utilisateurs Premium.',
    'pdf': 'La génération de documents PDF (factures, bons de livraison) est une fonctionnalité Premium.',
    'inventaire': 'Les inventaires physiques sont une fonctionnalité Premium.',
    'analyses': 'Les analyses avancées et prévisions sont réservées aux utilisateurs Premium.',
    'comparaison': 'La comparaison détaillée des fournisseurs est une fonctionnalité Premium.',
    'documents': 'La génération de documents (factures, bons) est une fonctionnalité Premium.',
    'default': 'Cette fonctionnalité est réservée aux utilisateurs Premium.',
  };

  ngOnInit(): void {
    const feature = this.route.snapshot.queryParams['feature'];
    if (feature) {
      this.requestedFeature.set(feature);
    }
  }

  getFeatureMessage(): string {
    const feature = this.requestedFeature();
    return this.featureMessages[feature] || this.featureMessages['default'];
  }
}
