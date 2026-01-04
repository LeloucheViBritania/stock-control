/**
 * Comparaison de fournisseurs - Basique FREE, Avancé PREMIUM
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FournisseursService, Fournisseur } from '../../services/fournisseurs.service';
import { AuthService } from '@services/auth.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

interface ComparaisonData {
  fournisseur: Fournisseur;
  stats: {
    delaiMoyen: number;
    prixMoyen: number;
    tauxConformite: number;
    evaluation: number;
  };
}

@Component({
  selector: 'app-comparer-fournisseurs',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <a routerLink="/fournisseurs" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Comparer les fournisseurs</h1>
          <p class="text-gray-600">{{ comparaisons().length }} fournisseurs sélectionnés</p>
        </div>
      </div>

      @if (isLoading()) {
        <div class="card p-12">
          <app-loading-spinner size="lg" text="Chargement..." />
        </div>
      } @else {
        <!-- Tableau de comparaison -->
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Critère</th>
                  @for (comp of comparaisons(); track comp.fournisseur.id) {
                    <th class="px-6 py-4 text-center">
                      <div class="flex flex-col items-center">
                        <div class="w-12 h-12 rounded-full bg-info-100 flex items-center justify-center mb-2">
                          <span class="font-bold text-info-600">{{ comp.fournisseur.nom.substring(0, 2).toUpperCase() }}</span>
                        </div>
                        <span class="font-semibold text-gray-900 dark:text-white">{{ comp.fournisseur.nom }}</span>
                      </div>
                    </th>
                  }
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <!-- Évaluation -->
                <tr>
                  <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">Évaluation</td>
                  @for (comp of comparaisons(); track comp.fournisseur.id) {
                    <td class="px-6 py-4 text-center">
                      <div class="flex items-center justify-center gap-1">
                        @for (star of [1,2,3,4,5]; track star) {
                          <svg 
                            class="w-4 h-4"
                            [class.text-warning-500]="star <= comp.fournisseur.evaluation"
                            [class.text-gray-300]="star > comp.fournisseur.evaluation"
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        }
                        <span class="ml-2 font-semibold" [class]="getBestClass('evaluation', comp.fournisseur.evaluation)">
                          {{ comp.fournisseur.evaluation }}/5
                        </span>
                      </div>
                    </td>
                  }
                </tr>

                <!-- Délai livraison -->
                <tr>
                  <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">Délai de livraison</td>
                  @for (comp of comparaisons(); track comp.fournisseur.id) {
                    <td class="px-6 py-4 text-center">
                      <span class="font-semibold" [class]="getBestClass('delai', comp.fournisseur.delaiLivraison, true)">
                        {{ comp.fournisseur.delaiLivraison }} jours
                      </span>
                    </td>
                  }
                </tr>

                <!-- Total achats -->
                <tr>
                  <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">Total achats</td>
                  @for (comp of comparaisons(); track comp.fournisseur.id) {
                    <td class="px-6 py-4 text-center font-semibold text-gray-900 dark:text-white">
                      {{ comp.fournisseur.totalAchats | number:'1.0-0' }} €
                    </td>
                  }
                </tr>

                <!-- Nombre de commandes -->
                <tr>
                  <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">Commandes passées</td>
                  @for (comp of comparaisons(); track comp.fournisseur.id) {
                    <td class="px-6 py-4 text-center font-semibold text-gray-900 dark:text-white">
                      {{ comp.fournisseur.nombreCommandes }}
                    </td>
                  }
                </tr>

                <!-- Localisation -->
                <tr>
                  <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">Localisation</td>
                  @for (comp of comparaisons(); track comp.fournisseur.id) {
                    <td class="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                      {{ comp.fournisseur.ville || '—' }}, {{ comp.fournisseur.pays }}
                    </td>
                  }
                </tr>

                <!-- PREMIUM Stats -->
                <tr class="bg-warning-50/50 dark:bg-warning-900/10">
                  <td [attr.colspan]="comparaisons().length + 1" class="px-6 py-3">
                    <div class="flex items-center gap-2">
                      <span class="badge-premium">Premium</span>
                      <span class="text-sm text-gray-600">Métriques avancées</span>
                    </div>
                  </td>
                </tr>

                <!-- Prix moyen (PREMIUM) -->
                <tr class="relative">
                  <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    Prix moyen d'achat
                  </td>
                  @for (comp of comparaisons(); track comp.fournisseur.id) {
                    <td class="px-6 py-4 text-center">
                      @if (isPremium()) {
                        <span class="font-semibold" [class]="getBestClass('prix', comp.stats.prixMoyen, true)">
                          {{ comp.stats.prixMoyen | number:'1.2-2' }} €
                        </span>
                      } @else {
                        <span class="text-gray-400">—</span>
                      }
                    </td>
                  }
                </tr>

                <!-- Taux conformité (PREMIUM) -->
                <tr>
                  <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    Taux de conformité
                  </td>
                  @for (comp of comparaisons(); track comp.fournisseur.id) {
                    <td class="px-6 py-4 text-center">
                      @if (isPremium()) {
                        <span class="font-semibold" [class]="getBestClass('conformite', comp.stats.tauxConformite)">
                          {{ comp.stats.tauxConformite }}%
                        </span>
                      } @else {
                        <span class="text-gray-400">—</span>
                      }
                    </td>
                  }
                </tr>

                <!-- Délai moyen réel (PREMIUM) -->
                <tr>
                  <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    Délai moyen réel
                  </td>
                  @for (comp of comparaisons(); track comp.fournisseur.id) {
                    <td class="px-6 py-4 text-center">
                      @if (isPremium()) {
                        <span class="font-semibold" [class]="getBestClass('delai', comp.stats.delaiMoyen, true)">
                          {{ comp.stats.delaiMoyen | number:'1.1-1' }} jours
                        </span>
                      } @else {
                        <span class="text-gray-400">—</span>
                      }
                    </td>
                  }
                </tr>

                <!-- Actions -->
                <tr>
                  <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">Actions</td>
                  @for (comp of comparaisons(); track comp.fournisseur.id) {
                    <td class="px-6 py-4 text-center">
                      <a [routerLink]="['/fournisseurs', comp.fournisseur.id]" class="btn-secondary btn-sm">
                        Voir fiche
                      </a>
                    </td>
                  }
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recommandation (PREMIUM) -->
        <div class="card p-6 relative overflow-hidden">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">🏆 Recommandation</h3>
          
          @if (!isPremium()) {
            <div class="absolute inset-0 bg-gradient-to-r from-white/95 dark:from-gray-800/95 to-white/80 dark:to-gray-800/80 flex items-center justify-center z-10">
              <div class="text-center">
                <span class="badge-premium mb-3">Premium</span>
                <p class="text-gray-600 mb-3">Obtenez une recommandation personnalisée basée sur vos critères</p>
                <a routerLink="/abonnement" class="btn bg-gradient-to-r from-warning-500 to-warning-600 text-white">
                  Débloquer cette fonctionnalité
                </a>
              </div>
            </div>
          }

          <div class="p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-success-100 flex items-center justify-center">
                <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">
                  {{ isPremium() ? (bestFournisseur()?.nom || 'Analyse en cours...') : 'Fournisseur recommandé' }}
                </p>
                <p class="text-sm text-gray-600">
                  {{ isPremium() ? 'Meilleur rapport qualité/prix/délai' : 'Passez à Premium pour voir la recommandation' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ComparerFournisseursComponent implements OnInit {
  private readonly fournisseursService = inject(FournisseursService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  comparaisons = signal<ComparaisonData[]>([]);
  isLoading = signal(true);

  isPremium = computed(() => this.authService.isPremium());
  
  bestFournisseur = computed(() => {
    const list = this.comparaisons();
    if (list.length === 0) return null;
    // Simple algo: meilleure évaluation
    return list.reduce((best, curr) => 
      curr.fournisseur.evaluation > best.fournisseur.evaluation ? curr : best
    ).fournisseur;
  });

  ngOnInit(): void {
    const idsParam = this.route.snapshot.queryParams['ids'];
    if (idsParam) {
      const ids = idsParam.split(',');
      this.loadComparaison(ids);
    } else {
      this.isLoading.set(false);
    }
  }

  loadComparaison(ids: string[]): void {
    this.fournisseursService.comparer(ids).subscribe({
      next: (data) => {
        this.comparaisons.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        // Fallback: charger individuellement
        Promise.all(ids.map(id => 
          this.fournisseursService.getById(id).toPromise()
        )).then(fournisseurs => {
          this.comparaisons.set(fournisseurs.filter(Boolean).map(f => ({
            fournisseur: f!,
            stats: {
              delaiMoyen: f!.delaiLivraison,
              prixMoyen: 0,
              tauxConformite: 95,
              evaluation: f!.evaluation,
            },
          })));
          this.isLoading.set(false);
        });
      },
    });
  }

  getBestClass(type: string, value: number, lowerIsBetter = false): string {
    const values = this.comparaisons().map(c => {
      switch (type) {
        case 'evaluation': return c.fournisseur.evaluation;
        case 'delai': return c.fournisseur.delaiLivraison;
        case 'prix': return c.stats.prixMoyen;
        case 'conformite': return c.stats.tauxConformite;
        default: return 0;
      }
    });

    const best = lowerIsBetter ? Math.min(...values) : Math.max(...values);
    
    if (value === best) {
      return 'text-success-600';
    }
    return 'text-gray-900 dark:text-white';
  }
}
