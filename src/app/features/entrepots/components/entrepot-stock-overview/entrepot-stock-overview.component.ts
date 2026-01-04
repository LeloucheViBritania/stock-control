import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-entrepot-stock-overview',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="p-4"><ng-content></ng-content></div>`,
})
export class EntrepotStockOverviewComponent {
  @Input() data: any;
  @Output() action = new EventEmitter<any>();
}
