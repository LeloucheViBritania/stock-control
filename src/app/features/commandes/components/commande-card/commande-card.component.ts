import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommandeStatusBadgeComponent, CommandeStatut } from '../commande-status-badge/commande-status-badge.component';

export interface Commande {
  id: string;
  numero: string;
  clientNom: string;
  clientPrenom?: string;
  statut: CommandeStatut;
  montantTotal: number;
  nombreArticles: number;
  dateCreation: Date;
  dateLivraison?: Date;
  modePaiement?: string;
  paye: boolean;
}

@Component({
  selector: 'app-commande-card',
  standalone: true,
  imports: [CommonModule, RouterModule, CommandeStatusBadgeComponent],
  template: `
    <div 
      class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow cursor-pointer"
      (click)="onCardClick()"
    >
      <!-- Header -->
      <div class="flex items-start justify-between mb-3">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-semibold text-gray-900 dark:text-white">{{ commande.numero }}</h3>
            <app-commande-status-badge [statut]="commande.statut"></app-commande-status-badge>
          </div>
          <p class="text-sm text-gray-500 mt-1">
            {{ commande.clientPrenom }} {{ commande.clientNom }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-lg font-bold text-primary-600">{{ commande.montantTotal | number:'1.0-0' }} FCFA</p>
          <p class="text-xs text-gray-500">{{ commande.nombreArticles }} article(s)</p>
        </div>
      </div>

      <!-- Details -->
      <div class="flex items-center gap-4 text-sm text-gray-500 mb-3">
        <span class="flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          {{ formatDate(commande.dateCreation) }}
        </span>
        @if (commande.modePaiement) {
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            {{ commande.modePaiement }}
          </span>
        }
        <span 
          class="flex items-center gap-1"
          [class.text-green-600]="commande.paye"
          [class.text-red-600]="!commande.paye"
        >
          @if (commande.paye) {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Payée
          } @else {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Non payée
          }
        </span>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button 
          (click)="onViewDetails($event)"
          class="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded transition-colors"
        >
          Voir détails
        </button>
        @if (commande.statut === 'EN_ATTENTE') {
          <button 
            (click)="onConfirm($event)"
            class="px-3 py-1.5 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded transition-colors"
          >
            Confirmer
          </button>
        }
      </div>
    </div>
  `,
})
export class CommandeCardComponent {
  @Input() commande!: Commande;

  @Output() cardClick = new EventEmitter<Commande>();
  @Output() viewDetails = new EventEmitter<Commande>();
  @Output() confirm = new EventEmitter<Commande>();

  onCardClick(): void {
    this.cardClick.emit(this.commande);
  }

  onViewDetails(event: Event): void {
    event.stopPropagation();
    this.viewDetails.emit(this.commande);
  }

  onConfirm(event: Event): void {
    event.stopPropagation();
    this.confirm.emit(this.commande);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
