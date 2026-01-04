/**
 * Routes du module Mouvements Stock
 */
import { Routes } from '@angular/router';

export const MOUVEMENTS_STOCK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/mouvements-list/mouvements-list.component').then(m => m.MouvementsListComponent),
  },
  {
    path: 'stats',
    loadComponent: () => import('./pages/mouvements-stats/mouvements-stats.component').then(m => m.MouvementsStatsComponent),
    data: { title: 'Statistiques mouvements' },
  },
];
