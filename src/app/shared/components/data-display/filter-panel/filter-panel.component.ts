import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between mb-4">
        <h4 class="font-medium text-gray-900 dark:text-white">Filtres</h4>
        <button type="button" class="text-sm text-primary-600" (click)="reset.emit()">
          Réinitialiser
        </button>
      </div>
      <ng-content></ng-content>
    </div>
  `,
})
export class FilterPanelComponent {
  @Output() reset = new EventEmitter<void>();
}
