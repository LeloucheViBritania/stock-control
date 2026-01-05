import { Component, Input, OnInit, OnChanges, OnDestroy, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full" [style.height]="height">
      <canvas #chartCanvas></canvas>
    </div>
  `,
})
export class BarChartComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  @Input() data: ChartData<'bar'> = { labels: [], datasets: [] };
  @Input() height = '300px';
  @Input() showLegend = true;
  @Input() horizontal = false;
  @Input() stacked = false;

  private chart: Chart<'bar'> | null = null;

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

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: this.data,
      options: {
        indexAxis: this.horizontal ? 'y' : 'x',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: this.showLegend, position: 'top' },
        },
        scales: {
          x: { stacked: this.stacked },
          y: { stacked: this.stacked, beginAtZero: true },
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
