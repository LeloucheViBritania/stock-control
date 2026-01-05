/**
 * Prévisions par Produit (PREMIUM)
 * Analyse détaillée des prévisions pour un produit spécifique
 */
import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface PrevisionProduit {
  date: Date;
  quantitePrevue: number;
  quantiteReelle?: number;
  ecart?: number;
  confiance: number;
}

interface FacteurInfluence {
  nom: string;
  impact: number; // -100 à +100
  description: string;
}

@Component({
  selector: 'app-previsions-produit',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a routerLink="/previsions" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ produit().nom }}</h1>
              <span class="badge-premium">Premium</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Prévisions de demande et recommandations</p>
          </div>
        </div>
        <div class="flex gap-2">
          <select [(ngModel)]="horizon" (change)="updatePrevisions()" class="form-input">
            <option value="7">7 jours</option>
            <option value="14">14 jours</option>
            <option value="30">30 jours</option>
            <option value="90">90 jours</option>
          </select>
          <button type="button" class="btn-secondary" (click)="exporterPrevisions()">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Exporter
          </button>
        </div>
      </div>

      <!-- Info produit -->
      <div class="card p-6">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ produit().nom }}</h2>
              <p class="text-gray-500">Réf: {{ produit().reference }} | {{ produit().categorie }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">Stock actuel</p>
            <p class="text-3xl font-bold" [class.text-danger-600]="produit().stock < produit().seuilMin">
              {{ produit().stock }}
            </p>
            <p class="text-xs text-gray-400">Seuil min: {{ produit().seuilMin }}</p>
          </div>
        </div>
      </div>

      <!-- KPIs prévisions -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card p-4">
          <p class="text-sm text-gray-500">Demande prévue ({{ horizon }}j)</p>
          <p class="text-2xl font-bold text-primary-600">{{ demandePrevue() }}</p>
          <p class="text-xs text-gray-400 mt-1">unités</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Jours avant rupture</p>
          <p class="text-2xl font-bold" 
            [class.text-danger-600]="joursAvantRupture() <= 7"
            [class.text-warning-600]="joursAvantRupture() > 7 && joursAvantRupture() <= 14"
            [class.text-success-600]="joursAvantRupture() > 14"
          >{{ joursAvantRupture() }}</p>
          <p class="text-xs text-gray-400 mt-1">jours estimés</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Fiabilité prévisions</p>
          <p class="text-2xl font-bold text-success-600">{{ fiabilite() }}%</p>
          <p class="text-xs text-gray-400 mt-1">sur 30 jours</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Qté recommandée</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ quantiteRecommandee() }}</p>
          <p class="text-xs text-gray-400 mt-1">à commander</p>
        </div>
      </div>

      <!-- Graphique prévisions -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900 dark:text-white">Évolution des ventes et prévisions</h3>
          <div class="flex gap-4 text-sm">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-primary-500"></span>
              <span class="text-gray-600">Réel</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-purple-500"></span>
              <span class="text-gray-600">Prévu</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-8 h-3 bg-purple-200 rounded"></span>
              <span class="text-gray-600">Intervalle confiance</span>
            </div>
          </div>
        </div>
        <div class="h-80">
          <canvas #chartCanvas></canvas>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Facteurs d'influence -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Facteurs d'influence</h3>
          <div class="space-y-4">
            @for (facteur of facteurs(); track facteur.nom) {
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ facteur.nom }}</span>
                  <span class="text-sm font-semibold"
                    [class.text-success-600]="facteur.impact > 0"
                    [class.text-danger-600]="facteur.impact < 0"
                  >{{ facteur.impact > 0 ? '+' : '' }}{{ facteur.impact }}%</span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                  @if (facteur.impact > 0) {
                    <div class="h-full bg-success-500 rounded-full" [style.width.%]="facteur.impact"></div>
                  } @else {
                    <div class="h-full bg-danger-500 rounded-full ml-auto" [style.width.%]="-facteur.impact"></div>
                  }
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ facteur.description }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Recommandations IA -->
        <div class="card p-6 bg-gradient-to-br from-purple-50 to-primary-50 dark:from-purple-900/20 dark:to-primary-900/20">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white">Recommandations IA</h3>
          </div>
          
          <div class="space-y-3">
            @for (reco of recommandations(); track reco.titre) {
              <div class="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div class="flex items-start gap-2">
                  <span class="text-lg">{{ reco.icon }}</span>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ reco.titre }}</p>
                    <p class="text-sm text-gray-600 mt-1">{{ reco.description }}</p>
                  </div>
                </div>
              </div>
            }
          </div>

          <button type="button" class="btn-primary w-full mt-4" (click)="appliquerRecommandation()">
            Créer commande recommandée
          </button>
        </div>
      </div>

      <!-- Historique vs prévisions -->
      <div class="card p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Précision des prévisions passées</h3>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="text-left py-2 px-4 font-medium text-gray-600">Période</th>
                <th class="text-right py-2 px-4 font-medium text-gray-600">Prévu</th>
                <th class="text-right py-2 px-4 font-medium text-gray-600">Réel</th>
                <th class="text-right py-2 px-4 font-medium text-gray-600">Écart</th>
                <th class="text-center py-2 px-4 font-medium text-gray-600">Précision</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              @for (h of historiquePrecision(); track h.periode) {
                <tr>
                  <td class="py-2 px-4 text-gray-700">{{ h.periode }}</td>
                  <td class="py-2 px-4 text-right font-mono">{{ h.prevu }}</td>
                  <td class="py-2 px-4 text-right font-mono">{{ h.reel }}</td>
                  <td class="py-2 px-4 text-right"
                    [class.text-success-600]="h.ecart >= 0"
                    [class.text-danger-600]="h.ecart < 0"
                  >{{ h.ecart > 0 ? '+' : '' }}{{ h.ecart }}</td>
                  <td class="py-2 px-4 text-center">
                    <span class="px-2 py-1 text-xs rounded-full"
                      [class.bg-success-100]="h.precision >= 90"
                      [class.text-success-700]="h.precision >= 90"
                      [class.bg-warning-100]="h.precision >= 70 && h.precision < 90"
                      [class.text-warning-700]="h.precision >= 70 && h.precision < 90"
                      [class.bg-danger-100]="h.precision < 70"
                      [class.text-danger-700]="h.precision < 70"
                    >{{ h.precision }}%</span>
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
export class PrevisionsProduitComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;
  private route = inject(ActivatedRoute);

  horizon = '30';
  
  produit = signal({
    id: '1', nom: 'Écran LCD 27" HD', reference: 'ECR-027-HD', categorie: 'Informatique',
    stock: 45, seuilMin: 20, seuilMax: 150, prixVente: 299
  });

  previsions = signal<PrevisionProduit[]>([]);
  facteurs = signal<FacteurInfluence[]>([]);
  recommandations = signal<{icon: string; titre: string; description: string}[]>([]);
  historiquePrecision = signal<{periode: string; prevu: number; reel: number; ecart: number; precision: number}[]>([]);

  demandePrevue = computed(() => this.previsions().reduce((sum, p) => sum + p.quantitePrevue, 0));
  joursAvantRupture = computed(() => {
    const demandeMoyenne = this.demandePrevue() / parseInt(this.horizon);
    return demandeMoyenne > 0 ? Math.floor(this.produit().stock / demandeMoyenne) : 999;
  });
  fiabilite = signal(87);
  quantiteRecommandee = computed(() => Math.max(0, this.demandePrevue() + this.produit().seuilMin - this.produit().stock));

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.createChart(), 100);
  }

  loadData(): void {
    // Prévisions
    const previsions: PrevisionProduit[] = [];
    for (let i = 0; i < parseInt(this.horizon); i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      previsions.push({
        date,
        quantitePrevue: Math.floor(Math.random() * 5) + 2,
        confiance: 85 + Math.random() * 10
      });
    }
    this.previsions.set(previsions);

    // Facteurs
    this.facteurs.set([
      { nom: 'Saisonnalité', impact: 15, description: 'Hausse habituelle en début d\'année' },
      { nom: 'Tendance marché', impact: 8, description: 'Croissance du segment écrans' },
      { nom: 'Promotion concurrent', impact: -12, description: 'Offre agressive détectée' },
      { nom: 'Stock concurrent', impact: 5, description: 'Ruptures signalées chez 2 concurrents' },
    ]);

    // Recommandations
    this.recommandations.set([
      { icon: '📦', titre: 'Commander 80 unités', description: 'Couvrir la demande estimée + stock de sécurité' },
      { icon: '⏰', titre: 'Commander avant le 15/01', description: 'Délai fournisseur de 5 jours' },
      { icon: '💰', titre: 'Négocier remise volume', description: 'Seuil de 100 unités chez ce fournisseur' },
    ]);

    // Historique
    this.historiquePrecision.set([
      { periode: 'Semaine dernière', prevu: 25, reel: 23, ecart: -2, precision: 92 },
      { periode: 'Il y a 2 semaines', prevu: 28, reel: 31, ecart: 3, precision: 89 },
      { periode: 'Il y a 3 semaines', prevu: 22, reel: 20, ecart: -2, precision: 91 },
      { periode: 'Il y a 4 semaines', prevu: 30, reel: 35, ecart: 5, precision: 83 },
    ]);
  }

  updatePrevisions(): void {
    this.loadData();
    if (this.chart) {
      this.chart.destroy();
      this.createChart();
    }
  }

  createChart(): void {
    if (!this.chartCanvas?.nativeElement) return;

    const labels = this.previsions().map(p => p.date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }));
    const prevues = this.previsions().map(p => p.quantitePrevue);
    const reelles = this.previsions().slice(0, 7).map(p => Math.floor(p.quantitePrevue * (0.9 + Math.random() * 0.2)));

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Réel', data: [...reelles, ...Array(prevues.length - reelles.length).fill(null)], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: false, tension: 0.3 },
          { label: 'Prévu', data: prevues, borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.1)', fill: true, borderDash: [5, 5], tension: 0.3 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }

  exporterPrevisions(): void {}
  appliquerRecommandation(): void {}
}
