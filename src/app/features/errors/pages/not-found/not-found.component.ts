/**
 * Page 404 - Non trouvée
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div class="text-center">
        <h1 class="text-9xl font-bold text-primary-600">404</h1>
        <h2 class="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Page non trouvée</h2>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div class="mt-8 flex gap-4 justify-center">
          <a
            routerLink="/dashboard"
            class="btn-primary"
          >
            Retour au tableau de bord
          </a>
          <button
            type="button"
            class="btn-secondary"
            (click)="goBack()"
          >
            Page précédente
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class NotFoundComponent {
  goBack(): void {
    window.history.back();
  }
}
