/**
 * Composant Modal réutilisable
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div 
          class="fixed inset-0 bg-black/50 transition-opacity"
          (click)="closeOnBackdrop && close()"
        ></div>
        
        <div class="flex min-h-full items-center justify-center p-4">
          <div 
            class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full transition-all"
            [ngClass]="sizeClasses"
          >
            @if (title || showClose) {
              <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                @if (title) {
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
                }
                @if (showClose) {
                  <button 
                    type="button" 
                    (click)="close()"
                    class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                }
              </div>
            }
            
            <div class="p-6">
              <ng-content></ng-content>
            </div>
            
            <ng-content select="[modal-footer]"></ng-content>
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title?: string;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  @Input() showClose = true;
  @Input() closeOnBackdrop = true;
  
  @Output() closed = new EventEmitter<void>();

  get sizeClasses(): string {
    const sizes: Record<string, string> = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-4xl',
    };
    return sizes[this.size];
  }

  close(): void {
    this.closed.emit();
  }
}
