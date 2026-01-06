import { Routes } from '@angular/router';

export const UTILISATEURS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./utilisateurs-list/utilisateurs-list.component').then(m => m.UtilisateursListComponent),
    title: 'Utilisateurs'
  },
  {
    path: 'new',
    loadComponent: () => import('./utilisateur-form/utilisateur-form.component').then(m => m.UtilisateurFormComponent),
    title: 'Nouvel utilisateur'
  },
  {
    path: ':id',
    loadComponent: () => import('./utilisateur-detail/utilisateur-detail.component').then(m => m.UtilisateurDetailComponent),
    title: 'Détail utilisateur'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./utilisateur-form/utilisateur-form.component').then(m => m.UtilisateurFormComponent),
    title: 'Modifier utilisateur'
  }
];
