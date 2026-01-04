import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tree-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ul class="space-y-1">
      @for (item of items; track item.id) {
        <li>
          <div 
            class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            (click)="select.emit(item)"
          >
            @if (item.children?.length) {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            }
            <span>{{ item.label }}</span>
          </div>
        </li>
      }
    </ul>
  `,
})
export class TreeViewComponent {
  @Input() items: { id: string; label: string; children?: any[] }[] = [];
  @Output() select = new EventEmitter<any>();
}
