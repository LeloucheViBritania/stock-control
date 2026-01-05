import { Routes } from '@angular/router';
import { premiumGuard } from '@guards/premium.guard';

export const INVENTAIRE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [premiumGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/inventaire-list/inventaire-list.component').then(m => m.InventaireListComponent) },
      { path: 'nouveau', loadComponent: () => import('./pages/inventaire-physique/inventaire-physique.component').then(m => m.InventairePhysiqueComponent) },
      { path: 'scanner', loadComponent: () => import('./pages/inventaire-scanner/inventaire-scanner.component').then(m => m.InventaireScannerComponent) },
      { path: 'ecarts', loadComponent: () => import('./pages/ecarts-inventaire/ecarts-inventaire.component').then(m => m.EcartsInventaireComponent) },
      { path: ':id', loadComponent: () => import('./pages/inventaire-list/inventaire-list.component').then(m => m.InventaireListComponent) },
      { path: ':id/comptage', loadComponent: () => import('./pages/session-comptage/session-comptage.component').then(m => m.SessionComptageComponent) },
    ]
  }
];
