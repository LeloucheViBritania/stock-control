import { Routes } from '@angular/router';

export const INVENTAIRE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./inventaire-list/inventaire-list.component').then(m => m.InventaireListComponent),
    title: 'Inventaire'
  }
];
