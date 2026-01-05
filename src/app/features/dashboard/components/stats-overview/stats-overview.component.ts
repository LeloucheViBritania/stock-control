import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface StatCard {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
  icon?: string;
  trend?: number;
  trendLabel?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  link?: string;
}

@Component({
  selector: 'app-stats-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="grid gap-4" [class]="gridClass">
      @for (stat of stats; track stat.title) {
        <div 
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
          [class.cursor-pointer]="stat.link"
          [routerLink]="stat.link || null"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ stat.title }}</p>
              <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {{ stat.prefix }}{{ formatValue(stat.value) }}{{ stat.suffix }}
              </p>
              @if (stat.trend !== undefined) {
                <div class="flex items-center mt-2">
                  <span 
                    class="flex items-center text-sm font-medium"
                    [class.text-green-600]="stat.trend >= 0"
                    [class.text-red-600]="stat.trend < 0"
                  >
                    @if (stat.trend >= 0) {
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                      </svg>
                    } @else {
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                      </svg>
                    }
                    {{ stat.trend >= 0 ? '+' : '' }}{{ stat.trend }}%
                  </span>
                  @if (stat.trendLabel) {
                    <span class="ml-2 text-sm text-gray-500">{{ stat.trendLabel }}</span>
                  }
                </div>
              }
            </div>
            <div 
              class="flex items-center justify-center w-12 h-12 rounded-full"
              [class.bg-primary-100]="stat.color === 'primary' || !stat.color"
              [class.text-primary-600]="stat.color === 'primary' || !stat.color"
              [class.bg-green-100]="stat.color === 'success'"
              [class.text-green-600]="stat.color === 'success'"
              [class.bg-yellow-100]="stat.color === 'warning'"
              [class.text-yellow-600]="stat.color === 'warning'"
              [class.bg-red-100]="stat.color === 'danger'"
              [class.text-red-600]="stat.color === 'danger'"
              [class.bg-blue-100]="stat.color === 'info'"
              [class.text-blue-600]="stat.color === 'info'"
            >
              @switch (stat.icon) {
                @case ('money') {
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                }
                @case ('box') {
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                }
                @case ('cart') {
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                }
                @case ('users') {
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                }
                @case ('alert') {
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                }
                @default {
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                }
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class StatsOverviewComponent {
  @Input() stats: StatCard[] = [];
  @Input() columns: 2 | 3 | 4 = 4;

  get gridClass(): string {
    return `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${this.columns}`;
  }

  formatValue(value: number | string): string {
    if (typeof value === 'number') {
      return value.toLocaleString('fr-FR');
    }
    return value;
  }
}
