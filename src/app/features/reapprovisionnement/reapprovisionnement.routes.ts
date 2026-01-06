import { Routes } from '@angular/router';

export const REAPPROVISIONNEMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./reapprovisionnement.component').then(m => m.ReapprovisionnementComponent),
    title: 'Réapprovisionnement'
  }
];
