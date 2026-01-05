import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      @if (showLabel) {
        <div class="flex justify-between mb-1">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ label }}</span>
          @if (showPercentage) {
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ clampedValue }}%</span>
          }
        </div>
      }
      <div 
        class="w-full rounded-full overflow-hidden"
        [class.h-1]="size === 'xs'"
        [class.h-2]="size === 'sm'"
        [class.h-3]="size === 'md'"
        [class.h-4]="size === 'lg'"
        [class.bg-gray-200]="!striped"
        [class.bg-gray-100]="striped"
      >
        <div
          class="h-full rounded-full transition-all duration-300 ease-out"
          [class.bg-primary-600]="color === 'primary'"
          [class.bg-green-600]="color === 'success'"
          [class.bg-yellow-500]="color === 'warning'"
          [class.bg-red-600]="color === 'danger'"
          [class.bg-gray-600]="color === 'gray'"
          [class.animate-pulse]="indeterminate"
          [class.progress-striped]="striped"
          [class.animate-stripes]="striped && animated"
          [style.width.%]="indeterminate ? 100 : clampedValue"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    .progress-striped {
      background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
      );
      background-size: 1rem 1rem;
    }
    .animate-stripes {
      animation: stripes 1s linear infinite;
    }
    @keyframes stripes {
      0% { background-position: 1rem 0; }
      100% { background-position: 0 0; }
    }
  `],
})
export class ProgressBarComponent {
  @Input() value = 0;
  @Input() max = 100;
  @Input() label = '';
  @Input() showLabel = false;
  @Input() showPercentage = true;
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
  @Input() color: 'primary' | 'success' | 'warning' | 'danger' | 'gray' = 'primary';
  @Input() striped = false;
  @Input() animated = false;
  @Input() indeterminate = false;

  get clampedValue(): number {
    const percentage = (this.value / this.max) * 100;
    return Math.min(100, Math.max(0, percentage));
  }
}
