import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-premium-lock',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="relative">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
        <div class="text-center text-white p-6">
          <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <p class="font-medium mb-2">{{ message }}</p>
          <a routerLink="/abonnement" class="btn bg-gradient-to-r from-warning-500 to-warning-600 text-white text-sm">
            Passer à Premium
          </a>
        </div>
      </div>
      <ng-content></ng-content>
    </div>
  `,
})
export class PremiumLockComponent {
  @Input() message = 'Fonctionnalité Premium';
}
