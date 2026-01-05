import { Routes } from '@angular/router';
import { premiumGuard } from '@guards/premium.guard';

export const TRANSFERTS_STOCK_ROUTES: Routes = [
  {
    path: '',
    canActivate: [premiumGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/transferts-list/transferts-list.component').then(m => m.TransfertsListComponent) },
      { path: 'planning', loadComponent: () => import('./pages/transferts-planning/transferts-planning.component').then(m => m.TransfertsPlanningComponent) },
      { path: 'nouveau', loadComponent: () => import('./pages/transfert-form/transfert-form.component').then(m => m.TransfertFormComponent) },
      { path: ':id', loadComponent: () => import('./pages/transfert-detail/transfert-detail.component').then(m => m.TransfertDetailComponent) },
    ]
  }
];
