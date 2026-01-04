/**
 * Routes du module Produits
 */
import { Routes } from '@angular/router';

export const PRODUITS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/produits-list/produits-list.component').then(m => m.ProduitsListComponent),
  },
  {
    path: 'nouveau',
    loadComponent: () => import('./pages/produit-form/produit-form.component').then(m => m.ProduitFormComponent),
    data: { title: 'Nouveau produit' },
  },
  {
    path: 'stock-faible',
    loadComponent: () => import('./pages/stock-faible/stock-faible.component').then(m => m.StockFaibleComponent),
    data: { title: 'Stock faible' },
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/produit-detail/produit-detail.component').then(m => m.ProduitDetailComponent),
    data: { title: 'Détail produit' },
  },
  {
    path: ':id/modifier',
    loadComponent: () => import('./pages/produit-form/produit-form.component').then(m => m.ProduitFormComponent),
    data: { title: 'Modifier produit' },
  },
];
