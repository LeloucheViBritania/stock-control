/**
 * Rapport des alertes stock (PREMIUM)
 */
import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { ExportService } from '@services/export.service';

Chart.register(...registerables);

interface AlerteStock {
  id: string;
  produit: string;
  reference: string;
  categorie: string;
  stockActuel: number;
  seuilAlerte: number;
  seuilCritique: number;
  niveau: 'CRITIQUE' | 'ALERTE' | 'ATTENTION';
  joursStock: number;
  tendance: 'HAUSSE' | 'STABLE' | 'BAISSE';
  dernierMouvement: Date;
  fournisseur?: string;
  delaiAppro?: number;
}

@Component({
  selector: 'app-rapport-alertes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex items-center gap-3">
          <a routerLink="/rapports" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Alertes Stock</h1>
              <span class="badge-premium">Premium</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Surveillance et gestion des seuils</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button type="button" class="btn-secondary" (click)="exporterRapport()">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Exporter
          </button>
          <a routerLink="/reapprovisionnement" class="btn-primary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Réapprovisionner
          </a>
        </div>
      </div>

      <!-- KPIs alertes -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card p-5 border-l-4 border-danger-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Critiques</p>
              <p class="text-3xl font-bold text-danger-600 mt-1">{{ alertesCritiques() }}</p>
            </div>
            <div class="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
          </div>
          <p class="text-sm text-gray-500 mt-2">Action immédiate requise</p>
        </div>
        <div class="card p-5 border-l-4 border-warning-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Alertes</p>
              <p class="text-3xl font-bold text-warning-600 mt-1">{{ alertesWarning() }}</p>
            </div>
            <div class="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <p class="text-sm text-gray-500 mt-2">Sous le seuil d'alerte</p>
        </div>
        <div class="card p-5 border-l-4 border-primary-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Attention</p>
              <p class="text-3xl font-bold text-primary-600 mt-1">{{ alertesAttention() }}</p>
            </div>
            <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <p class="text-sm text-gray-500 mt-2">À surveiller</p>
        </div>
        <div class="card p-5 border-l-4 border-success-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Valeur à risque</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ valeurRisque() | number:'1.0-0' }} €</p>
            </div>
            <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <p class="text-sm text-gray-500 mt-2">Stock restant</p>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Graphique répartition -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Répartition par niveau</h3>
          <div class="h-48">
            <canvas #pieChart></canvas>
          </div>
        </div>

        <!-- Graphique tendance -->
        <div class="lg:col-span-2 card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Évolution des alertes (30 jours)</h3>
          <div class="h-48">
            <canvas #lineChart></canvas>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="card p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">Niveau:</span>
            <div class="flex gap-1">
              <button 
                type="button" 
                class="px-3 py-1.5 text-sm rounded-lg transition-colors"
                [class.bg-gray-900]="filterNiveau === ''"
                [class.text-white]="filterNiveau === ''"
                [class.bg-gray-100]="filterNiveau !== ''"
                (click)="filterNiveau = ''"
              >Tous</button>
              <button 
                type="button" 
                class="px-3 py-1.5 text-sm rounded-lg transition-colors"
                [class.bg-danger-500]="filterNiveau === 'CRITIQUE'"
                [class.text-white]="filterNiveau === 'CRITIQUE'"
                [class.bg-danger-100]="filterNiveau !== 'CRITIQUE'"
                [class.text-danger-700]="filterNiveau !== 'CRITIQUE'"
                (click)="filterNiveau = 'CRITIQUE'"
              >Critiques</button>
              <button 
                type="button" 
                class="px-3 py-1.5 text-sm rounded-lg transition-colors"
                [class.bg-warning-500]="filterNiveau === 'ALERTE'"
                [class.text-white]="filterNiveau === 'ALERTE'"
                [class.bg-warning-100]="filterNiveau !== 'ALERTE'"
                [class.text-warning-700]="filterNiveau !== 'ALERTE'"
                (click)="filterNiveau = 'ALERTE'"
              >Alertes</button>
            </div>
          </div>
          <div class="flex-1">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Rechercher un produit..." 
              class="form-input w-full max-w-xs"
            />
          </div>
          <select [(ngModel)]="sortBy" class="form-input">
            <option value="niveau">Trier par niveau</option>
            <option value="stock">Trier par stock</option>
            <option value="jours">Trier par jours restants</option>
          </select>
        </div>
      </div>

      <!-- Liste des alertes -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Niveau</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Seuils</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Jours stock</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tendance</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              @for (alerte of filteredAlertes(); track alerte.id) {
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td class="px-4 py-4">
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">{{ alerte.produit }}</p>
                      <p class="text-sm text-gray-500">{{ alerte.reference }} • {{ alerte.categorie }}</p>
                    </div>
                  </td>
                  <td class="px-4 py-4 text-center">
                    <span class="px-2.5 py-1 text-xs font-semibold rounded-full"
                      [class.bg-danger-100]="alerte.niveau === 'CRITIQUE'"
                      [class.text-danger-700]="alerte.niveau === 'CRITIQUE'"
                      [class.bg-warning-100]="alerte.niveau === 'ALERTE'"
                      [class.text-warning-700]="alerte.niveau === 'ALERTE'"
                      [class.bg-primary-100]="alerte.niveau === 'ATTENTION'"
                      [class.text-primary-700]="alerte.niveau === 'ATTENTION'"
                    >{{ alerte.niveau }}</span>
                  </td>
                  <td class="px-4 py-4 text-center">
                    <span class="text-lg font-bold" [class.text-danger-600]="alerte.niveau === 'CRITIQUE'">
                      {{ alerte.stockActuel }}
                    </span>
                  </td>
                  <td class="px-4 py-4 text-center text-sm">
                    <span class="text-danger-600">{{ alerte.seuilCritique }}</span> / 
                    <span class="text-warning-600">{{ alerte.seuilAlerte }}</span>
                  </td>
                  <td class="px-4 py-4 text-center">
                    <span class="font-medium" [class.text-danger-600]="alerte.joursStock < 7" [class.text-warning-600]="alerte.joursStock >= 7 && alerte.joursStock < 14">
                      {{ alerte.joursStock }} j
                    </span>
                  </td>
                  <td class="px-4 py-4 text-center">
                    @if (alerte.tendance === 'HAUSSE') {
                      <svg class="w-5 h-5 mx-auto text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                      </svg>
                    } @else if (alerte.tendance === 'BAISSE') {
                      <svg class="w-5 h-5 mx-auto text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                      </svg>
                    } @else {
                      <svg class="w-5 h-5 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"/>
                      </svg>
                    }
                  </td>
                  <td class="px-4 py-4 text-right">
                    <a [routerLink]="['/reapprovisionnement']" [queryParams]="{ produit: alerte.id }" class="btn-sm bg-primary-100 text-primary-700 hover:bg-primary-200">
                      Commander
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class RapportAlertesComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart') lineChartCanvas!: ElementRef<HTMLCanvasElement>;

  private readonly exportService = inject(ExportService);
  private pieChart: Chart | null = null;
  private lineChart: Chart | null = null;

  alertes = signal<AlerteStock[]>([]);
  filterNiveau = '';
  searchQuery = '';
  sortBy = 'niveau';

  alertesCritiques = computed(() => this.alertes().filter(a => a.niveau === 'CRITIQUE').length);
  alertesWarning = computed(() => this.alertes().filter(a => a.niveau === 'ALERTE').length);
  alertesAttention = computed(() => this.alertes().filter(a => a.niveau === 'ATTENTION').length);
  valeurRisque = computed(() => this.alertes().reduce((sum, a) => sum + a.stockActuel * 50, 0)); // Prix moyen 50€

  filteredAlertes = computed(() => {
    let result = this.alertes();
    if (this.filterNiveau) {
      result = result.filter(a => a.niveau === this.filterNiveau);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(a => a.produit.toLowerCase().includes(q) || a.reference.toLowerCase().includes(q));
    }
    // Tri
    result = [...result].sort((a, b) => {
      if (this.sortBy === 'niveau') {
        const order = { 'CRITIQUE': 0, 'ALERTE': 1, 'ATTENTION': 2 };
        return order[a.niveau] - order[b.niveau];
      }
      if (this.sortBy === 'stock') return a.stockActuel - b.stockActuel;
      if (this.sortBy === 'jours') return a.joursStock - b.joursStock;
      return 0;
    });
    return result;
  });

  ngOnInit(): void {
    this.loadAlertes();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.createCharts(), 100);
  }

  loadAlertes(): void {
    this.alertes.set([
      { id: '1', produit: 'Écran LCD 24"', reference: 'LCD-24-001', categorie: 'Informatique', stockActuel: 5, seuilAlerte: 20, seuilCritique: 10, niveau: 'CRITIQUE', joursStock: 3, tendance: 'BAISSE', dernierMouvement: new Date() },
      { id: '2', produit: 'Souris gaming', reference: 'MS-GAM-001', categorie: 'Périphériques', stockActuel: 8, seuilAlerte: 25, seuilCritique: 10, niveau: 'CRITIQUE', joursStock: 5, tendance: 'STABLE', dernierMouvement: new Date() },
      { id: '3', produit: 'Clavier mécanique', reference: 'KB-MECH-001', categorie: 'Périphériques', stockActuel: 18, seuilAlerte: 30, seuilCritique: 15, niveau: 'ALERTE', joursStock: 12, tendance: 'BAISSE', dernierMouvement: new Date() },
      { id: '4', produit: 'Webcam HD', reference: 'WC-HD-001', categorie: 'Périphériques', stockActuel: 22, seuilAlerte: 40, seuilCritique: 20, niveau: 'ALERTE', joursStock: 15, tendance: 'STABLE', dernierMouvement: new Date() },
      { id: '5', produit: 'Câble HDMI', reference: 'HDMI-2M', categorie: 'Accessoires', stockActuel: 45, seuilAlerte: 100, seuilCritique: 50, niveau: 'ALERTE', joursStock: 8, tendance: 'HAUSSE', dernierMouvement: new Date() },
      { id: '6', produit: 'Hub USB-C', reference: 'USB-HUB-4', categorie: 'Accessoires', stockActuel: 35, seuilAlerte: 50, seuilCritique: 25, niveau: 'ATTENTION', joursStock: 20, tendance: 'STABLE', dernierMouvement: new Date() },
    ]);
  }

  createCharts(): void {
    if (this.pieChartCanvas?.nativeElement) {
      this.pieChart = new Chart(this.pieChartCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Critiques', 'Alertes', 'Attention'],
          datasets: [{
            data: [this.alertesCritiques(), this.alertesWarning(), this.alertesAttention()],
            backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6'],
          }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
      });
    }

    if (this.lineChartCanvas?.nativeElement) {
      const labels = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (29 - i));
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      });
      this.lineChart = new Chart(this.lineChartCanvas.nativeElement, {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Critiques', data: labels.map(() => Math.floor(Math.random() * 3) + 1), borderColor: '#ef4444', tension: 0.4 },
            { label: 'Alertes', data: labels.map(() => Math.floor(Math.random() * 5) + 2), borderColor: '#f59e0b', tension: 0.4 },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } },
      });
    }
  }

  exporterRapport(): void {
    this.exportService.export({
      filename: `alertes-stock-${new Date().toISOString().split('T')[0]}`,
      title: 'Rapport Alertes Stock',
      columns: [
        { field: 'produit', header: 'Produit' },
        { field: 'reference', header: 'Référence' },
        { field: 'niveau', header: 'Niveau' },
        { field: 'stockActuel', header: 'Stock', format: 'number' },
        { field: 'joursStock', header: 'Jours stock', format: 'number' },
      ],
      data: this.alertes(),
      format: 'xlsx'
    });
  }
}
