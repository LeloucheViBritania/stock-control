import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-upgrade-prompt',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 bg-gradient-to-r from-warning-500 to-warning-600 rounded-xl text-white">
      <h3 class="text-lg font-bold mb-2">{{ title }}</h3>
      <p class="text-warning-100 mb-4">{{ description }}</p>
      <a routerLink="/abonnement" class="inline-block px-4 py-2 bg-white text-warning-600 font-medium rounded-lg hover:bg-warning-50 transition-colors">
        Voir les plans
      </a>
    </div>
  `,
})
export class UpgradePromptComponent {
  @Input() title = 'Passez à Premium';
  @Input() description = 'Débloquez toutes les fonctionnalités avancées';
}
