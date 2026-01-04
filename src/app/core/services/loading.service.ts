/**
 * Service de gestion du loading global
 */
import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  // Compteur de requêtes en cours
  private loadingCount = signal(0);
  
  // Signal pour le message de chargement
  private loadingMessage = signal<string>('Chargement...');

  // Signal computed pour savoir si on est en chargement
  readonly isLoading = computed(() => this.loadingCount() > 0);
  
  // Message actuel
  readonly message = computed(() => this.loadingMessage());

  /**
   * Démarre le chargement
   */
  start(message?: string): void {
    this.loadingCount.update(count => count + 1);
    if (message) {
      this.loadingMessage.set(message);
    }
  }

  /**
   * Arrête le chargement
   */
  stop(): void {
    this.loadingCount.update(count => Math.max(0, count - 1));
    if (this.loadingCount() === 0) {
      this.loadingMessage.set('Chargement...');
    }
  }

  /**
   * Force l'arrêt de tous les chargements
   */
  forceStop(): void {
    this.loadingCount.set(0);
    this.loadingMessage.set('Chargement...');
  }

  /**
   * Définit le message de chargement
   */
  setMessage(message: string): void {
    this.loadingMessage.set(message);
  }
}
