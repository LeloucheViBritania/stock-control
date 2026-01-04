/**
 * Composant Confirm Dialog
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black/50" (click)="onCancel()"></div>
        
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div class="flex items-center gap-4 mb-4">
              <div 
                class="w-12 h-12 rounded-full flex items-center justify-center"
                [ngClass]="{
                  'bg-danger-100 text-danger-600': type === 'danger',
                  'bg-warning-100 text-warning-600': type === 'warning',
                  'bg-info-100 text-info-600': type === 'info'
                }"
              >
                @switch (type) {
                  @case ('danger') {
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  }
                  @case ('warning') {
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                  }
                  @default {
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  }
                }
              </div>
              
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
                @if (message) {
                  <p class="text-gray-600 dark:text-gray-400 mt-1">{{ message }}</p>
                }
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button type="button" class="btn-secondary" (click)="onCancel()">
                {{ cancelText }}
              </button>
              <button 
                type="button" 
                (click)="onConfirm()"
                [ngClass]="{
                  'btn-danger': type === 'danger',
                  'btn-warning': type === 'warning',
                  'btn-primary': type === 'info'
                }"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmation';
  @Input() message?: string;
  @Input() type: 'danger' | 'warning' | 'info' = 'danger';
  @Input() confirmText = 'Confirmer';
  @Input() cancelText = 'Annuler';
  
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
