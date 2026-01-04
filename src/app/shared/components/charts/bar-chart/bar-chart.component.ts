import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
})
export class BarChartComponent {
  @Input() data: any;
  @Output() change = new EventEmitter<any>();
}
