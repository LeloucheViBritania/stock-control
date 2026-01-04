/**
 * Page Accès refusé
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div class="text-center">
        <div class="w-24 h-24 mx-auto mb-6 bg-danger-100 dark:bg-danger-900/30 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Accès refusé</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <div class="mt-8">
          <a
            routerLink="/dashboard"
            class="btn-primary"
          >
            Retour au tableau de bord
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class AccessDeniedComponent {}
