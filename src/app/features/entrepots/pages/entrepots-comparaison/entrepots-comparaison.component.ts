/**
 * Comparaison des Entrepôts (PREMIUM)
 * Analyse comparative multi-entrepôts
 */
import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface EntrepotComparatif {
  id: string;
  nom: string;
  ville: string;
  capaciteMax: number;
  stockActuel: number;
  tauxRemplissage: number;
  valeurStock: number;
  nombreProduits: number;
  mouvementsJour: number;
  efficacite: number;
  coutOperationnel: number;
}

@Component({
  selector: 'app-entrepots-comparaison',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a routerLink="/entrepots" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Comparaison Entrepôts</h1>
              <span class="badge-premium">Premium</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Analyse comparative de performance</p>
          </div>
        </div>
        <button type="button" class="btn-secondary" (click)="exporterComparaison()">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Exporter rapport
        </button>
      </div>

      <!-- Sélection entrepôts -->
      <div class="card p-4">
        <div class="flex flex-wrap gap-3">
          @for (entrepot of entrepots(); track entrepot.id) {
            <label class="flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all"
              [class.bg-primary-100]="entrepotsSelectionnes().includes(entrepot.id)"
              [class.border-primary-500]="entrepotsSelectionnes().includes(entrepot.id)"
              [class.border-2]="entrepotsSelectionnes().includes(entrepot.id)"
              [class.bg-gray-50]="!entrepotsSelectionnes().includes(entrepot.id)"
              [class.hover:bg-gray-100]="!entrepotsSelectionnes().includes(entrepot.id)"
            >
              <input type="checkbox" [checked]="entrepotsSelectionnes().includes(entrepot.id)" 
                (change)="toggleEntrepot(entrepot.id)" class="rounded border-gray-300" />
              <div>
                <p class="font-medium text-gray-900">{{ entrepot.nom }}</p>
                <p class="text-xs text-gray-500">{{ entrepot.ville }}</p>
              </div>
            </label>
          }
        </div>
      </div>

      @if (entrepotsSelectionnes().length >= 2) {
        <!-- Tableau comparatif -->
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="text-left py-3 px-4 font-medium text-gray-600">Métrique</th>
                  @for (id of entrepotsSelectionnes(); track id) {
                    <th class="text-center py-3 px-4 font-medium text-gray-600">{{ getEntrepot(id)?.nom }}</th>
                  }
                  <th class="text-center py-3 px-4 font-medium text-gray-600 bg-primary-50">Meilleur</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                @for (metric of metriques; track metric.key) {
                  <tr>
                    <td class="py-3 px-4 font-medium text-gray-700">{{ metric.label }}</td>
                    @for (id of entrepotsSelectionnes(); track id) {
                      <td class="py-3 px-4 text-center"
                        [class.bg-success-50]="isBest(id, metric.key)"
                        [class.font-semibold]="isBest(id, metric.key)"
                        [class.text-success-700]="isBest(id, metric.key)"
                      >
                        {{ formatValue(getEntrepot(id), metric.key, metric.format) }}
                      </td>
                    }
                    <td class="py-3 px-4 text-center bg-primary-50 font-semibold text-primary-700">
                      {{ getBestEntrepot(metric.key)?.nom }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Graphiques comparatifs -->
        <div class="grid gap-6 lg:grid-cols-2">
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Taux de remplissage</h3>
            <div class="h-64">
              <canvas #remplissageChart></canvas>
            </div>
          </div>

          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Valeur du stock</h3>
            <div class="h-64">
              <canvas #valeurChart></canvas>
            </div>
          </div>
        </div>

        <!-- Radar performance -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Radar de performance</h3>
          <div class="h-80 max-w-xl mx-auto">
            <canvas #radarChart></canvas>
          </div>
        </div>

        <!-- Recommandations -->
        <div class="card p-6 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white">Recommandations d'optimisation</h3>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            @for (reco of recommandations(); track reco.titre) {
              <div class="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <div class="flex items-start gap-3">
                  <span class="text-2xl">{{ reco.icon }}</span>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ reco.titre }}</p>
                    <p class="text-sm text-gray-600 mt-1">{{ reco.description }}</p>
                    <p class="text-xs text-primary-600 mt-2 font-medium">Impact: {{ reco.impact }}</p>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="card p-12 text-center">
          <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Sélectionnez au moins 2 entrepôts</h3>
          <p class="text-gray-500 mt-1">Pour comparer leurs performances</p>
        </div>
      }
    </div>
  `,
})
export class EntrepotsComparaisonComponent implements OnInit, AfterViewInit {
  @ViewChild('remplissageChart') remplissageChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('valeurChart') valeurChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('radarChart') radarChart!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];

  entrepots = signal<EntrepotComparatif[]>([]);
  entrepotsSelectionnes = signal<string[]>([]);
  recommandations = signal<{icon: string; titre: string; description: string; impact: string}[]>([]);

  metriques = [
    { key: 'tauxRemplissage', label: 'Taux de remplissage', format: 'percent' },
    { key: 'valeurStock', label: 'Valeur du stock', format: 'currency' },
    { key: 'nombreProduits', label: 'Nombre de produits', format: 'number' },
    { key: 'mouvementsJour', label: 'Mouvements/jour', format: 'number' },
    { key: 'efficacite', label: 'Efficacité', format: 'percent' },
    { key: 'coutOperationnel', label: 'Coût opérationnel', format: 'currency' },
  ];

  ngOnInit(): void {
    this.loadEntrepots();
    this.loadRecommandations();
  }

  ngAfterViewInit(): void {}

  loadEntrepots(): void {
    this.entrepots.set([
      { id: '1', nom: 'Paris Central', ville: 'Paris', capaciteMax: 10000, stockActuel: 7500, tauxRemplissage: 75, valeurStock: 450000, nombreProduits: 1250, mouvementsJour: 85, efficacite: 92, coutOperationnel: 15000 },
      { id: '2', nom: 'Lyon Sud', ville: 'Lyon', capaciteMax: 8000, stockActuel: 5600, tauxRemplissage: 70, valeurStock: 320000, nombreProduits: 890, mouvementsJour: 62, efficacite: 88, coutOperationnel: 12000 },
      { id: '3', nom: 'Marseille Port', ville: 'Marseille', capaciteMax: 12000, stockActuel: 11400, tauxRemplissage: 95, valeurStock: 580000, nombreProduits: 1450, mouvementsJour: 95, efficacite: 78, coutOperationnel: 18000 },
      { id: '4', nom: 'Bordeaux Ouest', ville: 'Bordeaux', capaciteMax: 6000, stockActuel: 3000, tauxRemplissage: 50, valeurStock: 180000, nombreProduits: 520, mouvementsJour: 35, efficacite: 85, coutOperationnel: 9000 },
    ]);
  }

  loadRecommandations(): void {
    this.recommandations.set([
      { icon: '🔄', titre: 'Rééquilibrer les stocks', description: 'Transférer 500 unités de Marseille vers Bordeaux pour optimiser les taux de remplissage', impact: '+8% efficacité globale' },
      { icon: '📦', titre: 'Optimiser Paris Central', description: 'Le taux de remplissage optimal est de 80%. Prévoir expansion ou délestage', impact: 'Réduction coûts 5%' },
      { icon: '🚚', titre: 'Améliorer logistique Marseille', description: 'L\'efficacité est inférieure à la moyenne. Audit des processus recommandé', impact: '+14% efficacité' },
    ]);
  }

  toggleEntrepot(id: string): void {
    const current = this.entrepotsSelectionnes();
    if (current.includes(id)) {
      this.entrepotsSelectionnes.set(current.filter(e => e !== id));
    } else {
      this.entrepotsSelectionnes.set([...current, id]);
    }
    setTimeout(() => this.updateCharts(), 100);
  }

  getEntrepot(id: string): EntrepotComparatif | undefined {
    return this.entrepots().find(e => e.id === id);
  }

  formatValue(entrepot: EntrepotComparatif | undefined, key: string, format: string): string {
    if (!entrepot) return '-';
    const value = (entrepot as any)[key];
    switch (format) {
      case 'percent': return `${value}%`;
      case 'currency': return `${value.toLocaleString()} €`;
      default: return value.toString();
    }
  }

  isBest(id: string, key: string): boolean {
    const best = this.getBestEntrepot(key);
    return best?.id === id;
  }

  getBestEntrepot(key: string): EntrepotComparatif | undefined {
    const selected = this.entrepotsSelectionnes().map(id => this.getEntrepot(id)).filter(Boolean) as EntrepotComparatif[];
    if (!selected.length) return undefined;
    
    const higherIsBetter = ['efficacite', 'valeurStock', 'nombreProduits', 'mouvementsJour'];
    const lowerIsBetter = ['coutOperationnel'];
    
    if (higherIsBetter.includes(key)) {
      return selected.reduce((best, curr) => (curr as any)[key] > (best as any)[key] ? curr : best);
    } else if (lowerIsBetter.includes(key)) {
      return selected.reduce((best, curr) => (curr as any)[key] < (best as any)[key] ? curr : best);
    } else if (key === 'tauxRemplissage') {
      // Optimal around 70-80%
      return selected.reduce((best, curr) => Math.abs(curr.tauxRemplissage - 75) < Math.abs(best.tauxRemplissage - 75) ? curr : best);
    }
    return selected[0];
  }

  updateCharts(): void {
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    const selected = this.entrepotsSelectionnes().map(id => this.getEntrepot(id)).filter(Boolean) as EntrepotComparatif[];
    if (selected.length < 2) return;

    const labels = selected.map(e => e.nom);
    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

    // Remplissage chart
    if (this.remplissageChart?.nativeElement) {
      this.charts.push(new Chart(this.remplissageChart.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [{ label: 'Taux de remplissage (%)', data: selected.map(e => e.tauxRemplissage), backgroundColor: colors }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { max: 100 } } }
      }));
    }

    // Valeur chart
    if (this.valeurChart?.nativeElement) {
      this.charts.push(new Chart(this.valeurChart.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [{ label: 'Valeur (€)', data: selected.map(e => e.valeurStock), backgroundColor: colors }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      }));
    }

    // Radar chart
    if (this.radarChart?.nativeElement) {
      this.charts.push(new Chart(this.radarChart.nativeElement, {
        type: 'radar',
        data: {
          labels: ['Remplissage', 'Efficacité', 'Mouvements', 'Produits', 'Valeur'],
          datasets: selected.map((e, i) => ({
            label: e.nom,
            data: [e.tauxRemplissage, e.efficacite, e.mouvementsJour, e.nombreProduits / 20, e.valeurStock / 8000],
            borderColor: colors[i],
            backgroundColor: colors[i] + '40',
          }))
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { r: { max: 100 } } }
      }));
    }
  }

  exporterComparaison(): void {}
}
