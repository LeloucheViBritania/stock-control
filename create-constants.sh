#!/bin/bash
cd /home/claude/gestion-stock-frontend/src/app/core/constants

# Config
cat > config.ts << 'EOF'
export const APP_CONFIG = {
  appName: 'Gestion de Stock',
  appVersion: '1.0.0',
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  dateFormat: 'dd/MM/yyyy',
  dateTimeFormat: 'dd/MM/yyyy HH:mm',
  currency: 'EUR',
  locale: 'fr-FR',
};

export const STORAGE_KEYS = {
  token: 'gestion_stock_token',
  refreshToken: 'gestion_stock_refresh_token',
  user: 'gestion_stock_user',
  theme: 'gestion_stock_theme',
  sidebar: 'gestion_stock_sidebar',
};
EOF

# API Endpoints
cat > api-endpoints.ts << 'EOF'
export const API_ENDPOINTS = {
  auth: {
    login: 'auth/login',
    register: 'auth/register',
    logout: 'auth/logout',
    refresh: 'auth/refresh',
    forgotPassword: 'auth/forgot-password',
    resetPassword: 'auth/reset-password',
    profile: 'auth/profile',
    changePassword: 'auth/change-password',
  },
  produits: {
    base: 'produits',
    stockFaible: 'produits/stock-faible',
    export: 'produits/export',
  },
  categories: {
    base: 'categories',
    tree: 'categories/tree',
  },
  clients: {
    base: 'clients',
    segmentation: 'clients/segmentation',
  },
  fournisseurs: {
    base: 'fournisseurs',
    comparer: 'fournisseurs/comparer',
  },
  commandes: {
    base: 'commandes',
    export: 'commandes/export',
  },
  mouvements: {
    base: 'mouvements-stock',
    stats: 'mouvements-stock/stats',
  },
  entrepots: {
    base: 'entrepots',
  },
  transferts: {
    base: 'transferts-stock',
  },
  inventaire: {
    base: 'inventaire',
    sessions: 'inventaire/sessions',
  },
  notifications: {
    base: 'notifications',
    markRead: 'notifications/mark-read',
    markAllRead: 'notifications/mark-all-read',
  },
  dashboard: {
    stats: 'dashboard/stats',
    charts: 'dashboard/charts',
  },
  rapports: {
    base: 'rapports',
    inventaire: 'rapports/inventaire',
    ventes: 'rapports/ventes',
    mouvements: 'rapports/mouvements',
  },
  journalAudit: {
    base: 'journal-audit',
    stats: 'journal-audit/stats',
  },
  subscription: {
    base: 'subscription',
    plans: 'subscription/plans',
    checkout: 'subscription/checkout',
  },
  users: {
    base: 'users',
  },
};
EOF

# App Routes
cat > app-routes.ts << 'EOF'
export const APP_ROUTES = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  dashboard: '/dashboard',
  produits: {
    list: '/produits',
    nouveau: '/produits/nouveau',
    detail: (id: string) => \`/produits/\${id}\`,
    modifier: (id: string) => \`/produits/\${id}/modifier\`,
    stockFaible: '/produits/stock-faible',
  },
  categories: {
    list: '/categories',
    nouveau: '/categories/nouveau',
    modifier: (id: string) => \`/categories/\${id}/modifier\`,
  },
  clients: {
    list: '/clients',
    nouveau: '/clients/nouveau',
    detail: (id: string) => \`/clients/\${id}\`,
    modifier: (id: string) => \`/clients/\${id}/modifier\`,
  },
  fournisseurs: {
    list: '/fournisseurs',
    nouveau: '/fournisseurs/nouveau',
    detail: (id: string) => \`/fournisseurs/\${id}\`,
    modifier: (id: string) => \`/fournisseurs/\${id}/modifier\`,
  },
  commandes: {
    list: '/commandes',
    nouveau: '/commandes/nouveau',
    detail: (id: string) => \`/commandes/\${id}\`,
  },
  mouvements: {
    list: '/mouvements-stock',
    stats: '/mouvements-stock/stats',
  },
  entrepots: {
    list: '/entrepots',
    nouveau: '/entrepots/nouveau',
    detail: (id: string) => \`/entrepots/\${id}\`,
  },
  transferts: {
    list: '/transferts-stock',
    nouveau: '/transferts-stock/nouveau',
  },
  inventaire: {
    list: '/inventaire',
    nouveau: '/inventaire/nouveau',
  },
  rapports: '/rapports',
  journalAudit: '/journal-audit',
  notifications: '/notifications',
  abonnement: '/abonnement',
  parametres: {
    profile: '/parametres/profile',
    security: '/parametres/security',
    preferences: '/parametres/preferences',
    users: '/parametres/users',
  },
  errors: {
    notFound: '/404',
    accessDenied: '/acces-refuse',
    premiumRequired: '/premium-requis',
    serverError: '/erreur-serveur',
  },
};
EOF

# Permissions
cat > permissions.ts << 'EOF'
import { Role } from '@enums/role.enum';

export const PERMISSIONS = {
  // Produits
  PRODUITS_READ: [Role.ADMIN, Role.GESTIONNAIRE, Role.EMPLOYE],
  PRODUITS_CREATE: [Role.ADMIN, Role.GESTIONNAIRE],
  PRODUITS_UPDATE: [Role.ADMIN, Role.GESTIONNAIRE],
  PRODUITS_DELETE: [Role.ADMIN],

  // Categories
  CATEGORIES_READ: [Role.ADMIN, Role.GESTIONNAIRE, Role.EMPLOYE],
  CATEGORIES_MANAGE: [Role.ADMIN, Role.GESTIONNAIRE],

  // Clients
  CLIENTS_READ: [Role.ADMIN, Role.GESTIONNAIRE, Role.EMPLOYE],
  CLIENTS_MANAGE: [Role.ADMIN, Role.GESTIONNAIRE],

  // Fournisseurs
  FOURNISSEURS_READ: [Role.ADMIN, Role.GESTIONNAIRE, Role.EMPLOYE],
  FOURNISSEURS_MANAGE: [Role.ADMIN, Role.GESTIONNAIRE],

  // Commandes
  COMMANDES_READ: [Role.ADMIN, Role.GESTIONNAIRE, Role.EMPLOYE],
  COMMANDES_CREATE: [Role.ADMIN, Role.GESTIONNAIRE, Role.EMPLOYE],
  COMMANDES_UPDATE: [Role.ADMIN, Role.GESTIONNAIRE],
  COMMANDES_DELETE: [Role.ADMIN],

  // Mouvements Stock
  MOUVEMENTS_READ: [Role.ADMIN, Role.GESTIONNAIRE, Role.EMPLOYE],
  MOUVEMENTS_CREATE: [Role.ADMIN, Role.GESTIONNAIRE, Role.EMPLOYE],

  // Entrepots (PREMIUM)
  ENTREPOTS_MANAGE: [Role.ADMIN, Role.GESTIONNAIRE],

  // Rapports (PREMIUM)
  RAPPORTS_VIEW: [Role.ADMIN, Role.GESTIONNAIRE],

  // Journal Audit (PREMIUM)
  AUDIT_VIEW: [Role.ADMIN, Role.GESTIONNAIRE],

  // Users
  USERS_MANAGE: [Role.ADMIN],

  // Settings
  SETTINGS_MANAGE: [Role.ADMIN],
};

export function hasPermission(userRole: Role, permission: Role[]): boolean {
  return permission.includes(userRole);
}
EOF

echo "Constants créés"
