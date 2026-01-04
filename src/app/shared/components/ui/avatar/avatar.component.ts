/**
 * Composant Avatar
 */
import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="relative inline-flex items-center justify-center rounded-full overflow-hidden"
      [ngClass]="[sizeClasses, colorClasses]"
    >
      @if (src) {
        <img 
          [src]="src" 
          [alt]="alt || name"
          class="w-full h-full object-cover"
          (error)="onImageError()"
        />
      } @else {
        <span class="font-semibold" [ngClass]="textSizeClasses">
          {{ initials() }}
        </span>
      }
      
      @if (status) {
        <span 
          class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800"
          [ngClass]="{
            'bg-success-500': status === 'online',
            'bg-warning-500': status === 'away',
            'bg-gray-400': status === 'offline'
          }"
        ></span>
      }
    </div>
  `,
})
export class AvatarComponent {
  @Input() src?: string;
  @Input() name?: string;
  @Input() alt?: string;
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' = 'primary';
  @Input() status?: 'online' | 'away' | 'offline';

  imageError = signal(false);

  initials = computed(() => {
    if (!this.name) return '?';
    const parts = this.name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  get sizeClasses(): string {
    const sizes: Record<string, string> = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16',
    };
    return sizes[this.size];
  }

  get textSizeClasses(): string {
    const sizes: Record<string, string> = {
      xs: 'text-xs',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    };
    return sizes[this.size];
  }

  get colorClasses(): string {
    const colors: Record<string, string> = {
      primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
      secondary: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
      success: 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400',
      warning: 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400',
      danger: 'bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400',
      info: 'bg-info-100 text-info-600 dark:bg-info-900/30 dark:text-info-400',
    };
    return colors[this.color];
  }

  onImageError(): void {
    this.imageError.set(true);
    this.src = undefined;
  }
}
