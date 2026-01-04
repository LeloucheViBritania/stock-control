import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
})
export class DateRangePickerComponent {
  @Input() data: any;
  @Output() change = new EventEmitter<any>();
}
