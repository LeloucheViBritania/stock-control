/**
 * Routes du module Transferts Stock (PREMIUM)
 */
import { Routes } from '@angular/router';

export const TRANSFERTS_STOCK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/transferts-list/transferts-list.component').then(m => m.TransfertsListComponent),
  },
  {
    path: 'nouveau',
    loadComponent: () => import('./pages/transfert-form/transfert-form.component').then(m => m.TransfertFormComponent),
    data: { title: 'Nouveau transfert' },
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/transfert-detail/transfert-detail.component').then(m => m.TransfertDetailComponent),
    data: { title: 'Détail transfert' },
  },
];
