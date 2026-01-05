/**
 * Dashboard Analytics avancé (PREMIUM)
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { ChartComponent, ChartConfig } from '@components/ui/chart/chart.component';
import { StatsCardComponent } from '@components/ui/stats-card/stats-card.component';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-dashboard-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ChartComponent, StatsCardComponent, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <span class="badge-premium">Premium</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Analyses approfondies de votre activité</p>
        </div>
        <div class="flex items-center gap-3">
          <select [(ngModel)]="selectedPeriod" (ngModelChange)="loadData()" class="form-input w-auto">
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="trimestre">Ce trimestre</option>
            <option value="annee">Cette année</option>
          </select>
          <button type="button" class="btn-secondary" (click)="exportReport()">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Exporter
          </button>
        </div>
      </div>

      @if (isLoading()) {
        <div class="card p-12"><app-loading-spinner size="lg" text="Chargement des analyses..." /></div>
      } @else {
        <!-- KPIs principaux -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <app-stats-card
            label="Chiffre d'affaires"
            [value]="stats().chiffreAffaires"
            format="currency"
            suffix="€"
            [trend]="stats().tendanceCA"
            colorClass="primary"
            [icon]="true"
          >
            <svg icon class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </app-stats-card>

          <app-stats-card
            label="Commandes"
            [value]="stats().nombreCommandes"
            [trend]="stats().tendanceCommandes"
            colorClass="success"
            [icon]="true"
          >
            <svg icon class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </app-stats-card>

          <app-stats-card
            label="Panier moyen"
            [value]="stats().panierMoyen"
            format="currency"
            suffix="€"
            [trend]="stats().tendancePanier"
            colorClass="info"
            [icon]="true"
          >
            <svg icon class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </app-stats-card>

          <app-stats-card
            label="Valeur stock"
            [value]="stats().valeurStock"
            format="currency"
            suffix="€"
            colorClass="warning"
            [icon]="true"
          >
            <svg icon class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </app-stats-card>
        </div>

        <!-- Graphiques -->
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Évolution CA -->
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Évolution du chiffre d'affaires</h3>
            @if (caChartConfig()) {
              <app-chart [config]="caChartConfig()!" height="300px" />
            }
          </div>

          <!-- Répartition ventes -->
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Répartition par catégorie</h3>
            @if (categoriesChartConfig()) {
              <app-chart [config]="categoriesChartConfig()!" height="300px" />
            }
          </div>
        </div>

        <!-- Tableaux -->
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Top produits -->
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Top 10 Produits</h3>
            <div class="space-y-3">
              @for (p of topProduits(); track p.id; let i = $index) {
                <div class="flex items-center gap-3">
                  <span class="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center">
                    {{ i + 1 }}
                  </span>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 dark:text-white truncate">{{ p.nom }}</p>
                    <p class="text-sm text-gray-500">{{ p.quantiteVendue | number }} vendus</p>
                  </div>
                  <p class="font-semibold text-primary-600">{{ p.chiffreAffaires | number:'1.0-0' }} €</p>
                </div>
              }
            </div>
          </div>

          <!-- Top clients -->
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Top 10 Clients</h3>
            <div class="space-y-3">
              @for (c of topClients(); track c.id; let i = $index) {
                <div class="flex items-center gap-3">
                  <span class="w-6 h-6 rounded-full bg-success-100 text-success-600 text-xs font-bold flex items-center justify-center">
                    {{ i + 1 }}
                  </span>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 dark:text-white truncate">{{ c.nom }}</p>
                    <p class="text-sm text-gray-500">{{ c.nombreCommandes }} commandes</p>
                  </div>
                  <p class="font-semibold text-success-600">{{ c.chiffreAffaires | number:'1.0-0' }} €</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Mouvements stock -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Mouvements de stock</h3>
          @if (mouvementsChartConfig()) {
            <app-chart [config]="mouvementsChartConfig()!" height="250px" />
          }
        </div>
      }
    </div>
  `,
})
export class DashboardAnalyticsComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  isLoading = signal(true);
  selectedPeriod = 'mois';

  stats = signal<any>({
    chiffreAffaires: 0, tendanceCA: 0,
    nombreCommandes: 0, tendanceCommandes: 0,
    panierMoyen: 0, tendancePanier: 0,
    valeurStock: 0
  });

  topProduits = signal<any[]>([]);
  topClients = signal<any[]>([]);
  caChartConfig = signal<ChartConfig | null>(null);
  categoriesChartConfig = signal<ChartConfig | null>(null);
  mouvementsChartConfig = signal<ChartConfig | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    // Simuler le chargement des données
    setTimeout(() => {
      this.stats.set({
        chiffreAffaires: 125750, tendanceCA: 12.5,
        nombreCommandes: 342, tendanceCommandes: 8.2,
        panierMoyen: 367.69, tendancePanier: 3.8,
        valeurStock: 485000
      });

      this.topProduits.set([
        { id: '1', nom: 'Écran LCD 27"', quantiteVendue: 85, chiffreAffaires: 25500 },
        { id: '2', nom: 'PC Portable Pro', quantiteVendue: 42, chiffreAffaires: 46200 },
        { id: '3', nom: 'Clavier mécanique RGB', quantiteVendue: 156, chiffreAffaires: 11700 },
        { id: '4', nom: 'Souris gaming', quantiteVendue: 203, chiffreAffaires: 8120 },
        { id: '5', nom: 'Casque audio', quantiteVendue: 89, chiffreAffaires: 6675 },
      ]);

      this.topClients.set([
        { id: '1', nom: 'TechCorp SARL', nombreCommandes: 12, chiffreAffaires: 28500 },
        { id: '2', nom: 'Digital Solutions', nombreCommandes: 8, chiffreAffaires: 18750 },
        { id: '3', nom: 'InfoPro', nombreCommandes: 15, chiffreAffaires: 15200 },
        { id: '4', nom: 'WebAgency', nombreCommandes: 6, chiffreAffaires: 12800 },
        { id: '5', nom: 'StartupXYZ', nombreCommandes: 4, chiffreAffaires: 9500 },
      ]);

      // Config graphique CA
      this.caChartConfig.set({
        type: 'area',
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
        datasets: [{
          label: "Chiffre d'affaires",
          data: [85000, 92000, 88000, 105000, 115000, 125750],
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderColor: 'rgb(99, 102, 241)',
          fill: true
        }]
      });

      // Config graphique catégories
      this.categoriesChartConfig.set({
        type: 'doughnut',
        labels: ['Informatique', 'Périphériques', 'Accessoires', 'Logiciels'],
        datasets: [{
          label: 'Ventes',
          data: [45, 25, 20, 10],
          backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#3b82f6']
        }]
      });

      // Config graphique mouvements
      this.mouvementsChartConfig.set({
        type: 'bar',
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [
          { label: 'Entrées', data: [120, 85, 110, 95, 130, 45, 20], backgroundColor: '#22c55e' },
          { label: 'Sorties', data: [90, 75, 100, 85, 110, 35, 15], backgroundColor: '#ef4444' }
        ]
      });

      this.isLoading.set(false);
    }, 1000);
  }

  exportReport(): void {
    console.log('Export du rapport analytics');
  }
}
