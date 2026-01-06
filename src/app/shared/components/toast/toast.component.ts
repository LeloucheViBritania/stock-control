import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '@core/services/notifications.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="toast toast--{{ toast.type }}"
          role="alert"
          (click)="dismiss(toast.id)"
        >
          <div class="toast__icon">
            @switch (toast.type) {
              @case ('success') {
                <i class="ph ph-check-circle"></i>
              }
              @case ('error') {
                <i class="ph ph-x-circle"></i>
              }
              @case ('warning') {
                <i class="ph ph-warning"></i>
              }
              @case ('info') {
                <i class="ph ph-info"></i>
              }
            }
          </div>
          <div class="toast__content">
            @if (toast.title) {
              <div class="toast__title">{{ toast.title }}</div>
            }
            <div class="toast__message">{{ toast.message }}</div>
          </div>
          <button class="toast__close" (click)="dismiss(toast.id); $event.stopPropagation()">
            <i class="ph ph-x"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: var(--space-4);
      right: var(--space-4);
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      max-width: 420px;
      width: 100%;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-4);
      background: var(--neutral-0);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      border-left: 4px solid;
      animation: slideInRight 0.3s ease-out;
      cursor: pointer;
      pointer-events: auto;
      transition: transform var(--transition-fast), opacity var(--transition-fast);

      &:hover {
        transform: translateX(-4px);
      }

      &--success {
        border-left-color: var(--success-500);
        
        .toast__icon {
          color: var(--success-500);
        }
      }

      &--error {
        border-left-color: var(--error-500);
        
        .toast__icon {
          color: var(--error-500);
        }
      }

      &--warning {
        border-left-color: var(--warning-500);
        
        .toast__icon {
          color: var(--warning-500);
        }
      }

      &--info {
        border-left-color: var(--info-500);
        
        .toast__icon {
          color: var(--info-500);
        }
      }
    }

    .toast__icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .toast__content {
      flex: 1;
      min-width: 0;
    }

    .toast__title {
      font-weight: 600;
      color: var(--neutral-900);
      margin-bottom: var(--space-1);
    }

    .toast__message {
      font-size: var(--text-sm);
      color: var(--neutral-600);
      word-wrap: break-word;
    }

    .toast__close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: transparent;
      border: none;
      border-radius: var(--radius-sm);
      color: var(--neutral-400);
      cursor: pointer;
      transition: all var(--transition-fast);
      flex-shrink: 0;

      &:hover {
        background: var(--neutral-100);
        color: var(--neutral-600);
      }
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `]
})
export class ToastComponent {
  protected toastService = inject(ToastService);

  dismiss(id: string): void {
    this.toastService.remove(id);
  }
}
