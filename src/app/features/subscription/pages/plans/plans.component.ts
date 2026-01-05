/**
 * Page de sélection des plans d'abonnement
 */
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@services/auth.service';

interface PlanFeature {
  name: string;
  free: boolean | string;
  premium: boolean | string;
  enterprise: boolean | string;
}

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Choisissez votre plan</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Commencez gratuitement, évoluez selon vos besoins</p>
        
        <!-- Toggle Mensuel/Annuel -->
        <div class="mt-6 inline-flex items-center gap-3 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button 
            type="button"
            class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            [class.bg-white]="!annuel()"
            [class.shadow]="!annuel()"
            [class.text-gray-900]="!annuel()"
            [class.text-gray-500]="annuel()"
            (click)="annuel.set(false)"
          >
            Mensuel
          </button>
          <button 
            type="button"
            class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            [class.bg-white]="annuel()"
            [class.shadow]="annuel()"
            [class.text-gray-900]="annuel()"
            [class.text-gray-500]="!annuel()"
            (click)="annuel.set(true)"
          >
            Annuel <span class="text-success-600 text-xs ml-1">-20%</span>
          </button>
        </div>
      </div>
      
      <!-- Plans -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <!-- Free Plan -->
        <div class="card p-6 flex flex-col">
          <div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Gratuit</h3>
            <p class="text-sm text-gray-500 mt-1">Pour démarrer</p>
          </div>
          <div class="mt-4">
            <p class="text-4xl font-bold text-gray-900 dark:text-white">0 €</p>
            <p class="text-sm text-gray-500">pour toujours</p>
          </div>
          <ul class="mt-6 space-y-3 flex-1">
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>100 produits max</span>
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>1 entrepôt</span>
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>Gestion des commandes</span>
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>Clients & Fournisseurs</span>
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>Dashboard basique</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-400">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              <span>Multi-entrepôts</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-400">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              <span>Rapports avancés</span>
            </li>
          </ul>
          <button 
            type="button" 
            class="btn-secondary w-full mt-6"
            [disabled]="!isPremium()"
          >
            {{ isPremium() ? 'Rétrograder' : 'Plan actuel' }}
          </button>
        </div>
        
        <!-- Premium Plan -->
        <div class="card p-6 flex flex-col border-2 border-warning-500 relative shadow-lg">
          <span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-warning-500 to-warning-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            POPULAIRE
          </span>
          <div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Premium</h3>
            <p class="text-sm text-gray-500 mt-1">Pour les PME</p>
          </div>
          <div class="mt-4">
            <p class="text-4xl font-bold text-gray-900 dark:text-white">
              {{ annuel() ? '23' : '29' }} €
              <span class="text-lg font-normal text-gray-500">/mois</span>
            </p>
            <p class="text-sm text-gray-500">{{ annuel() ? 'facturé annuellement (276 €/an)' : 'facturé mensuellement' }}</p>
          </div>
          <ul class="mt-6 space-y-3 flex-1">
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span><strong>Produits illimités</strong></span>
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span><strong>5 entrepôts</strong></span>
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>Transferts de stock</span>
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>Inventaire physique</span>
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>Rapports & exports</span>
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>Prévisions IA</span>
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>Journal d'audit</span>
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>Support prioritaire</span>
            </li>
          </ul>
          @if (isPremium()) {
            <button type="button" class="btn-secondary w-full mt-6" disabled>
              Plan actuel
            </button>
          } @else {
            <a 
              [routerLink]="['checkout']" 
              [queryParams]="{plan: 'premium', billing: annuel() ? 'annual' : 'monthly'}"
              class="btn bg-gradient-to-r from-warning-500 to-warning-600 text-white w-full mt-6 text-center hover:from-warning-600 hover:to-warning-700"
            >
              Passer à Premium
            </a>
          }
        </div>
        
        <!-- Enterprise Plan -->
        <div class="card p-6 flex flex-col bg-gray-900 text-white">
          <div>
            <h3 class="text-xl font-bold">Enterprise</h3>
            <p class="text-sm text-gray-400 mt-1">Pour les grandes entreprises</p>
          </div>
          <div class="mt-4">
            <p class="text-4xl font-bold">Sur mesure</p>
            <p class="text-sm text-gray-400">contactez-nous</p>
          </div>
          <ul class="mt-6 space-y-3 flex-1">
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-warning-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>Tout Premium +</span>
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-warning-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span><strong>Entrepôts illimités</strong></span>
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-warning-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>API dédiée</span>
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-warning-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>SSO / SAML</span>
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-warning-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>Account Manager dédié</span>
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-warning-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>SLA garanti 99.9%</span>
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-warning-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>Formation sur site</span>
            </li>
            <li class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-warning-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>Personnalisation</span>
            </li>
          </ul>
          <a 
            href="mailto:enterprise@gestionstock.com" 
            class="btn border border-white text-white hover:bg-white hover:text-gray-900 w-full mt-6 text-center"
          >
            Nous contacter
          </a>
        </div>
      </div>

      <!-- Tableau comparatif -->
      <div class="max-w-6xl mx-auto mt-12">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">Comparaison détaillée</h2>
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="text-left px-6 py-4 font-semibold">Fonctionnalité</th>
                  <th class="text-center px-6 py-4 font-semibold">Gratuit</th>
                  <th class="text-center px-6 py-4 font-semibold text-warning-600">Premium</th>
                  <th class="text-center px-6 py-4 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                @for (feature of features; track feature.name) {
                  <tr>
                    <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ feature.name }}</td>
                    <td class="px-6 py-4 text-center">
                      @if (feature.free === true) {
                        <svg class="w-5 h-5 text-success-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      } @else if (feature.free === false) {
                        <svg class="w-5 h-5 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      } @else {
                        <span class="text-sm text-gray-600">{{ feature.free }}</span>
                      }
                    </td>
                    <td class="px-6 py-4 text-center bg-warning-50/50">
                      @if (feature.premium === true) {
                        <svg class="w-5 h-5 text-success-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      } @else if (feature.premium === false) {
                        <svg class="w-5 h-5 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      } @else {
                        <span class="text-sm font-medium text-warning-600">{{ feature.premium }}</span>
                      }
                    </td>
                    <td class="px-6 py-4 text-center">
                      @if (feature.enterprise === true) {
                        <svg class="w-5 h-5 text-success-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      } @else {
                        <span class="text-sm text-gray-600">{{ feature.enterprise }}</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- FAQ -->
      <div class="max-w-3xl mx-auto mt-12">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">Questions fréquentes</h2>
        <div class="space-y-4">
          @for (faq of faqs; track faq.question) {
            <div class="card p-4">
              <button 
                type="button" 
                class="flex items-center justify-between w-full text-left"
                (click)="faq.open = !faq.open"
              >
                <span class="font-medium text-gray-900 dark:text-white">{{ faq.question }}</span>
                <svg class="w-5 h-5 transition-transform" [class.rotate-180]="faq.open" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              @if (faq.open) {
                <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">{{ faq.answer }}</p>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class PlansComponent {
  private readonly authService = inject(AuthService);

  annuel = signal(false);

  isPremium(): boolean {
    return this.authService.isPremium();
  }

  features: PlanFeature[] = [
    { name: 'Produits', free: '100 max', premium: 'Illimité', enterprise: 'Illimité' },
    { name: 'Entrepôts', free: '1', premium: '5', enterprise: 'Illimité' },
    { name: 'Utilisateurs', free: '2', premium: '10', enterprise: 'Illimité' },
    { name: 'Gestion des commandes', free: true, premium: true, enterprise: true },
    { name: 'Clients & Fournisseurs', free: true, premium: true, enterprise: true },
    { name: 'Mouvements de stock', free: true, premium: true, enterprise: true },
    { name: 'Dashboard', free: 'Basique', premium: 'Avancé', enterprise: 'Personnalisé' },
    { name: 'Multi-entrepôts', free: false, premium: true, enterprise: true },
    { name: 'Transferts de stock', free: false, premium: true, enterprise: true },
    { name: 'Inventaire physique', free: false, premium: true, enterprise: true },
    { name: 'Rapports avancés', free: false, premium: true, enterprise: true },
    { name: 'Exports (Excel, PDF)', free: false, premium: true, enterprise: true },
    { name: 'Prévisions IA', free: false, premium: true, enterprise: true },
    { name: 'Journal d\'audit', free: false, premium: true, enterprise: true },
    { name: 'API', free: false, premium: 'Limitée', enterprise: 'Complète' },
    { name: 'Support', free: 'Email', premium: 'Prioritaire', enterprise: 'Dédié 24/7' },
  ];

  faqs = [
    { question: 'Puis-je changer de plan à tout moment ?', answer: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Le changement prend effet immédiatement et la facturation est ajustée au prorata.', open: false },
    { question: 'Y a-t-il un engagement ?', answer: 'Non, tous nos plans sont sans engagement. Vous pouvez annuler à tout moment. Pour le plan annuel, vous bénéficiez du tarif réduit jusqu\'à la fin de la période.', open: false },
    { question: 'Comment fonctionne l\'essai gratuit Premium ?', answer: 'Vous bénéficiez de 14 jours d\'essai gratuit de toutes les fonctionnalités Premium. Aucune carte bancaire n\'est requise pour l\'essai.', open: false },
    { question: 'Mes données sont-elles sécurisées ?', answer: 'Absolument. Nous utilisons un chiffrement AES-256 pour toutes les données, avec des sauvegardes quotidiennes et un hébergement certifié ISO 27001.', open: false },
    { question: 'Puis-je exporter mes données ?', answer: 'Oui, vous pouvez exporter toutes vos données à tout moment au format Excel ou CSV, quel que soit votre plan.', open: false },
  ];
}
