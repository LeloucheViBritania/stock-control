/**
 * Page Premium requis
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-premium-required',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div class="text-center max-w-md">
        <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-warning-400 to-warning-600 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Fonctionnalité Premium</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Cette fonctionnalité est réservée aux abonnés Premium. 
          Passez à Premium pour débloquer toutes les fonctionnalités avancées.
        </p>
        <div class="mt-8 flex gap-4 justify-center">
          <a
            routerLink="/abonnement"
            class="btn bg-gradient-to-r from-warning-500 to-warning-600 text-white hover:from-warning-600 hover:to-warning-700"
          >
            Voir les plans Premium
          </a>
          <a
            routerLink="/dashboard"
            class="btn-secondary"
          >
            Retour
          </a>
        </div>
        
        <!-- Features list -->
        <div class="mt-12 text-left">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Avantages Premium :</h3>
          <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li class="flex items-center gap-2">
              <svg class="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Multi-entrepôts illimités
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Transferts de stock
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Inventaire physique
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Rapports avancés & exports
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Journal d'audit complet
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class PremiumRequiredComponent {}
