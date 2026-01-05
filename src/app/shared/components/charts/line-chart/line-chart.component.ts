import { Component, Input, OnInit, OnChanges, OnDestroy, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full" [style.height]="height">
      <canvas #chartCanvas></canvas>
    </div>
  `,
})
export class LineChartComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  @Input() data: ChartData<'line'> = { labels: [], datasets: [] };
  @Input() height = '300px';
  @Input() showLegend = true;
  @Input() showGrid = true;
  @Input() tension = 0.4;
  @Input() fill = false;

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

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: this.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: this.showLegend, position: 'top' },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: { grid: { display: this.showGrid } },
          y: { grid: { display: this.showGrid }, beginAtZero: true },
        },
        elements: {
          line: { tension: this.tension, fill: this.fill },
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
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
