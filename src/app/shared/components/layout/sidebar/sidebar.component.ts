/**
 * Composant Sidebar
 */
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  premium?: boolean;
  children?: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside
      class="fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
      [class.w-[280px]]="!collapsed"
      [class.w-[80px]]="collapsed"
      [class.-translate-x-full]="!mobileOpen"
      [class.translate-x-0]="mobileOpen"
      [class.lg:translate-x-0]="true"
    >
      <!-- Logo -->
      <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        @if (!collapsed) {
          <a routerLink="/dashboard" class="flex items-center gap-2">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <span class="text-lg font-bold text-gray-900 dark:text-white">GStock</span>
          </a>
        } @else {
          <a routerLink="/dashboard" class="mx-auto">
            <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
          </a>
        }
        
        <!-- Collapse Button (Desktop) -->
        <button
          type="button"
          class="hidden lg:flex p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          (click)="toggleCollapse.emit()"
          [class.mx-auto]="collapsed"
        >
          <svg 
            class="w-5 h-5 transition-transform" 
            [class.rotate-180]="collapsed"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="p-4 space-y-1 overflow-y-auto h-[calc(100vh-64px)]">
        @for (section of navSections; track section.title) {
          @if (!collapsed) {
            <p class="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {{ section.title }}
            </p>
          }
          
          @for (item of section.items; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
              [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
              class="flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
              [class.justify-center]="collapsed"
              [title]="collapsed ? item.label : ''"
            >
              <span [innerHTML]="item.icon" class="w-5 h-5 flex-shrink-0"></span>
              @if (!collapsed) {
                <span class="flex-1">{{ item.label }}</span>
                @if (item.premium && !authService.isPremium()) {
                  <span class="px-1.5 py-0.5 text-2xs font-medium bg-warning-100 text-warning-700 rounded">
                    PRO
                  </span>
                }
              }
            </a>
          }
        }
      </nav>

      <!-- Upgrade Banner -->
      @if (!collapsed && !authService.isPremium()) {
        <div class="absolute bottom-4 left-4 right-4">
          <div class="p-4 bg-gradient-to-r from-warning-500 to-warning-600 rounded-xl text-white">
            <p class="font-semibold">Passez à Premium</p>
            <p class="text-sm text-warning-100 mt-1">Débloquez toutes les fonctionnalités</p>
            <a
              routerLink="/abonnement"
              class="mt-3 block w-full py-2 text-center text-sm font-medium bg-white text-warning-600 rounded-lg hover:bg-warning-50 transition-colors"
            >
              Voir les plans
            </a>
          </div>
        </div>
      }
    </aside>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() mobileOpen = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  readonly authService = inject(AuthService);

  navSections = [
    {
      title: 'Principal',
      items: [
        {
          label: 'Tableau de bord',
          route: '/dashboard',
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
        },
      ],
    },
    {
      title: 'Gestion',
      items: [
        {
          label: 'Produits',
          route: '/produits',
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>',
        },
        {
          label: 'Catégories',
          route: '/categories',
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>',
        },
        {
          label: 'Clients',
          route: '/clients',
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
        },
        {
          label: 'Fournisseurs',
          route: '/fournisseurs',
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>',
        },
        {
          label: 'Commandes',
          route: '/commandes',
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>',
        },
      ],
    },
    {
      title: 'Stock',
      items: [
        {
          label: 'Mouvements',
          route: '/mouvements-stock',
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>',
        },
        {
          label: 'Entrepôts',
          route: '/entrepots',
          premium: true,
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>',
        },
        {
          label: 'Transferts',
          route: '/transferts-stock',
          premium: true,
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>',
        },
        {
          label: 'Inventaire',
          route: '/inventaire',
          premium: true,
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>',
        },
      ],
    },
    {
      title: 'Analyse',
      items: [
        {
          label: 'Rapports',
          route: '/rapports',
          premium: true,
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
        },
        {
          label: 'Journal d\'audit',
          route: '/journal-audit',
          premium: true,
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        },
      ],
    },
  ];
}
