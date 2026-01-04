import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-previsions-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Prévisions</h1>
      <div class="card p-6">
        <p class="text-gray-600 dark:text-gray-400">Prévisions de stock - En cours de développement</p>
      </div>
    </div>
  `,
})
export class PrevisionsDashboardComponent {}
