/**
 * Cartographie des entrepôts (PREMIUM)
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EntrepotsService } from '../../services/entrepots.service';

interface EntrepotLocation {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  latitude: number;
  longitude: number;
  stockActuel: number;
  capaciteMax: number;
  tauxRemplissage: number;
  valeurStock: number;
  statut: 'ACTIF' | 'MAINTENANCE' | 'INACTIF';
}

@Component({
  selector: 'app-entrepots-carte',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a routerLink="/entrepots" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Carte des Entrepôts</h1>
              <span class="badge-premium">Premium</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Vue géographique de votre réseau logistique</p>
          </div>
        </div>
      </div>

      <!-- KPIs résumé -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card p-4">
          <p class="text-sm text-gray-500">Entrepôts actifs</p>
          <p class="text-2xl font-bold text-success-600">{{ entrepotsActifs() }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Stock total</p>
          <p class="text-2xl font-bold text-primary-600">{{ stockTotal() | number }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Valeur totale</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ valeurTotale() | number:'1.0-0' }} €</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Taux remplissage moyen</p>
          <p class="text-2xl font-bold" [class.text-success-600]="tauxMoyen() < 70" [class.text-warning-600]="tauxMoyen() >= 70 && tauxMoyen() < 90" [class.text-danger-600]="tauxMoyen() >= 90">
            {{ tauxMoyen() | number:'1.0-0' }}%
          </p>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Carte (placeholder) -->
        <div class="lg:col-span-2 card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Répartition géographique</h3>
          <div class="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg overflow-hidden" style="height: 400px;">
            <!-- Carte de France stylisée -->
            <svg viewBox="0 0 600 600" class="w-full h-full opacity-30">
              <path d="M300 50 L450 150 L500 300 L450 450 L350 550 L200 500 L100 400 L80 250 L150 120 Z" fill="currentColor" class="text-blue-300"/>
            </svg>
            
            <!-- Points des entrepôts -->
            @for (e of entrepots(); track e.id) {
              <div 
                class="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                [style.left.%]="getPositionX(e)"
                [style.top.%]="getPositionY(e)"
                (click)="selectEntrepot(e)"
              >
                <div class="relative">
                  <!-- Marker -->
                  <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                    [class.bg-success-500]="e.statut === 'ACTIF' && e.tauxRemplissage < 70"
                    [class.bg-warning-500]="e.statut === 'ACTIF' && e.tauxRemplissage >= 70 && e.tauxRemplissage < 90"
                    [class.bg-danger-500]="e.statut === 'ACTIF' && e.tauxRemplissage >= 90"
                    [class.bg-gray-400]="e.statut !== 'ACTIF'"
                  >
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
                    </svg>
                  </div>
                  
                  <!-- Tooltip -->
                  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    <p class="font-semibold">{{ e.nom }}</p>
                    <p>{{ e.tauxRemplissage }}% occupé</p>
                    <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            }
          </div>
          
          <!-- Légende -->
          <div class="flex items-center justify-center gap-6 mt-4">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-success-500"></div>
              <span class="text-sm text-gray-600">Optimal (&lt;70%)</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-warning-500"></div>
              <span class="text-sm text-gray-600">Élevé (70-90%)</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-danger-500"></div>
              <span class="text-sm text-gray-600">Critique (&gt;90%)</span>
            </div>
          </div>
        </div>

        <!-- Liste entrepôts -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Détails</h3>
          <div class="space-y-3 max-h-96 overflow-y-auto">
            @for (e of entrepots(); track e.id) {
              <a 
                [routerLink]="['/entrepots', e.id]"
                class="block p-4 rounded-lg transition-all cursor-pointer"
                [class.bg-primary-50]="selectedEntrepot()?.id === e.id"
                [class.border-primary-500]="selectedEntrepot()?.id === e.id"
                [class.bg-gray-50]="selectedEntrepot()?.id !== e.id"
                [class.hover:bg-gray-100]="selectedEntrepot()?.id !== e.id"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="font-medium text-gray-900 dark:text-white">{{ e.nom }}</span>
                  <span class="px-2 py-0.5 text-xs rounded-full"
                    [class.bg-success-100]="e.statut === 'ACTIF'"
                    [class.text-success-700]="e.statut === 'ACTIF'"
                    [class.bg-warning-100]="e.statut === 'MAINTENANCE'"
                    [class.text-warning-700]="e.statut === 'MAINTENANCE'"
                    [class.bg-gray-100]="e.statut === 'INACTIF'"
                    [class.text-gray-700]="e.statut === 'INACTIF'"
                  >{{ e.statut }}</span>
                </div>
                <p class="text-sm text-gray-500 mb-2">{{ e.ville }}</p>
                
                <!-- Barre de remplissage -->
                <div class="mb-2">
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-gray-500">Remplissage</span>
                    <span class="font-medium">{{ e.tauxRemplissage }}%</span>
                  </div>
                  <div class="h-2 bg-gray-200 rounded-full">
                    <div 
                      class="h-full rounded-full transition-all"
                      [class.bg-success-500]="e.tauxRemplissage < 70"
                      [class.bg-warning-500]="e.tauxRemplissage >= 70 && e.tauxRemplissage < 90"
                      [class.bg-danger-500]="e.tauxRemplissage >= 90"
                      [style.width.%]="e.tauxRemplissage"
                    ></div>
                  </div>
                </div>
                
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">{{ e.stockActuel | number }} articles</span>
                  <span class="font-medium text-primary-600">{{ e.valeurStock | number:'1.0-0' }} €</span>
                </div>
              </a>
            }
          </div>
        </div>
      </div>

      <!-- Actions transfert -->
      <div class="card p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h3>
        <div class="grid gap-4 md:grid-cols-3">
          <a routerLink="/transferts-stock/nouveau" class="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">Nouveau transfert</p>
                <p class="text-xs text-gray-500">Déplacer du stock entre entrepôts</p>
              </div>
            </div>
          </a>
          <a routerLink="/inventaire" class="p-4 bg-success-50 dark:bg-success-900/20 rounded-lg hover:bg-success-100 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">Inventaire</p>
                <p class="text-xs text-gray-500">Lancer un comptage physique</p>
              </div>
            </div>
          </a>
          <a routerLink="/rapports/stock" class="p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg hover:bg-warning-100 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">Rapport stock</p>
                <p class="text-xs text-gray-500">Analyser la répartition</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class EntrepotsCarteComponent implements OnInit {
  private readonly entrepotsService = inject(EntrepotsService);

  entrepots = signal<EntrepotLocation[]>([]);
  selectedEntrepot = signal<EntrepotLocation | null>(null);

  entrepotsActifs = computed(() => this.entrepots().filter(e => e.statut === 'ACTIF').length);
  stockTotal = computed(() => this.entrepots().reduce((sum, e) => sum + e.stockActuel, 0));
  valeurTotale = computed(() => this.entrepots().reduce((sum, e) => sum + e.valeurStock, 0));
  tauxMoyen = computed(() => {
    const actifs = this.entrepots().filter(e => e.statut === 'ACTIF');
    if (actifs.length === 0) return 0;
    return actifs.reduce((sum, e) => sum + e.tauxRemplissage, 0) / actifs.length;
  });

  ngOnInit(): void {
    this.loadEntrepots();
  }

  loadEntrepots(): void {
    // Mock data
    this.entrepots.set([
      { id: '1', nom: 'Paris Central', adresse: '12 Rue du Commerce', ville: 'Paris', latitude: 48.8566, longitude: 2.3522, stockActuel: 4500, capaciteMax: 6000, tauxRemplissage: 75, valeurStock: 450000, statut: 'ACTIF' },
      { id: '2', nom: 'Lyon Sud', adresse: '45 Avenue de la Gare', ville: 'Lyon', latitude: 45.7640, longitude: 4.8357, stockActuel: 2800, capaciteMax: 4000, tauxRemplissage: 70, valeurStock: 280000, statut: 'ACTIF' },
      { id: '3', nom: 'Marseille Port', adresse: '8 Quai des Pêcheurs', ville: 'Marseille', latitude: 43.2965, longitude: 5.3698, stockActuel: 3800, capaciteMax: 4000, tauxRemplissage: 95, valeurStock: 350000, statut: 'ACTIF' },
      { id: '4', nom: 'Bordeaux Ouest', adresse: '23 Rue des Vignes', ville: 'Bordeaux', latitude: 44.8378, longitude: -0.5792, stockActuel: 1500, capaciteMax: 3000, tauxRemplissage: 50, valeurStock: 150000, statut: 'ACTIF' },
      { id: '5', nom: 'Lille Nord', adresse: '67 Boulevard Industriel', ville: 'Lille', latitude: 50.6292, longitude: 3.0573, stockActuel: 0, capaciteMax: 2500, tauxRemplissage: 0, valeurStock: 0, statut: 'MAINTENANCE' },
    ]);
  }

  selectEntrepot(e: EntrepotLocation): void {
    this.selectedEntrepot.set(e);
  }

  getPositionX(e: EntrepotLocation): number {
    // Simplified mapping of longitude to X position (France approx -5 to 10)
    return ((e.longitude + 5) / 15) * 80 + 10;
  }

  getPositionY(e: EntrepotLocation): number {
    // Simplified mapping of latitude to Y position (France approx 42 to 51)
    return (1 - (e.latitude - 42) / 9) * 70 + 15;
  }
}
