import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  link?: string;
  action?: string;
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h3>
      <div class="grid grid-cols-2 gap-3">
        @for (action of actions; track action.id) {
          @if (action.link) {
            <a 
              [routerLink]="action.link"
              class="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
              [class.hover:border-primary-300]="action.color === 'primary'"
              [class.hover:border-green-300]="action.color === 'success'"
              [class.hover:border-yellow-300]="action.color === 'warning'"
              [class.hover:border-red-300]="action.color === 'danger'"
              [class.hover:border-blue-300]="action.color === 'info'"
            >
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center"
                [class.bg-primary-100]="action.color === 'primary'"
                [class.text-primary-600]="action.color === 'primary'"
                [class.bg-green-100]="action.color === 'success'"
                [class.text-green-600]="action.color === 'success'"
                [class.bg-yellow-100]="action.color === 'warning'"
                [class.text-yellow-600]="action.color === 'warning'"
                [class.bg-red-100]="action.color === 'danger'"
                [class.text-red-600]="action.color === 'danger'"
                [class.bg-blue-100]="action.color === 'info'"
                [class.text-blue-600]="action.color === 'info'"
              >
                <ng-container [ngSwitch]="action.icon">
                  <svg *ngSwitchCase="'plus'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  <svg *ngSwitchCase="'cart'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <svg *ngSwitchCase="'box'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  <svg *ngSwitchCase="'users'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                  <svg *ngSwitchCase="'document'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <svg *ngSwitchDefault class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </ng-container>
              </div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{{ action.label }}</span>
            </a>
          } @else {
            <button 
              type="button"
              (click)="onActionClick(action)"
              class="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
            >
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center"
                [class.bg-primary-100]="action.color === 'primary'"
                [class.text-primary-600]="action.color === 'primary'"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{{ action.label }}</span>
            </button>
          }
        }
      </div>
    </div>
  `,
})
export class QuickActionsComponent {
  @Input() actions: QuickAction[] = [
    { id: '1', label: 'Nouveau produit', icon: 'plus', color: 'primary', link: '/produits/nouveau' },
    { id: '2', label: 'Nouvelle commande', icon: 'cart', color: 'success', link: '/commandes/nouveau' },
    { id: '3', label: 'Entrée stock', icon: 'box', color: 'info', link: '/mouvements-stock' },
    { id: '4', label: 'Nouveau client', icon: 'users', color: 'warning', link: '/clients/nouveau' },
  ];

  @Output() actionClick = new EventEmitter<QuickAction>();

  onActionClick(action: QuickAction): void {
    this.actionClick.emit(action);
  }
}
