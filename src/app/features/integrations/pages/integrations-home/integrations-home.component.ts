/**
 * Intégrations & API (PREMIUM)
 * Gestion des intégrations tierces et webhooks
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '@services/notification.service';

interface Integration {
  id: string;
  nom: string;
  type: 'ERP' | 'ECOMMERCE' | 'COMPTABILITE' | 'TRANSPORT' | 'CUSTOM';
  logo: string;
  description: string;
  statut: 'ACTIVE' | 'INACTIVE' | 'ERREUR';
  derniereSynchro?: Date;
  config?: any;
}

@Component({
  selector: 'app-integrations-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Intégrations & API</h1>
            <span class="badge-premium">Premium</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Connectez vos outils et automatisez vos flux</p>
        </div>
      </div>

      <!-- Liens rapides -->
      <div class="grid gap-4 md:grid-cols-3">
        <a routerLink="api-keys" class="card p-6 hover:shadow-md transition-shadow group">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">Clés API</h3>
              <p class="text-sm text-gray-500">Gérez vos clés d'accès</p>
            </div>
          </div>
        </a>

        <a routerLink="webhooks" class="card p-6 hover:shadow-md transition-shadow group">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">Webhooks</h3>
              <p class="text-sm text-gray-500">Configurez vos notifications</p>
            </div>
          </div>
        </a>

        <div class="card p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ integrationsActives() }}</h3>
              <p class="text-sm text-gray-500">Intégrations actives</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Intégrations disponibles -->
      <div class="card p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Intégrations disponibles</h3>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          @for (integration of integrations(); track integration.id) {
            <div class="border rounded-lg p-4 hover:border-primary-300 transition-colors">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    {{ integration.logo }}
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900 dark:text-white">{{ integration.nom }}</h4>
                    <p class="text-xs text-gray-500">{{ integration.type }}</p>
                  </div>
                </div>
                <span class="px-2 py-1 text-xs rounded-full"
                  [class.bg-success-100]="integration.statut === 'ACTIVE'"
                  [class.text-success-700]="integration.statut === 'ACTIVE'"
                  [class.bg-gray-100]="integration.statut === 'INACTIVE'"
                  [class.text-gray-700]="integration.statut === 'INACTIVE'"
                  [class.bg-danger-100]="integration.statut === 'ERREUR'"
                  [class.text-danger-700]="integration.statut === 'ERREUR'"
                >{{ integration.statut }}</span>
              </div>
              <p class="text-sm text-gray-600 mt-3">{{ integration.description }}</p>
              @if (integration.derniereSynchro) {
                <p class="text-xs text-gray-400 mt-2">Dernière synchro: {{ integration.derniereSynchro | date:'dd/MM/yyyy HH:mm' }}</p>
              }
              <div class="flex gap-2 mt-4">
                @if (integration.statut === 'ACTIVE') {
                  <button type="button" class="btn-secondary text-xs py-1.5" (click)="synchroniser(integration)">Synchroniser</button>
                  <button type="button" class="btn-secondary text-xs py-1.5" (click)="configurer(integration)">Configurer</button>
                } @else {
                  <button type="button" class="btn-primary text-xs py-1.5" (click)="activer(integration)">Activer</button>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Documentation API -->
      <div class="card p-6 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Documentation API</h3>
              <p class="text-gray-600">Consultez notre documentation complète pour intégrer l'API</p>
            </div>
          </div>
          <a href="/api/docs" target="_blank" class="btn-primary">
            Voir la documentation
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class IntegrationsHomeComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  integrations = signal<Integration[]>([]);
  integrationsActives = signal(3);

  ngOnInit(): void {
    this.loadIntegrations();
  }

  loadIntegrations(): void {
    this.integrations.set([
      { id: '1', nom: 'Shopify', type: 'ECOMMERCE', logo: '🛒', description: 'Synchronisez vos produits et commandes Shopify', statut: 'ACTIVE', derniereSynchro: new Date() },
      { id: '2', nom: 'WooCommerce', type: 'ECOMMERCE', logo: '🔌', description: 'Intégration WordPress WooCommerce', statut: 'INACTIVE' },
      { id: '3', nom: 'Sage', type: 'COMPTABILITE', logo: '📊', description: 'Export automatique vers Sage comptabilité', statut: 'ACTIVE', derniereSynchro: new Date(Date.now() - 3600000) },
      { id: '4', nom: 'Chronopost', type: 'TRANSPORT', logo: '📦', description: 'Génération automatique des bons de transport', statut: 'ACTIVE', derniereSynchro: new Date(Date.now() - 7200000) },
      { id: '5', nom: 'SAP', type: 'ERP', logo: '🏢', description: 'Synchronisation bidirectionnelle avec SAP', statut: 'INACTIVE' },
      { id: '6', nom: 'Custom API', type: 'CUSTOM', logo: '⚙️', description: 'Connectez votre propre système', statut: 'INACTIVE' },
    ]);
  }

  synchroniser(integration: Integration): void {
    this.notificationService.info(`Synchronisation ${integration.nom} en cours...`);
    setTimeout(() => {
      integration.derniereSynchro = new Date();
      this.notificationService.success(`${integration.nom} synchronisé avec succès`);
    }, 1500);
  }

  configurer(integration: Integration): void {
    this.notificationService.info(`Configuration de ${integration.nom}...`);
  }

  activer(integration: Integration): void {
    integration.statut = 'ACTIVE';
    integration.derniereSynchro = new Date();
    this.integrationsActives.update(v => v + 1);
    this.notificationService.success(`${integration.nom} activé`);
  }
}
