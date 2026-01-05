/**
 * Rapport Clients avancé (PREMIUM)
 */
import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { ExportService } from '@services/export.service';

Chart.register(...registerables);

interface ClientStats {
  id: string;
  nom: string;
  email: string;
  totalAchats: number;
  nombreCommandes: number;
  panierMoyen: number;
  derniereCommande: Date;
  segment: 'VIP' | 'FIDELE' | 'REGULIER' | 'OCCASIONNEL' | 'INACTIF';
  tendance: 'HAUSSE' | 'STABLE' | 'BAISSE';
  scoreEngagement: number;
}

@Component({
  selector: 'app-rapport-clients',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a routerLink="/rapports" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Rapport Clients</h1>
              <span class="badge-premium">Premium</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Analyse comportementale et segmentation</p>
          </div>
        </div>
        <div class="flex gap-2">
          <select [(ngModel)]="periode" (change)="loadData()" class="form-input">
            <option value="30">30 derniers jours</option>
            <option value="90">3 derniers mois</option>
            <option value="180">6 derniers mois</option>
            <option value="365">12 derniers mois</option>
          </select>
          <button type="button" class="btn-secondary" (click)="exporterRapport()">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Exporter
          </button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="card p-4">
          <p class="text-sm text-gray-500">Clients actifs</p>
          <p class="text-2xl font-bold text-primary-600">{{ kpis().clientsActifs }}</p>
          <p class="text-xs text-success-600 mt-1">+{{ kpis().nouveauxClients }} ce mois</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">CA Total</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ kpis().caTotal | number:'1.0-0' }} €</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Panier moyen</p>
          <p class="text-2xl font-bold text-success-600">{{ kpis().panierMoyen | number:'1.0-0' }} €</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Taux fidélisation</p>
          <p class="text-2xl font-bold text-warning-600">{{ kpis().tauxFidelisation }}%</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">LTV moyen</p>
          <p class="text-2xl font-bold text-purple-600">{{ kpis().ltvMoyen | number:'1.0-0' }} €</p>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Segmentation -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Segmentation clients</h3>
          <div class="h-64">
            <canvas #segmentChart></canvas>
          </div>
          <div class="grid grid-cols-5 gap-2 mt-4 text-center text-xs">
            <div class="p-2 bg-purple-100 rounded">
              <p class="font-bold text-purple-700">{{ getSegmentCount('VIP') }}</p>
              <p class="text-purple-600">VIP</p>
            </div>
            <div class="p-2 bg-primary-100 rounded">
              <p class="font-bold text-primary-700">{{ getSegmentCount('FIDELE') }}</p>
              <p class="text-primary-600">Fidèles</p>
            </div>
            <div class="p-2 bg-success-100 rounded">
              <p class="font-bold text-success-700">{{ getSegmentCount('REGULIER') }}</p>
              <p class="text-success-600">Réguliers</p>
            </div>
            <div class="p-2 bg-warning-100 rounded">
              <p class="font-bold text-warning-700">{{ getSegmentCount('OCCASIONNEL') }}</p>
              <p class="text-warning-600">Occasionnels</p>
            </div>
            <div class="p-2 bg-gray-100 rounded">
              <p class="font-bold text-gray-700">{{ getSegmentCount('INACTIF') }}</p>
              <p class="text-gray-600">Inactifs</p>
            </div>
          </div>
        </div>

        <!-- Évolution CA par segment -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">CA par segment</h3>
          <div class="h-64">
            <canvas #caChart></canvas>
          </div>
        </div>
      </div>

      <!-- Top clients -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900 dark:text-white">Top 10 Clients</h3>
          <div class="flex gap-2">
            <button type="button" 
              class="px-3 py-1 text-sm rounded-lg"
              [class.bg-primary-100]="sortBy === 'ca'"
              [class.text-primary-700]="sortBy === 'ca'"
              [class.text-gray-500]="sortBy !== 'ca'"
              (click)="sortBy = 'ca'"
            >Par CA</button>
            <button type="button" 
              class="px-3 py-1 text-sm rounded-lg"
              [class.bg-primary-100]="sortBy === 'commandes'"
              [class.text-primary-700]="sortBy === 'commandes'"
              [class.text-gray-500]="sortBy !== 'commandes'"
              (click)="sortBy = 'commandes'"
            >Par commandes</button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-3 px-4 font-medium">#</th>
                <th class="text-left py-3 px-4 font-medium">Client</th>
                <th class="text-left py-3 px-4 font-medium">Segment</th>
                <th class="text-right py-3 px-4 font-medium">CA Total</th>
                <th class="text-right py-3 px-4 font-medium">Commandes</th>
                <th class="text-right py-3 px-4 font-medium">Panier moy.</th>
                <th class="text-center py-3 px-4 font-medium">Tendance</th>
                <th class="text-center py-3 px-4 font-medium">Engagement</th>
              </tr>
            </thead>
            <tbody>
              @for (client of topClients(); track client.id; let i = $index) {
                <tr class="border-b hover:bg-gray-50">
                  <td class="py-3 px-4 font-medium text-gray-500">{{ i + 1 }}</td>
                  <td class="py-3 px-4">
                    <a [routerLink]="['/clients', client.id]" class="font-medium text-gray-900 hover:text-primary-600">
                      {{ client.nom }}
                    </a>
                    <p class="text-xs text-gray-500">{{ client.email }}</p>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-1 text-xs font-medium rounded-full"
                      [class.bg-purple-100]="client.segment === 'VIP'"
                      [class.text-purple-700]="client.segment === 'VIP'"
                      [class.bg-primary-100]="client.segment === 'FIDELE'"
                      [class.text-primary-700]="client.segment === 'FIDELE'"
                      [class.bg-success-100]="client.segment === 'REGULIER'"
                      [class.text-success-700]="client.segment === 'REGULIER'"
                      [class.bg-warning-100]="client.segment === 'OCCASIONNEL'"
                      [class.text-warning-700]="client.segment === 'OCCASIONNEL'"
                    >{{ client.segment }}</span>
                  </td>
                  <td class="py-3 px-4 text-right font-semibold">{{ client.totalAchats | number:'1.0-0' }} €</td>
                  <td class="py-3 px-4 text-right">{{ client.nombreCommandes }}</td>
                  <td class="py-3 px-4 text-right">{{ client.panierMoyen | number:'1.0-0' }} €</td>
                  <td class="py-3 px-4 text-center">
                    @if (client.tendance === 'HAUSSE') {
                      <svg class="w-5 h-5 text-success-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                      </svg>
                    } @else if (client.tendance === 'BAISSE') {
                      <svg class="w-5 h-5 text-danger-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"/>
                      </svg>
                    } @else {
                      <svg class="w-5 h-5 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"/>
                      </svg>
                    }
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center justify-center">
                      <div class="w-16 h-2 bg-gray-200 rounded-full">
                        <div class="h-full rounded-full"
                          [class.bg-success-500]="client.scoreEngagement >= 70"
                          [class.bg-warning-500]="client.scoreEngagement >= 40 && client.scoreEngagement < 70"
                          [class.bg-danger-500]="client.scoreEngagement < 40"
                          [style.width.%]="client.scoreEngagement"
                        ></div>
                      </div>
                      <span class="ml-2 text-xs text-gray-500">{{ client.scoreEngagement }}%</span>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Insights IA -->
      <div class="card p-6 bg-gradient-to-r from-purple-50 to-primary-50 dark:from-purple-900/20 dark:to-primary-900/20">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 dark:text-white">Insights IA</h3>
        </div>
        <div class="grid gap-4 md:grid-cols-3">
          <div class="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <p class="text-sm font-medium text-danger-600 mb-1">⚠️ Risque d'attrition</p>
            <p class="text-sm text-gray-600">{{ kpis().clientsRisque }} clients à risque de départ. Recommandation: campagne de fidélisation ciblée.</p>
          </div>
          <div class="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <p class="text-sm font-medium text-success-600 mb-1">🎯 Opportunité upsell</p>
            <p class="text-sm text-gray-600">{{ kpis().opportunitesUpsell }} clients réguliers éligibles à une montée en gamme. Potentiel: +{{ kpis().potentielUpsell | number:'1.0-0' }} €.</p>
          </div>
          <div class="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <p class="text-sm font-medium text-primary-600 mb-1">📈 Croissance</p>
            <p class="text-sm text-gray-600">Le segment VIP a augmenté de 15% ce trimestre. Focus recommandé sur les fidèles pour conversion.</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RapportClientsComponent implements OnInit, AfterViewInit {
  @ViewChild('segmentChart') segmentChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('caChart') caChart!: ElementRef<HTMLCanvasElement>;

  private readonly exportService = inject(ExportService);
  private chart1: Chart | null = null;
  private chart2: Chart | null = null;

  periode = '90';
  sortBy: 'ca' | 'commandes' = 'ca';
  clients = signal<ClientStats[]>([]);
  kpis = signal({
    clientsActifs: 0, nouveauxClients: 0, caTotal: 0, panierMoyen: 0,
    tauxFidelisation: 0, ltvMoyen: 0, clientsRisque: 0, opportunitesUpsell: 0, potentielUpsell: 0
  });

  topClients = computed(() => {
    const sorted = [...this.clients()];
    return sorted.sort((a, b) => 
      this.sortBy === 'ca' ? b.totalAchats - a.totalAchats : b.nombreCommandes - a.nombreCommandes
    ).slice(0, 10);
  });

  ngOnInit(): void { this.loadData(); }
  ngAfterViewInit(): void { setTimeout(() => this.createCharts(), 100); }

  loadData(): void {
    // Mock data
    this.clients.set([
      { id: '1', nom: 'TechCorp SARL', email: 'contact@techcorp.fr', totalAchats: 125000, nombreCommandes: 45, panierMoyen: 2778, derniereCommande: new Date(), segment: 'VIP', tendance: 'HAUSSE', scoreEngagement: 92 },
      { id: '2', nom: 'Digital Solutions', email: 'achat@digitalsol.fr', totalAchats: 89500, nombreCommandes: 32, panierMoyen: 2797, derniereCommande: new Date(Date.now() - 7*86400000), segment: 'VIP', tendance: 'STABLE', scoreEngagement: 85 },
      { id: '3', nom: 'StartupXYZ', email: 'hello@startupxyz.io', totalAchats: 45000, nombreCommandes: 18, panierMoyen: 2500, derniereCommande: new Date(Date.now() - 14*86400000), segment: 'FIDELE', tendance: 'HAUSSE', scoreEngagement: 78 },
      { id: '4', nom: 'InfoPro', email: 'commandes@infopro.com', totalAchats: 38000, nombreCommandes: 25, panierMoyen: 1520, derniereCommande: new Date(Date.now() - 5*86400000), segment: 'FIDELE', tendance: 'STABLE', scoreEngagement: 72 },
      { id: '5', nom: 'WebAgency', email: 'pro@webagency.fr', totalAchats: 28500, nombreCommandes: 12, panierMoyen: 2375, derniereCommande: new Date(Date.now() - 21*86400000), segment: 'REGULIER', tendance: 'BAISSE', scoreEngagement: 55 },
      { id: '6', nom: 'ComputerShop', email: 'achat@computershop.fr', totalAchats: 22000, nombreCommandes: 15, panierMoyen: 1467, derniereCommande: new Date(Date.now() - 10*86400000), segment: 'REGULIER', tendance: 'STABLE', scoreEngagement: 65 },
      { id: '7', nom: 'MicroEntreprise', email: 'contact@micro.fr', totalAchats: 15000, nombreCommandes: 8, panierMoyen: 1875, derniereCommande: new Date(Date.now() - 30*86400000), segment: 'OCCASIONNEL', tendance: 'STABLE', scoreEngagement: 42 },
      { id: '8', nom: 'BureauPlus', email: 'achats@bureauplus.fr', totalAchats: 12500, nombreCommandes: 6, panierMoyen: 2083, derniereCommande: new Date(Date.now() - 45*86400000), segment: 'OCCASIONNEL', tendance: 'BAISSE', scoreEngagement: 35 },
    ]);

    this.kpis.set({
      clientsActifs: 342, nouveauxClients: 28, caTotal: 856000, panierMoyen: 2504,
      tauxFidelisation: 68, ltvMoyen: 8500, clientsRisque: 15, opportunitesUpsell: 45, potentielUpsell: 125000
    });
  }

  getSegmentCount(segment: string): number {
    return this.clients().filter(c => c.segment === segment).length;
  }

  createCharts(): void {
    if (this.segmentChart?.nativeElement) {
      this.chart1 = new Chart(this.segmentChart.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['VIP', 'Fidèles', 'Réguliers', 'Occasionnels', 'Inactifs'],
          datasets: [{
            data: [12, 45, 89, 156, 40],
            backgroundColor: ['#9333ea', '#3b82f6', '#22c55e', '#f59e0b', '#9ca3af']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
      });
    }

    if (this.caChart?.nativeElement) {
      this.chart2 = new Chart(this.caChart.nativeElement, {
        type: 'bar',
        data: {
          labels: ['VIP', 'Fidèles', 'Réguliers', 'Occasionnels'],
          datasets: [{
            label: 'CA (k€)',
            data: [450, 220, 120, 66],
            backgroundColor: ['#9333ea', '#3b82f6', '#22c55e', '#f59e0b']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    }
  }

  exporterRapport(): void {
    this.exportService.export({
      filename: `rapport-clients-${new Date().toISOString().split('T')[0]}`,
      title: 'Rapport Clients',
      columns: [
        { field: 'nom', header: 'Client' },
        { field: 'segment', header: 'Segment' },
        { field: 'totalAchats', header: 'CA Total', format: 'currency' },
        { field: 'nombreCommandes', header: 'Commandes', format: 'number' },
        { field: 'panierMoyen', header: 'Panier moyen', format: 'currency' }
      ],
      data: this.clients(),
      format: 'xlsx'
    });
  }
}
