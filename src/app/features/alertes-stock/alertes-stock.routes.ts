import { Routes } from '@angular/router';
import { premiumGuard } from '@guards/premium.guard';

export const ALERTES_STOCK_ROUTES: Routes = [
  {
    path: '',
    canActivate: [premiumGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/alertes-dashboard/alertes-dashboard.component').then(m => m.AlertesDashboardComponent) },
      { path: 'config', loadComponent: () => import('./pages/alertes-config/alertes-config.component').then(m => m.AlertesConfigComponent) },
    ]
  }
];
