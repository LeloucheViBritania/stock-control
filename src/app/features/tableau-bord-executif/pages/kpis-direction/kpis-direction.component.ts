/**
 * Tableau de Bord Exécutif (PREMIUM)
 * Vue stratégique pour la direction
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface KPIDirection {
  id: string;
  nom: string;
  valeur: number;
  unite: string;
  evolution: number;
  objectif?: number;
  tendance: 'hausse' | 'baisse' | 'stable';
  categorie: 'finance' | 'stock' | 'ventes' | 'operations';
}

interface AlerteStrategique {
  id: string;
  type: 'CRITIQUE' | 'IMPORTANT' | 'INFO';
  titre: string;
  description: string;
  impact: string;
  date: Date;
}

@Component({
  selector: 'app-kpis-direction',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Tableau de Bord Exécutif</h1>
            <span class="badge-premium">Premium</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Vue stratégique des indicateurs clés</p>
        </div>
        <div class="flex gap-2">
          <select [(ngModel)]="periodeSelectionnee" class="form-input">
            <option value="jour">Aujourd'hui</option>
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="trimestre">Ce trimestre</option>
            <option value="annee">Cette année</option>
          </select>
          <button type="button" class="btn-secondary" (click)="exporterRapport()">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Rapport PDF
          </button>
        </div>
      </div>

      <!-- Score de santé global -->
      <div class="card p-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-medium opacity-90">Score de Santé Global</h2>
            <p class="text-5xl font-bold mt-2">{{ scoreGlobal() }}<span class="text-2xl">/100</span></p>
            <p class="mt-2 opacity-80">
              @if (scoreGlobal() >= 80) {
                Excellent - Tous les indicateurs sont au vert
              } @else if (scoreGlobal() >= 60) {
                Bon - Quelques points d'attention
              } @else {
                Attention requise - Actions correctives nécessaires
              }
            </p>
          </div>
          <div class="w-32 h-32 relative">
            <svg class="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="12"/>
              <circle cx="64" cy="64" r="56" fill="none" stroke="white" stroke-width="12" 
                [attr.stroke-dasharray]="351.86" [attr.stroke-dashoffset]="351.86 * (1 - scoreGlobal() / 100)"
                stroke-linecap="round"/>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-2xl font-bold">{{ scoreGlobal() }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- KPIs par catégorie -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Finance -->
        <div class="card p-6">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white">Performance Financière</h3>
          </div>
          <div class="space-y-4">
            @for (kpi of kpisFinance(); track kpi.id) {
              <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p class="text-sm text-gray-500">{{ kpi.nom }}</p>
                  <p class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ kpi.valeur | number:'1.0-0' }} {{ kpi.unite }}
                  </p>
                </div>
                <div class="text-right">
                  <span class="inline-flex items-center gap-1 text-sm"
                    [class.text-success-600]="kpi.evolution > 0"
                    [class.text-danger-600]="kpi.evolution < 0"
                  >
                    @if (kpi.evolution > 0) {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                      </svg>
                    } @else if (kpi.evolution < 0) {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                      </svg>
                    }
                    {{ kpi.evolution > 0 ? '+' : '' }}{{ kpi.evolution }}%
                  </span>
                  @if (kpi.objectif) {
                    <p class="text-xs text-gray-400">Obj: {{ kpi.objectif | number }} {{ kpi.unite }}</p>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Stock -->
        <div class="card p-6">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white">Gestion des Stocks</h3>
          </div>
          <div class="space-y-4">
            @for (kpi of kpisStock(); track kpi.id) {
              <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p class="text-sm text-gray-500">{{ kpi.nom }}</p>
                  <p class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ kpi.valeur | number:'1.0-0' }} {{ kpi.unite }}
                  </p>
                </div>
                <div class="text-right">
                  <span class="inline-flex items-center gap-1 text-sm"
                    [class.text-success-600]="kpi.evolution > 0"
                    [class.text-danger-600]="kpi.evolution < 0"
                  >
                    {{ kpi.evolution > 0 ? '+' : '' }}{{ kpi.evolution }}%
                  </span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Ventes -->
        <div class="card p-6">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white">Performance Commerciale</h3>
          </div>
          <div class="space-y-4">
            @for (kpi of kpisVentes(); track kpi.id) {
              <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p class="text-sm text-gray-500">{{ kpi.nom }}</p>
                  <p class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ kpi.valeur | number:'1.0-0' }} {{ kpi.unite }}
                  </p>
                </div>
                <div class="text-right">
                  <span class="inline-flex items-center gap-1 text-sm"
                    [class.text-success-600]="kpi.evolution > 0"
                    [class.text-danger-600]="kpi.evolution < 0"
                  >
                    {{ kpi.evolution > 0 ? '+' : '' }}{{ kpi.evolution }}%
                  </span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Opérations -->
        <div class="card p-6">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white">Efficacité Opérationnelle</h3>
          </div>
          <div class="space-y-4">
            @for (kpi of kpisOperations(); track kpi.id) {
              <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p class="text-sm text-gray-500">{{ kpi.nom }}</p>
                  <p class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ kpi.valeur | number:'1.1-1' }} {{ kpi.unite }}
                  </p>
                </div>
                <div class="text-right">
                  <span class="inline-flex items-center gap-1 text-sm"
                    [class.text-success-600]="kpi.evolution > 0"
                    [class.text-danger-600]="kpi.evolution < 0"
                  >
                    {{ kpi.evolution > 0 ? '+' : '' }}{{ kpi.evolution }}%
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Alertes stratégiques -->
      <div class="card p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Alertes Stratégiques</h3>
        <div class="space-y-3">
          @for (alerte of alertes(); track alerte.id) {
            <div class="p-4 rounded-lg border-l-4"
              [class.bg-danger-50]="alerte.type === 'CRITIQUE'"
              [class.border-danger-500]="alerte.type === 'CRITIQUE'"
              [class.bg-warning-50]="alerte.type === 'IMPORTANT'"
              [class.border-warning-500]="alerte.type === 'IMPORTANT'"
              [class.bg-primary-50]="alerte.type === 'INFO'"
              [class.border-primary-500]="alerte.type === 'INFO'"
            >
              <div class="flex items-start justify-between">
                <div>
                  <p class="font-medium text-gray-900">{{ alerte.titre }}</p>
                  <p class="text-sm text-gray-600 mt-1">{{ alerte.description }}</p>
                  <p class="text-xs text-gray-500 mt-2">Impact: {{ alerte.impact }}</p>
                </div>
                <span class="text-xs text-gray-400">{{ alerte.date | date:'dd/MM HH:mm' }}</span>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class KpisDirectionComponent implements OnInit {
  periodeSelectionnee = 'mois';
  scoreGlobal = signal(78);

  kpis = signal<KPIDirection[]>([]);
  alertes = signal<AlerteStrategique[]>([]);

  kpisFinance = computed(() => this.kpis().filter(k => k.categorie === 'finance'));
  kpisStock = computed(() => this.kpis().filter(k => k.categorie === 'stock'));
  kpisVentes = computed(() => this.kpis().filter(k => k.categorie === 'ventes'));
  kpisOperations = computed(() => this.kpis().filter(k => k.categorie === 'operations'));

  ngOnInit(): void {
    this.loadKPIs();
    this.loadAlertes();
  }

  loadKPIs(): void {
    this.kpis.set([
      { id: '1', nom: 'Chiffre d\'affaires', valeur: 245000, unite: '€', evolution: 12.5, objectif: 280000, tendance: 'hausse', categorie: 'finance' },
      { id: '2', nom: 'Marge brute', valeur: 32.5, unite: '%', evolution: 2.1, objectif: 35, tendance: 'hausse', categorie: 'finance' },
      { id: '3', nom: 'Trésorerie', valeur: 89000, unite: '€', evolution: -5.2, tendance: 'baisse', categorie: 'finance' },
      { id: '4', nom: 'Valeur stock', valeur: 156000, unite: '€', evolution: 8.3, tendance: 'hausse', categorie: 'stock' },
      { id: '5', nom: 'Taux de rotation', valeur: 4.2, unite: 'x', evolution: 15.2, tendance: 'hausse', categorie: 'stock' },
      { id: '6', nom: 'Ruptures évitées', valeur: 94, unite: '%', evolution: 3.1, objectif: 98, tendance: 'hausse', categorie: 'stock' },
      { id: '7', nom: 'Commandes', valeur: 342, unite: '', evolution: 18.4, tendance: 'hausse', categorie: 'ventes' },
      { id: '8', nom: 'Panier moyen', valeur: 156, unite: '€', evolution: -2.3, objectif: 170, tendance: 'baisse', categorie: 'ventes' },
      { id: '9', nom: 'Clients actifs', valeur: 1245, unite: '', evolution: 8.7, tendance: 'hausse', categorie: 'ventes' },
      { id: '10', nom: 'Délai préparation', valeur: 2.4, unite: 'h', evolution: -12.5, tendance: 'hausse', categorie: 'operations' },
      { id: '11', nom: 'Taux erreurs', valeur: 0.8, unite: '%', evolution: -25.0, tendance: 'hausse', categorie: 'operations' },
      { id: '12', nom: 'Productivité', valeur: 94.5, unite: '%', evolution: 5.2, objectif: 95, tendance: 'hausse', categorie: 'operations' },
    ]);
  }

  loadAlertes(): void {
    this.alertes.set([
      { id: '1', type: 'CRITIQUE', titre: 'Rupture imminente sur 3 références clés', description: 'Les produits ECR-027, CLV-MEC et SOU-PRO sont en stock critique.', impact: 'Perte CA estimée: 15 000 €/semaine', date: new Date() },
      { id: '2', type: 'IMPORTANT', titre: 'Retard fournisseur TechSupply', description: 'Livraison prévue le 15/01 reportée au 22/01.', impact: 'Décalage approvisionnement 12 références', date: new Date(Date.now() - 3600000) },
      { id: '3', type: 'INFO', titre: 'Objectif mensuel atteint à 87%', description: 'Performance commerciale en bonne voie.', impact: 'Projection fin de mois: 102% de l\'objectif', date: new Date(Date.now() - 7200000) },
    ]);
  }

  exporterRapport(): void {}
}
