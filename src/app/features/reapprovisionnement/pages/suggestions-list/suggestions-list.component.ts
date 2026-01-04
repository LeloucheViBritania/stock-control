/**
 * Page Suggestions de réapprovisionnement
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

interface Suggestion {
  id: string;
  produit: {
    id: string;
    nom: string;
    reference: string;
    quantiteStock: number;
    seuilAlerte: number;
    seuilCritique: number;
    prixAchat: number;
  };
  fournisseur?: {
    id: string;
    nom: string;
    delaiLivraison: number;
  };
  quantiteSuggere: number;
  urgence: 'critique' | 'haute' | 'normale';
  estimationCout: number;
  selected?: boolean;
}

@Component({
  selector: 'app-suggestions-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Réapprovisionnement</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            {{ suggestions().length }} suggestion{{ suggestions().length > 1 ? 's' : '' }} de réapprovisionnement
          </p>
        </div>
        <div class="flex items-center gap-3">
          @if (selectedCount() > 0) {
            <button 
              type="button" 
              class="btn-primary"
              (click)="creerCommandeAchat()"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Commander ({{ selectedCount() }})
            </button>
          }
          
          <!-- PREMIUM : Commande automatique -->
          <button 
            type="button" 
            class="btn-secondary relative"
            (click)="showPremiumFeature('auto')"
          >
            Commande auto
            <span class="absolute -top-2 -right-2 badge-premium text-xs px-1.5">PRO</span>
          </button>
        </div>
      </div>

      <!-- Stats rapides -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Stock critique</p>
          <p class="text-2xl font-bold text-danger-600">{{ critiques() }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Stock faible</p>
          <p class="text-2xl font-bold text-warning-600">{{ faibles() }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">À commander</p>
          <p class="text-2xl font-bold text-primary-600">{{ selectedCount() }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Coût estimé</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ coutTotal() | number:'1.0-0' }} €</p>
        </div>
      </div>

      <!-- Filtres -->
      <div class="flex flex-wrap items-center gap-3">
        <select [(ngModel)]="filterUrgence" (ngModelChange)="applyFilters()" class="form-input w-auto">
          <option value="">Toutes urgences</option>
          <option value="critique">Critique</option>
          <option value="haute">Haute</option>
          <option value="normale">Normale</option>
        </select>

        <label class="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            [(ngModel)]="selectAll"
            (ngModelChange)="toggleSelectAll()"
            class="w-4 h-4 rounded border-gray-300 text-primary-600"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">Tout sélectionner</span>
        </label>
      </div>

      @if (isLoading()) {
        <div class="card p-12">
          <app-loading-spinner size="lg" text="Analyse du stock..." />
        </div>
      } @else if (filteredSuggestions().length === 0) {
        <div class="card p-12 text-center">
          <div class="w-16 h-16 mx-auto bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Stock optimal</h3>
          <p class="text-gray-500 mt-1">Aucun réapprovisionnement nécessaire pour le moment</p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (suggestion of filteredSuggestions(); track suggestion.id) {
            <div 
              class="card p-4 transition-colors"
              [class.border-2]="suggestion.selected"
              [class.border-primary-500]="suggestion.selected"
            >
              <div class="flex items-start gap-4">
                <!-- Checkbox -->
                <input 
                  type="checkbox" 
                  [(ngModel)]="suggestion.selected"
                  (ngModelChange)="updateSelection()"
                  class="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600"
                />

                <!-- Urgence indicator -->
                <div 
                  class="w-2 h-16 rounded-full flex-shrink-0"
                  [ngClass]="{
                    'bg-danger-500': suggestion.urgence === 'critique',
                    'bg-warning-500': suggestion.urgence === 'haute',
                    'bg-info-500': suggestion.urgence === 'normale'
                  }"
                ></div>

                <!-- Produit info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <a 
                        [routerLink]="['/produits', suggestion.produit.id]"
                        class="font-semibold text-gray-900 dark:text-white hover:text-primary-600"
                      >
                        {{ suggestion.produit.nom }}
                      </a>
                      <p class="text-sm text-gray-500">{{ suggestion.produit.reference }}</p>
                    </div>
                    
                    <span 
                      class="badge flex-shrink-0"
                      [ngClass]="{
                        'badge-danger': suggestion.urgence === 'critique',
                        'badge-warning': suggestion.urgence === 'haute',
                        'badge-info': suggestion.urgence === 'normale'
                      }"
                    >
                      {{ getUrgenceLabel(suggestion.urgence) }}
                    </span>
                  </div>

                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p class="text-xs text-gray-500">Stock actuel</p>
                      <p 
                        class="font-bold"
                        [class.text-danger-600]="suggestion.produit.quantiteStock <= suggestion.produit.seuilCritique"
                        [class.text-warning-600]="suggestion.produit.quantiteStock > suggestion.produit.seuilCritique && suggestion.produit.quantiteStock <= suggestion.produit.seuilAlerte"
                      >
                        {{ suggestion.produit.quantiteStock }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500">Seuil alerte</p>
                      <p class="font-medium text-gray-700 dark:text-gray-300">{{ suggestion.produit.seuilAlerte }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500">Qté suggérée</p>
                      <input 
                        type="number" 
                        [(ngModel)]="suggestion.quantiteSuggere"
                        (ngModelChange)="recalculerCout(suggestion)"
                        class="w-20 px-2 py-1 text-center font-bold text-primary-600 border border-gray-300 rounded"
                        min="1"
                      />
                    </div>
                    <div>
                      <p class="text-xs text-gray-500">Coût estimé</p>
                      <p class="font-bold text-gray-900 dark:text-white">{{ suggestion.estimationCout | number:'1.2-2' }} €</p>
                    </div>
                  </div>

                  @if (suggestion.fournisseur) {
                    <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4 text-sm">
                      <span class="text-gray-500">Fournisseur :</span>
                      <a 
                        [routerLink]="['/fournisseurs', suggestion.fournisseur.id]"
                        class="text-primary-600 hover:underline"
                      >
                        {{ suggestion.fournisseur.nom }}
                      </a>
                      <span class="text-gray-400">•</span>
                      <span class="text-gray-500">Délai : {{ suggestion.fournisseur.delaiLivraison }} jours</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- PREMIUM Teaser : Prévisions avancées -->
      @if (!isPremium()) {
        <div class="card p-6 bg-gradient-to-r from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 border-warning-200">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-warning-500 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Prévisions intelligentes</h3>
                <p class="text-sm text-gray-600">
                  Anticipez vos besoins avec l'IA et les commandes automatiques
                </p>
              </div>
            </div>
            <a routerLink="/abonnement" class="btn-warning whitespace-nowrap">
              Passer à Premium
            </a>
          </div>
        </div>
      }
    </div>
  `,
})
export class SuggestionsListComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  isLoading = signal(true);
  suggestions = signal<Suggestion[]>([]);
  filterUrgence = '';
  selectAll = false;

  isPremium = computed(() => this.authService.isPremium());

  filteredSuggestions = computed(() => {
    if (!this.filterUrgence) return this.suggestions();
    return this.suggestions().filter(s => s.urgence === this.filterUrgence);
  });

  critiques = computed(() => this.suggestions().filter(s => s.urgence === 'critique').length);
  faibles = computed(() => this.suggestions().filter(s => s.urgence === 'haute').length);
  selectedCount = computed(() => this.suggestions().filter(s => s.selected).length);
  coutTotal = computed(() => this.suggestions().filter(s => s.selected).reduce((sum, s) => sum + s.estimationCout, 0));

  ngOnInit(): void {
    this.loadSuggestions();
  }

  loadSuggestions(): void {
    setTimeout(() => {
      this.suggestions.set([
        {
          id: '1',
          produit: { id: '1', nom: 'Clavier mécanique RGB', reference: 'KBD-001', quantiteStock: 3, seuilAlerte: 10, seuilCritique: 5, prixAchat: 45 },
          fournisseur: { id: '1', nom: 'TechSupply', delaiLivraison: 5 },
          quantiteSuggere: 20,
          urgence: 'critique',
          estimationCout: 900,
        },
        {
          id: '2',
          produit: { id: '2', nom: 'Souris gaming', reference: 'MOU-002', quantiteStock: 0, seuilAlerte: 15, seuilCritique: 5, prixAchat: 35 },
          fournisseur: { id: '1', nom: 'TechSupply', delaiLivraison: 5 },
          quantiteSuggere: 30,
          urgence: 'critique',
          estimationCout: 1050,
        },
        {
          id: '3',
          produit: { id: '3', nom: 'Écran 27"', reference: 'MON-003', quantiteStock: 8, seuilAlerte: 10, seuilCritique: 3, prixAchat: 250 },
          fournisseur: { id: '2', nom: 'DisplayPro', delaiLivraison: 7 },
          quantiteSuggere: 10,
          urgence: 'haute',
          estimationCout: 2500,
        },
        {
          id: '4',
          produit: { id: '4', nom: 'Câble HDMI 2m', reference: 'CBL-004', quantiteStock: 25, seuilAlerte: 30, seuilCritique: 10, prixAchat: 8 },
          quantiteSuggere: 50,
          urgence: 'normale',
          estimationCout: 400,
        },
      ]);
      this.isLoading.set(false);
    }, 800);
  }

  getUrgenceLabel(urgence: string): string {
    const labels: Record<string, string> = {
      'critique': 'Critique',
      'haute': 'Urgent',
      'normale': 'Normal',
    };
    return labels[urgence] || urgence;
  }

  applyFilters(): void {
    this.selectAll = false;
  }

  toggleSelectAll(): void {
    this.suggestions.update(suggestions =>
      suggestions.map(s => ({ ...s, selected: this.selectAll }))
    );
  }

  updateSelection(): void {
    this.selectAll = this.suggestions().every(s => s.selected);
  }

  recalculerCout(suggestion: Suggestion): void {
    suggestion.estimationCout = suggestion.quantiteSuggere * suggestion.produit.prixAchat;
  }

  creerCommandeAchat(): void {
    const selected = this.suggestions().filter(s => s.selected);
    if (selected.length === 0) return;

    this.notificationService.success(`Création de commande pour ${selected.length} produit(s)...`);
    // Rediriger vers le formulaire de commande d'achat
  }

  showPremiumFeature(feature: string): void {
    this.notificationService.info('Cette fonctionnalité nécessite un abonnement Premium');
  }
}
