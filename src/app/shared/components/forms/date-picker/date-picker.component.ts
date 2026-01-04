import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
})
export class DatePickerComponent {
  @Input() data: any;
  @Output() change = new EventEmitter<any>();
}
