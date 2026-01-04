/**
 * Routes du module Inventaire (PREMIUM)
 */
import { Routes } from '@angular/router';

export const INVENTAIRE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/inventaire-list/inventaire-list.component').then(m => m.InventaireListComponent),
  },
  {
    path: 'nouveau',
    loadComponent: () => import('./pages/inventaire-physique/inventaire-physique.component').then(m => m.InventairePhysiqueComponent),
    data: { title: 'Nouvel inventaire' },
  },
  {
    path: ':id/comptage',
    loadComponent: () => import('./pages/session-comptage/session-comptage.component').then(m => m.SessionComptageComponent),
    data: { title: 'Session de comptage' },
  },
];
