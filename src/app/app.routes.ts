import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { premiumGuard } from './core/guards/premium.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Auth routes (public)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Main app routes (protected)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      // Dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Tableau de bord'
      },

      // FREE Tier Features
      {
        path: 'produits',
        loadChildren: () => import('./features/produits/produits.routes').then(m => m.PRODUITS_ROUTES),
        title: 'Produits'
      },
      {
        path: 'categories',
        loadChildren: () => import('./features/categories/categories.routes').then(m => m.CATEGORIES_ROUTES),
        title: 'Catégories'
      },
      {
        path: 'clients',
        loadChildren: () => import('./features/clients/clients.routes').then(m => m.CLIENTS_ROUTES),
        title: 'Clients'
      },
      {
        path: 'fournisseurs',
        loadChildren: () => import('./features/fournisseurs/fournisseurs.routes').then(m => m.FOURNISSEURS_ROUTES),
        title: 'Fournisseurs'
      },
      {
        path: 'commandes',
        loadChildren: () => import('./features/commandes/commandes.routes').then(m => m.COMMANDES_ROUTES),
        title: 'Commandes'
      },
      {
        path: 'mouvements-stock',
        loadChildren: () => import('./features/mouvements-stock/mouvements-stock.routes').then(m => m.MOUVEMENTS_STOCK_ROUTES),
        title: 'Mouvements de Stock'
      },

      // PREMIUM Features
      {
        path: 'entrepots',
        loadChildren: () => import('./features/entrepots/entrepots.routes').then(m => m.ENTREPOTS_ROUTES),
        canActivate: [premiumGuard],
        title: 'Entrepôts'
      },
      {
        path: 'inventaire',
        loadChildren: () => import('./features/inventaire/inventaire.routes').then(m => m.INVENTAIRE_ROUTES),
        canActivate: [premiumGuard],
        title: 'Inventaire'
      },
      {
        path: 'inventaire-physique',
        loadChildren: () => import('./features/inventaire-physique/inventaire-physique.routes').then(m => m.INVENTAIRE_PHYSIQUE_ROUTES),
        canActivate: [premiumGuard],
        title: 'Inventaire Physique'
      },
      {
        path: 'transferts',
        loadChildren: () => import('./features/transferts-stock/transferts-stock.routes').then(m => m.TRANSFERTS_STOCK_ROUTES),
        canActivate: [premiumGuard],
        title: 'Transferts de Stock'
      },
      {
        path: 'previsions',
        loadChildren: () => import('./features/previsions/previsions.routes').then(m => m.PREVISIONS_ROUTES),
        canActivate: [premiumGuard],
        title: 'Prévisions'
      },
      {
        path: 'reapprovisionnement',
        loadChildren: () => import('./features/reapprovisionnement/reapprovisionnement.routes').then(m => m.REAPPROVISIONNEMENT_ROUTES),
        canActivate: [premiumGuard],
        title: 'Réapprovisionnement'
      },
      {
        path: 'journal-audit',
        loadChildren: () => import('./features/journal-audit/journal-audit.routes').then(m => m.JOURNAL_AUDIT_ROUTES),
        canActivate: [premiumGuard],
        title: 'Journal d\'Audit'
      },
      {
        path: 'rapports',
        loadChildren: () => import('./features/rapports/rapports.routes').then(m => m.RAPPORTS_ROUTES),
        canActivate: [premiumGuard],
        title: 'Rapports'
      },

      // Admin only
      {
        path: 'utilisateurs',
        loadChildren: () => import('./features/utilisateurs/utilisateurs.routes').then(m => m.UTILISATEURS_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        title: 'Utilisateurs'
      },
      {
        path: 'subscription',
        loadChildren: () => import('./features/subscription/subscription.routes').then(m => m.SUBSCRIPTION_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        title: 'Abonnement'
      },

      // Profile
      {
        path: 'profil',
        loadComponent: () => import('./features/auth/profil/profil.component').then(m => m.ProfilComponent),
        title: 'Mon Profil'
      }
    ]
  },

  // Fallback
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
