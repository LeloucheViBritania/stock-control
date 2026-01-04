import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="alertClass" role="alert">
      <ng-content></ng-content>
    </div>
  `,
})
export class AlertComponent {
  @Input() type: 'success' | 'warning' | 'danger' | 'info' = 'info';

  get alertClass(): string {
    const base = 'p-4 rounded-lg border';
    const types = {
      success: 'bg-success-50 border-success-200 text-success-800 dark:bg-success-900/20 dark:border-success-800 dark:text-success-400',
      warning: 'bg-warning-50 border-warning-200 text-warning-800 dark:bg-warning-900/20 dark:border-warning-800 dark:text-warning-400',
      danger: 'bg-danger-50 border-danger-200 text-danger-800 dark:bg-danger-900/20 dark:border-danger-800 dark:text-danger-400',
      info: 'bg-info-50 border-info-200 text-info-800 dark:bg-info-900/20 dark:border-info-800 dark:text-info-400',
    };
    return `${base} ${types[this.type]}`;
  }
}
