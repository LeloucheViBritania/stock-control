/**
 * Segmentation des clients - Aperçu FREE, détails PREMIUM
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientsService } from '../../services/clients.service';
import { AuthService } from '@services/auth.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

interface SegmentData {
  segment: string;
  count: number;
  totalAchats: number;
  color: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-segmentation',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/clients" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Segmentation Clients</h1>
            <p class="text-gray-600 dark:text-gray-400">Analysez vos clients par segment</p>
          </div>
        </div>
      </div>

      @if (isLoading()) {
        <div class="card p-12">
          <app-loading-spinner size="lg" text="Chargement..." />
        </div>
      } @else {
        <!-- Segments Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (segment of segments(); track segment.segment) {
            <div class="card p-6 hover:shadow-md transition-shadow cursor-pointer"
                 [routerLink]="['/clients']" 
                 [queryParams]="{ segment: segment.segment }">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center" [style.background-color]="segment.color + '20'">
                  @switch (segment.segment) {
                    @case ('VIP') {
                      <svg class="w-6 h-6" [style.color]="segment.color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                      </svg>
                    }
                    @case ('REGULIER') {
                      <svg class="w-6 h-6" [style.color]="segment.color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    }
                    @case ('NOUVEAU') {
                      <svg class="w-6 h-6" [style.color]="segment.color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                      </svg>
                    }
                    @case ('INACTIF') {
                      <svg class="w-6 h-6" [style.color]="segment.color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    }
                  }
                </div>
                <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ segment.count }}</span>
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ getSegmentLabel(segment.segment) }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ segment.description }}</p>
              <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  CA total: <span class="font-semibold text-gray-900 dark:text-white">{{ segment.totalAchats | number:'1.0-0' }} €</span>
                </p>
              </div>
            </div>
          }
        </div>

        <!-- Graphique répartition -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Donut Chart -->
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Répartition des clients</h3>
            <div class="flex items-center justify-center">
              <div class="relative w-48 h-48">
                <!-- SVG Donut simplifié -->
                <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
                  @for (segment of segments(); track segment.segment; let i = $index) {
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      [attr.stroke]="segment.color"
                      stroke-width="20"
                      [attr.stroke-dasharray]="getStrokeDasharray(segment, i)"
                      [attr.stroke-dashoffset]="getStrokeDashoffset(i)"
                    />
                  }
                </svg>
                <div class="absolute inset-0 flex items-center justify-center flex-col">
                  <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ totalClients() }}</span>
                  <span class="text-sm text-gray-500">clients</span>
                </div>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-2 gap-3">
              @for (segment of segments(); track segment.segment) {
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full" [style.background-color]="segment.color"></div>
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ getSegmentLabel(segment.segment) }}</span>
                  <span class="text-sm font-medium text-gray-900 dark:text-white ml-auto">{{ getPercentage(segment) }}%</span>
                </div>
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
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 max-w-xs">
                    Débloquez les analyses détaillées, les prédictions de churn et les recommandations personnalisées.
                  </p>
                  <a routerLink="/abonnement" class="btn bg-gradient-to-r from-warning-500 to-warning-600 text-white">
                    Passer à Premium
                  </a>
                </div>
              </div>
            }
            
            <div class="space-y-4">
              <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div class="flex items-center gap-3 mb-2">
                  <svg class="w-5 h-5 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                  <span class="font-medium text-gray-900 dark:text-white">Prédiction de churn</span>
                </div>
                <p class="text-sm text-gray-500">Identifiez les clients à risque de départ</p>
              </div>
              
              <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div class="flex items-center gap-3 mb-2">
                  <svg class="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                  <span class="font-medium text-gray-900 dark:text-white">Valeur vie client (CLV)</span>
                </div>
                <p class="text-sm text-gray-500">Estimez la valeur future de chaque client</p>
              </div>
              
              <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div class="flex items-center gap-3 mb-2">
                  <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                  <span class="font-medium text-gray-900 dark:text-white">Recommandations</span>
                </div>
                <p class="text-sm text-gray-500">Actions personnalisées par segment</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tableau détaillé par segment (simplifié FREE) -->
        <div class="card overflow-hidden">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="font-semibold text-gray-900 dark:text-white">Détail par segment</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Segment</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Clients</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">% Total</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">CA Total</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">CA Moyen</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Panier Moyen
                    @if (!isPremium()) {
                      <span class="badge-premium text-xs ml-1">PRO</span>
                    }
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                @for (segment of segments(); track segment.segment) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-3 h-3 rounded-full" [style.background-color]="segment.color"></div>
                        <span class="font-medium text-gray-900 dark:text-white">{{ getSegmentLabel(segment.segment) }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                      {{ segment.count }}
                    </td>
                    <td class="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                      {{ getPercentage(segment) }}%
                    </td>
                    <td class="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                      {{ segment.totalAchats | number:'1.0-0' }} €
                    </td>
                    <td class="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                      {{ segment.count > 0 ? (segment.totalAchats / segment.count | number:'1.0-0') : 0 }} €
                    </td>
                    <td class="px-6 py-4 text-right">
                      @if (isPremium()) {
                        <span class="text-gray-900 dark:text-white">{{ getAverageBasket(segment) | number:'1.0-0' }} €</span>
                      } @else {
                        <span class="text-gray-400">—</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class SegmentationComponent implements OnInit {
  private readonly clientsService = inject(ClientsService);
  private readonly authService = inject(AuthService);

  segments = signal<SegmentData[]>([]);
  isLoading = signal(true);

  isPremium = computed(() => this.authService.isPremium());
  totalClients = computed(() => this.segments().reduce((sum, s) => sum + s.count, 0));

  private segmentConfig: Record<string, { color: string; description: string }> = {
    'VIP': { color: '#f59e0b', description: 'Vos meilleurs clients' },
    'REGULIER': { color: '#10b981', description: 'Achats réguliers' },
    'NOUVEAU': { color: '#3b82f6', description: 'Clients récents' },
    'INACTIF': { color: '#6b7280', description: 'Sans activité récente' },
  };

  ngOnInit(): void {
    this.loadSegmentation();
  }

  loadSegmentation(): void {
    this.clientsService.getSegmentation().subscribe({
      next: (data) => {
        const segments = data.map(s => ({
          ...s,
          color: this.segmentConfig[s.segment]?.color || '#6b7280',
          icon: '',
          description: this.segmentConfig[s.segment]?.description || '',
        }));
        this.segments.set(segments);
        this.isLoading.set(false);
      },
      error: () => {
        // Données de démo
        this.segments.set([
          { segment: 'VIP', count: 45, totalAchats: 125000, color: '#f59e0b', icon: '', description: 'Vos meilleurs clients' },
          { segment: 'REGULIER', count: 180, totalAchats: 85000, color: '#10b981', icon: '', description: 'Achats réguliers' },
          { segment: 'NOUVEAU', count: 67, totalAchats: 12000, color: '#3b82f6', icon: '', description: 'Clients récents' },
          { segment: 'INACTIF', count: 98, totalAchats: 45000, color: '#6b7280', icon: '', description: 'Sans activité récente' },
        ]);
        this.isLoading.set(false);
      },
    });
  }

  getSegmentLabel(segment: string): string {
    const labels: Record<string, string> = {
      'VIP': 'VIP',
      'REGULIER': 'Réguliers',
      'NOUVEAU': 'Nouveaux',
      'INACTIF': 'Inactifs',
    };
    return labels[segment] || segment;
  }

  getPercentage(segment: SegmentData): number {
    const total = this.totalClients();
    if (total === 0) return 0;
    return Math.round((segment.count / total) * 100);
  }

  getAverageBasket(segment: SegmentData): number {
    // Simulation - en réalité viendrait du backend
    return Math.round(segment.totalAchats / (segment.count * 3));
  }

  // Pour le graphique donut
  getStrokeDasharray(segment: SegmentData, index: number): string {
    const total = this.totalClients();
    if (total === 0) return '0 251.2';
    const percentage = segment.count / total;
    const circumference = 2 * Math.PI * 40;
    return `${percentage * circumference} ${circumference}`;
  }

  getStrokeDashoffset(index: number): number {
    const circumference = 2 * Math.PI * 40;
    let offset = 0;
    for (let i = 0; i < index; i++) {
      const seg = this.segments()[i];
      const total = this.totalClients();
      if (total > 0) {
        offset += (seg.count / total) * circumference;
      }
    }
    return -offset;
  }
}
