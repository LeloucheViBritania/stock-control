import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audit-filters',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="p-4"><ng-content></ng-content></div>`,
})
export class AuditFiltersComponent {
  @Input() data: any;
  @Output() action = new EventEmitter<any>();
}
