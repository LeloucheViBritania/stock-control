/**
 * Composant Badge
 */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="inline-flex items-center font-medium rounded-full"
      [ngClass]="[sizeClasses, colorClasses]"
    >
      @if (dot) {
        <span 
          class="w-1.5 h-1.5 rounded-full mr-1.5"
          [ngClass]="dotClasses"
        ></span>
      }
      <ng-content></ng-content>
    </span>
  `,
})
export class BadgeComponent {
  @Input() variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'premium' = 'secondary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() dot = false;

  get sizeClasses(): string {
    const sizes: Record<string, string> = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-sm',
    };
    return sizes[this.size];
  }

  get colorClasses(): string {
    const colors: Record<string, string> = {
      primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
      secondary: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      success: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
      warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
      danger: 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400',
      info: 'bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-400',
      premium: 'bg-gradient-to-r from-warning-500 to-warning-600 text-white',
    };
    return colors[this.variant];
  }

  get dotClasses(): string {
    const dots: Record<string, string> = {
      primary: 'bg-primary-500',
      secondary: 'bg-gray-500',
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      danger: 'bg-danger-500',
      info: 'bg-info-500',
      premium: 'bg-white',
    };
    return dots[this.variant];
  }
}
