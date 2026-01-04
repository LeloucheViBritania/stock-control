/**
 * Page Erreur serveur
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div class="text-center">
        <h1 class="text-9xl font-bold text-danger-600">500</h1>
        <h2 class="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Erreur serveur</h2>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Une erreur inattendue s'est produite. Nos équipes ont été notifiées.
        </p>
        <div class="mt-8 flex gap-4 justify-center">
          <button
            type="button"
            class="btn-primary"
            (click)="refresh()"
          >
            Réessayer
          </button>
          <a
            routerLink="/dashboard"
            class="btn-secondary"
          >
            Retour au tableau de bord
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ServerErrorComponent {
  refresh(): void {
    window.location.reload();
  }
}
