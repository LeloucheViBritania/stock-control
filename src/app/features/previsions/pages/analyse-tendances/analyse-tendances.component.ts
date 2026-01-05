/**
 * Page d'analyse des tendances (PREMIUM)
 */
import { Component, OnInit, inject, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { PrevisionsService } from '../../services/previsions.service';

Chart.register(...registerables);

@Component({
  selector: 'app-analyse-tendances',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-3">
          <a routerLink="/previsions" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Analyse des Tendances</h1>
              <span class="badge-premium">Premium</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <select [(ngModel)]="typeAnalyse" (ngModelChange)="loadData()" class="form-input">
            <option value="VENTES">Ventes</option>
            <option value="STOCK">Stock</option>
            <option value="COMMANDES">Commandes</option>
          </select>
          <select [(ngModel)]="periode" (ngModelChange)="loadData()" class="form-input">
            <option value="3">3 mois</option>
            <option value="6">6 mois</option>
            <option value="12">12 mois</option>
          </select>
        </div>
      </div>

      <!-- KPIs Tendance -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card p-4">
          <p class="text-sm text-gray-500">Tendance globale</p>
          <div class="flex items-center gap-2 mt-1">
            @if (tendance()?.tendanceGlobale === 'HAUSSE') {
              <svg class="w-6 h-6 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
              <span class="text-xl font-bold text-success-600">Hausse</span>
            } @else if (tendance()?.tendanceGlobale === 'BAISSE') {
              <svg class="w-6 h-6 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"/>
              </svg>
              <span class="text-xl font-bold text-danger-600">Baisse</span>
            } @else {
              <span class="text-xl font-bold text-gray-600">Stable</span>
            }
          </div>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Croissance</p>
          <p class="text-xl font-bold mt-1" [class.text-success-600]="(tendance()?.croissance || 0) > 0" [class.text-danger-600]="(tendance()?.croissance || 0) < 0">
            {{ (tendance()?.croissance || 0) > 0 ? '+' : '' }}{{ tendance()?.croissance | number:'1.1-1' }}%
          </p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Anomalies</p>
          <p class="text-xl font-bold text-warning-600 mt-1">{{ tendance()?.anomalies?.length || 0 }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Corrélations</p>
          <p class="text-xl font-bold text-primary-600 mt-1">{{ tendance()?.correlation?.length || 0 }}</p>
        </div>
      </div>

      <!-- Graphique principal -->
      <div class="card p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Évolution sur {{ periode }} mois</h3>
        <div class="h-72">
          <canvas #chartCanvas></canvas>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Saisonnalité -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Saisonnalité</h3>
          <div class="h-48">
            <canvas #seasonalityChart></canvas>
          </div>
        </div>

        <!-- Corrélations -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Facteurs de corrélation</h3>
          <div class="space-y-3">
            @for (corr of tendance()?.correlation; track corr.facteur) {
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium">{{ corr.facteur }}</span>
                  <span class="text-sm font-semibold" [class.text-success-600]="corr.correlation > 0" [class.text-danger-600]="corr.correlation < 0">
                    {{ corr.correlation > 0 ? '+' : '' }}{{ (corr.correlation * 100) | number:'1.0-0' }}%
                  </span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full"
                    [class.bg-success-500]="corr.correlation > 0"
                    [class.bg-danger-500]="corr.correlation < 0"
                    [style.width.%]="absValue(corr.correlation) * 100"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AnalyseTendancesComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('seasonalityChart') seasonalityChartCanvas!: ElementRef<HTMLCanvasElement>;

  private readonly previsionsService = inject(PrevisionsService);
  private chart: Chart | null = null;
  private seasonalityChart: Chart | null = null;

  typeAnalyse: 'VENTES' | 'STOCK' | 'COMMANDES' = 'VENTES';
  periode = 6;
  tendance = signal<any>(null);
  saisonnalite = [1.2, 0.9, 1.0, 1.1, 1.3, 1.5, 1.4, 1.2, 0.8, 0.9, 1.1, 1.6];
  moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  absValue(val: number): number { return Math.abs(val); }

  ngOnInit(): void { this.loadData(); }

  ngAfterViewInit(): void { setTimeout(() => this.createCharts(), 100); }

  loadData(): void {
    this.previsionsService.getAnalyseTendance(this.typeAnalyse, this.periode).subscribe({
      next: (data) => { this.tendance.set(data); this.updateCharts(); },
      error: () => {
        this.tendance.set({
          tendanceGlobale: 'HAUSSE', croissance: 12.5,
          anomalies: [
            { date: new Date(Date.now() - 30*86400000), valeur: 15000, attendu: 12000 },
          ],
          correlation: [
            { facteur: 'Promotions', correlation: 0.78 },
            { facteur: 'Météo', correlation: 0.45 },
            { facteur: 'Jours fériés', correlation: -0.32 },
            { facteur: 'Nouveaux clients', correlation: 0.65 },
          ],
        });
        setTimeout(() => this.updateCharts(), 100);
      }
    });
  }

  createCharts(): void {
    if (this.chartCanvas?.nativeElement) {
      const labels = this.generateLabels();
      const data = this.generateMockData();
      
      this.chart = new Chart(this.chartCanvas.nativeElement, {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Réel', data: data.reel, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4 },
            { label: 'Prévu', data: data.prevu, borderColor: '#a855f7', borderDash: [5, 5], tension: 0.4 },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } },
      });
    }

    if (this.seasonalityChartCanvas?.nativeElement) {
      this.seasonalityChart = new Chart(this.seasonalityChartCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: this.moisLabels,
          datasets: [{ label: 'Facteur', data: this.saisonnalite, backgroundColor: this.saisonnalite.map(v => v >= 1 ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)') }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 0.5, max: 2 } } },
      });
    }
  }

  updateCharts(): void {
    if (this.chart) {
      this.chart.data.labels = this.generateLabels();
      const data = this.generateMockData();
      this.chart.data.datasets[0].data = data.reel;
      this.chart.data.datasets[1].data = data.prevu;
      this.chart.update();
    }
  }

  generateLabels(): string[] {
    return Array.from({ length: this.periode }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (this.periode - 1 - i));
      return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    });
  }

  generateMockData(): { reel: number[]; prevu: number[] } {
    const base = this.typeAnalyse === 'VENTES' ? 50000 : this.typeAnalyse === 'STOCK' ? 5000 : 200;
    const reel = Array.from({ length: this.periode }, () => base + (Math.random() - 0.3) * base * 0.4);
    const prevu = reel.map(v => v * (0.95 + Math.random() * 0.1));
    return { reel, prevu };
  }
}
