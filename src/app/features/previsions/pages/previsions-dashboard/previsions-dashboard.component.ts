/**
 * Dashboard des prévisions (PREMIUM)
 */
import { Component, OnInit, inject, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { PrevisionsService, PrevisionStock, RecommandationReapprovisionnement } from '../../services/previsions.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

Chart.register(...registerables);

@Component({
  selector: 'app-previsions-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Prévisions & Analyses IA</h1>
            <span class="badge-premium">Premium</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Anticipez vos besoins grâce à l'intelligence artificielle</p>
        </div>
        <div class="flex items-center gap-3">
          <a routerLink="tendances" class="btn-secondary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Tendances
          </a>
          <a routerLink="scenarios" class="btn-primary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            Scénarios
          </a>
        </div>
      </div>

      @if (isLoading()) {
        <div class="card p-12"><app-loading-spinner size="lg" text="Analyse en cours..." /></div>
      } @else {
        <!-- KPIs -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card p-4">
            <p class="text-sm text-gray-500">Tendance ventes</p>
            <div class="flex items-center gap-2">
              <p class="text-2xl font-bold" [ngClass]="{
                'text-success-600': dashboard()?.tendanceVentes === 'HAUSSE',
                'text-gray-600': dashboard()?.tendanceVentes === 'STABLE',
                'text-danger-600': dashboard()?.tendanceVentes === 'BAISSE'
              }">
                {{ dashboard()?.tendanceVentes }}
              </p>
              @if (dashboard()?.tendanceVentes === 'HAUSSE') {
                <svg class="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              }
            </div>
            <p class="text-sm text-gray-500 mt-1">{{ dashboard()?.croissancePrevue | number:'1.1-1' }}% prévu</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-500">Alertes stock</p>
            <p class="text-2xl font-bold text-warning-600">{{ dashboard()?.alertesStock }}</p>
            <p class="text-sm text-gray-500 mt-1">produits à risque</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-500">Produits à risque</p>
            <p class="text-2xl font-bold text-danger-600">{{ dashboard()?.produitsARisque }}</p>
            <p class="text-sm text-gray-500 mt-1">rupture imminente</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-500">Fiabilité modèle</p>
            <p class="text-2xl font-bold text-primary-600">{{ dashboard()?.fiabiliteModele | number:'1.0-0' }}%</p>
            <p class="text-sm text-gray-500 mt-1">précision</p>
          </div>
        </div>

        <!-- Graphique évolution prévue -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Évolution prévue des ventes</h3>
          <div class="h-64">
            <canvas #chartCanvas></canvas>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Prévisions stock -->
          <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900 dark:text-white">Prévisions de stock</h3>
              <a routerLink="/reapprovisionnement" class="text-sm text-primary-600 hover:underline">Réappro →</a>
            </div>
            <div class="space-y-4">
              @for (p of previsionsStock().slice(0, 5); track p.produitId) {
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div class="flex-1">
                    <p class="font-medium text-gray-900 dark:text-white">{{ p.produitNom }}</p>
                    <div class="flex items-center gap-4 mt-1 text-sm">
                      <span class="text-gray-500">Stock: {{ p.stockActuel }}</span>
                      <span class="text-gray-500">Conso: {{ p.consommationMoyenne | number:'1.1-1' }}/j</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold" [class.text-danger-600]="p.joursRestants < 7" [class.text-warning-600]="p.joursRestants >= 7 && p.joursRestants < 14" [class.text-success-600]="p.joursRestants >= 14">
                      {{ p.joursRestants }} j
                    </p>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Recommandations -->
          <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900 dark:text-white">Recommandations urgentes</h3>
              <span class="text-sm text-gray-500">{{ recommandations().length }} total</span>
            </div>
            <div class="space-y-3">
              @for (r of recommandations().slice(0, 4); track r.produitId) {
                <div class="p-3 border-l-4 rounded-r-lg" [ngClass]="{
                  'border-danger-500 bg-danger-50 dark:bg-danger-900/20': r.urgence === 'CRITIQUE',
                  'border-warning-500 bg-warning-50 dark:bg-warning-900/20': r.urgence === 'HAUTE',
                  'border-primary-500 bg-primary-50 dark:bg-primary-900/20': r.urgence === 'NORMALE'
                }">
                  <div class="flex items-start justify-between">
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">{{ r.produitNom }}</p>
                      <p class="text-sm text-gray-600 mt-1">{{ r.raisonRecommandation }}</p>
                    </div>
                    <span class="text-xs font-medium px-2 py-1 rounded-full" [ngClass]="{
                      'bg-danger-100 text-danger-700': r.urgence === 'CRITIQUE',
                      'bg-warning-100 text-warning-700': r.urgence === 'HAUTE'
                    }">{{ r.urgence }}</span>
                  </div>
                  <div class="flex items-center justify-between mt-2 text-sm">
                    <span>Commander: <strong>{{ r.quantiteRecommandee }}</strong> u.</span>
                    <span class="font-medium text-primary-600">{{ r.coutEstime | number:'1.0-0' }} €</span>
                  </div>
                </div>
              }
            </div>
            <a routerLink="/reapprovisionnement" class="block w-full mt-4 btn-secondary text-center">
              Voir toutes les recommandations
            </a>
          </div>
        </div>
      }
    </div>
  `,
})
export class PrevisionsDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private readonly previsionsService = inject(PrevisionsService);
  private chart: Chart | null = null;

  dashboard = signal<any>(null);
  previsionsStock = signal<PrevisionStock[]>([]);
  recommandations = signal<RecommandationReapprovisionnement[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.createChart(), 200);
  }

  createChart(): void {
    if (!this.chartCanvas?.nativeElement) return;
    
    const labels = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - 6 + i);
      return d.toLocaleDateString('fr-FR', { month: 'short' });
    });
    
    const reel = [42000, 45000, 48000, 52000, 49000, 55000];
    const prevu = [null, null, null, null, null, 55000, 58000, 62000, 60000, 65000, 68000, 72000];
    
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Réel', data: [...reel, ...Array(6).fill(null)], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4, spanGaps: false },
          { label: 'Prévu', data: prevu, borderColor: '#a855f7', borderDash: [5, 5], tension: 0.4 },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } },
    });
  }

  loadData(): void {
    this.previsionsService.getDashboardPrevisions().subscribe({
      next: (d) => this.dashboard.set(d),
      error: () => this.dashboard.set({
        tendanceVentes: 'HAUSSE', croissancePrevue: 8.5, alertesStock: 12, produitsARisque: 3, recommandationsUrgentes: 5, fiabiliteModele: 87
      })
    });

    this.previsionsService.getPrevisionStock().subscribe({
      next: (p) => this.previsionsStock.set(p),
      error: () => this.previsionsStock.set([
        { produitId: '1', produitNom: 'Écran LCD 24"', stockActuel: 45, consommationMoyenne: 8.5, joursRestants: 5, quantiteRecommandee: 100, dateRecommandeeCommande: new Date(), tendanceConsommation: 'HAUSSE' },
        { produitId: '2', produitNom: 'Clavier mécanique', stockActuel: 120, consommationMoyenne: 5.2, joursRestants: 23, quantiteRecommandee: 50, dateRecommandeeCommande: new Date(Date.now() + 86400000 * 10), tendanceConsommation: 'STABLE' },
        { produitId: '3', produitNom: 'Souris gaming', stockActuel: 15, consommationMoyenne: 3.1, joursRestants: 4, quantiteRecommandee: 80, dateRecommandeeCommande: new Date(), tendanceConsommation: 'HAUSSE' },
        { produitId: '4', produitNom: 'Casque audio', stockActuel: 85, consommationMoyenne: 2.8, joursRestants: 30, quantiteRecommandee: 40, dateRecommandeeCommande: new Date(Date.now() + 86400000 * 15), tendanceConsommation: 'STABLE' },
      ])
    });

    this.previsionsService.getRecommandationsReapprovisionnement().subscribe({
      next: (r) => { this.recommandations.set(r); this.isLoading.set(false); },
      error: () => {
        this.recommandations.set([
          { produitId: '3', produitNom: 'Souris gaming', produitReference: 'MS-GAM-001', stockActuel: 15, seuilAlerte: 20, quantiteRecommandee: 80, coutEstime: 2400, urgence: 'CRITIQUE', raisonRecommandation: 'Stock sous le seuil critique, rupture dans 4 jours' },
          { produitId: '1', produitNom: 'Écran LCD 24"', produitReference: 'LCD-24-001', stockActuel: 45, seuilAlerte: 50, quantiteRecommandee: 100, coutEstime: 18000, urgence: 'HAUTE', raisonRecommandation: 'Stock faible, tendance de consommation en hausse' },
          { produitId: '5', produitNom: 'Webcam HD', produitReference: 'WC-HD-002', stockActuel: 28, seuilAlerte: 30, quantiteRecommandee: 50, coutEstime: 2500, urgence: 'NORMALE', raisonRecommandation: 'Approche du seuil d\'alerte' },
        ]);
        this.isLoading.set(false);
      }
    });
  }
}
