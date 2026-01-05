import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface Produit {
  id: string;
  reference: string;
  nom: string;
  description?: string;
  prixVente: number;
  prixAchat?: number;
  quantiteStock: number;
  seuilAlerte: number;
  categorieNom?: string;
  image?: string;
  actif: boolean;
}

@Component({
  selector: 'app-produit-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div 
      class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      (click)="onCardClick()"
    >
      <!-- Image -->
      <div class="relative h-40 bg-gray-100 dark:bg-gray-700">
        @if (produit.image) {
          <img [src]="produit.image" [alt]="produit.nom" class="w-full h-full object-cover" />
        } @else {
          <div class="w-full h-full flex items-center justify-center">
            <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
        }
        <!-- Stock Badge -->
        <div 
          class="absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded"
          [class.bg-green-100]="stockStatus === 'ok'"
          [class.text-green-800]="stockStatus === 'ok'"
          [class.bg-yellow-100]="stockStatus === 'low'"
          [class.text-yellow-800]="stockStatus === 'low'"
          [class.bg-red-100]="stockStatus === 'critical'"
          [class.text-red-800]="stockStatus === 'critical'"
        >
          {{ produit.quantiteStock }} en stock
        </div>
        @if (!produit.actif) {
          <div class="absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded bg-gray-800 text-white">
            Inactif
          </div>
        }
      </div>

      <!-- Content -->
      <div class="p-4">
        <div class="flex items-start justify-between mb-2">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ produit.reference }}</p>
            <h3 class="font-semibold text-gray-900 dark:text-white line-clamp-1">{{ produit.nom }}</h3>
          </div>
        </div>

        @if (produit.categorieNom) {
          <span class="inline-block px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded mb-2">
            {{ produit.categorieNom }}
          </span>
        }

        <div class="flex items-center justify-between mt-3">
          <span class="text-lg font-bold text-primary-600">{{ produit.prixVente | number:'1.0-0' }} FCFA</span>
          <div class="flex gap-1">
            <button 
              (click)="onEdit($event)" 
              class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
              title="Modifier"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button 
              (click)="onAdjustStock($event)" 
              class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Ajuster stock"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProduitCardComponent {
  @Input() produit!: Produit;

  @Output() cardClick = new EventEmitter<Produit>();
  @Output() edit = new EventEmitter<Produit>();
  @Output() adjustStock = new EventEmitter<Produit>();

  get stockStatus(): 'ok' | 'low' | 'critical' {
    if (this.produit.quantiteStock <= 0) return 'critical';
    if (this.produit.quantiteStock <= this.produit.seuilAlerte) return 'low';
    return 'ok';
  }

  onCardClick(): void {
    this.cardClick.emit(this.produit);
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.edit.emit(this.produit);
  }

  onAdjustStock(event: Event): void {
    event.stopPropagation();
    this.adjustStock.emit(this.produit);
  }
}
