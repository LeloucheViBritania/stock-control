import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-doughnut-chart',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
})
export class DoughnutChartComponent {
  @Input() data: any;
  @Output() change = new EventEmitter<any>();
}
