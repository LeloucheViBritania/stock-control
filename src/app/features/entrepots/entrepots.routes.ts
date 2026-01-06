import { Routes } from '@angular/router';

export const ENTREPOTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./entrepots-list/entrepots-list.component').then(m => m.EntrepotsListComponent),
    title: 'Entrepôts'
  },
  {
    path: 'new',
    loadComponent: () => import('./entrepot-form/entrepot-form.component').then(m => m.EntrepotFormComponent),
    title: 'Nouvel entrepôt'
  },
  {
    path: ':id',
    loadComponent: () => import('./entrepot-detail/entrepot-detail.component').then(m => m.EntrepotDetailComponent),
    title: 'Détail entrepôt'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./entrepot-form/entrepot-form.component').then(m => m.EntrepotFormComponent),
    title: 'Modifier entrepôt'
  }
];
