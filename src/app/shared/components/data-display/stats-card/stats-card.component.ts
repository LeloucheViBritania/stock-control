import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card card-body">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ label }}</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ value }}</p>
        </div>
        @if (icon) {
          <div class="w-12 h-12 rounded-lg flex items-center justify-center" [class]="iconBgClass">
            <span [innerHTML]="icon" class="w-6 h-6" [class]="iconClass"></span>
          </div>
        }
      </div>
      @if (change !== undefined) {
        <p class="mt-2 text-sm" [class.text-success-600]="change >= 0" [class.text-danger-600]="change < 0">
          {{ change >= 0 ? '+' : '' }}{{ change }}%
        </p>
      }
    </div>
  `,
})
export class StatsCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() icon?: string;
  @Input() iconBgClass = 'bg-primary-100 dark:bg-primary-900/30';
  @Input() iconClass = 'text-primary-600';
  @Input() change?: number;
}
