/**
 * Service de notifications (toast)
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
}

export interface NotificationOptions {
  title?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly notificationsSubject = new BehaviorSubject<Notification[]>([]);
  
  notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  private show(type: NotificationType, message: string, options?: NotificationOptions): void {
    const notification: Notification = {
      id: this.generateId(),
      type,
      message,
      title: options?.title,
      duration: options?.duration || (type === 'error' ? 7000 : 5000),
    };

    const current = this.notificationsSubject.getValue();
    this.notificationsSubject.next([...current, notification]);

    // Auto-dismiss
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.duration);
    }
  }

  success(message: string, options?: NotificationOptions): void {
    this.show('success', message, { title: options?.title || 'Succès', ...options });
  }

  error(message: string, options?: NotificationOptions): void {
    this.show('error', message, { title: options?.title || 'Erreur', ...options });
  }

  warning(message: string, options?: NotificationOptions): void {
    this.show('warning', message, { title: options?.title || 'Attention', ...options });
  }

  info(message: string, options?: NotificationOptions): void {
    this.show('info', message, { title: options?.title, ...options });
  }

  dismiss(id: string): void {
    const current = this.notificationsSubject.getValue();
    this.notificationsSubject.next(current.filter(n => n.id !== id));
  }

  clear(): void {
    this.notificationsSubject.next([]);
  }
}
