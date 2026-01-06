import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  private nextId = 0;

  readonly toasts = this._toasts.asReadonly();

  success(title: string, message?: string, duration = 5000): void {
    this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message?: string, duration = 7000): void {
    this.show({ type: 'error', title, message, duration });
  }

  warning(title: string, message?: string, duration = 5000): void {
    this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message?: string, duration = 5000): void {
    this.show({ type: 'info', title, message, duration });
  }

  private show(toast: Omit<Toast, 'id'>): void {
    const id = this.nextId++;
    const newToast = { ...toast, id };
    
    this._toasts.update(toasts => [...toasts, newToast]);

    if (toast.duration && toast.duration > 0) {
      setTimeout(() => this.remove(id), toast.duration);
    }
  }

  remove(id: number): void {
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}
