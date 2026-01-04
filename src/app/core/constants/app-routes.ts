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
