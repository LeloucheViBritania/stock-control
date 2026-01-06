import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'stock_alert' | 'order' | 'transfer';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private socket: Socket | null = null;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  readonly notifications$ = this.notificationsSubject.asObservable();
  readonly unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private authService: AuthService) {}

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.socket?.connected) return;

    const token = this.authService.getToken();
    if (!token) return;

    this.socket = io(environment.wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('notification', (notification: Notification) => {
      this.addNotification(notification);
    });

    this.socket.on('stock_alert', (data: any) => {
      this.addNotification({
        id: Date.now().toString(),
        type: 'stock_alert',
        title: 'Alerte Stock',
        message: `Stock faible pour ${data.produit?.nom || 'un produit'}`,
        data,
        read: false,
        createdAt: new Date()
      });
    });

    this.socket.on('order_update', (data: any) => {
      this.addNotification({
        id: Date.now().toString(),
        type: 'order',
        title: 'Mise à jour commande',
        message: `Commande ${data.numeroCommande} - ${data.statut}`,
        data,
        read: false,
        createdAt: new Date()
      });
    });

    this.socket.on('transfer_update', (data: any) => {
      this.addNotification({
        id: Date.now().toString(),
        type: 'transfer',
        title: 'Mise à jour transfert',
        message: `Transfert ${data.numeroTransfert} - ${data.statut}`,
        data,
        read: false,
        createdAt: new Date()
      });
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Add notification
   */
  private addNotification(notification: Notification): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...current].slice(0, 50)); // Keep last 50
    this.updateUnreadCount();
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): void {
    const notifications = this.notificationsSubject.value.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): void {
    const notifications = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.notificationsSubject.next([]);
    this.updateUnreadCount();
  }

  /**
   * Remove notification
   */
  remove(id: string): void {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== id);
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
  }

  private updateUnreadCount(): void {
    const count = this.notificationsSubject.value.filter(n => !n.read).length;
    this.unreadCountSubject.next(count);
  }
}

// ============================================
// TOAST SERVICE
// ============================================
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  private defaultDuration = 5000;

  /**
   * Show success toast
   */
  success(title: string, message?: string, duration?: number): void {
    this.show({ type: 'success', title, message, duration });
  }

  /**
   * Show error toast
   */
  error(title: string, message?: string, duration?: number): void {
    this.show({ type: 'error', title, message, duration: duration || 8000 });
  }

  /**
   * Show warning toast
   */
  warning(title: string, message?: string, duration?: number): void {
    this.show({ type: 'warning', title, message, duration });
  }

  /**
   * Show info toast
   */
  info(title: string, message?: string, duration?: number): void {
    this.show({ type: 'info', title, message, duration });
  }

  /**
   * Show toast
   */
  show(toast: Omit<Toast, 'id'>): void {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || this.defaultDuration
    };

    this.toastsSignal.update(toasts => [...toasts, newToast]);

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => this.remove(id), newToast.duration);
    }
  }

  /**
   * Remove toast by id
   */
  remove(id: string): void {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }

  /**
   * Clear all toasts
   */
  clear(): void {
    this.toastsSignal.set([]);
  }
}

// ============================================
// LOADING SERVICE
// ============================================
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSignal = signal<boolean>(false);
  private requestCount = 0;

  readonly isLoading = this.loadingSignal.asReadonly();

  show(): void {
    this.requestCount++;
    this.loadingSignal.set(true);
  }

  hide(): void {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.loadingSignal.set(false);
    }
  }

  forceHide(): void {
    this.requestCount = 0;
    this.loadingSignal.set(false);
  }
}
