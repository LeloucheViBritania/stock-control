/**
 * Routes du module Prévisions
 */
import { Routes } from '@angular/router';

export const PREVISIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/previsions-dashboard/previsions-dashboard.component').then(m => m.PrevisionsDashboardComponent),
  },
];
