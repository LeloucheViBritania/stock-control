/**
 * Page d'abonnement avec choix des plans
 */
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  savings?: string;
}

@Component({
  selector: 'app-abonnement',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <a routerLink="/" class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-6">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Retour
          </a>
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choisissez votre plan
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Débloquez toutes les fonctionnalités pour gérer votre stock comme un pro
          </p>

          <!-- Toggle mensuel/annuel -->
          <div class="mt-8 inline-flex items-center gap-4 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
            <button 
              type="button"
              (click)="billingPeriod.set('monthly')"
              class="px-6 py-2 rounded-full text-sm font-medium transition-colors"
              [class.bg-white]="billingPeriod() === 'monthly'"
              [class.shadow-sm]="billingPeriod() === 'monthly'"
              [class.text-gray-900]="billingPeriod() === 'monthly'"
              [class.text-gray-600]="billingPeriod() !== 'monthly'"
            >
              Mensuel
            </button>
            <button 
              type="button"
              (click)="billingPeriod.set('yearly')"
              class="px-6 py-2 rounded-full text-sm font-medium transition-colors"
              [class.bg-white]="billingPeriod() === 'yearly'"
              [class.shadow-sm]="billingPeriod() === 'yearly'"
              [class.text-gray-900]="billingPeriod() === 'yearly'"
              [class.text-gray-600]="billingPeriod() !== 'yearly'"
            >
              Annuel <span class="text-success-600 ml-1">-20%</span>
            </button>
          </div>
        </div>

        <!-- Plans -->
        <div class="grid md:grid-cols-3 gap-8 mb-16">
          <!-- Plan Gratuit -->
          <div class="card p-8 border-2 border-gray-200 dark:border-gray-700 flex flex-col">
            <div class="text-center mb-6">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Gratuit</h2>
              <div class="mt-4">
                <span class="text-4xl font-bold text-gray-900 dark:text-white">0€</span>
                <span class="text-gray-500">/mois</span>
              </div>
              <p class="text-sm text-gray-500 mt-2">Pour démarrer</p>
            </div>

            <ul class="space-y-4 mb-8 flex-1">
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-gray-700 dark:text-gray-300">Jusqu'à 100 produits</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-gray-700 dark:text-gray-300">1 entrepôt</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-gray-700 dark:text-gray-300">Gestion commandes</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-gray-700 dark:text-gray-300">Suivi mouvements</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                <span class="text-gray-400">Export données</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                <span class="text-gray-400">Rapports avancés</span>
              </li>
            </ul>

            <div class="text-center">
              @if (currentPlan() === 'free') {
                <span class="inline-block px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg font-medium w-full">
                  Plan actuel
                </span>
              } @else {
                <button type="button" class="btn-secondary w-full">
                  Rétrograder
                </button>
              }
            </div>
          </div>

          <!-- Plan Premium -->
          <div class="card p-8 border-2 border-warning-500 relative flex flex-col transform scale-105 shadow-xl">
            <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-warning-500 text-white text-sm font-bold px-4 py-1 rounded-full">
              POPULAIRE
            </div>

            <div class="text-center mb-6">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Premium</h2>
              <div class="mt-4">
                <span class="text-4xl font-bold text-warning-600">
                  {{ billingPeriod() === 'monthly' ? '29' : '23' }}€
                </span>
                <span class="text-gray-500">/mois</span>
              </div>
              @if (billingPeriod() === 'yearly') {
                <p class="text-sm text-success-600 mt-1">Soit 276€/an (économisez 72€)</p>
              } @else {
                <p class="text-sm text-gray-500 mt-2">Facturation mensuelle</p>
              }
            </div>

            <ul class="space-y-4 mb-8 flex-1">
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-gray-700 dark:text-gray-300 font-medium">Produits illimités</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-gray-700 dark:text-gray-300 font-medium">Multi-entrepôts</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-gray-700 dark:text-gray-300 font-medium">Export CSV/Excel/PDF</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-gray-700 dark:text-gray-300 font-medium">Rapports avancés</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-gray-700 dark:text-gray-300 font-medium">Inventaires physiques</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-gray-700 dark:text-gray-300 font-medium">Génération PDF</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-gray-700 dark:text-gray-300 font-medium">Support prioritaire</span>
              </li>
            </ul>

            <div class="text-center">
              @if (currentPlan() === 'premium') {
                <span class="inline-block px-6 py-3 bg-warning-100 text-warning-700 rounded-lg font-medium w-full">
                  Plan actuel
                </span>
              } @else {
                <button 
                  type="button" 
                  (click)="subscribe('premium')"
                  class="btn bg-gradient-to-r from-warning-500 to-warning-600 text-white hover:from-warning-600 hover:to-warning-700 w-full justify-center text-lg py-3"
                  [disabled]="isProcessing()"
                >
                  @if (isProcessing()) {
                    <svg class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  }
                  Commencer maintenant
                </button>
              }
            </div>
          </div>

          <!-- Plan Enterprise -->
          <div class="card p-8 border-2 border-gray-200 dark:border-gray-700 flex flex-col">
            <div class="text-center mb-6">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Enterprise</h2>
              <div class="mt-4">
                <span class="text-4xl font-bold text-gray-900 dark:text-white">Sur devis</span>
              </div>
              <p class="text-sm text-gray-500 mt-2">Pour les grandes équipes</p>
            </div>

            <ul class="space-y-4 mb-8 flex-1">
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-gray-700 dark:text-gray-300">Tout de Premium +</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-gray-700 dark:text-gray-300">Utilisateurs illimités</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-gray-700 dark:text-gray-300">API complète</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-gray-700 dark:text-gray-300">Intégrations personnalisées</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-gray-700 dark:text-gray-300">Account manager dédié</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-gray-700 dark:text-gray-300">SLA garanti</span>
              </li>
            </ul>

            <div class="text-center">
              <a href="mailto:contact&#64;example.com" class="btn-secondary w-full justify-center">
                Nous contacter
              </a>
            </div>
          </div>
        </div>

        <!-- FAQ -->
        <div class="max-w-3xl mx-auto">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Questions fréquentes
          </h3>
          
          <div class="space-y-4">
            @for (faq of faqs; track faq.question) {
              <div class="card">
                <button 
                  type="button"
                  class="w-full p-6 text-left flex items-center justify-between"
                  (click)="toggleFaq(faq.question)"
                >
                  <span class="font-medium text-gray-900 dark:text-white">{{ faq.question }}</span>
                  <svg 
                    class="w-5 h-5 text-gray-500 transition-transform"
                    [class.rotate-180]="openFaq() === faq.question"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                @if (openFaq() === faq.question) {
                  <div class="px-6 pb-6 text-gray-600 dark:text-gray-400">
                    {{ faq.answer }}
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Garantie -->
        <div class="mt-12 text-center">
          <div class="inline-flex items-center gap-3 bg-success-50 dark:bg-success-900/20 px-6 py-3 rounded-full">
            <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <span class="text-success-700 dark:text-success-400 font-medium">
              Garantie satisfait ou remboursé 30 jours
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AbonnementComponent {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  billingPeriod = signal<'monthly' | 'yearly'>('monthly');
  isProcessing = signal(false);
  openFaq = signal<string | null>(null);

  currentPlan = computed(() => this.authService.user()?.plan || 'free');

  faqs = [
    {
      question: 'Puis-je changer de plan à tout moment ?',
      answer: 'Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. Si vous passez à un plan supérieur, vous serez facturé au prorata pour le reste de la période. Si vous passez à un plan inférieur, le changement prendra effet à la fin de votre période de facturation actuelle.',
    },
    {
      question: 'Comment fonctionne la facturation ?',
      answer: 'La facturation est effectuée mensuellement ou annuellement selon votre choix. Vous recevrez une facture par email à chaque renouvellement. Vous pouvez annuler à tout moment depuis les paramètres de votre compte.',
    },
    {
      question: 'Mes données sont-elles conservées si je passe au plan gratuit ?',
      answer: 'Oui, toutes vos données sont conservées. Cependant, certaines fonctionnalités ne seront plus accessibles et les limites du plan gratuit s\'appliqueront (100 produits, 1 entrepôt).',
    },
    {
      question: 'Proposez-vous une période d\'essai ?',
      answer: 'Nous offrons une garantie satisfait ou remboursé de 30 jours. Si vous n\'êtes pas satisfait, nous vous remboursons intégralement, sans poser de questions.',
    },
    {
      question: 'Quels moyens de paiement acceptez-vous ?',
      answer: 'Nous acceptons les cartes de crédit (Visa, Mastercard, American Express), les virements bancaires pour les plans annuels, et PayPal.',
    },
  ];

  toggleFaq(question: string): void {
    this.openFaq.set(this.openFaq() === question ? null : question);
  }

  subscribe(plan: string): void {
    this.isProcessing.set(true);
    
    // Simulation - rediriger vers Stripe ou autre
    setTimeout(() => {
      this.isProcessing.set(false);
      this.notificationService.success('Redirection vers le paiement...');
      // window.location.href = 'https://checkout.stripe.com/...';
    }, 1500);
  }
}
