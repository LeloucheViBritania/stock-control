import { Component, Input, OnInit, OnChanges, OnDestroy, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-area-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full" [style.height]="height">
      <canvas #chartCanvas></canvas>
    </div>
  `,
})
export class AreaChartComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  @Input() data: ChartData<'line'> = { labels: [], datasets: [] };
  @Input() height = '300px';
  @Input() showLegend = true;
  @Input() tension = 0.4;
  @Input() gradient = true;

  private chart: Chart<'line'> | null = null;

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

    // Apply fill to datasets
    const datasetsWithFill = this.data.datasets.map((dataset, index) => ({
      ...dataset,
      fill: true,
      backgroundColor: this.gradient ? this.createGradient(ctx, dataset.borderColor as string) : dataset.backgroundColor,
    }));

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: { ...this.data, datasets: datasetsWithFill },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: this.showLegend, position: 'top' },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
        },
        elements: {
          line: { tension: this.tension },
          point: { radius: 0, hoverRadius: 6 },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }

  private createGradient(ctx: CanvasRenderingContext2D, color: string): CanvasGradient {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, this.hexToRgba(color, 0.4));
    gradient.addColorStop(1, this.hexToRgba(color, 0));
    return gradient;
  }

  private hexToRgba(hex: string, alpha: number): string {
    if (!hex) return `rgba(59, 130, 246, ${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private updateChart(): void {
    if (this.chart) {
      this.chart.data = this.data;
      this.chart.update();
    }
  }
}
