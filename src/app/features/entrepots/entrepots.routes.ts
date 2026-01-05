import { Routes } from '@angular/router';
import { premiumGuard } from '@guards/premium.guard';

export const ENTREPOTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [premiumGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/entrepots-list/entrepots-list.component').then(m => m.EntrepotsListComponent) },
      { path: 'nouveau', loadComponent: () => import('./pages/entrepot-form/entrepot-form.component').then(m => m.EntrepotFormComponent) },
      { path: 'carte', loadComponent: () => import('./pages/entrepots-carte/entrepots-carte.component').then(m => m.EntrepotsCarteComponent) },
      { path: 'comparaison', loadComponent: () => import('./pages/entrepots-comparaison/entrepots-comparaison.component').then(m => m.EntrepotsComparaisonComponent) },
      { path: ':id', loadComponent: () => import('./pages/entrepot-detail/entrepot-detail.component').then(m => m.EntrepotDetailComponent) },
      { path: ':id/modifier', loadComponent: () => import('./pages/entrepot-form/entrepot-form.component').then(m => m.EntrepotFormComponent) },
      { path: ':id/zones', loadComponent: () => import('./pages/entrepot-zones/entrepot-zones.component').then(m => m.EntrepotZonesComponent) },
    ]
  }
];
