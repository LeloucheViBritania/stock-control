import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-rapports-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Rapports</h1>
        <span class="badge-premium">Premium</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a routerLink="inventaire" class="card p-6 hover:shadow-md transition-shadow">
          <h3 class="font-semibold">Rapport Inventaire</h3>
          <p class="text-sm text-gray-500">État des stocks</p>
        </a>
        <a routerLink="ventes" class="card p-6 hover:shadow-md transition-shadow">
          <h3 class="font-semibold">Rapport Ventes</h3>
          <p class="text-sm text-gray-500">Analyse des ventes</p>
        </a>
        <a routerLink="mouvements" class="card p-6 hover:shadow-md transition-shadow">
          <h3 class="font-semibold">Rapport Mouvements</h3>
          <p class="text-sm text-gray-500">Historique détaillé</p>
        </a>
      </div>
    </div>
  `,
})
export class RapportsHomeComponent {}
