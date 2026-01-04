import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Choisissez votre plan</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Commencez gratuitement, évoluez selon vos besoins</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <!-- Free Plan -->
        <div class="card p-6">
          <h3 class="text-xl font-bold">Gratuit</h3>
          <p class="text-3xl font-bold mt-4">0 €<span class="text-sm font-normal text-gray-500">/mois</span></p>
          <ul class="mt-6 space-y-3 text-sm">
            <li class="flex items-center gap-2">✓ 100 produits max</li>
            <li class="flex items-center gap-2">✓ 1 entrepôt</li>
            <li class="flex items-center gap-2">✓ Gestion commandes</li>
          </ul>
          <button class="btn-secondary w-full mt-6">Plan actuel</button>
        </div>
        
        <!-- Premium Plan -->
        <div class="card p-6 border-2 border-warning-500 relative">
          <span class="absolute -top-3 left-1/2 -translate-x-1/2 badge-premium px-3 py-1">Recommandé</span>
          <h3 class="text-xl font-bold">Premium</h3>
          <p class="text-3xl font-bold mt-4">29 €<span class="text-sm font-normal text-gray-500">/mois</span></p>
          <ul class="mt-6 space-y-3 text-sm">
            <li class="flex items-center gap-2">✓ Produits illimités</li>
            <li class="flex items-center gap-2">✓ Multi-entrepôts</li>
            <li class="flex items-center gap-2">✓ Rapports avancés</li>
            <li class="flex items-center gap-2">✓ Journal d'audit</li>
          </ul>
          <a routerLink="checkout" class="btn bg-gradient-to-r from-warning-500 to-warning-600 text-white w-full mt-6 block text-center">
            Passer à Premium
          </a>
        </div>
      </div>
    </div>
  `,
})
export class PlansComponent {}
