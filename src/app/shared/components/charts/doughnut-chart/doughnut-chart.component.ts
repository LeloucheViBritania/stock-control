import { Component, Input, OnInit, OnChanges, OnDestroy, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-doughnut-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full" [style.height]="height">
      <canvas #chartCanvas></canvas>
      @if (showCenterText && centerText) {
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ centerValue }}</div>
            <div class="text-sm text-gray-500">{{ centerText }}</div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DoughnutChartComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  @Input() data: ChartData<'doughnut'> = { labels: [], datasets: [] };
  @Input() height = '300px';
  @Input() showLegend = true;
  @Input() legendPosition: 'top' | 'bottom' | 'left' | 'right' = 'right';
  @Input() cutout = '60%';
  @Input() showCenterText = false;
  @Input() centerText = '';
  @Input() centerValue = '';

  private chart: Chart<'doughnut'> | null = null;

  ngOnInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private createChart(): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: this.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: this.cutout,
        plugins: {
          legend: { display: this.showLegend, position: this.legendPosition },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart(): void {
    if (this.chart) {
      this.chart.data = this.data;
      this.chart.update();
    }
  }
}
