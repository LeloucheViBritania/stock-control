/**
 * Routes du module Entrepôts (PREMIUM)
 */
import { Routes } from '@angular/router';

export const ENTREPOTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/entrepots-list/entrepots-list.component').then(m => m.EntrepotsListComponent),
  },
  {
    path: 'nouveau',
    loadComponent: () => import('./pages/entrepot-form/entrepot-form.component').then(m => m.EntrepotFormComponent),
    data: { title: 'Nouvel entrepôt' },
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/entrepot-detail/entrepot-detail.component').then(m => m.EntrepotDetailComponent),
    data: { title: 'Détail entrepôt' },
  },
  {
    path: ':id/modifier',
    loadComponent: () => import('./pages/entrepot-form/entrepot-form.component').then(m => m.EntrepotFormComponent),
    data: { title: 'Modifier entrepôt' },
  },
];
