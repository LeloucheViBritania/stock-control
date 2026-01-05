import { Routes } from '@angular/router';
import { premiumGuard } from '@guards/premium.guard';

export const INTEGRATIONS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [premiumGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/integrations-home/integrations-home.component').then(m => m.IntegrationsHomeComponent) },
      { path: 'webhooks', loadComponent: () => import('./pages/webhooks-config/webhooks-config.component').then(m => m.WebhooksConfigComponent) },
      { path: 'api-keys', loadComponent: () => import('./pages/api-keys/api-keys.component').then(m => m.ApiKeysComponent) },
    ]
  }
];
