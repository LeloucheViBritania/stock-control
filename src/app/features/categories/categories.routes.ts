/**
 * Routes du module Catégories
 */
import { Routes } from '@angular/router';

export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/categories-list/categories-list.component').then(m => m.CategoriesListComponent),
  },
  {
    path: 'nouveau',
    loadComponent: () => import('./pages/categorie-form/categorie-form.component').then(m => m.CategorieFormComponent),
    data: { title: 'Nouvelle catégorie' },
  },
  {
    path: ':id/modifier',
    loadComponent: () => import('./pages/categorie-form/categorie-form.component').then(m => m.CategorieFormComponent),
    data: { title: 'Modifier catégorie' },
  },
];
