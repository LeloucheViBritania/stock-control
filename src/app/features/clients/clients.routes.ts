import { Routes } from '@angular/router';

export const CLIENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./clients-list/clients-list.component').then(m => m.ClientsListComponent),
    title: 'Clients'
  },
  {
    path: 'new',
    loadComponent: () => import('./client-form/client-form.component').then(m => m.ClientFormComponent),
    title: 'Nouveau client'
  },
  {
    path: ':id',
    loadComponent: () => import('./client-detail/client-detail.component').then(m => m.ClientDetailComponent),
    title: 'Détail client'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./client-form/client-form.component').then(m => m.ClientFormComponent),
    title: 'Modifier client'
  }
];
