/**
 * Composant Toast pour les notifications
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '@services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full">
      @for (notification of notifications(); track notification.id) {
        <div 
          class="p-4 rounded-lg shadow-lg border flex items-start gap-3 animate-slide-in"
          [ngClass]="{
            'bg-success-50 border-success-200 text-success-800': notification.type === 'success',
            'bg-danger-50 border-danger-200 text-danger-800': notification.type === 'error',
            'bg-warning-50 border-warning-200 text-warning-800': notification.type === 'warning',
            'bg-info-50 border-info-200 text-info-800': notification.type === 'info'
          }"
        >
          <!-- Icon -->
          <div class="flex-shrink-0">
            @switch (notification.type) {
              @case ('success') {
                <svg class="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              }
              @case ('error') {
                <svg class="w-5 h-5 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              }
              @case ('warning') {
                <svg class="w-5 h-5 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              }
              @case ('info') {
                <svg class="w-5 h-5 text-info-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              }
            }
          </div>
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            @if (notification.title) {
              <p class="font-medium">{{ notification.title }}</p>
            }
            <p class="text-sm">{{ notification.message }}</p>
          </div>
          
          <!-- Close button -->
          <button 
            type="button"
            (click)="dismiss(notification.id)"
            class="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `],
})
export class ToastComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  
  notifications = signal<Notification[]>([]);

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications.set(notifications);
    });
  }

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }
}
