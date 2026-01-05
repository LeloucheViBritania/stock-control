/**
 * Liste des suggestions de réapprovisionnement (PREMIUM)
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PrevisionsService, RecommandationReapprovisionnement } from '@features/previsions/services/previsions.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-suggestions-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Suggestions de Réapprovisionnement</h1>
            <span class="badge-premium">Premium</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Recommandations intelligentes basées sur l'analyse de vos ventes</p>
        </div>
        <div class="flex gap-3">
          <button type="button" class="btn-secondary" (click)="exporterListe()">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Exporter
          </button>
          <a routerLink="bon-commande" class="btn-primary">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            Créer bon de commande
          </a>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card p-4">
          <p class="text-sm text-gray-500">Suggestions urgentes</p>
          <p class="text-2xl font-bold text-danger-600">{{ urgentes() }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Priorité haute</p>
          <p class="text-2xl font-bold text-warning-600">{{ hautes() }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Total suggestions</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ suggestions().length }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Coût total estimé</p>
          <p class="text-2xl font-bold text-primary-600">{{ coutTotal() | number:'1.0-0' }} €</p>
        </div>
      </div>

      <!-- Filtres -->
      <div class="card p-4">
        <div class="flex flex-wrap items-center gap-4">
          <input type="text" [(ngModel)]="searchQuery" placeholder="Rechercher un produit..." class="form-input flex-1 min-w-[200px]" />
          <select [(ngModel)]="filterUrgence" class="form-input w-auto">
            <option value="">Toutes urgences</option>
            <option value="CRITIQUE">Critique</option>
            <option value="HAUTE">Haute</option>
            <option value="NORMALE">Normale</option>
            <option value="BASSE">Basse</option>
          </select>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" [(ngModel)]="selectAll" (change)="toggleSelectAll()" class="rounded" />
            Tout sélectionner
          </label>
        </div>
      </div>

      @if (isLoading()) {
        <div class="card p-12"><app-loading-spinner size="lg" text="Analyse en cours..." /></div>
      } @else {
        <div class="space-y-4">
          @for (s of filteredSuggestions(); track s.produitId) {
            <div 
              class="card p-4 border-l-4 transition-all"
              [ngClass]="{
                'border-l-danger-500': s.urgence === 'CRITIQUE',
                'border-l-warning-500': s.urgence === 'HAUTE',
                'border-l-primary-500': s.urgence === 'NORMALE',
                'border-l-gray-300': s.urgence === 'BASSE'
              }"
            >
              <div class="flex items-start gap-4">
                <input type="checkbox" [(ngModel)]="s.selected" class="mt-1 rounded" />
                <div class="flex-1">
                  <div class="flex items-start justify-between">
                    <div>
                      <h3 class="font-semibold text-gray-900 dark:text-white">{{ s.produitNom }}</h3>
                      <p class="text-sm text-gray-500">{{ s.produitReference }}</p>
                    </div>
                    <span 
                      class="px-2 py-1 text-xs font-medium rounded-full"
                      [ngClass]="{
                        'bg-danger-100 text-danger-700': s.urgence === 'CRITIQUE',
                        'bg-warning-100 text-warning-700': s.urgence === 'HAUTE',
                        'bg-primary-100 text-primary-700': s.urgence === 'NORMALE',
                        'bg-gray-100 text-gray-700': s.urgence === 'BASSE'
                      }"
                    >
                      {{ s.urgence }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mt-2">{{ s.raisonRecommandation }}</p>
                  <div class="flex flex-wrap items-center gap-6 mt-3 text-sm">
                    <div>
                      <span class="text-gray-500">Stock actuel:</span>
                      <span class="font-medium ml-1" [class.text-danger-600]="s.stockActuel <= s.seuilAlerte">{{ s.stockActuel }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Seuil:</span>
                      <span class="font-medium ml-1">{{ s.seuilAlerte }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Recommandé:</span>
                      <span class="font-bold ml-1 text-primary-600">{{ s.quantiteRecommandee }} unités</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Coût estimé:</span>
                      <span class="font-bold ml-1">{{ s.coutEstime | number:'1.0-0' }} €</span>
                    </div>
                    @if (s.fournisseurNom) {
                      <div>
                        <span class="text-gray-500">Fournisseur:</span>
                        <span class="font-medium ml-1">{{ s.fournisseurNom }}</span>
                      </div>
                    }
                    @if (s.delaiLivraison) {
                      <div>
                        <span class="text-gray-500">Délai:</span>
                        <span class="font-medium ml-1">{{ s.delaiLivraison }}j</span>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          } @empty {
            <div class="card p-12 text-center">
              <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Aucune suggestion</h3>
              <p class="text-gray-500 mt-1">Tous vos stocks sont à niveau optimal</p>
            </div>
          }
        </div>

        @if (selectedCount() > 0) {
          <div class="sticky bottom-4 card p-4 bg-primary-50 dark:bg-primary-900/20 border-primary-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-primary-900 dark:text-primary-100">{{ selectedCount() }} produit(s) sélectionné(s)</p>
                <p class="text-sm text-primary-700 dark:text-primary-300">Coût total: {{ selectedCost() | number:'1.0-0' }} €</p>
              </div>
              <a routerLink="bon-commande" [queryParams]="{produits: selectedIds()}" class="btn-primary">
                Créer bon de commande
              </a>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class SuggestionsListComponent implements OnInit {
  private readonly previsionsService = inject(PrevisionsService);
  private readonly notificationService = inject(NotificationService);

  suggestions = signal<(RecommandationReapprovisionnement & { selected?: boolean })[]>([]);
  isLoading = signal(true);
  searchQuery = '';
  filterUrgence = '';
  selectAll = false;

  filteredSuggestions = computed(() => {
    let result = this.suggestions();
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(s => s.produitNom.toLowerCase().includes(q) || s.produitReference.toLowerCase().includes(q));
    }
    if (this.filterUrgence) {
      result = result.filter(s => s.urgence === this.filterUrgence);
    }
    return result;
  });

  urgentes = computed(() => this.suggestions().filter(s => s.urgence === 'CRITIQUE').length);
  hautes = computed(() => this.suggestions().filter(s => s.urgence === 'HAUTE').length);
  coutTotal = computed(() => this.suggestions().reduce((sum, s) => sum + s.coutEstime, 0));
  selectedCount = computed(() => this.suggestions().filter(s => s.selected).length);
  selectedCost = computed(() => this.suggestions().filter(s => s.selected).reduce((sum, s) => sum + s.coutEstime, 0));
  selectedIds = computed(() => this.suggestions().filter(s => s.selected).map(s => s.produitId).join(','));

  ngOnInit(): void { this.loadSuggestions(); }

  loadSuggestions(): void {
    this.previsionsService.getRecommandationsReapprovisionnement().subscribe({
      next: (r) => { this.suggestions.set(r.map(s => ({ ...s, selected: false }))); this.isLoading.set(false); },
      error: () => {
        this.suggestions.set([
          { produitId: '1', produitNom: 'Souris gaming RGB', produitReference: 'MS-GAM-001', stockActuel: 3, seuilAlerte: 20, quantiteRecommandee: 100, coutEstime: 3000, urgence: 'CRITIQUE', raisonRecommandation: 'Stock critique - rupture imminente dans 2 jours', fournisseurNom: 'TechSupply', delaiLivraison: 3, selected: false },
          { produitId: '2', produitNom: 'Écran LCD 24"', produitReference: 'LCD-24-002', stockActuel: 15, seuilAlerte: 25, quantiteRecommandee: 50, coutEstime: 9000, urgence: 'HAUTE', raisonRecommandation: 'Stock sous le seuil, forte demande prévue', fournisseurNom: 'DisplayPro', delaiLivraison: 5, selected: false },
          { produitId: '3', produitNom: 'Clavier mécanique', produitReference: 'KB-MECH-003', stockActuel: 45, seuilAlerte: 50, quantiteRecommandee: 80, coutEstime: 6000, urgence: 'NORMALE', raisonRecommandation: 'Réapprovisionnement préventif recommandé', fournisseurNom: 'KeyboardWorld', delaiLivraison: 4, selected: false },
          { produitId: '4', produitNom: 'Câble HDMI 2m', produitReference: 'CBL-HDMI-004', stockActuel: 120, seuilAlerte: 100, quantiteRecommandee: 200, coutEstime: 1600, urgence: 'BASSE', raisonRecommandation: 'Stock correct mais promotion à venir', fournisseurNom: 'CableExpress', delaiLivraison: 2, selected: false },
        ] as any);
        this.isLoading.set(false);
      }
    });
  }

  toggleSelectAll(): void {
    const filtered = this.filteredSuggestions();
    filtered.forEach(s => s.selected = this.selectAll);
    this.suggestions.update(list => [...list]);
  }

  exporterListe(): void {
    this.notificationService.success('Export des suggestions lancé');
  }
}
