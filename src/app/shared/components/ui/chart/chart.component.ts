/**
 * Composant de graphique réutilisable (PREMIUM)
 * Utilise Chart.js pour les visualisations
 */
import { Component, Input, OnInit, OnChanges, AfterViewInit, ElementRef, ViewChild, inject, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'area';

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  fill?: boolean;
  tension?: number;
}

export interface ChartConfig {
  type: ChartType;
  labels: string[];
  datasets: ChartDataset[];
  options?: any;
}

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container" [style.height]="height">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      width: 100%;
    }
  `]
})
export class ChartComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  @Input() config!: ChartConfig;
  @Input() height = '300px';

  private chart: any;
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && !changes['config'].firstChange) {
      this.updateChart();
    }
  }

  private async createChart(): Promise<void> {
    if (!this.chartCanvas?.nativeElement || !this.config) return;

    try {
      const Chart = (await import('chart.js/auto')).default;
      
      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (!ctx) return;

      const chartType = this.config.type === 'area' ? 'line' : this.config.type;
      
      const datasets = this.config.datasets.map(ds => ({
        ...ds,
        fill: this.config.type === 'area' ? true : ds.fill,
        tension: ds.tension ?? 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }));

      this.chart = new Chart(ctx, {
        type: chartType,
        data: {
          labels: this.config.labels,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 20
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              cornerRadius: 8
            }
          },
          scales: chartType === 'pie' || chartType === 'doughnut' ? {} : {
            x: {
              grid: { display: false },
              ticks: { color: '#6b7280' }
            },
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(107, 114, 128, 0.1)' },
              ticks: { color: '#6b7280' }
            }
          },
          ...this.config.options
        }
      });
    } catch (error) {
      console.warn('Chart.js non disponible, affichage alternatif');
    }
  }

  private updateChart(): void {
    if (this.chart) {
      this.chart.data.labels = this.config.labels;
      this.chart.data.datasets = this.config.datasets;
      this.chart.update();
    } else {
      this.createChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
