/**
 * Page de simulation de scénarios (PREMIUM)
 */
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PrevisionsService } from '../../services/previsions.service';

@Component({
  selector: 'app-simulation-scenarios',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-3">
        <a routerLink="/previsions" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Simulation de Scénarios</h1>
            <span class="badge-premium">Premium</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Simulez l'impact de différentes stratégies sur votre activité</p>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Paramètres de simulation -->
        <div class="lg:col-span-1 space-y-6">
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Paramètres</h3>
            
            <div class="space-y-5">
              <div>
                <label class="form-label">Croissance des ventes (%)</label>
                <input type="range" [(ngModel)]="params.croissanceVentes" min="-30" max="50" class="w-full" />
                <div class="flex justify-between text-sm text-gray-500">
                  <span>-30%</span>
                  <span class="font-semibold text-primary-600">{{ params.croissanceVentes }}%</span>
                  <span>+50%</span>
                </div>
              </div>

              <div>
                <label class="form-label">Nouveaux produits</label>
                <input type="range" [(ngModel)]="params.nouveauxProduits" min="0" max="100" class="w-full" />
                <div class="flex justify-between text-sm text-gray-500">
                  <span>0</span>
                  <span class="font-semibold text-primary-600">{{ params.nouveauxProduits }}</span>
                  <span>100</span>
                </div>
              </div>

              <div>
                <label class="form-label">Nouveaux clients</label>
                <input type="range" [(ngModel)]="params.nouveauxClients" min="0" max="500" class="w-full" />
                <div class="flex justify-between text-sm text-gray-500">
                  <span>0</span>
                  <span class="font-semibold text-primary-600">{{ params.nouveauxClients }}</span>
                  <span>500</span>
                </div>
              </div>

              <div>
                <label class="form-label">Horizon (mois)</label>
                <select [(ngModel)]="params.horizon" class="form-input">
                  <option [ngValue]="3">3 mois</option>
                  <option [ngValue]="6">6 mois</option>
                  <option [ngValue]="12">12 mois</option>
                </select>
              </div>
            </div>

            <button 
              type="button" 
              class="btn-primary w-full mt-6"
              [disabled]="isSimulating()"
              (click)="simuler()"
            >
              @if (isSimulating()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Simulation...
              } @else {
                Lancer la simulation
              }
            </button>
          </div>

          <!-- Scénarios prédéfinis -->
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Scénarios prédéfinis</h3>
            <div class="space-y-2">
              <button type="button" class="w-full p-3 text-left bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 transition-colors" (click)="appliquerScenario('optimiste')">
                <span class="font-medium text-success-600">🚀 Optimiste</span>
                <p class="text-xs text-gray-500 mt-1">+20% ventes, 50 nouveaux produits</p>
              </button>
              <button type="button" class="w-full p-3 text-left bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 transition-colors" (click)="appliquerScenario('realiste')">
                <span class="font-medium text-primary-600">📊 Réaliste</span>
                <p class="text-xs text-gray-500 mt-1">+8% ventes, 20 nouveaux produits</p>
              </button>
              <button type="button" class="w-full p-3 text-left bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 transition-colors" (click)="appliquerScenario('pessimiste')">
                <span class="font-medium text-warning-600">⚠️ Pessimiste</span>
                <p class="text-xs text-gray-500 mt-1">-10% ventes, 5 nouveaux produits</p>
              </button>
            </div>
          </div>
        </div>

        <!-- Résultats -->
        <div class="lg:col-span-2 space-y-6">
          @if (resultats()) {
            <!-- KPIs Impact -->
            <div class="grid grid-cols-2 gap-4">
              <div class="card p-4">
                <p class="text-sm text-gray-500">Impact CA</p>
                <p class="text-2xl font-bold mt-1" [class.text-success-600]="resultats()!.impactCA > 0" [class.text-danger-600]="resultats()!.impactCA < 0">
                  {{ resultats()!.impactCA > 0 ? '+' : '' }}{{ resultats()!.impactCA | number:'1.0-0' }} €
                </p>
                <p class="text-sm text-gray-500 mt-1">sur {{ params.horizon }} mois</p>
              </div>
              <div class="card p-4">
                <p class="text-sm text-gray-500">Impact Stock</p>
                <p class="text-2xl font-bold text-primary-600 mt-1">{{ resultats()!.impactStock | number:'1.0-0' }} €</p>
                <p class="text-sm text-gray-500 mt-1">valeur additionnelle</p>
              </div>
              <div class="card p-4">
                <p class="text-sm text-gray-500">Investissement</p>
                <p class="text-2xl font-bold text-warning-600 mt-1">{{ resultats()!.investissementNecessaire | number:'1.0-0' }} €</p>
                <p class="text-sm text-gray-500 mt-1">nécessaire</p>
              </div>
              <div class="card p-4">
                <p class="text-sm text-gray-500">ROI estimé</p>
                <p class="text-2xl font-bold mt-1" [class.text-success-600]="resultats()!.roi > 0" [class.text-danger-600]="resultats()!.roi < 0">
                  {{ resultats()!.roi > 0 ? '+' : '' }}{{ resultats()!.roi | number:'1.0-0' }}%
                </p>
                <p class="text-sm text-gray-500 mt-1">retour sur investissement</p>
              </div>
            </div>

            <!-- Détails -->
            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Détails de la simulation</h3>
              
              <div class="space-y-4">
                <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 class="font-medium text-gray-900 dark:text-white mb-2">Hypothèses</h4>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• Croissance ventes: {{ params.croissanceVentes > 0 ? '+' : '' }}{{ params.croissanceVentes }}%</li>
                    <li>• Nouveaux produits: {{ params.nouveauxProduits }} références</li>
                    <li>• Nouveaux clients: {{ params.nouveauxClients }} clients</li>
                    <li>• Horizon: {{ params.horizon }} mois</li>
                  </ul>
                </div>

                <div class="p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
                  <h4 class="font-medium text-success-700 dark:text-success-400 mb-2">Points positifs</h4>
                  <ul class="text-sm text-success-600 space-y-1">
                    @if (params.croissanceVentes > 0) {
                      <li>✓ Augmentation du chiffre d'affaires de {{ (params.croissanceVentes * 450000 / 100) | number:'1.0-0' }} €</li>
                    }
                    @if (params.nouveauxClients > 0) {
                      <li>✓ {{ params.nouveauxClients }} nouveaux clients = panier moyen estimé {{ params.nouveauxClients * 250 | number:'1.0-0' }} €</li>
                    }
                    @if (resultats()!.roi > 15) {
                      <li>✓ ROI attractif supérieur à 15%</li>
                    }
                  </ul>
                </div>

                <div class="p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                  <h4 class="font-medium text-warning-700 dark:text-warning-400 mb-2">Points d'attention</h4>
                  <ul class="text-sm text-warning-600 space-y-1">
                    @if (params.nouveauxProduits > 30) {
                      <li>⚠ {{ params.nouveauxProduits }} nouveaux produits nécessitent une gestion de stock accrue</li>
                    }
                    @if (resultats()!.investissementNecessaire > 50000) {
                      <li>⚠ Investissement significatif à prévoir: {{ resultats()!.investissementNecessaire | number:'1.0-0' }} €</li>
                    }
                    <li>⚠ Prévoir des ressources RH supplémentaires pour la croissance</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Recommandations -->
            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Recommandations IA</h3>
              <div class="grid gap-4 md:grid-cols-2">
                <div class="p-4 border border-primary-200 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="font-medium text-primary-700">Stock optimal</span>
                  </div>
                  <p class="text-sm text-primary-600">Augmenter le stock de sécurité de {{ (params.croissanceVentes * 0.15) | number:'1.0-0' }}% pour absorber la croissance</p>
                </div>
                <div class="p-4 border border-success-200 bg-success-50 dark:bg-success-900/20 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <svg class="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                    </svg>
                    <span class="font-medium text-success-700">Croissance</span>
                  </div>
                  <p class="text-sm text-success-600">Focus sur les 20% de produits générant 80% du CA pour maximiser le ROI</p>
                </div>
              </div>
            </div>
          } @else {
            <div class="card p-12 text-center">
              <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Lancez une simulation</h3>
              <p class="text-gray-500 mt-2">Ajustez les paramètres et cliquez sur "Lancer la simulation"</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class SimulationScenariosComponent {
  private readonly previsionsService = inject(PrevisionsService);

  params = { croissanceVentes: 10, nouveauxProduits: 20, nouveauxClients: 100, horizon: 6 };
  resultats = signal<{ impactCA: number; impactStock: number; investissementNecessaire: number; roi: number } | null>(null);
  isSimulating = signal(false);

  simuler(): void {
    this.isSimulating.set(true);
    
    this.previsionsService.getScenario({
      croissanceVentes: this.params.croissanceVentes,
      nouveauxProduits: this.params.nouveauxProduits,
      nouveauxClients: this.params.nouveauxClients,
    }).subscribe({
      next: (r) => { this.resultats.set(r); this.isSimulating.set(false); },
      error: () => {
        // Mock calculation
        const baseCA = 450000;
        const impactCA = baseCA * (this.params.croissanceVentes / 100) * (this.params.horizon / 12) + this.params.nouveauxClients * 250;
        const impactStock = this.params.nouveauxProduits * 500 + impactCA * 0.15;
        const investissementNecessaire = this.params.nouveauxProduits * 2000 + this.params.nouveauxClients * 50;
        const roi = investissementNecessaire > 0 ? ((impactCA - investissementNecessaire) / investissementNecessaire * 100) : 0;
        
        this.resultats.set({ impactCA, impactStock, investissementNecessaire, roi });
        this.isSimulating.set(false);
      }
    });
  }

  appliquerScenario(type: 'optimiste' | 'realiste' | 'pessimiste'): void {
    switch (type) {
      case 'optimiste':
        this.params = { croissanceVentes: 20, nouveauxProduits: 50, nouveauxClients: 300, horizon: 12 };
        break;
      case 'realiste':
        this.params = { croissanceVentes: 8, nouveauxProduits: 20, nouveauxClients: 100, horizon: 6 };
        break;
      case 'pessimiste':
        this.params = { croissanceVentes: -10, nouveauxProduits: 5, nouveauxClients: 20, horizon: 6 };
        break;
    }
    this.simuler();
  }
}
