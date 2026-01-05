import { Routes } from '@angular/router';
import { premiumGuard } from '@guards/premium.guard';

export const CODES_BARRES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [premiumGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/scanner-produit/scanner-produit.component').then(m => m.ScannerProduitComponent) },
      { path: 'generation', loadComponent: () => import('./pages/generation-codes/generation-codes.component').then(m => m.GenerationCodesComponent) },
      { path: 'historique', loadComponent: () => import('./pages/historique-scans/historique-scans.component').then(m => m.HistoriqueScansComponent) },
    ]
  }
];
