/**
 * Widget d'alertes pour le dashboard (PREMIUM)
 */
import { Component, OnInit, inject, signal, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface AlerteResume {
  type: string;
  count: number;
  prioriteCritique: number;
}

@Component({
  selector: 'app-alertes-widget',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="card p-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">Alertes Stock</h3>
        <a routerLink="/alertes-stock" class="text-sm text-primary-600 hover:underline">Voir tout</a>
      </div>

      @if (totalAlertes() > 0) {
        <!-- Résumé -->
        <div class="flex items-center gap-4 mb-4 p-3 rounded-lg"
          [class.bg-danger-50]="alertesCritiques() > 0"
          [class.bg-warning-50]="alertesCritiques() === 0"
        >
          <div class="w-12 h-12 rounded-full flex items-center justify-center"
            [class.bg-danger-100]="alertesCritiques() > 0"
            [class.bg-warning-100]="alertesCritiques() === 0"
          >
            <svg class="w-6 h-6" 
              [class.text-danger-600]="alertesCritiques() > 0"
              [class.text-warning-600]="alertesCritiques() === 0"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold"
              [class.text-danger-700]="alertesCritiques() > 0"
              [class.text-warning-700]="alertesCritiques() === 0"
            >{{ totalAlertes() }}</p>
            <p class="text-sm text-gray-600">alertes actives</p>
          </div>
          @if (alertesCritiques() > 0) {
            <div class="ml-auto text-right">
              <p class="text-lg font-bold text-danger-600">{{ alertesCritiques() }}</p>
              <p class="text-xs text-danger-500">critiques</p>
            </div>
          }
        </div>

        <!-- Répartition par type -->
        <div class="space-y-2">
          @for (alerte of alertesParType(); track alerte.type) {
            <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full"
                  [class.bg-danger-500]="alerte.type === 'RUPTURE'"
                  [class.bg-warning-500]="alerte.type === 'SEUIL_BAS'"
                  [class.bg-purple-500]="alerte.type === 'SURSTOCK'"
                  [class.bg-orange-500]="alerte.type === 'PEREMPTION'"
                ></span>
                <span class="text-sm text-gray-600">{{ getTypeLabel(alerte.type) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ alerte.count }}</span>
                @if (alerte.prioriteCritique > 0) {
                  <span class="px-1.5 py-0.5 text-xs bg-danger-100 text-danger-700 rounded">
                    {{ alerte.prioriteCritique }} crit.
                  </span>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-6">
          <div class="w-12 h-12 mx-auto bg-success-100 rounded-full flex items-center justify-center mb-3">
            <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p class="text-gray-500">Aucune alerte active</p>
          <p class="text-sm text-gray-400">Tout est sous contrôle !</p>
        </div>
      }
    </div>
  `,
})
export class AlertesWidgetComponent implements OnInit {
  @Input() maxItems = 5;

  alertesParType = signal<AlerteResume[]>([]);
  
  totalAlertes = computed(() => this.alertesParType().reduce((sum, a) => sum + a.count, 0));
  alertesCritiques = computed(() => this.alertesParType().reduce((sum, a) => sum + a.prioriteCritique, 0));

  ngOnInit(): void {
    this.loadAlertes();
  }

  loadAlertes(): void {
    // Mock data - à remplacer par appel API
    this.alertesParType.set([
      { type: 'RUPTURE', count: 3, prioriteCritique: 2 },
      { type: 'SEUIL_BAS', count: 8, prioriteCritique: 1 },
      { type: 'SURSTOCK', count: 2, prioriteCritique: 0 },
      { type: 'PEREMPTION', count: 4, prioriteCritique: 1 },
    ]);
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'RUPTURE': 'Rupture de stock',
      'SEUIL_BAS': 'Stock bas',
      'SURSTOCK': 'Surstock',
      'PEREMPTION': 'Péremption',
      'ECART': 'Écart inventaire'
    };
    return labels[type] || type;
  }
}
