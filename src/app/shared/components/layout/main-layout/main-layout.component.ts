/**
 * Composant Layout Principal
 * Contient le header, sidebar et zone de contenu
 */
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <!-- Sidebar -->
      <app-sidebar 
        [collapsed]="sidebarCollapsed()"
        (toggleCollapse)="toggleSidebar()"
      />

      <!-- Main Content -->
      <div 
        class="transition-all duration-300"
        [class.lg:ml-[280px]]="!sidebarCollapsed()"
        [class.lg:ml-[80px]]="sidebarCollapsed()"
      >
        <!-- Header -->
        <app-header 
          (toggleSidebar)="toggleSidebar()"
        />

        <!-- Page Content -->
        <main class="p-4 md:p-6 lg:p-8 min-h-[calc(100vh-64px)]">
          <router-outlet />
        </main>
      </div>

      <!-- Mobile Sidebar Overlay -->
      @if (mobileMenuOpen()) {
        <div 
          class="fixed inset-0 z-40 bg-black/50 lg:hidden"
          (click)="closeMobileMenu()"
        ></div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class MainLayoutComponent {
  sidebarCollapsed = signal(false);
  mobileMenuOpen = signal(false);

  toggleSidebar(): void {
    if (window.innerWidth < 1024) {
      this.mobileMenuOpen.update(v => !v);
    } else {
      this.sidebarCollapsed.update(v => !v);
    }
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
