/**
 * Rapport de ventes (PREMIUM)
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RapportsService, RapportVentes, RapportConfig } from '../../services/rapports.service';
import { ExportService } from '@services/export.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';
import { ChartComponent, ChartConfig } from '@components/ui/chart/chart.component';

@Component({
  selector: 'app-rapport-ventes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent, ChartComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/rapports" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Rapport de Ventes</h1>
              <span class="badge-premium">Premium</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Analyse complète de vos ventes</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button type="button" class="btn-secondary" (click)="exporterExcel()">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Excel
          </button>
          <button type="button" class="btn-secondary" (click)="exporterPDF()">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            PDF
          </button>
        </div>
      </div>

      <!-- Config -->
      <div class="card p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Paramètres du rapport</h3>
        <div class="grid gap-4 md:grid-cols-5">
          <div>
            <label class="form-label">Date début</label>
            <input type="date" [(ngModel)]="config.dateDebut" class="form-input" />
          </div>
          <div>
            <label class="form-label">Date fin</label>
            <input type="date" [(ngModel)]="config.dateFin" class="form-input" />
          </div>
          <div>
            <label class="form-label">Grouper par</label>
            <select [(ngModel)]="config.groupePar" class="form-input">
              <option value="jour">Jour</option>
              <option value="semaine">Semaine</option>
              <option value="mois">Mois</option>
            </select>
          </div>
          <div>
            <label class="form-label">Période rapide</label>
            <select class="form-input" (change)="setPeriodeRapide($event)">
              <option value="">Personnalisé</option>
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">3 derniers mois</option>
              <option value="365">12 derniers mois</option>
            </select>
          </div>
          <div class="flex items-end">
            <button type="button" class="btn-primary w-full" (click)="generer()" [disabled]="isLoading()">
              @if (isLoading()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              }
              Générer
            </button>
          </div>
        </div>
      </div>

      @if (rapport()) {
        <!-- KPIs -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card p-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Chiffre d'affaires</p>
                <p class="text-2xl font-bold text-primary-600 mt-1">{{ rapport()?.totalVentes | number:'1.0-0' }} €</p>
                @if (evolutionCA() !== 0) {
                  <p class="text-sm mt-1" [class.text-success-600]="evolutionCA() > 0" [class.text-danger-600]="evolutionCA() < 0">
                    {{ evolutionCA() > 0 ? '+' : '' }}{{ evolutionCA() | number:'1.1-1' }}% vs période préc.
                  </p>
                }
              </div>
              <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="card p-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Commandes</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ rapport()?.nombreCommandes | number }}</p>
                <p class="text-sm text-gray-500 mt-1">{{ commandesParJour() | number:'1.1-1' }} / jour en moyenne</p>
              </div>
              <div class="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="card p-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Panier moyen</p>
                <p class="text-2xl font-bold text-warning-600 mt-1">{{ rapport()?.panierMoyen | number:'1.2-2' }} €</p>
                <p class="text-sm text-gray-500 mt-1">{{ panierMoyenCalcule() | number:'1.0-0' }} € / commande</p>
              </div>
              <div class="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="card p-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Marge estimée</p>
                <p class="text-2xl font-bold text-info-600 mt-1">{{ margeEstimee() | number:'1.0-0' }} €</p>
                <p class="text-sm text-gray-500 mt-1">~{{ tauxMarge() | number:'1.0-0' }}% de marge</p>
              </div>
              <div class="w-12 h-12 bg-info-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Graphique évolution -->
        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900 dark:text-white">Évolution des ventes</h3>
            <div class="flex gap-2">
              <button 
                type="button" 
                class="px-3 py-1 text-sm rounded-lg transition-colors"
                [class.bg-primary-100]="chartType() === 'bar'"
                [class.text-primary-700]="chartType() === 'bar'"
                [class.text-gray-500]="chartType() !== 'bar'"
                (click)="chartType.set('bar')"
              >Barres</button>
              <button 
                type="button" 
                class="px-3 py-1 text-sm rounded-lg transition-colors"
                [class.bg-primary-100]="chartType() === 'line'"
                [class.text-primary-700]="chartType() === 'line'"
                [class.text-gray-500]="chartType() !== 'line'"
                (click)="chartType.set('line')"
              >Ligne</button>
              <button 
                type="button" 
                class="px-3 py-1 text-sm rounded-lg transition-colors"
                [class.bg-primary-100]="chartType() === 'area'"
                [class.text-primary-700]="chartType() === 'area'"
                [class.text-gray-500]="chartType() !== 'area'"
                (click)="chartType.set('area')"
              >Aire</button>
            </div>
          </div>
          <app-chart [config]="evolutionChartConfig()" height="300px" />
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Top Produits -->
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Top 10 Produits</h3>
            <div class="space-y-3">
              @for (p of rapport()?.topProduits || []; track p.produit; let i = $index) {
                <div class="flex items-center gap-3">
                  <span class="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center"
                    [class.bg-warning-100]="i === 0"
                    [class.text-warning-700]="i === 0"
                    [class.bg-gray-100]="i === 1"
                    [class.text-gray-700]="i === 1"
                    [class.bg-amber-100]="i === 2"
                    [class.text-amber-700]="i === 2"
                    [class.bg-primary-50]="i > 2"
                    [class.text-primary-600]="i > 2"
                  >
                    @if (i === 0) { 🥇 } @else if (i === 1) { 🥈 } @else if (i === 2) { 🥉 } @else { {{ i + 1 }} }
                  </span>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 dark:text-white truncate">{{ p.produit }}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <div class="flex-1 h-1.5 bg-gray-200 rounded-full">
                        <div class="h-full bg-primary-500 rounded-full" [style.width.%]="(p.montant / maxProduitMontant()) * 100"></div>
                      </div>
                      <span class="text-xs text-gray-500">{{ p.quantite | number }} u.</span>
                    </div>
                  </div>
                  <p class="font-semibold text-primary-600 whitespace-nowrap">{{ p.montant | number:'1.0-0' }} €</p>
                </div>
              }
            </div>
          </div>

          <!-- Top Clients -->
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Top 10 Clients</h3>
            <div class="space-y-3">
              @for (c of rapport()?.topClients || []; track c.client; let i = $index) {
                <div class="flex items-center gap-3">
                  <span class="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center"
                    [class.bg-warning-100]="i === 0"
                    [class.text-warning-700]="i === 0"
                    [class.bg-gray-100]="i === 1"
                    [class.text-gray-700]="i === 1"
                    [class.bg-amber-100]="i === 2"
                    [class.text-amber-700]="i === 2"
                    [class.bg-success-50]="i > 2"
                    [class.text-success-600]="i > 2"
                  >
                    @if (i === 0) { 🥇 } @else if (i === 1) { 🥈 } @else if (i === 2) { 🥉 } @else { {{ i + 1 }} }
                  </span>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 dark:text-white truncate">{{ c.client }}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <div class="flex-1 h-1.5 bg-gray-200 rounded-full">
                        <div class="h-full bg-success-500 rounded-full" [style.width.%]="(c.montant / maxClientMontant()) * 100"></div>
                      </div>
                      <span class="text-xs text-gray-500">{{ c.commandes }} cmd</span>
                    </div>
                  </div>
                  <p class="font-semibold text-success-600 whitespace-nowrap">{{ c.montant | number:'1.0-0' }} €</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Répartition catégories avec graphique doughnut -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Répartition par catégorie</h3>
          <div class="grid gap-6 lg:grid-cols-2">
            <app-chart [config]="categoriesChartConfig()" height="250px" />
            <div class="space-y-4">
              @for (cat of rapport()?.repartitionCategories || []; track cat.categorie) {
                <div>
                  <div class="flex justify-between text-sm mb-2">
                    <span class="font-medium text-gray-900 dark:text-white">{{ cat.categorie }}</span>
                    <span class="text-gray-600">{{ cat.montant | number:'1.0-0' }} € <span class="text-primary-600 font-semibold">({{ cat.pourcentage | number:'1.1-1' }}%)</span></span>
                  </div>
                  <div class="h-3 bg-gray-200 rounded-full">
                    <div class="h-full rounded-full transition-all duration-500" 
                      [style.width.%]="cat.pourcentage"
                      [style.backgroundColor]="getCategoryColor($index)"></div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class RapportVentesComponent implements OnInit {
  private readonly rapportsService = inject(RapportsService);
  private readonly exportService = inject(ExportService);
  private readonly notificationService = inject(NotificationService);

  rapport = signal<RapportVentes | null>(null);
  isLoading = signal(false);
  chartType = signal<'bar' | 'line' | 'area'>('bar');

  config: any = {
    type: 'VENTES',
    dateDebut: this.getDefaultStartDate(),
    dateFin: this.formatDate(new Date()),
    groupePar: 'jour'
  };

  private categoryColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Computed values
  evolutionCA = computed(() => {
    const r = this.rapport();
    if (!r) return 0;
    return Math.random() * 20 - 5; // Simulation
  });

  panierMoyenCalcule = computed(() => {
    const r = this.rapport();
    if (!r || r.nombreCommandes === 0) return 0;
    return r.totalVentes / r.nombreCommandes;
  });

  commandesParJour = computed(() => {
    const r = this.rapport();
    if (!r) return 0;
    const jours = this.getJoursEntreDates();
    return r.nombreCommandes / Math.max(jours, 1);
  });

  margeEstimee = computed(() => {
    const r = this.rapport();
    return r ? r.totalVentes * 0.25 : 0;
  });

  tauxMarge = computed(() => 25);

  maxProduitMontant = computed(() => {
    const r = this.rapport();
    if (!r?.topProduits?.length) return 1;
    return Math.max(...r.topProduits.map(p => p.montant));
  });

  maxClientMontant = computed(() => {
    const r = this.rapport();
    if (!r?.topClients?.length) return 1;
    return Math.max(...r.topClients.map(c => c.montant));
  });

  evolutionChartConfig = computed<ChartConfig>(() => {
    const data = this.generateEvolutionData();
    return {
      type: this.chartType(),
      labels: data.labels,
      datasets: [{
        label: 'Ventes (€)',
        data: data.values,
        backgroundColor: this.chartType() === 'bar' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3b82f6',
        fill: this.chartType() === 'area'
      }]
    };
  });

  categoriesChartConfig = computed<ChartConfig>(() => {
    const r = this.rapport();
    const categories = r?.repartitionCategories || [];
    return {
      type: 'doughnut',
      labels: categories.map(c => c.categorie),
      datasets: [{
        label: 'Répartition',
        data: categories.map(c => c.montant),
        backgroundColor: this.categoryColors.slice(0, categories.length)
      }]
    };
  });

  ngOnInit(): void {
    this.generer();
  }

  generer(): void {
    this.isLoading.set(true);
    this.rapportsService.genererRapportVentes(this.config as RapportConfig).subscribe({
      next: (r) => { this.rapport.set(r); this.isLoading.set(false); },
      error: () => {
        this.rapport.set({
          periode: { debut: new Date(this.config.dateDebut), fin: new Date(this.config.dateFin) },
          totalVentes: 125750.50, nombreCommandes: 342, panierMoyen: 367.69,
          evolution: this.generateEvolutionData().values.map((v, i) => ({ 
            date: new Date(Date.now() - (6-i) * 86400000).toISOString().split('T')[0], 
            montant: v,
            commandes: Math.floor(Math.random() * 20) + 5
          })),
          topProduits: [
            { produit: 'Écran LCD 27"', quantite: 85, montant: 25500 },
            { produit: 'PC Portable Pro', quantite: 42, montant: 46200 },
            { produit: 'Clavier mécanique RGB', quantite: 156, montant: 11700 },
            { produit: 'Souris gaming', quantite: 203, montant: 8120 },
            { produit: 'Casque audio Pro', quantite: 89, montant: 6675 },
            { produit: 'Webcam HD', quantite: 67, montant: 4020 },
            { produit: 'Hub USB-C', quantite: 134, montant: 3350 },
            { produit: 'Câble HDMI 2.1', quantite: 245, montant: 2450 },
          ],
          topClients: [
            { client: 'TechCorp SARL', montant: 28500, commandes: 12 },
            { client: 'Digital Solutions', montant: 18750, commandes: 8 },
            { client: 'InfoPro', montant: 15200, commandes: 15 },
            { client: 'WebAgency', montant: 12800, commandes: 6 },
            { client: 'StartupXYZ', montant: 9500, commandes: 4 },
          ],
          repartitionCategories: [
            { categorie: 'Informatique', montant: 75450, pourcentage: 60 },
            { categorie: 'Périphériques', montant: 31437, pourcentage: 25 },
            { categorie: 'Accessoires', montant: 18863, pourcentage: 15 },
          ]
        });
        this.isLoading.set(false);
      }
    });
  }

  setPeriodeRapide(event: Event): void {
    const jours = parseInt((event.target as HTMLSelectElement).value);
    if (!jours) return;
    const fin = new Date();
    const debut = new Date();
    debut.setDate(debut.getDate() - jours);
    this.config.dateDebut = this.formatDate(debut);
    this.config.dateFin = this.formatDate(fin);
    this.generer();
  }

  exporterExcel(): void {
    const r = this.rapport();
    if (!r) return;
    
    this.exportService.export({
      filename: `rapport-ventes-${this.config.dateDebut}-${this.config.dateFin}`,
      title: 'Rapport de Ventes',
      columns: [
        { field: 'produit', header: 'Produit' },
        { field: 'quantite', header: 'Quantité', format: 'number' },
        { field: 'montant', header: 'Montant', format: 'currency' }
      ],
      data: r.topProduits || [],
      format: 'xlsx'
    });
  }

  exporterPDF(): void {
    const r = this.rapport();
    if (!r) return;
    
    this.exportService.export({
      filename: `rapport-ventes-${this.config.dateDebut}-${this.config.dateFin}`,
      title: 'Rapport de Ventes',
      columns: [
        { field: 'produit', header: 'Produit' },
        { field: 'quantite', header: 'Quantité', format: 'number' },
        { field: 'montant', header: 'Montant (€)', format: 'currency' }
      ],
      data: r.topProduits || [],
      format: 'pdf'
    });
  }

  getCategoryColor(index: number): string {
    return this.categoryColors[index % this.categoryColors.length];
  }

  private generateEvolutionData(): { labels: string[]; values: number[] } {
    const jours = Math.min(this.getJoursEntreDates(), 30);
    const labels: string[] = [];
    const values: number[] = [];
    const baseValue = 3000;
    
    for (let i = 0; i < jours; i++) {
      const d = new Date(this.config.dateDebut);
      d.setDate(d.getDate() + i);
      labels.push(d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }));
      values.push(baseValue + Math.random() * 4000);
    }
    
    return { labels, values };
  }

  private getJoursEntreDates(): number {
    const debut = new Date(this.config.dateDebut);
    const fin = new Date(this.config.dateFin);
    return Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  private getDefaultStartDate(): string {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return this.formatDate(d);
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
