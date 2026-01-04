import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center py-12">
      @if (icon) {
        <div [innerHTML]="icon" class="mx-auto w-12 h-12 text-gray-400"></div>
      }
      <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">{{ title }}</h3>
      @if (description) {
        <p class="mt-2 text-gray-500 dark:text-gray-400">{{ description }}</p>
      }
      <ng-content></ng-content>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon?: string;
  @Input() title = 'Aucune donnée';
  @Input() description?: string;
}
