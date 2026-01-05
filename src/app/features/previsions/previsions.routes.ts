import { Routes } from '@angular/router';
import { premiumGuard } from '@guards/premium.guard';

export const PREVISIONS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [premiumGuard],
    loadComponent: () => import('./pages/previsions-dashboard/previsions-dashboard.component').then(m => m.PrevisionsDashboardComponent)
  },
  {
    path: 'tendances',
    canActivate: [premiumGuard],
    loadComponent: () => import('./pages/analyse-tendances/analyse-tendances.component').then(m => m.AnalyseTendancesComponent),
    data: { title: 'Analyse des tendances' }
  },
  {
    path: 'scenarios',
    canActivate: [premiumGuard],
    loadComponent: () => import('./pages/simulation-scenarios/simulation-scenarios.component').then(m => m.SimulationScenariosComponent),
    data: { title: 'Simulation de scénarios' }
  },
  {
    path: 'produit/:id',
    canActivate: [premiumGuard],
    loadComponent: () => import('./pages/previsions-produit/previsions-produit.component').then(m => m.PrevisionsProduitComponent),
    data: { title: 'Prévisions produit' }
  }
];
