/**
 * Routes du module Fournisseurs
 */
import { Routes } from '@angular/router';

export const FOURNISSEURS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/fournisseurs-list/fournisseurs-list.component').then(m => m.FournisseursListComponent),
  },
  {
    path: 'nouveau',
    loadComponent: () => import('./pages/fournisseur-form/fournisseur-form.component').then(m => m.FournisseurFormComponent),
    data: { title: 'Nouveau fournisseur' },
  },
  {
    path: 'comparer',
    loadComponent: () => import('./pages/comparer-fournisseurs/comparer-fournisseurs.component').then(m => m.ComparerFournisseursComponent),
    data: { title: 'Comparer fournisseurs' },
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/fournisseur-detail/fournisseur-detail.component').then(m => m.FournisseurDetailComponent),
    data: { title: 'Détail fournisseur' },
  },
  {
    path: ':id/modifier',
    loadComponent: () => import('./pages/fournisseur-form/fournisseur-form.component').then(m => m.FournisseurFormComponent),
    data: { title: 'Modifier fournisseur' },
  },
];
