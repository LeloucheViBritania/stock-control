import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (variant) {
      @case ('text') {
        <div class="space-y-2">
          @for (line of lines; track $index; let last = $last) {
            <div 
              class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
              [style.width]="last ? '60%' : '100%'"
            ></div>
          }
        </div>
      }
      @case ('circle') {
        <div 
          class="rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"
          [style.width]="width"
          [style.height]="height || width"
        ></div>
      }
      @case ('rect') {
        <div 
          class="bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
          [style.width]="width"
          [style.height]="height"
        ></div>
      }
      @case ('card') {
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 animate-pulse">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      }
      @case ('table') {
        <div class="space-y-3 animate-pulse">
          <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          @for (row of rows; track $index) {
            <div class="h-12 bg-gray-100 dark:bg-gray-800 rounded"></div>
          }
        </div>
      }
      @case ('list') {
        <div class="space-y-3">
          @for (item of rows; track $index) {
            <div class="flex items-center space-x-3 animate-pulse">
              <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          }
        </div>
      }
      @default {
        <div 
          class="bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
          [style.width]="width"
          [style.height]="height"
        ></div>
      }
    }
  `,
})
export class SkeletonLoaderComponent {
  @Input() variant: 'text' | 'circle' | 'rect' | 'card' | 'table' | 'list' = 'rect';
  @Input() width = '100%';
  @Input() height = '20px';
  @Input() count = 1;

  get lines(): number[] {
    return Array(this.count).fill(0);
  }

  get rows(): number[] {
    return Array(Math.max(1, this.count)).fill(0);
  }
}
