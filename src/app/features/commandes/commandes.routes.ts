import { Routes } from '@angular/router';

export const COMMANDES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./commandes-list/commandes-list.component').then(m => m.CommandesListComponent),
    title: 'Commandes'
  },
  {
    path: 'new',
    loadComponent: () => import('./commande-form/commande-form.component').then(m => m.CommandeFormComponent),
    title: 'Nouvelle commande'
  },
  {
    path: ':id',
    loadComponent: () => import('./commande-detail/commande-detail.component').then(m => m.CommandeDetailComponent),
    title: 'Détail commande'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./commande-form/commande-form.component').then(m => m.CommandeFormComponent),
    title: 'Modifier commande'
  }
];
