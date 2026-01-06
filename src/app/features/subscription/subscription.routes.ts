import { Routes } from '@angular/router';

export const SUBSCRIPTION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./subscription.component').then(m => m.SubscriptionComponent),
    title: 'Gestion Premium'
  }
];
