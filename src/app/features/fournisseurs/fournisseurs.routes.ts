import { Routes } from '@angular/router';

export const FOURNISSEURS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./fournisseurs-list/fournisseurs-list.component').then(m => m.FournisseursListComponent),
    title: 'Fournisseurs'
  },
  {
    path: 'new',
    loadComponent: () => import('./fournisseur-form/fournisseur-form.component').then(m => m.FournisseurFormComponent),
    title: 'Nouveau fournisseur'
  },
  {
    path: ':id',
    loadComponent: () => import('./fournisseur-detail/fournisseur-detail.component').then(m => m.FournisseurDetailComponent),
    title: 'Détail fournisseur'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./fournisseur-form/fournisseur-form.component').then(m => m.FournisseurFormComponent),
    title: 'Modifier fournisseur'
  }
];
