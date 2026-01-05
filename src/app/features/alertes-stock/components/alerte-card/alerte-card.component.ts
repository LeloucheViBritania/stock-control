/**
 * Carte d'alerte réutilisable (PREMIUM)
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface AlerteData {
  id: string;
  type: 'RUPTURE' | 'SEUIL_BAS' | 'SURSTOCK' | 'PEREMPTION' | 'ECART';
  priorite: 'CRITIQUE' | 'HAUTE' | 'MOYENNE' | 'BASSE';
  produit: { id: string; nom: string; reference: string; stock: number };
  message: string;
  dateCreation: Date;
  statut: 'ACTIVE' | 'EN_COURS' | 'RESOLUE' | 'IGNOREE';
  entrepot?: string;
}

@Component({
  selector: 'app-alerte-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="card p-4 transition-all hover:shadow-md cursor-pointer"
      [class.border-l-4]="true"
      [class.border-danger-500]="alerte.priorite === 'CRITIQUE'"
      [class.border-warning-500]="alerte.priorite === 'HAUTE'"
      [class.border-primary-500]="alerte.priorite === 'MOYENNE'"
      [class.border-gray-300]="alerte.priorite === 'BASSE'"
      [class.opacity-60]="alerte.statut === 'RESOLUE' || alerte.statut === 'IGNOREE'"
      (click)="onSelect.emit(alerte)"
    >
      <div class="flex items-start gap-3">
        <!-- Icône type -->
        <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          [class.bg-danger-100]="alerte.type === 'RUPTURE'"
          [class.bg-warning-100]="alerte.type === 'SEUIL_BAS'"
          [class.bg-purple-100]="alerte.type === 'SURSTOCK'"
          [class.bg-orange-100]="alerte.type === 'PEREMPTION'"
          [class.bg-primary-100]="alerte.type === 'ECART'"
        >
          @switch (alerte.type) {
            @case ('RUPTURE') {
              <svg class="w-5 h-5 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            }
            @case ('SEUIL_BAS') {
              <svg class="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
              </svg>
            }
            @case ('SURSTOCK') {
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            }
            @case ('PEREMPTION') {
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            }
            @default {
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            }
          }
        </div>

        <!-- Contenu -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <a [routerLink]="['/produits', alerte.produit.id]" 
              class="font-medium text-gray-900 dark:text-white hover:text-primary-600 truncate"
              (click)="$event.stopPropagation()">
              {{ alerte.produit.nom }}
            </a>
            <span class="px-1.5 py-0.5 text-xs rounded-full flex-shrink-0"
              [class.bg-danger-100]="alerte.priorite === 'CRITIQUE'"
              [class.text-danger-700]="alerte.priorite === 'CRITIQUE'"
              [class.bg-warning-100]="alerte.priorite === 'HAUTE'"
              [class.text-warning-700]="alerte.priorite === 'HAUTE'"
              [class.bg-primary-100]="alerte.priorite === 'MOYENNE'"
              [class.text-primary-700]="alerte.priorite === 'MOYENNE'"
              [class.bg-gray-100]="alerte.priorite === 'BASSE'"
              [class.text-gray-700]="alerte.priorite === 'BASSE'"
            >{{ alerte.priorite }}</span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{{ alerte.message }}</p>
          <div class="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span>Stock: {{ alerte.produit.stock }}</span>
            @if (alerte.entrepot) {
              <span>• {{ alerte.entrepot }}</span>
            }
            <span>• {{ alerte.dateCreation | date:'dd/MM HH:mm' }}</span>
          </div>
        </div>

        <!-- Actions -->
        @if (showActions && alerte.statut === 'ACTIVE') {
          <div class="flex items-center gap-1 flex-shrink-0">
            <button type="button" 
              class="p-1.5 hover:bg-success-100 rounded text-success-600" 
              title="Résoudre"
              (click)="onResolve.emit(alerte); $event.stopPropagation()">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </button>
            <button type="button" 
              class="p-1.5 hover:bg-gray-100 rounded text-gray-600" 
              title="Ignorer"
              (click)="onIgnore.emit(alerte); $event.stopPropagation()">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class AlerteCardComponent {
  @Input({ required: true }) alerte!: AlerteData;
  @Input() showActions = true;
  
  @Output() onSelect = new EventEmitter<AlerteData>();
  @Output() onResolve = new EventEmitter<AlerteData>();
  @Output() onIgnore = new EventEmitter<AlerteData>();
}
