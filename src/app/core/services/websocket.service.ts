/**
 * Service WebSocket pour les notifications temps réel
 */
import { Injectable, inject, OnDestroy } from '@angular/core';
import { Subject, Observable, timer, retry, tap } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '@env/environment';
import { AuthService } from './auth.service';

export interface WsMessage {
  type: string;
  payload: any;
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService implements OnDestroy {
  private readonly authService = inject(AuthService);
  private socket$: WebSocketSubject<WsMessage> | null = null;
  private messagesSubject = new Subject<WsMessage>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  readonly messages$ = this.messagesSubject.asObservable();

  /**
   * Connecte au WebSocket
   */
  connect(): void {
    if (this.socket$) return;

    const token = this.authService.getToken();
    if (!token) return;

    const wsUrl = `${environment.wsUrl}?token=${token}`;

    this.socket$ = webSocket<WsMessage>({
      url: wsUrl,
      openObserver: {
        next: () => {
          console.log('WebSocket connecté');
          this.reconnectAttempts = 0;
        },
      },
      closeObserver: {
        next: () => {
          console.log('WebSocket déconnecté');
          this.socket$ = null;
          this.tryReconnect();
        },
      },
    });

    this.socket$.pipe(
      retry({ delay: 3000, count: this.maxReconnectAttempts }),
    ).subscribe({
      next: (message) => this.messagesSubject.next(message),
      error: (error) => console.error('WebSocket error:', error),
    });
  }

  /**
   * Déconnecte du WebSocket
   */
  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }
  }

  /**
   * Envoie un message
   */
  send(message: WsMessage): void {
    if (this.socket$) {
      this.socket$.next(message);
    }
  }

  /**
   * Écoute un type de message spécifique
   */
  on<T>(type: string): Observable<T> {
    return new Observable(subscriber => {
      const subscription = this.messages$.subscribe(message => {
        if (message.type === type) {
          subscriber.next(message.payload as T);
        }
      });

      return () => subscription.unsubscribe();
    });
  }

  /**
   * Tentative de reconnexion
   */
  private tryReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      timer(3000 * this.reconnectAttempts).subscribe(() => {
        this.connect();
      });
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
