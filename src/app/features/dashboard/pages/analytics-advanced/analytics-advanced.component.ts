/**
 * Dashboard Analytics Avancé (PREMIUM)
 */
import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics-advanced',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Analytics Avancé</h1>
            <span class="badge-premium">Premium</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Vue d'ensemble de votre performance</p>
        </div>
        <div class="flex items-center gap-3">
          <select [(ngModel)]="periode" (change)="refreshData()" class="form-input">
            <option value="7">7 jours</option>
            <option value="30">30 jours</option>
            <option value="90">3 mois</option>
            <option value="365">12 mois</option>
          </select>
          <button type="button" class="btn-secondary" (click)="refreshData()">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Actualiser
          </button>
        </div>
      </div>

      <!-- KPIs principaux avec évolution -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        @for (kpi of kpis(); track kpi.label) {
          <div class="card p-5">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-gray-500">{{ kpi.label }}</p>
                <p class="text-2xl font-bold mt-1" [ngClass]="kpi.color">
                  {{ kpi.prefix }}{{ kpi.value | number:'1.0-0' }}{{ kpi.suffix }}
                </p>
                <div class="flex items-center gap-1 mt-2">
                  @if (kpi.evolution > 0) {
                    <svg class="w-4 h-4 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                    </svg>
                    <span class="text-sm text-success-600">+{{ kpi.evolution }}%</span>
                  } @else if (kpi.evolution < 0) {
                    <svg class="w-4 h-4 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                    </svg>
                    <span class="text-sm text-danger-600">{{ kpi.evolution }}%</span>
                  } @else {
                    <span class="text-sm text-gray-500">0%</span>
                  }
                  <span class="text-xs text-gray-400">vs période préc.</span>
                </div>
              </div>
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" [ngClass]="kpi.bgColor">
                <svg class="w-5 h-5" [ngClass]="kpi.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="kpi.icon"/>
                </svg>
              </div>
            </div>
            <!-- Mini sparkline -->
            <div class="mt-3 h-8">
              <canvas [id]="'sparkline-' + kpi.id"></canvas>
            </div>
          </div>
        }
      </div>

      <!-- Graphiques principaux -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Évolution CA -->
        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900 dark:text-white">Évolution du CA</h3>
            <div class="flex gap-2">
              <button type="button" class="px-3 py-1 text-sm rounded-lg"
                [class.bg-primary-100]="caChartType === 'line'"
                [class.text-primary-700]="caChartType === 'line'"
                (click)="caChartType = 'line'; updateCaChart()">Ligne</button>
              <button type="button" class="px-3 py-1 text-sm rounded-lg"
                [class.bg-primary-100]="caChartType === 'bar'"
                [class.text-primary-700]="caChartType === 'bar'"
                (click)="caChartType = 'bar'; updateCaChart()">Barres</button>
            </div>
          </div>
          <div class="h-72">
            <canvas #caChart></canvas>
          </div>
        </div>

        <!-- Répartition par catégorie -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Répartition par catégorie</h3>
          <div class="h-72">
            <canvas #categoryChart></canvas>
          </div>
        </div>
      </div>

      <!-- Métriques détaillées -->
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Performance produits -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Top Produits</h3>
          <div class="space-y-3">
            @for (produit of topProduits(); track produit.nom; let i = $index) {
              <div class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                  {{ i + 1 }}
                </span>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ produit.nom }}</span>
                    <span class="text-sm font-semibold">{{ produit.ca | number:'1.0-0' }} €</span>
                  </div>
                  <div class="h-1.5 bg-gray-200 rounded-full mt-1">
                    <div class="h-full bg-primary-500 rounded-full" [style.width.%]="produit.pourcentage"></div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Activité récente -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Activité temps réel</h3>
          <div class="space-y-3">
            @for (event of activiteRecente(); track event.id) {
              <div class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div class="w-8 h-8 rounded-full flex items-center justify-center"
                  [class.bg-success-100]="event.type === 'commande'"
                  [class.bg-primary-100]="event.type === 'client'"
                  [class.bg-warning-100]="event.type === 'stock'"
                >
                  @switch (event.type) {
                    @case ('commande') {
                      <svg class="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                    }
                    @case ('client') {
                      <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    }
                    @case ('stock') {
                      <svg class="w-4 h-4 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                      </svg>
                    }
                  }
                </div>
                <div class="flex-1">
                  <p class="text-sm text-gray-900 dark:text-white">{{ event.message }}</p>
                  <p class="text-xs text-gray-500">{{ event.time }}</p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Objectifs -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Objectifs du mois</h3>
          <div class="space-y-4">
            @for (objectif of objectifs(); track objectif.label) {
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm text-gray-600">{{ objectif.label }}</span>
                  <span class="text-sm font-semibold" 
                    [class.text-success-600]="objectif.progress >= 100"
                    [class.text-warning-600]="objectif.progress >= 70 && objectif.progress < 100"
                    [class.text-danger-600]="objectif.progress < 70"
                  >{{ objectif.progress }}%</span>
                </div>
                <div class="h-3 bg-gray-200 rounded-full">
                  <div class="h-full rounded-full transition-all"
                    [class.bg-success-500]="objectif.progress >= 100"
                    [class.bg-warning-500]="objectif.progress >= 70 && objectif.progress < 100"
                    [class.bg-danger-500]="objectif.progress < 70"
                    [style.width.%]="Math.min(objectif.progress, 100)"
                  ></div>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ objectif.current | number }} / {{ objectif.target | number }} {{ objectif.unit }}</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Alertes et recommandations -->
      <div class="card p-6 border-l-4 border-warning-500 bg-warning-50 dark:bg-warning-900/20">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-warning-800">Points d'attention</h4>
            <ul class="mt-2 space-y-1 text-sm text-warning-700">
              <li>• 5 produits en rupture imminente (stock < 7 jours)</li>
              <li>• Taux de conversion en baisse de 8% cette semaine</li>
              <li>• 3 commandes en attente depuis plus de 48h</li>
            </ul>
            <a routerLink="/previsions" class="inline-flex items-center mt-3 text-sm font-medium text-warning-700 hover:text-warning-800">
              Voir les recommandations IA
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AnalyticsAdvancedComponent implements OnInit, AfterViewInit {
  @ViewChild('caChart') caChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;

  private caChart: Chart | null = null;
  private categoryChart: Chart | null = null;

  periode = '30';
  caChartType: 'line' | 'bar' = 'line';
  Math = Math;

  kpis = signal([
    { id: 'ca', label: 'Chiffre d\'affaires', value: 125750, prefix: '', suffix: ' €', evolution: 12.5, color: 'text-primary-600', bgColor: 'bg-primary-100', iconColor: 'text-primary-600', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'commandes', label: 'Commandes', value: 342, prefix: '', suffix: '', evolution: 8.2, color: 'text-success-600', bgColor: 'bg-success-100', iconColor: 'text-success-600', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'clients', label: 'Clients actifs', value: 156, prefix: '', suffix: '', evolution: 5.4, color: 'text-warning-600', bgColor: 'bg-warning-100', iconColor: 'text-warning-600', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'marge', label: 'Marge brute', value: 28.5, prefix: '', suffix: '%', evolution: -2.1, color: 'text-purple-600', bgColor: 'bg-purple-100', iconColor: 'text-purple-600', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  ]);

  topProduits = signal([
    { nom: 'PC Portable Pro', ca: 46200, pourcentage: 100 },
    { nom: 'Écran LCD 27"', ca: 25500, pourcentage: 55 },
    { nom: 'Clavier mécanique RGB', ca: 11700, pourcentage: 25 },
    { nom: 'Souris gaming', ca: 8120, pourcentage: 18 },
    { nom: 'Casque audio Pro', ca: 6675, pourcentage: 14 },
  ]);

  activiteRecente = signal([
    { id: 1, type: 'commande', message: 'Nouvelle commande #1247 - TechCorp', time: 'Il y a 2 min' },
    { id: 2, type: 'client', message: 'Nouveau client: Digital Solutions', time: 'Il y a 15 min' },
    { id: 3, type: 'stock', message: 'Alerte stock: Écran LCD 24"', time: 'Il y a 32 min' },
    { id: 4, type: 'commande', message: 'Commande #1246 expédiée', time: 'Il y a 1h' },
    { id: 5, type: 'commande', message: 'Commande #1245 payée', time: 'Il y a 2h' },
  ]);

  objectifs = signal([
    { label: 'CA mensuel', current: 125750, target: 150000, unit: '€', progress: 84 },
    { label: 'Nouvelles commandes', current: 342, target: 400, unit: '', progress: 85 },
    { label: 'Taux de conversion', current: 3.2, target: 4, unit: '%', progress: 80 },
    { label: 'Nouveaux clients', current: 28, target: 50, unit: '', progress: 56 },
  ]);

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => this.createCharts(), 100);
  }

  refreshData(): void {
    // Refresh logic
  }

  createCharts(): void {
    if (this.caChartRef?.nativeElement) {
      const labels = this.generateLabels();
      this.caChart = new Chart(this.caChartRef.nativeElement, {
        type: this.caChartType,
        data: {
          labels,
          datasets: [{
            label: 'CA (€)',
            data: this.generateRandomData(parseInt(this.periode), 3000, 8000),
            borderColor: '#3b82f6',
            backgroundColor: this.caChartType === 'line' ? 'rgba(59,130,246,0.1)' : '#3b82f6',
            fill: this.caChartType === 'line',
            tension: 0.4
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    }

    if (this.categoryChartRef?.nativeElement) {
      this.categoryChart = new Chart(this.categoryChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Informatique', 'Périphériques', 'Accessoires', 'Logiciels', 'Services'],
          datasets: [{
            data: [45, 25, 15, 10, 5],
            backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
      });
    }
  }

  updateCaChart(): void {
    if (this.caChart) {
      this.caChart.destroy();
      this.createCharts();
    }
  }

  generateLabels(): string[] {
    const days = parseInt(this.periode);
    return Array.from({ length: Math.min(days, 30) }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (Math.min(days, 30) - 1 - i));
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    });
  }

  generateRandomData(count: number, min: number, max: number): number[] {
    return Array.from({ length: Math.min(count, 30) }, () => Math.floor(Math.random() * (max - min) + min));
  }
}
