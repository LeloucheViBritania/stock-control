import { Routes } from '@angular/router';
import { premiumGuard } from '@guards/premium.guard';

export const LOTS_TRACABILITE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [premiumGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/lots-list/lots-list.component').then(m => m.LotsListComponent) },
      { path: ':id', loadComponent: () => import('./pages/lot-detail/lot-detail.component').then(m => m.LotDetailComponent) },
    ]
  }
];
