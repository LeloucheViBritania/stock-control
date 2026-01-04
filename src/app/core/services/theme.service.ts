/**
 * Service de gestion du thème (clair/sombre)
 */
import { Injectable, inject, signal, computed, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StorageService } from './storage.service';

export type Theme = 'light' | 'dark' | 'system';

const THEME_KEY = 'gestion_stock_theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageService = inject(StorageService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Signal pour le thème sélectionné
  private currentTheme = signal<Theme>('system');

  // Signal computed pour savoir si le mode sombre est actif
  readonly isDarkMode = computed(() => {
    const theme = this.currentTheme();
    if (theme === 'system') {
      return this.prefersDarkMode();
    }
    return theme === 'dark';
  });

  // Getter pour le thème actuel
  readonly theme = computed(() => this.currentTheme());

  constructor() {
    // Effet pour appliquer le thème quand il change
    effect(() => {
      this.applyTheme(this.isDarkMode());
    });
  }

  /**
   * Initialise le thème au démarrage
   */
  initTheme(): void {
    if (!this.isBrowser) return;

    const savedTheme = this.storageService.get<Theme>(THEME_KEY);
    if (savedTheme) {
      this.currentTheme.set(savedTheme);
    }

    // Écouter les changements de préférence système
    this.watchSystemPreference();
  }

  /**
   * Change le thème
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    this.storageService.set(THEME_KEY, theme);
  }

  /**
   * Récupère le thème actuel
   */
  getTheme(): Theme {
    return this.currentTheme();
  }

  /**
   * Bascule entre clair et sombre
   */
  toggleTheme(): void {
    const newTheme = this.isDarkMode() ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Vérifie si le système préfère le mode sombre
   */
  private prefersDarkMode(): boolean {
    if (!this.isBrowser) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Applique le thème au DOM
   */
  private applyTheme(isDark: boolean): void {
    if (!this.isBrowser) return;

    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  /**
   * Surveille les changements de préférence système
   */
  private watchSystemPreference(): void {
    if (!this.isBrowser) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this.currentTheme() === 'system') {
        this.applyTheme(this.prefersDarkMode());
      }
    });
  }
}
