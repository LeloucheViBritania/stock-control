/**
 * Carte de statistiques avancée (PREMIUM)
 */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="card p-4 transition-all hover:shadow-lg"
      [class.cursor-pointer]="clickable"
      [class.ring-2]="selected"
      [class.ring-primary-500]="selected"
    >
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ label }}</p>
          <div class="flex items-baseline gap-2 mt-1">
            <p 
              class="text-2xl font-bold"
              [ngClass]="{
                'text-gray-900 dark:text-white': !colorClass,
                'text-success-600': colorClass === 'success',
                'text-danger-600': colorClass === 'danger',
                'text-warning-600': colorClass === 'warning',
                'text-primary-600': colorClass === 'primary',
                'text-info-600': colorClass === 'info'
              }"
            >
              @if (prefix) { <span class="text-lg">{{ prefix }}</span> }
              {{ formattedValue }}
              @if (suffix) { <span class="text-lg">{{ suffix }}</span> }
            </p>
            @if (trend !== undefined) {
              <span 
                class="flex items-center text-sm font-medium"
                [class.text-success-600]="trend > 0"
                [class.text-danger-600]="trend < 0"
                [class.text-gray-500]="trend === 0"
              >
                @if (trend > 0) {
                  <svg class="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                  +{{ trend }}%
                } @else if (trend < 0) {
                  <svg class="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"/>
                  </svg>
                  {{ trend }}%
                } @else {
                  <svg class="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"/>
                  </svg>
                  0%
                }
              </span>
            }
          </div>
          @if (description) {
            <p class="text-xs text-gray-500 mt-1">{{ description }}</p>
          }
        </div>
        @if (icon) {
          <div 
            class="w-12 h-12 rounded-xl flex items-center justify-center"
            [ngClass]="{
              'bg-gray-100 text-gray-600': !iconColorClass,
              'bg-success-100 text-success-600': iconColorClass === 'success',
              'bg-danger-100 text-danger-600': iconColorClass === 'danger',
              'bg-warning-100 text-warning-600': iconColorClass === 'warning',
              'bg-primary-100 text-primary-600': iconColorClass === 'primary',
              'bg-info-100 text-info-600': iconColorClass === 'info'
            }"
          >
            <ng-content select="[icon]"></ng-content>
          </div>
        }
      </div>
      @if (showProgress && progress !== undefined) {
        <div class="mt-3">
          <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="h-full rounded-full transition-all duration-500"
              [style.width.%]="progress"
              [ngClass]="{
                'bg-success-500': progress < 70,
                'bg-warning-500': progress >= 70 && progress < 90,
                'bg-danger-500': progress >= 90
              }"
            ></div>
          </div>
        </div>
      }
    </div>
  `
})
export class StatsCardComponent {
  @Input() label = '';
  @Input() value: number | string = 0;
  @Input() prefix?: string;
  @Input() suffix?: string;
  @Input() trend?: number;
  @Input() description?: string;
  @Input() icon = false;
  @Input() colorClass?: 'success' | 'danger' | 'warning' | 'primary' | 'info';
  @Input() iconColorClass?: 'success' | 'danger' | 'warning' | 'primary' | 'info';
  @Input() clickable = false;
  @Input() selected = false;
  @Input() showProgress = false;
  @Input() progress?: number;
  @Input() format: 'number' | 'currency' | 'percent' = 'number';

  get formattedValue(): string {
    if (typeof this.value === 'string') return this.value;
    
    switch (this.format) {
      case 'currency':
        return this.value.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      case 'percent':
        return this.value.toFixed(1);
      default:
        return this.value.toLocaleString('fr-FR');
    }
  }
}
