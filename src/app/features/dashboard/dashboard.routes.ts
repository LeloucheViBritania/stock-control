/**
 * Routes du module Dashboard
 */
import { Routes } from '@angular/router';
import { premiumGuard } from '@guards/premium.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent),
  },
  {
    path: 'analytics',
    canActivate: [premiumGuard],
    loadComponent: () => import('./pages/dashboard-analytics/dashboard-analytics.component').then(m => m.DashboardAnalyticsComponent),
    data: { title: 'Analytics', premium: true },
  },
  {
    path: 'analytics-avance',
    canActivate: [premiumGuard],
    loadComponent: () => import('./pages/analytics-advanced/analytics-advanced.component').then(m => m.AnalyticsAdvancedComponent),
    data: { title: 'Analytics Avancé', premium: true },
  },
];
