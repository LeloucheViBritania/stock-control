/**
 * Routes du module Clients
 */
import { Routes } from '@angular/router';

export const CLIENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/clients-list/clients-list.component').then(m => m.ClientsListComponent),
  },
  {
    path: 'nouveau',
    loadComponent: () => import('./pages/client-form/client-form.component').then(m => m.ClientFormComponent),
    data: { title: 'Nouveau client' },
  },
  {
    path: 'segmentation',
    loadComponent: () => import('./pages/segmentation/segmentation.component').then(m => m.SegmentationComponent),
    data: { title: 'Segmentation clients' },
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/client-detail/client-detail.component').then(m => m.ClientDetailComponent),
    data: { title: 'Détail client' },
  },
  {
    path: ':id/modifier',
    loadComponent: () => import('./pages/client-form/client-form.component').then(m => m.ClientFormComponent),
    data: { title: 'Modifier client' },
  },
];
