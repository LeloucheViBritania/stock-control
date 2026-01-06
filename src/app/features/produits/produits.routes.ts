import { Routes } from '@angular/router';

export const PRODUITS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./produits-list/produits-list.component').then(m => m.ProduitsListComponent),
    title: 'Liste des produits'
  },
  {
    path: 'new',
    loadComponent: () => import('./produit-form/produit-form.component').then(m => m.ProduitFormComponent),
    title: 'Nouveau produit'
  },
  {
    path: ':id',
    loadComponent: () => import('./produit-detail/produit-detail.component').then(m => m.ProduitDetailComponent),
    title: 'Détail produit'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./produit-form/produit-form.component').then(m => m.ProduitFormComponent),
    title: 'Modifier produit'
  }
];
