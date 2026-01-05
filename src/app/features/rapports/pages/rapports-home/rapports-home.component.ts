/**
 * Page d'accueil des rapports (PREMIUM)
 */
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RapportsService } from '../../services/rapports.service';
import { NotificationService } from '@services/notification.service';

@Component({
  selector: 'app-rapports-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Rapports & Analyses</h1>
            <span class="badge-premium">Premium</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Générez des rapports détaillés sur votre activité</p>
        </div>
      </div>

      <!-- Types de rapports -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- Rapport Ventes -->
        <div class="card p-6 hover:shadow-lg transition-shadow cursor-pointer" (click)="selectRapport('VENTES')">
          <div class="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Rapport de Ventes</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Analyse complète des ventes, chiffre d'affaires, top produits et clients.</p>
          <a routerLink="ventes" class="inline-flex items-center mt-4 text-sm font-medium text-primary-600 hover:underline">
            Générer <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </a>
        </div>

        <!-- Rapport Stock -->
        <div class="card p-6 hover:shadow-lg transition-shadow cursor-pointer" (click)="selectRapport('STOCK')">
          <div class="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Rapport de Stock</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">État des stocks, valorisation, alertes et rotation des produits.</p>
          <a routerLink="stock" class="inline-flex items-center mt-4 text-sm font-medium text-primary-600 hover:underline">
            Générer <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </a>
        </div>

        <!-- Rapport Mouvements -->
        <div class="card p-6 hover:shadow-lg transition-shadow cursor-pointer" (click)="selectRapport('MOUVEMENTS')">
          <div class="w-12 h-12 rounded-xl bg-warning-100 flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Rapport Mouvements</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Historique détaillé des entrées, sorties et transferts de stock.</p>
          <a routerLink="mouvements" class="inline-flex items-center mt-4 text-sm font-medium text-primary-600 hover:underline">
            Générer <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </a>
        </div>

        <!-- Rapport Inventaire -->
        <div class="card p-6 hover:shadow-lg transition-shadow cursor-pointer" (click)="selectRapport('INVENTAIRE')">
          <div class="w-12 h-12 rounded-xl bg-info-100 flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Rapport Inventaire</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Synthèse des inventaires, écarts constatés et ajustements.</p>
          <a routerLink="inventaire" class="inline-flex items-center mt-4 text-sm font-medium text-primary-600 hover:underline">
            Générer <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>

      <!-- Quick Export -->
      <div class="card p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Export rapide</h3>
        <div class="flex flex-wrap gap-3">
          <button type="button" class="btn-secondary" (click)="exportRapide('produits')">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Liste Produits (Excel)
          </button>
          <button type="button" class="btn-secondary" (click)="exportRapide('clients')">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Liste Clients (Excel)
          </button>
          <button type="button" class="btn-secondary" (click)="exportRapide('stock')">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            État Stock (Excel)
          </button>
        </div>
      </div>

      <!-- Historique -->
      <div class="card p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Rapports récents</h3>
        @if (rapportsRecents().length) {
          <div class="space-y-2">
            @for (r of rapportsRecents(); track r.id) {
              <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                    <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ r.type }}</p>
                    <p class="text-sm text-gray-500">{{ r.dateGeneration | date:'dd/MM/yyyy HH:mm' }}</p>
                  </div>
                </div>
                <button type="button" class="btn-secondary btn-sm">Télécharger</button>
              </div>
            }
          </div>
        } @else {
          <p class="text-gray-500 text-center py-4">Aucun rapport généré récemment</p>
        }
      </div>
    </div>
  `,
})
export class RapportsHomeComponent {
  private readonly rapportsService = inject(RapportsService);
  private readonly notificationService = inject(NotificationService);

  rapportsRecents = signal<any[]>([
    { id: '1', type: 'Rapport de Ventes', dateGeneration: new Date(), generePar: 'Admin', statut: 'TERMINE' },
    { id: '2', type: 'État du Stock', dateGeneration: new Date(Date.now() - 86400000), generePar: 'Admin', statut: 'TERMINE' },
  ]);

  selectRapport(type: string): void {
    // Navigation handled by routerLink
  }

  exportRapide(type: string): void {
    this.notificationService.success(`Export ${type} lancé`);
  }
}
