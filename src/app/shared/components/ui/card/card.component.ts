import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-shadow"
      [class.shadow]="shadow === 'sm'"
      [class.shadow-md]="shadow === 'md'"
      [class.shadow-lg]="shadow === 'lg'"
      [class.shadow-xl]="shadow === 'xl'"
      [class.border]="bordered"
      [class.border-gray-200]="bordered"
      [class.dark:border-gray-700]="bordered"
      [class.hover:shadow-lg]="hoverable"
      [class.cursor-pointer]="clickable"
    >
      @if (header || headerTemplate) {
        <div 
          class="px-4 py-3 border-b border-gray-200 dark:border-gray-700"
          [class.bg-gray-50]="headerBg"
          [class.dark:bg-gray-900]="headerBg"
        >
          @if (headerTemplate) {
            <ng-content select="[card-header]"></ng-content>
          } @else {
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ header }}</h3>
            @if (subheader) {
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ subheader }}</p>
            }
          }
        </div>
      }

      <div [class]="bodyClass" [class.p-4]="padding">
        <ng-content></ng-content>
      </div>

      @if (footerTemplate) {
        <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <ng-content select="[card-footer]"></ng-content>
        </div>
      }
    </div>
  `,
})
export class CardComponent {
  @Input() header?: string;
  @Input() subheader?: string;
  @Input() headerTemplate = false;
  @Input() footerTemplate = false;
  @Input() headerBg = false;
  @Input() shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl' = 'sm';
  @Input() bordered = true;
  @Input() hoverable = false;
  @Input() clickable = false;
  @Input() padding = true;
  @Input() bodyClass = '';
}
