import { Routes } from '@angular/router';
import { premiumGuard } from '@guards/premium.guard';

export const REAPPROVISIONNEMENT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [premiumGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/suggestions-list/suggestions-list.component').then(m => m.SuggestionsListComponent) },
      { path: 'bon-commande', loadComponent: () => import('./pages/bon-commande-achat/bon-commande-achat.component').then(m => m.BonCommandeAchatComponent) },
      { path: 'regles', loadComponent: () => import('./pages/regles-auto/regles-auto.component').then(m => m.ReglesAutoComponent) },
    ]
  }
];
