import { Routes } from '@angular/router';

export const PREVISIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./previsions.component').then(m => m.PrevisionsComponent),
    title: 'Prévisions'
  }
];
