import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface AlerteStock {
  id: string;
  produitId: string;
  produitNom: string;
  produitReference: string;
  quantiteActuelle: number;
  seuilAlerte: number;
  type: 'critique' | 'faible' | 'rupture';
}

@Component({
  selector: 'app-stock-alerts',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          Alertes Stock
        </h3>
        @if (alertes.length > 0) {
          <span class="px-2 py-1 text-xs font-bold bg-red-100 text-red-800 rounded-full">{{ alertes.length }}</span>
        }
      </div>

      <div class="divide-y divide-gray-100 dark:divide-gray-700 max-h-80 overflow-y-auto">
        @if (alertes.length === 0) {
          <div class="p-6 text-center text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-3 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p>Aucune alerte de stock</p>
          </div>
        } @else {
          @for (alerte of alertes; track alerte.id) {
            <div 
              class="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              (click)="onAlertClick(alerte)"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div 
                    class="w-2 h-2 rounded-full"
                    [class.bg-red-500]="alerte.type === 'rupture'"
                    [class.bg-orange-500]="alerte.type === 'critique'"
                    [class.bg-yellow-500]="alerte.type === 'faible'"
                  ></div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white text-sm">{{ alerte.produitNom }}</p>
                    <p class="text-xs text-gray-500">{{ alerte.produitReference }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p 
                    class="font-bold text-sm"
                    [class.text-red-600]="alerte.type === 'rupture'"
                    [class.text-orange-600]="alerte.type === 'critique'"
                    [class.text-yellow-600]="alerte.type === 'faible'"
                  >
                    {{ alerte.quantiteActuelle }}
                  </p>
                  <p class="text-xs text-gray-400">/ {{ alerte.seuilAlerte }}</p>
                </div>
              </div>
            </div>
          }
        }
      </div>

      @if (alertes.length > 0) {
        <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <a 
            routerLink="/alertes-stock" 
            class="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Voir toutes les alertes
          </a>
        </div>
      }
    </div>
  `,
})
export class StockAlertsComponent {
  @Input() alertes: AlerteStock[] = [];

  @Output() alertClick = new EventEmitter<AlerteStock>();

  onAlertClick(alerte: AlerteStock): void {
    this.alertClick.emit(alerte);
  }
}
