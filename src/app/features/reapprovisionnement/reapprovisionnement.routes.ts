/**
 * Routes du module Réapprovisionnement
 */
import { Routes } from '@angular/router';

export const REAPPROVISIONNEMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/suggestions-list/suggestions-list.component').then(m => m.SuggestionsListComponent),
  },
  {
    path: 'bon-commande',
    loadComponent: () => import('./pages/bon-commande-achat/bon-commande-achat.component').then(m => m.BonCommandeAchatComponent),
    data: { title: 'Bon de commande' },
  },
];
