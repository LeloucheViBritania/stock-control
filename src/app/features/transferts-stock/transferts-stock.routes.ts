import { Routes } from '@angular/router';

export const TRANSFERTS_STOCK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./transferts-list/transferts-list.component').then(m => m.TransfertsListComponent),
    title: 'Transferts de Stock'
  },
  {
    path: 'new',
    loadComponent: () => import('./transfert-form/transfert-form.component').then(m => m.TransfertFormComponent),
    title: 'Nouveau transfert'
  },
  {
    path: ':id',
    loadComponent: () => import('./transfert-detail/transfert-detail.component').then(m => m.TransfertDetailComponent),
    title: 'Détail transfert'
  }
];
