import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audit-logs-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Journal d'Audit</h1>
        <span class="badge-premium">Premium</span>
      </div>
      <div class="card p-6">
        <p class="text-gray-600 dark:text-gray-400">Historique des actions - En cours de développement</p>
      </div>
    </div>
  `,
})
export class AuditLogsListComponent {}
