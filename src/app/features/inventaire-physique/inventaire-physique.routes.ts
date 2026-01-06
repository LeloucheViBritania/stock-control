import { Routes } from '@angular/router';

export const INVENTAIRE_PHYSIQUE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./inventaire-physique-list/inventaire-physique-list.component').then(m => m.InventairePhysiqueListComponent),
    title: 'Inventaire Physique'
  },
  {
    path: 'new',
    loadComponent: () => import('./inventaire-physique-form/inventaire-physique-form.component').then(m => m.InventairePhysiqueFormComponent),
    title: 'Nouvelle session'
  },
  {
    path: ':id',
    loadComponent: () => import('./inventaire-physique-detail/inventaire-physique-detail.component').then(m => m.InventairePhysiqueDetailComponent),
    title: 'Session inventaire'
  }
];
