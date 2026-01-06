import { Routes } from '@angular/router';

export const MOUVEMENTS_STOCK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./mouvements-stock-list/mouvements-stock-list.component').then(m => m.MouvementsStockListComponent),
    title: 'Mouvements de Stock'
  }
];
