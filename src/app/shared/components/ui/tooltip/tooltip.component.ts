import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative group inline-block">
      <ng-content></ng-content>
      <div class="absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
           [class.bottom-full]="position === 'top'"
           [class.top-full]="position === 'bottom'"
           [class.mb-1]="position === 'top'"
           [class.mt-1]="position === 'bottom'">
        {{ text }}
      </div>
    </div>
  `,
})
export class TooltipComponent {
  @Input() text = '';
  @Input() position: 'top' | 'bottom' = 'top';
}
