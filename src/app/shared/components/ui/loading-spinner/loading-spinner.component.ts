/**
 * Composant Loading Spinner
 */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="flex items-center justify-center"
      [class.p-4]="!inline"
    >
      <div 
        class="animate-spin rounded-full border-2 border-current border-t-transparent"
        [ngClass]="sizeClasses"
        [class.text-primary-600]="color === 'primary'"
        [class.text-white]="color === 'white'"
        [class.text-gray-600]="color === 'gray'"
      ></div>
      @if (text && !inline) {
        <span class="ml-3 text-sm text-gray-600 dark:text-gray-400">
          {{ text }}
        </span>
      }
    </div>
  `,
  styles: [],
})
export class LoadingSpinnerComponent {
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() color: 'primary' | 'white' | 'gray' = 'primary';
  @Input() text?: string;
  @Input() inline = false;

  get sizeClasses(): string {
    const sizes = {
      xs: 'w-4 h-4',
      sm: 'w-5 h-5',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16',
    };
    return sizes[this.size];
  }
}
