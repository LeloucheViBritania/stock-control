import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
})
export class SkeletonLoaderComponent {
  @Input() data: any;
  @Output() change = new EventEmitter<any>();
}
