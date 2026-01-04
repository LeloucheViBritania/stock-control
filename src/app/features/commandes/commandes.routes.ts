/**
 * Routes du module Commandes
 */
import { Routes } from '@angular/router';

export const COMMANDES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/commandes-list/commandes-list.component').then(m => m.CommandesListComponent),
  },
  {
    path: 'nouveau',
    loadComponent: () => import('./pages/commande-form/commande-form.component').then(m => m.CommandeFormComponent),
    data: { title: 'Nouvelle commande' },
  },
  {
    path: 'export',
    loadComponent: () => import('./pages/commandes-export/commandes-export.component').then(m => m.CommandesExportComponent),
    data: { title: 'Exporter commandes' },
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/commande-detail/commande-detail.component').then(m => m.CommandeDetailComponent),
    data: { title: 'Détail commande' },
  },
  {
    path: ':id/modifier',
    loadComponent: () => import('./pages/commande-form/commande-form.component').then(m => m.CommandeFormComponent),
    data: { title: 'Modifier commande' },
  },
];
