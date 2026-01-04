/**
 * Page Préférences utilisateur
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '@services/theme.service';
import { NotificationService } from '@services/notification.service';
import { StorageService } from '@services/storage.service';

interface Preference {
  key: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'number';
  value: any;
  options?: { value: any; label: string }[];
}

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Préférences</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">Personnalisez votre expérience</p>
      </div>

      <!-- Apparence -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Apparence</h3>
        
        <div class="space-y-6">
          <!-- Thème -->
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Thème</p>
              <p class="text-sm text-gray-500">Choisissez le mode d'affichage</p>
            </div>
            <div class="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button 
                type="button"
                (click)="setTheme('light')"
                class="p-2 rounded-md transition-colors"
                [class.bg-white]="currentTheme() === 'light'"
                [class.shadow-sm]="currentTheme() === 'light'"
              >
                <svg class="w-5 h-5" [class.text-warning-500]="currentTheme() === 'light'" [class.text-gray-400]="currentTheme() !== 'light'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </button>
              <button 
                type="button"
                (click)="setTheme('dark')"
                class="p-2 rounded-md transition-colors"
                [class.bg-gray-800]="currentTheme() === 'dark'"
              >
                <svg class="w-5 h-5" [class.text-primary-400]="currentTheme() === 'dark'" [class.text-gray-400]="currentTheme() !== 'dark'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
              </button>
              <button 
                type="button"
                (click)="setTheme('system')"
                class="p-2 rounded-md transition-colors"
                [class.bg-white]="currentTheme() === 'system'"
                [class.shadow-sm]="currentTheme() === 'system'"
                [class.dark:bg-gray-600]="currentTheme() === 'system'"
              >
                <svg class="w-5 h-5" [class.text-gray-700]="currentTheme() === 'system'" [class.text-gray-400]="currentTheme() !== 'system'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Sidebar réduite par défaut</p>
              <p class="text-sm text-gray-500">Afficher la sidebar en mode compact</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                [(ngModel)]="sidebarCollapsed"
                (ngModelChange)="saveSidebarPreference()"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Notifications -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h3>
        
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Notifications par email</p>
              <p class="text-sm text-gray-500">Recevoir les alertes par email</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [(ngModel)]="emailNotifications" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Alertes de stock</p>
              <p class="text-sm text-gray-500">Être notifié quand un produit atteint le seuil d'alerte</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [(ngModel)]="stockAlerts" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Nouvelles commandes</p>
              <p class="text-sm text-gray-500">Être notifié lors d'une nouvelle commande</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [(ngModel)]="orderNotifications" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Affichage -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Affichage</h3>
        
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Éléments par page</p>
              <p class="text-sm text-gray-500">Nombre d'éléments affichés dans les listes</p>
            </div>
            <select [(ngModel)]="itemsPerPage" class="form-input w-auto">
              <option [value]="10">10</option>
              <option [value]="20">20</option>
              <option [value]="50">50</option>
              <option [value]="100">100</option>
            </select>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Format de date</p>
              <p class="text-sm text-gray-500">Format d'affichage des dates</p>
            </div>
            <select [(ngModel)]="dateFormat" class="form-input w-auto">
              <option value="dd/MM/yyyy">JJ/MM/AAAA</option>
              <option value="MM/dd/yyyy">MM/JJ/AAAA</option>
              <option value="yyyy-MM-dd">AAAA-MM-JJ</option>
            </select>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Devise</p>
              <p class="text-sm text-gray-500">Devise par défaut pour les prix</p>
            </div>
            <select [(ngModel)]="currency" class="form-input w-auto">
              <option value="EUR">Euro (€)</option>
              <option value="USD">Dollar ($)</option>
              <option value="GBP">Livre (£)</option>
              <option value="XOF">CFA (FCFA)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <button type="button" class="btn-secondary" (click)="resetToDefaults()">
          Réinitialiser
        </button>
        <button type="button" class="btn-primary" (click)="savePreferences()">
          Enregistrer
        </button>
      </div>
    </div>
  `,
})
export class PreferencesComponent implements OnInit {
  private readonly themeService = inject(ThemeService);
  private readonly notificationService = inject(NotificationService);
  private readonly storageService = inject(StorageService);

  currentTheme = signal<'light' | 'dark' | 'system'>('system');
  sidebarCollapsed = false;
  emailNotifications = true;
  stockAlerts = true;
  orderNotifications = true;
  itemsPerPage = 20;
  dateFormat = 'dd/MM/yyyy';
  currency = 'EUR';

  ngOnInit(): void {
    this.loadPreferences();
  }

  loadPreferences(): void {
    this.currentTheme.set(this.themeService.getTheme());
    this.sidebarCollapsed = this.storageService.get('sidebarCollapsed') === 'true';
    this.emailNotifications = this.storageService.get('emailNotifications') !== 'false';
    this.stockAlerts = this.storageService.get('stockAlerts') !== 'false';
    this.orderNotifications = this.storageService.get('orderNotifications') !== 'false';
    this.itemsPerPage = parseInt(this.storageService.get('itemsPerPage') || '20', 10);
    this.dateFormat = this.storageService.get('dateFormat') || 'dd/MM/yyyy';
    this.currency = this.storageService.get('currency') || 'EUR';
  }

  setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.themeService.setTheme(theme);
    this.currentTheme.set(theme);
  }

  saveSidebarPreference(): void {
    this.storageService.set('sidebarCollapsed', this.sidebarCollapsed.toString());
  }

  savePreferences(): void {
    this.storageService.set('emailNotifications', this.emailNotifications.toString());
    this.storageService.set('stockAlerts', this.stockAlerts.toString());
    this.storageService.set('orderNotifications', this.orderNotifications.toString());
    this.storageService.set('itemsPerPage', this.itemsPerPage.toString());
    this.storageService.set('dateFormat', this.dateFormat);
    this.storageService.set('currency', this.currency);
    
    this.notificationService.success('Préférences enregistrées');
  }

  resetToDefaults(): void {
    this.setTheme('system');
    this.sidebarCollapsed = false;
    this.emailNotifications = true;
    this.stockAlerts = true;
    this.orderNotifications = true;
    this.itemsPerPage = 20;
    this.dateFormat = 'dd/MM/yyyy';
    this.currency = 'EUR';
    
    this.savePreferences();
    this.notificationService.info('Préférences réinitialisées');
  }
}
