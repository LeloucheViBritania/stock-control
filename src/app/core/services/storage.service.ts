/**
 * Service de gestion du stockage local
 */
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /**
   * Récupère une valeur du localStorage
   */
  get<T>(key: string): T | null {
    if (!this.isBrowser) return null;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  /**
   * Stocke une valeur dans le localStorage
   */
  set<T>(key: string, value: T): void {
    if (!this.isBrowser) return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Erreur lors du stockage:', error);
    }
  }

  /**
   * Supprime une valeur du localStorage
   */
  remove(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(key);
  }

  /**
   * Vide tout le localStorage
   */
  clear(): void {
    if (!this.isBrowser) return;
    localStorage.clear();
  }

  /**
   * Vérifie si une clé existe
   */
  has(key: string): boolean {
    if (!this.isBrowser) return false;
    return localStorage.getItem(key) !== null;
  }

  /**
   * Récupère une valeur du sessionStorage
   */
  getSession<T>(key: string): T | null {
    if (!this.isBrowser) return null;
    
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  /**
   * Stocke une valeur dans le sessionStorage
   */
  setSession<T>(key: string, value: T): void {
    if (!this.isBrowser) return;
    
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Erreur lors du stockage session:', error);
    }
  }

  /**
   * Supprime une valeur du sessionStorage
   */
  removeSession(key: string): void {
    if (!this.isBrowser) return;
    sessionStorage.removeItem(key);
  }
}
