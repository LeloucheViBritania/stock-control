import { Routes } from '@angular/router';

export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./categories-list/categories-list.component').then(m => m.CategoriesListComponent),
    title: 'Catégories'
  },
  {
    path: 'new',
    loadComponent: () => import('./categorie-form/categorie-form.component').then(m => m.CategorieFormComponent),
    title: 'Nouvelle catégorie'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./categorie-form/categorie-form.component').then(m => m.CategorieFormComponent),
    title: 'Modifier catégorie'
  }
];
