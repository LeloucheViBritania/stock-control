import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  badge?: number | string;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <!-- Tab Headers -->
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="flex -mb-px space-x-4" [class.justify-center]="centered">
          @for (tab of tabs; track tab.id) {
            <button
              type="button"
              (click)="selectTab(tab)"
              [disabled]="tab.disabled"
              class="group inline-flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap"
              [class.border-primary-500]="activeTabId === tab.id"
              [class.text-primary-600]="activeTabId === tab.id"
              [class.border-transparent]="activeTabId !== tab.id"
              [class.text-gray-500]="activeTabId !== tab.id"
              [class.hover:text-gray-700]="activeTabId !== tab.id && !tab.disabled"
              [class.hover:border-gray-300]="activeTabId !== tab.id && !tab.disabled"
              [class.opacity-50]="tab.disabled"
              [class.cursor-not-allowed]="tab.disabled"
            >
              @if (tab.icon) {
                <span [innerHTML]="tab.icon"></span>
              }
              {{ tab.label }}
              @if (tab.badge !== undefined) {
                <span 
                  class="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full"
                  [class.bg-primary-100]="activeTabId === tab.id"
                  [class.text-primary-800]="activeTabId === tab.id"
                  [class.bg-gray-100]="activeTabId !== tab.id"
                  [class.text-gray-600]="activeTabId !== tab.id"
                >
                  {{ tab.badge }}
                </span>
              }
            </button>
          }
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="mt-4">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class TabsComponent implements AfterContentInit {
  @Input() tabs: Tab[] = [];
  @Input() activeTabId = '';
  @Input() centered = false;

  @Output() tabChange = new EventEmitter<Tab>();

  ngAfterContentInit(): void {
    if (!this.activeTabId && this.tabs.length > 0) {
      const firstEnabled = this.tabs.find(t => !t.disabled);
      if (firstEnabled) {
        this.activeTabId = firstEnabled.id;
      }
    }
  }

  selectTab(tab: Tab): void {
    if (!tab.disabled && this.activeTabId !== tab.id) {
      this.activeTabId = tab.id;
      this.tabChange.emit(tab);
    }
  }

  isActive(tabId: string): boolean {
    return this.activeTabId === tabId;
  }
}
