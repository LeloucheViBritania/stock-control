import { Routes } from '@angular/router';
import { premiumGuard } from '@guards/premium.guard';

export const RAPPORTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [premiumGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/rapports-home/rapports-home.component').then(m => m.RapportsHomeComponent) },
      { path: 'ventes', loadComponent: () => import('./pages/rapport-ventes/rapport-ventes.component').then(m => m.RapportVentesComponent) },
      { path: 'stock', loadComponent: () => import('./pages/rapport-inventaire/rapport-inventaire.component').then(m => m.RapportInventaireComponent) },
      { path: 'inventaire', loadComponent: () => import('./pages/rapport-inventaire/rapport-inventaire.component').then(m => m.RapportInventaireComponent) },
      { path: 'mouvements', loadComponent: () => import('./pages/rapport-mouvements/rapport-mouvements.component').then(m => m.RapportMouvementsComponent) },
      { path: 'clients', loadComponent: () => import('./pages/rapport-clients/rapport-clients.component').then(m => m.RapportClientsComponent) },
      { path: 'personnalise', loadComponent: () => import('./pages/rapport-personnalise/rapport-personnalise.component').then(m => m.RapportPersonnaliseComponent) },
    ]
  }
];
