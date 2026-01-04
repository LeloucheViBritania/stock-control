import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-transferts-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Transferts de Stock</h1>
          <span class="badge-premium">Premium</span>
        </div>
        <a routerLink="nouveau" class="btn-primary">+ Nouveau transfert</a>
      </div>
      <div class="card p-6">
        <p class="text-gray-600 dark:text-gray-400">Transferts entre entrepôts - En cours de développement</p>
      </div>
    </div>
  `,
})
export class TransfertsListComponent {}
