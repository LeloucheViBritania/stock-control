import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
}

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (isOpen) {
      <div class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
        <!-- Header -->
        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 dark:text-white">Notifications</h3>
          @if (unreadCount > 0) {
            <button 
              (click)="markAllAsRead()"
              class="text-xs text-primary-600 hover:text-primary-700"
            >
              Tout marquer comme lu
            </button>
          }
        </div>

        <!-- Notifications List -->
        <div class="max-h-96 overflow-y-auto">
          @if (notifications.length === 0) {
            <div class="p-8 text-center text-gray-500">
              <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <p>Aucune notification</p>
            </div>
          } @else {
            @for (notification of notifications; track notification.id) {
              <div 
                (click)="onNotificationClick(notification)"
                class="px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                [class.bg-blue-50]="!notification.read"
                [class.dark:bg-blue-900/20]="!notification.read"
              >
                <div class="flex items-start gap-3">
                  <div 
                    class="flex-shrink-0 w-2 h-2 mt-2 rounded-full"
                    [class.bg-blue-500]="notification.type === 'info'"
                    [class.bg-green-500]="notification.type === 'success'"
                    [class.bg-yellow-500]="notification.type === 'warning'"
                    [class.bg-red-500]="notification.type === 'error'"
                  ></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {{ notification.title }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {{ notification.message }}
                    </p>
                    <p class="text-xs text-gray-400 mt-1">
                      {{ formatDate(notification.createdAt) }}
                    </p>
                  </div>
                </div>
              </div>
            }
          }
        </div>

        <!-- Footer -->
        @if (notifications.length > 0) {
          <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <a 
              routerLink="/notifications"
              (click)="close()"
              class="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Voir toutes les notifications
            </a>
          </div>
        }
      </div>
    }
  `,
})
export class NotificationDropdownComponent {
  @Input() isOpen = false;
  @Input() notifications: Notification[] = [];

  @Output() closed = new EventEmitter<void>();
  @Output() notificationClick = new EventEmitter<Notification>();
  @Output() markAllRead = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  close(): void {
    this.isOpen = false;
    this.closed.emit();
  }

  onNotificationClick(notification: Notification): void {
    this.notificationClick.emit(notification);
  }

  markAllAsRead(): void {
    this.markAllRead.emit();
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
