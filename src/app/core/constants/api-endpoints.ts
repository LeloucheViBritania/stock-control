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
