/**
 * Routes du module Rapports (PREMIUM)
 */
import { Routes } from '@angular/router';

export const RAPPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/rapports-home/rapports-home.component').then(m => m.RapportsHomeComponent),
  },
  {
    path: 'inventaire',
    loadComponent: () => import('./pages/rapport-inventaire/rapport-inventaire.component').then(m => m.RapportInventaireComponent),
    data: { title: 'Rapport inventaire' },
  },
  {
    path: 'ventes',
    loadComponent: () => import('./pages/rapport-ventes/rapport-ventes.component').then(m => m.RapportVentesComponent),
    data: { title: 'Rapport ventes' },
  },
  {
    path: 'mouvements',
    loadComponent: () => import('./pages/rapport-mouvements/rapport-mouvements.component').then(m => m.RapportMouvementsComponent),
    data: { title: 'Rapport mouvements' },
  },
];
