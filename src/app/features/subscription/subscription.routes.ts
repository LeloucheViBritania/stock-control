/**
 * Routes du module Abonnement
 */
import { Routes } from '@angular/router';

export const SUBSCRIPTION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/plans/plans.component').then(m => m.PlansComponent),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent),
    data: { title: 'Paiement' },
  },
  {
    path: 'status',
    loadComponent: () => import('./pages/subscription-status/subscription-status.component').then(m => m.SubscriptionStatusComponent),
    data: { title: 'Mon abonnement' },
  },
];
