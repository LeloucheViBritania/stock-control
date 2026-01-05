/**
 * Configuration des routes principales
 * Gestion de Stock Frontend
 */

import { Routes } from '@angular/router';

// Guards
import { authGuard } from '@guards/auth.guard';
import { noAuthGuard } from '@guards/no-auth.guard';
import { premiumGuard } from '@guards/premium.guard';
import { roleGuard } from '@guards/role.guard';

// Enums
import { Role } from '@enums/role.enum';

/**
 * Routes principales de l'application
 */
export const routes: Routes = [
  // ============================================
  // REDIRECTION RACINE
  // ============================================
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  // ============================================
  // AUTH (Public)
  // ============================================
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    loadChildren: () => import('@features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },

  // ============================================
  // ROUTES PROTÉGÉES (Authentifiées)
  // ============================================
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => 
      import('@components/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      // ============================================
      // DASHBOARD
      // ============================================
      {
        path: 'dashboard',
        loadChildren: () => import('@features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
        data: { title: 'Tableau de bord' },
      },

      // ============================================
      // PRODUITS
      // ============================================
      {
        path: 'produits',
        loadChildren: () => import('@features/produits/produits.routes').then(m => m.PRODUITS_ROUTES),
        data: { title: 'Produits' },
      },

      // ============================================
      // CATÉGORIES
      // ============================================
      {
        path: 'categories',
        loadChildren: () => import('@features/categories/categories.routes').then(m => m.CATEGORIES_ROUTES),
        data: { title: 'Catégories' },
      },

      // ============================================
      // CLIENTS
      // ============================================
      {
        path: 'clients',
        loadChildren: () => import('@features/clients/clients.routes').then(m => m.CLIENTS_ROUTES),
        data: { title: 'Clients' },
      },

      // ============================================
      // FOURNISSEURS
      // ============================================
      {
        path: 'fournisseurs',
        loadChildren: () => import('@features/fournisseurs/fournisseurs.routes').then(m => m.FOURNISSEURS_ROUTES),
        data: { title: 'Fournisseurs' },
      },

      // ============================================
      // COMMANDES
      // ============================================
      {
        path: 'commandes',
        loadChildren: () => import('@features/commandes/commandes.routes').then(m => m.COMMANDES_ROUTES),
        data: { title: 'Commandes' },
      },

      // ============================================
      // MOUVEMENTS DE STOCK
      // ============================================
      {
        path: 'mouvements-stock',
        loadChildren: () => import('@features/mouvements-stock/mouvements-stock.routes').then(m => m.MOUVEMENTS_STOCK_ROUTES),
        data: { title: 'Mouvements de stock' },
      },

      // ============================================
      // ENTREPÔTS [PREMIUM]
      // ============================================
      {
        path: 'entrepots',
        canActivate: [premiumGuard],
        loadChildren: () => import('@features/entrepots/entrepots.routes').then(m => m.ENTREPOTS_ROUTES),
        data: { 
          title: 'Entrepôts',
          premium: true,
        },
      },

      // ============================================
      // TRANSFERTS DE STOCK [PREMIUM]
      // ============================================
      {
        path: 'transferts-stock',
        canActivate: [premiumGuard],
        loadChildren: () => import('@features/transferts-stock/transferts-stock.routes').then(m => m.TRANSFERTS_STOCK_ROUTES),
        data: { 
          title: 'Transferts de stock',
          premium: true,
        },
      },

      // ============================================
      // INVENTAIRE [PREMIUM]
      // ============================================
      {
        path: 'inventaire',
        canActivate: [premiumGuard],
        loadChildren: () => import('@features/inventaire/inventaire.routes').then(m => m.INVENTAIRE_ROUTES),
        data: { 
          title: 'Inventaire',
          premium: true,
        },
      },

      // ============================================
      // RÉAPPROVISIONNEMENT
      // ============================================
      {
        path: 'reapprovisionnement',
        loadChildren: () => import('@features/reapprovisionnement/reapprovisionnement.routes').then(m => m.REAPPROVISIONNEMENT_ROUTES),
        data: { title: 'Réapprovisionnement' },
      },

      // ============================================
      // PRÉVISIONS
      // ============================================
      {
        path: 'previsions',
        loadChildren: () => import('@features/previsions/previsions.routes').then(m => m.PREVISIONS_ROUTES),
        data: { title: 'Prévisions' },
      },

      // ============================================
      // RAPPORTS [PREMIUM]
      // ============================================
      {
        path: 'rapports',
        canActivate: [premiumGuard],
        loadChildren: () => import('@features/rapports/rapports.routes').then(m => m.RAPPORTS_ROUTES),
        data: { 
          title: 'Rapports',
          premium: true,
        },
      },

      // ============================================
      // JOURNAL D'AUDIT [PREMIUM - ADMIN/GESTIONNAIRE]
      // ============================================
      {
        path: 'journal-audit',
        canActivate: [premiumGuard, roleGuard],
        loadChildren: () => import('@features/journal-audit/journal-audit.routes').then(m => m.JOURNAL_AUDIT_ROUTES),
        data: { 
          title: 'Journal d\'audit',
          premium: true,
          roles: [Role.ADMIN, Role.GESTIONNAIRE],
        },
      },

      // ============================================
      // NOTIFICATIONS
      // ============================================
      {
        path: 'notifications',
        loadChildren: () => import('@features/notifications/notifications.routes').then(m => m.NOTIFICATIONS_ROUTES),
        data: { title: 'Notifications' },
      },

      // ============================================
      // ALERTES STOCK [PREMIUM]
      // ============================================
      {
        path: 'alertes-stock',
        canActivate: [premiumGuard],
        loadChildren: () => import('@features/alertes-stock/alertes-stock.routes').then(m => m.ALERTES_STOCK_ROUTES),
        data: { 
          title: 'Alertes Stock',
          premium: true,
        },
      },

      // ============================================
      // TRAÇABILITÉ DES LOTS [PREMIUM]
      // ============================================
      {
        path: 'lots',
        canActivate: [premiumGuard],
        loadChildren: () => import('@features/lots-tracabilite/lots-tracabilite.routes').then(m => m.LOTS_TRACABILITE_ROUTES),
        data: { 
          title: 'Traçabilité des Lots',
          premium: true,
        },
      },

      // ============================================
      // INTÉGRATIONS & API [PREMIUM]
      // ============================================
      {
        path: 'integrations',
        canActivate: [premiumGuard],
        loadChildren: () => import('@features/integrations/integrations.routes').then(m => m.INTEGRATIONS_ROUTES),
        data: { 
          title: 'Intégrations & API',
          premium: true,
        },
      },

      // ============================================
      // ABONNEMENT
      // ============================================
      {
        path: 'abonnement',
        loadChildren: () => import('@features/subscription/subscription.routes').then(m => m.SUBSCRIPTION_ROUTES),
        data: { title: 'Abonnement' },
      },

      // ============================================
      // PARAMÈTRES
      // ============================================
      {
        path: 'parametres',
        loadChildren: () => import('@features/settings/settings.routes').then(m => m.SETTINGS_ROUTES),
        data: { title: 'Paramètres' },
      },
    ],
  },

  // ============================================
  // PAGES D'ERREUR
  // ============================================
  {
    path: 'acces-refuse',
    loadComponent: () => 
      import('@features/errors/pages/access-denied/access-denied.component').then(m => m.AccessDeniedComponent),
    data: { title: 'Accès refusé' },
  },
  {
    path: 'premium-requis',
    loadComponent: () => 
      import('@features/errors/pages/premium-required/premium-required.component').then(m => m.PremiumRequiredComponent),
    data: { title: 'Premium requis' },
  },
  {
    path: 'erreur-serveur',
    loadComponent: () => 
      import('@features/errors/pages/server-error/server-error.component').then(m => m.ServerErrorComponent),
    data: { title: 'Erreur serveur' },
  },

  // ============================================
  // 404 - PAGE NON TROUVÉE
  // ============================================
  {
    path: '**',
    loadComponent: () => 
      import('@features/errors/pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    data: { title: 'Page non trouvée' },
  },
];
