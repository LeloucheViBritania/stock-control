/**
 * Statistiques des mouvements de stock
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MouvementsStockService } from '../../services/mouvements-stock.service';
import { AuthService } from '@services/auth.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';
import { TypeMouvementLabels, TypeMouvementColors } from '@enums/type-mouvement.enum';

@Component({
  selector: 'app-mouvements-stats',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/mouvements-stock" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Statistiques des mouvements</h1>
            <p class="text-gray-600">Analyse de l'activité stock</p>
          </div>
        </div>

        <!-- Période -->
        <div class="flex items-center gap-2">
          <select [(ngModel)]="periode" (ngModelChange)="loadStats()" class="form-input">
            <option value="jour">Aujourd'hui</option>
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="annee">Cette année</option>
          </select>
        </div>
      </div>

      @if (isLoading()) {
        <div class="card p-12">
          <app-loading-spinner size="lg" />
        </div>
      } @else {
        <!-- KPIs -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Total mouvements</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ stats()?.totalMouvements || 0 }}</p>
              </div>
              <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="card p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Entrées</p>
                <p class="text-3xl font-bold text-success-600 mt-1">+{{ stats()?.entrees || 0 }}</p>
              </div>
              <div class="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                </svg>
              </div>
            </div>
            <p class="text-sm text-gray-500 mt-2">
              Valeur: <span class="font-medium">{{ stats()?.valeurEntrees || 0 | number:'1.0-0' }} €</span>
            </p>
          </div>

          <div class="card p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Sorties</p>
                <p class="text-3xl font-bold text-danger-600 mt-1">-{{ stats()?.sorties || 0 }}</p>
              </div>
              <div class="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                </svg>
              </div>
            </div>
            <p class="text-sm text-gray-500 mt-2">
              Valeur: <span class="font-medium">{{ stats()?.valeurSorties || 0 | number:'1.0-0' }} €</span>
            </p>
          </div>

          <div class="card p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Ajustements</p>
                <p class="text-3xl font-bold text-warning-600 mt-1">{{ stats()?.ajustements || 0 }}</p>
              </div>
              <div class="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Répartition par type -->
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Répartition par type</h3>
            
            <div class="space-y-4">
              @for (item of stats()?.mouvementsParType || []; track item.type) {
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ getTypeLabel(item.type) }}
                    </span>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ item.count }} ({{ getPercentage(item.count) }}%)
                    </span>
                  </div>
                  <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      class="h-full rounded-full transition-all duration-500"
                      [style.width.%]="getPercentage(item.count)"
                      [style.background-color]="getTypeColor(item.type)"
                    ></div>
                  </div>
                </div>
              }

              @if (!stats()?.mouvementsParType?.length) {
                <p class="text-gray-500 text-center py-8">Aucune donnée</p>
              }
            </div>
          </div>

          <!-- Évolution (graphique simplifié) -->
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Évolution journalière</h3>
            
            @if (stats()?.evolutionJour?.length) {
              <div class="space-y-2">
                @for (jour of stats()?.evolutionJour?.slice(-7) || []; track jour.date) {
                  <div class="flex items-center gap-4">
                    <span class="text-sm text-gray-500 w-20">{{ jour.date | date:'EEE dd' }}</span>
                    <div class="flex-1 flex gap-1 items-center">
                      <!-- Barre entrées -->
                      <div 
                        class="h-6 bg-success-500 rounded-l"
                        [style.width.%]="getBarWidth(jour.entrees, 'entrees')"
                        title="Entrées: {{ jour.entrees }}"
                      ></div>
                      <!-- Barre sorties -->
                      <div 
                        class="h-6 bg-danger-500 rounded-r"
                        [style.width.%]="getBarWidth(jour.sorties, 'sorties')"
                        title="Sorties: {{ jour.sorties }}"
                      ></div>
                    </div>
                    <div class="text-xs text-gray-500 w-16 text-right">
                      <span class="text-success-600">+{{ jour.entrees }}</span>
                      <span class="text-danger-600 ml-1">-{{ jour.sorties }}</span>
                    </div>
                  </div>
                }
              </div>
              
              <div class="flex items-center justify-center gap-6 mt-4 text-sm">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-success-500 rounded"></div>
                  <span class="text-gray-600">Entrées</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-danger-500 rounded"></div>
                  <span class="text-gray-600">Sorties</span>
                </div>
              </div>
            } @else {
              <p class="text-gray-500 text-center py-8">Aucune donnée</p>
            }
          </div>
        </div>

        <!-- Analyses avancées (PREMIUM) -->
        <div class="card p-6 relative overflow-hidden">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Analyses avancées</h3>
          
          @if (!isPremium()) {
            <div class="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-800 via-white/90 dark:via-gray-800/90 to-transparent flex items-end justify-center pb-8 z-10">
              <div class="text-center">
                <span class="badge-premium mb-3">Premium</span>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 max-w-md">
                  Accédez aux analyses avancées : tendances, prévisions, alertes automatiques et rapports personnalisés.
                </p>
                <a routerLink="/abonnement" class="btn bg-gradient-to-r from-warning-500 to-warning-600 text-white">
                  Passer à Premium
                </a>
              </div>
            </div>
          }

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-50">
            <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div class="flex items-center gap-3 mb-2">
                <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
                <span class="font-medium text-gray-900 dark:text-white">Tendances</span>
              </div>
              <p class="text-sm text-gray-500">Analyse des tendances de stock sur 12 mois</p>
            </div>
            
            <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div class="flex items-center gap-3 mb-2">
                <svg class="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <span class="font-medium text-gray-900 dark:text-white">Prévisions</span>
              </div>
              <p class="text-sm text-gray-500">Prédiction des besoins de réapprovisionnement</p>
            </div>
            
            <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div class="flex items-center gap-3 mb-2">
                <svg class="w-5 h-5 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                <span class="font-medium text-gray-900 dark:text-white">Alertes</span>
              </div>
              <p class="text-sm text-gray-500">Notifications automatiques sur les anomalies</p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class MouvementsStatsComponent implements OnInit {
  private readonly mouvementsService = inject(MouvementsStockService);
  private readonly authService = inject(AuthService);

  stats = signal<any>(null);
  isLoading = signal(true);
  periode: 'jour' | 'semaine' | 'mois' | 'annee' = 'mois';

  isPremium = computed(() => this.authService.isPremium());

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading.set(true);
    this.mouvementsService.getStats(this.periode).subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.isLoading.set(false);
      },
      error: () => {
        // Données de démo
        this.stats.set({
          totalMouvements: 156,
          entrees: 89,
          sorties: 52,
          ajustements: 15,
          valeurEntrees: 12500,
          valeurSorties: 8900,
          mouvementsParType: [
            { type: 'ENTREE', count: 89, valeur: 12500 },
            { type: 'SORTIE', count: 52, valeur: 8900 },
            { type: 'AJUSTEMENT_POSITIF', count: 8, valeur: 500 },
            { type: 'AJUSTEMENT_NEGATIF', count: 7, valeur: 350 },
          ],
          evolutionJour: [
            { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), entrees: 12, sorties: 8 },
            { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), entrees: 8, sorties: 5 },
            { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), entrees: 15, sorties: 10 },
            { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), entrees: 6, sorties: 12 },
            { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), entrees: 20, sorties: 7 },
            { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), entrees: 18, sorties: 6 },
            { date: new Date(), entrees: 10, sorties: 4 },
          ],
        });
        this.isLoading.set(false);
      },
    });
  }

  getTypeLabel(type: string): string {
    return TypeMouvementLabels[type as keyof typeof TypeMouvementLabels] || type;
  }

  getTypeColor(type: string): string {
    return TypeMouvementColors[type as keyof typeof TypeMouvementColors] || '#6b7280';
  }

  getPercentage(count: number): number {
    const total = this.stats()?.totalMouvements || 1;
    return Math.round((count / total) * 100);
  }

  getBarWidth(value: number, type: 'entrees' | 'sorties'): number {
    const evolution = this.stats()?.evolutionJour || [];
    const maxEntrees = Math.max(...evolution.map((j: any) => j.entrees), 1);
    const maxSorties = Math.max(...evolution.map((j: any) => j.sorties), 1);
    const max = Math.max(maxEntrees, maxSorties);
    return (value / max) * 50;
  }
}
