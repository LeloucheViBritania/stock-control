import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { NotificationsService, LoadingService } from '@core/services/notifications.service';
import { TierAbonnement, Role } from '@core/models';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  premium?: boolean;
  roles?: Role[];
  children?: MenuItem[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Loading Bar -->
    @if (loadingService.isLoading()) {
      <div class="loading-bar">
        <div class="loading-bar__progress"></div>
      </div>
    }

    <div class="layout" [class.sidebar-collapsed]="sidebarCollapsed()">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar__header">
          <div class="logo">
            <div class="logo__icon">
              <i class="ph-fill ph-cube"></i>
            </div>
            @if (!sidebarCollapsed()) {
              <span class="logo__text">Stock Control</span>
            }
          </div>
          <button class="sidebar__toggle" (click)="toggleSidebar()">
            <i class="ph" [class.ph-caret-left]="!sidebarCollapsed()" [class.ph-caret-right]="sidebarCollapsed()"></i>
          </button>
        </div>

        <nav class="sidebar__nav">
          @for (item of menuItems; track item.route) {
            @if (canAccess(item)) {
              <a 
                class="nav-item"
                [routerLink]="item.route"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
                [title]="sidebarCollapsed() ? item.label : ''"
              >
                <i class="ph {{ item.icon }}"></i>
                @if (!sidebarCollapsed()) {
                  <span class="nav-item__label">{{ item.label }}</span>
                  @if (item.premium && !isPremium()) {
                    <span class="nav-item__badge">PRO</span>
                  }
                }
              </a>
            }
          }
        </nav>

        <div class="sidebar__footer">
          @if (!sidebarCollapsed()) {
            <div class="user-tier" [class.user-tier--premium]="isPremium()">
              @if (isPremium()) {
                <i class="ph-fill ph-crown"></i>
                <span>Premium</span>
              } @else {
                <i class="ph ph-star"></i>
                <span>Gratuit</span>
              }
            </div>
          }
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main">
        <!-- Header -->
        <header class="header">
          <div class="header__left">
            <button class="header__menu-btn" (click)="toggleSidebar()">
              <i class="ph ph-list"></i>
            </button>
            <div class="breadcrumb">
              <!-- Dynamic breadcrumb could go here -->
            </div>
          </div>

          <div class="header__right">
            <!-- Search -->
            <div class="header__search">
              <i class="ph ph-magnifying-glass"></i>
              <input type="text" placeholder="Rechercher..." />
            </div>

            <!-- Notifications -->
            <div class="header__notifications" [class.has-unread]="unreadCount() > 0">
              <button class="icon-btn" (click)="toggleNotifications()">
                <i class="ph ph-bell"></i>
                @if (unreadCount() > 0) {
                  <span class="notification-badge">{{ unreadCount() > 9 ? '9+' : unreadCount() }}</span>
                }
              </button>

              @if (showNotifications()) {
                <div class="notifications-dropdown">
                  <div class="notifications-dropdown__header">
                    <span>Notifications</span>
                    @if (unreadCount() > 0) {
                      <button (click)="markAllAsRead()">Tout marquer comme lu</button>
                    }
                  </div>
                  <div class="notifications-dropdown__body">
                    @if ((notificationsService.notifications$ | async)?.length === 0) {
                      <div class="notifications-empty">
                        <i class="ph ph-bell-slash"></i>
                        <p>Aucune notification</p>
                      </div>
                    } @else {
                      @for (notif of notificationsService.notifications$ | async; track notif.id) {
                        <div 
                          class="notification-item" 
                          [class.unread]="!notif.read"
                          (click)="onNotificationClick(notif)"
                        >
                          <div class="notification-item__icon notification-item__icon--{{ notif.type }}">
                            @switch (notif.type) {
                              @case ('success') { <i class="ph ph-check-circle"></i> }
                              @case ('error') { <i class="ph ph-x-circle"></i> }
                              @case ('warning') { <i class="ph ph-warning"></i> }
                              @case ('stock_alert') { <i class="ph ph-package"></i> }
                              @case ('order') { <i class="ph ph-shopping-cart"></i> }
                              @case ('transfer') { <i class="ph ph-arrows-left-right"></i> }
                              @default { <i class="ph ph-info"></i> }
                            }
                          </div>
                          <div class="notification-item__content">
                            <div class="notification-item__title">{{ notif.title }}</div>
                            <div class="notification-item__message">{{ notif.message }}</div>
                          </div>
                        </div>
                      }
                    }
                  </div>
                </div>
              }
            </div>

            <!-- User Menu -->
            <div class="header__user">
              <button class="user-btn" (click)="toggleUserMenu()">
                <div class="user-avatar">
                  {{ getUserInitials() }}
                </div>
                @if (!sidebarCollapsed()) {
                  <div class="user-info">
                    <span class="user-name">{{ authService.currentUser()?.nomComplet || authService.currentUser()?.nomUtilisateur }}</span>
                    <span class="user-role">{{ getRoleLabel() }}</span>
                  </div>
                }
                <i class="ph ph-caret-down"></i>
              </button>

              @if (showUserMenu()) {
                <div class="dropdown__menu">
                  <a class="dropdown__item" routerLink="/profil">
                    <i class="ph ph-user"></i>
                    Mon profil
                  </a>
                  @if (authService.isAdmin()) {
                    <a class="dropdown__item" routerLink="/utilisateurs">
                      <i class="ph ph-users"></i>
                      Utilisateurs
                    </a>
                    <a class="dropdown__item" routerLink="/subscription">
                      <i class="ph ph-crown"></i>
                      Abonnement
                    </a>
                  }
                  <div class="dropdown__divider"></div>
                  <button class="dropdown__item dropdown__item--danger" (click)="logout()">
                    <i class="ph ph-sign-out"></i>
                    Déconnexion
                  </button>
                </div>
              }
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>

    <!-- Mobile overlay -->
    @if (!sidebarCollapsed() && isMobile()) {
      <div class="mobile-overlay" (click)="toggleSidebar()"></div>
    }
  `,
  styles: [`
    .loading-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--primary-100);
      z-index: 9999;
      overflow: hidden;
    }

    .loading-bar__progress {
      height: 100%;
      background: linear-gradient(90deg, var(--primary-400), var(--primary-600), var(--primary-400));
      background-size: 200% 100%;
      animation: loading 1.5s ease-in-out infinite;
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .layout {
      display: flex;
      min-height: 100vh;
      background: var(--neutral-100);
    }

    // ==========================================
    // SIDEBAR
    // ==========================================
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--sidebar-width);
      background: linear-gradient(180deg, var(--neutral-900) 0%, var(--neutral-950) 100%);
      display: flex;
      flex-direction: column;
      z-index: 100;
      transition: width var(--transition-base);
      overflow-x: hidden;
    }

    .sidebar-collapsed .sidebar {
      width: var(--sidebar-collapsed-width);
    }

    .sidebar__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4) var(--space-4);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      min-height: var(--header-height);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .logo__icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .logo__text {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: 700;
      color: white;
      white-space: nowrap;
    }

    .sidebar__toggle {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: var(--radius-md);
      color: var(--neutral-400);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background: rgba(255, 255, 255, 0.15);
        color: white;
      }
    }

    .sidebar-collapsed .sidebar__toggle {
      display: none;
    }

    .sidebar__nav {
      flex: 1;
      padding: var(--space-4) var(--space-2);
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      margin-bottom: var(--space-1);
      color: var(--neutral-400);
      text-decoration: none;
      border-radius: var(--radius-lg);
      transition: all var(--transition-fast);
      white-space: nowrap;

      i {
        font-size: 1.25rem;
        flex-shrink: 0;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: white;
      }

      &.active {
        background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
        color: white;
        box-shadow: 0 4px 12px -2px rgba(0, 102, 255, 0.4);
      }
    }

    .sidebar-collapsed .nav-item {
      justify-content: center;
      padding: var(--space-3);
    }

    .nav-item__label {
      flex: 1;
      font-size: var(--text-sm);
      font-weight: 500;
    }

    .nav-item__badge {
      font-size: var(--text-xs);
      font-weight: 600;
      padding: 2px 6px;
      background: var(--secondary-500);
      color: var(--neutral-900);
      border-radius: var(--radius-full);
    }

    .sidebar__footer {
      padding: var(--space-4);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .user-tier {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-3);
      background: rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-lg);
      color: var(--neutral-400);
      font-size: var(--text-sm);
      font-weight: 500;

      &--premium {
        background: linear-gradient(135deg, var(--secondary-500) 0%, var(--secondary-600) 100%);
        color: var(--neutral-900);
      }
    }

    // ==========================================
    // MAIN CONTENT
    // ==========================================
    .main {
      flex: 1;
      margin-left: var(--sidebar-width);
      transition: margin-left var(--transition-base);
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .sidebar-collapsed .main {
      margin-left: var(--sidebar-collapsed-width);
    }

    // ==========================================
    // HEADER
    // ==========================================
    .header {
      position: sticky;
      top: 0;
      height: var(--header-height);
      background: var(--neutral-0);
      border-bottom: 1px solid var(--neutral-200);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-6);
      z-index: 50;
    }

    .header__left {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .header__menu-btn {
      display: none;
      width: 40px;
      height: 40px;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: var(--radius-lg);
      color: var(--neutral-600);
      cursor: pointer;
      font-size: 1.25rem;

      &:hover {
        background: var(--neutral-100);
      }
    }

    .header__right {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .header__search {
      position: relative;
      
      i {
        position: absolute;
        left: var(--space-3);
        top: 50%;
        transform: translateY(-50%);
        color: var(--neutral-400);
      }

      input {
        width: 280px;
        padding: var(--space-2) var(--space-4) var(--space-2) var(--space-10);
        background: var(--neutral-100);
        border: 1px solid transparent;
        border-radius: var(--radius-lg);
        font-size: var(--text-sm);
        transition: all var(--transition-fast);

        &:focus {
          outline: none;
          background: var(--neutral-0);
          border-color: var(--primary-300);
          box-shadow: 0 0 0 3px var(--primary-100);
        }

        &::placeholder {
          color: var(--neutral-400);
        }
      }
    }

    .header__notifications {
      position: relative;
    }

    .icon-btn {
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: var(--radius-lg);
      color: var(--neutral-600);
      cursor: pointer;
      font-size: 1.25rem;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--neutral-100);
        color: var(--neutral-800);
      }
    }

    .notification-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      min-width: 18px;
      height: 18px;
      padding: 0 4px;
      background: var(--error-500);
      color: white;
      font-size: 10px;
      font-weight: 600;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notifications-dropdown {
      position: absolute;
      top: calc(100% + var(--space-2));
      right: 0;
      width: 360px;
      background: var(--neutral-0);
      border: 1px solid var(--neutral-200);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      animation: fadeIn 0.15s ease-out;
      z-index: 100;
    }

    .notifications-dropdown__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4);
      border-bottom: 1px solid var(--neutral-200);
      font-weight: 600;
      color: var(--neutral-900);

      button {
        background: transparent;
        border: none;
        color: var(--primary-600);
        font-size: var(--text-sm);
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .notifications-dropdown__body {
      max-height: 400px;
      overflow-y: auto;
    }

    .notifications-empty {
      padding: var(--space-8);
      text-align: center;
      color: var(--neutral-400);

      i {
        font-size: 2.5rem;
        margin-bottom: var(--space-2);
      }
    }

    .notification-item {
      display: flex;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      cursor: pointer;
      transition: background var(--transition-fast);

      &:hover {
        background: var(--neutral-50);
      }

      &.unread {
        background: var(--primary-50);
      }
    }

    .notification-item__icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &--success { background: var(--success-100); color: var(--success-600); }
      &--error { background: var(--error-100); color: var(--error-600); }
      &--warning { background: var(--warning-100); color: var(--warning-600); }
      &--info { background: var(--info-100); color: var(--info-600); }
      &--stock_alert { background: var(--warning-100); color: var(--warning-600); }
      &--order { background: var(--primary-100); color: var(--primary-600); }
      &--transfer { background: var(--info-100); color: var(--info-600); }
    }

    .notification-item__content {
      flex: 1;
      min-width: 0;
    }

    .notification-item__title {
      font-weight: 500;
      color: var(--neutral-900);
      font-size: var(--text-sm);
    }

    .notification-item__message {
      font-size: var(--text-xs);
      color: var(--neutral-500);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .header__user {
      position: relative;
    }

    .user-btn {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2);
      background: transparent;
      border: none;
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: background var(--transition-fast);

      &:hover {
        background: var(--neutral-100);
      }
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: var(--text-sm);
    }

    .user-info {
      text-align: left;
    }

    .user-name {
      display: block;
      font-weight: 500;
      font-size: var(--text-sm);
      color: var(--neutral-900);
    }

    .user-role {
      display: block;
      font-size: var(--text-xs);
      color: var(--neutral-500);
    }

    .dropdown__menu {
      position: absolute;
      top: calc(100% + var(--space-2));
      right: 0;
      min-width: 200px;
      background: var(--neutral-0);
      border: 1px solid var(--neutral-200);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: var(--space-2);
      animation: fadeIn 0.15s ease-out;
      z-index: 100;
    }

    .dropdown__item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      width: 100%;
      padding: var(--space-3) var(--space-4);
      font-size: var(--text-sm);
      color: var(--neutral-700);
      background: transparent;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      text-decoration: none;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--neutral-100);
        color: var(--neutral-900);
      }

      &--danger {
        color: var(--error-600);

        &:hover {
          background: var(--error-50);
          color: var(--error-700);
        }
      }
    }

    .dropdown__divider {
      height: 1px;
      background: var(--neutral-200);
      margin: var(--space-2) 0;
    }

    // ==========================================
    // CONTENT
    // ==========================================
    .content {
      flex: 1;
      padding: var(--space-6);
      max-width: var(--content-max-width);
      width: 100%;
      margin: 0 auto;
    }

    .mobile-overlay {
      display: none;
    }

    // ==========================================
    // RESPONSIVE
    // ==========================================
    @media (max-width: 1024px) {
      .header__search input {
        width: 200px;
      }
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
      }

      .layout:not(.sidebar-collapsed) .sidebar {
        transform: translateX(0);
        width: var(--sidebar-width);
      }

      .main {
        margin-left: 0 !important;
      }

      .header__menu-btn {
        display: flex;
      }

      .header__search {
        display: none;
      }

      .user-info {
        display: none;
      }

      .mobile-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 99;
        animation: fadeIn 0.2s ease-out;
      }

      .sidebar-collapsed .mobile-overlay {
        display: none;
      }

      .content {
        padding: var(--space-4);
      }
    }
  `]
})
export class MainLayoutComponent {
  protected authService = inject(AuthService);
  protected notificationsService = inject(NotificationsService);
  protected loadingService = inject(LoadingService);
  private router = inject(Router);

  sidebarCollapsed = signal(false);
  showNotifications = signal(false);
  showUserMenu = signal(false);

  menuItems: MenuItem[] = [
    { label: 'Tableau de bord', icon: 'ph-squares-four', route: '/dashboard' },
    { label: 'Produits', icon: 'ph-package', route: '/produits' },
    { label: 'Catégories', icon: 'ph-folder', route: '/categories' },
    { label: 'Clients', icon: 'ph-users', route: '/clients' },
    { label: 'Fournisseurs', icon: 'ph-truck', route: '/fournisseurs' },
    { label: 'Commandes', icon: 'ph-shopping-cart', route: '/commandes' },
    { label: 'Mouvements Stock', icon: 'ph-arrows-down-up', route: '/mouvements-stock' },
    { label: 'Entrepôts', icon: 'ph-warehouse', route: '/entrepots', premium: true },
    { label: 'Inventaire', icon: 'ph-clipboard-text', route: '/inventaire', premium: true },
    { label: 'Inventaire Physique', icon: 'ph-list-checks', route: '/inventaire-physique', premium: true },
    { label: 'Transferts', icon: 'ph-arrows-left-right', route: '/transferts', premium: true },
    { label: 'Prévisions', icon: 'ph-chart-line-up', route: '/previsions', premium: true },
    { label: 'Réappro.', icon: 'ph-arrow-circle-down', route: '/reapprovisionnement', premium: true },
    { label: 'Rapports', icon: 'ph-file-text', route: '/rapports', premium: true },
    { label: 'Journal Audit', icon: 'ph-list-bullets', route: '/journal-audit', premium: true },
  ];

  constructor() {
    // Connect to WebSocket for notifications
    this.notificationsService.connect();

    // Close dropdowns on click outside
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.header__notifications')) {
        this.showNotifications.set(false);
      }
      if (!target.closest('.header__user')) {
        this.showUserMenu.set(false);
      }
    });
  }

  unreadCount(): number {
    let count = 0;
    this.notificationsService.unreadCount$.subscribe(c => count = c);
    return count;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleNotifications(): void {
    this.showNotifications.update(v => !v);
    this.showUserMenu.set(false);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
    this.showNotifications.set(false);
  }

  isPremium(): boolean {
    return this.authService.hasPremiumAccess();
  }

  canAccess(item: MenuItem): boolean {
    // Check roles if specified
    if (item.roles && item.roles.length > 0) {
      if (!this.authService.hasRole(item.roles)) {
        return false;
      }
    }
    return true;
  }

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';
    
    const name = user.nomComplet || user.nomUtilisateur;
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getRoleLabel(): string {
    const role = this.authService.userRole();
    switch (role) {
      case Role.ADMIN: return 'Administrateur';
      case Role.GESTIONNAIRE: return 'Gestionnaire';
      case Role.EMPLOYE: return 'Employé';
      default: return 'Utilisateur';
    }
  }

  markAllAsRead(): void {
    this.notificationsService.markAllAsRead();
  }

  onNotificationClick(notif: any): void {
    this.notificationsService.markAsRead(notif.id);
    this.showNotifications.set(false);
    
    // Navigate based on notification type
    if (notif.type === 'order' && notif.data?.id) {
      this.router.navigate(['/commandes', notif.data.id]);
    } else if (notif.type === 'stock_alert' && notif.data?.produit?.id) {
      this.router.navigate(['/produits', notif.data.produit.id]);
    } else if (notif.type === 'transfer' && notif.data?.id) {
      this.router.navigate(['/transferts', notif.data.id]);
    }
  }

  logout(): void {
    this.notificationsService.disconnect();
    this.authService.logout();
  }

  isMobile(): boolean {
    return window.innerWidth < 768;
  }
}
