import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface Client {
  id: string;
  nom: string;
  prenom?: string;
  email: string;
  telephone?: string;
  entreprise?: string;
  adresse?: string;
  ville?: string;
  totalAchats?: number;
  nombreCommandes?: number;
  derniereCommande?: Date;
  segment?: 'vip' | 'regulier' | 'occasionnel' | 'nouveau';
}

@Component({
  selector: 'app-client-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div 
      class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow cursor-pointer"
      (click)="onCardClick()"
    >
      <div class="flex items-start gap-4">
        <!-- Avatar -->
        <div 
          class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
          [class.bg-purple-500]="client.segment === 'vip'"
          [class.bg-blue-500]="client.segment === 'regulier'"
          [class.bg-green-500]="client.segment === 'occasionnel'"
          [class.bg-gray-400]="client.segment === 'nouveau' || !client.segment"
        >
          {{ initials }}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-semibold text-gray-900 dark:text-white truncate">
              {{ client.prenom }} {{ client.nom }}
            </h3>
            @if (client.segment === 'vip') {
              <span class="px-2 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded">VIP</span>
            }
          </div>

          @if (client.entreprise) {
            <p class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ client.entreprise }}</p>
          }

          <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
            @if (client.email) {
              <span class="flex items-center gap-1 truncate">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                {{ client.email }}
              </span>
            }
            @if (client.telephone) {
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                {{ client.telephone }}
              </span>
            }
          </div>
        </div>

        <!-- Stats -->
        <div class="text-right">
          @if (client.totalAchats !== undefined) {
            <p class="text-lg font-bold text-primary-600">{{ client.totalAchats | number:'1.0-0' }} FCFA</p>
            <p class="text-xs text-gray-500">Total achats</p>
          }
          @if (client.nombreCommandes !== undefined) {
            <p class="text-sm text-gray-600 mt-1">{{ client.nombreCommandes }} commandes</p>
          }
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button 
          (click)="onEmail($event)"
          class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
          title="Envoyer un email"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </button>
        <button 
          (click)="onCall($event)"
          class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
          title="Appeler"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
          </svg>
        </button>
        <button 
          (click)="onEdit($event)"
          class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
          title="Modifier"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </button>
      </div>
    </div>
  `,
})
export class ClientCardComponent {
  @Input() client!: Client;

  @Output() cardClick = new EventEmitter<Client>();
  @Output() edit = new EventEmitter<Client>();
  @Output() email = new EventEmitter<Client>();
  @Output() call = new EventEmitter<Client>();

  get initials(): string {
    const first = this.client.prenom?.[0] || this.client.nom[0] || '';
    const last = this.client.nom[0] || '';
    return (first + last).toUpperCase();
  }

  onCardClick(): void {
    this.cardClick.emit(this.client);
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.edit.emit(this.client);
  }

  onEmail(event: Event): void {
    event.stopPropagation();
    this.email.emit(this.client);
  }

  onCall(event: Event): void {
    event.stopPropagation();
    this.call.emit(this.client);
  }
}
