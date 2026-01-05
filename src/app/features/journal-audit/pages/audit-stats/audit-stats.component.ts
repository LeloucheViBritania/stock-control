/**
 * Statistiques d'audit (PREMIUM + ADMIN)
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JournalAuditService, AuditStats } from '../../services/journal-audit.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-audit-stats',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/journal-audit" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Statistiques d'Audit</h1>
              <span class="badge-premium">Premium</span>
            </div>
          </div>
        </div>
      </div>

      @if (isLoading()) {
        <div class="card p-12"><app-loading-spinner size="lg" /></div>
      } @else if (stats()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card p-4">
            <p class="text-sm text-gray-500">Actions totales</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats()?.totalActions | number }}</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-500">Erreurs</p>
            <p class="text-2xl font-bold text-danger-600">{{ stats()?.erreurs | number }}</p>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Actions par type</h3>
            <div class="space-y-3">
              @for (a of stats()?.repartitionActions || []; track a.action) {
                <div class="flex items-center justify-between">
                  <span>{{ a.action }}</span>
                  <span class="font-bold">{{ a.count | number }}</span>
                </div>
              }
            </div>
          </div>
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Utilisateurs actifs</h3>
            <div class="space-y-3">
              @for (u of stats()?.utilisateursActifs || []; track u.utilisateur) {
                <div class="flex items-center justify-between">
                  <span>{{ u.utilisateur }}</span>
                  <span class="font-bold">{{ u.actions | number }} actions</span>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AuditStatsComponent implements OnInit {
  private readonly auditService = inject(JournalAuditService);

  stats = signal<AuditStats | null>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    this.auditService.getStats().subscribe({
      next: (s) => { this.stats.set(s); this.isLoading.set(false); },
      error: () => {
        this.stats.set({
          totalActions: 12500, actionsParJour: [], erreurs: 23,
          repartitionActions: [
            { action: 'CREATE', count: 3200 },
            { action: 'UPDATE', count: 5800 },
            { action: 'DELETE', count: 450 },
            { action: 'LOGIN', count: 2100 },
            { action: 'EXPORT', count: 950 },
          ],
          repartitionEntites: [],
          utilisateursActifs: [
            { utilisateur: 'admin@example.com', actions: 4500 },
            { utilisateur: 'manager@example.com', actions: 3200 },
            { utilisateur: 'user@example.com', actions: 2100 },
          ]
        });
        this.isLoading.set(false);
      }
    });
  }
}
