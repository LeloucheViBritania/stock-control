/**
 * Enum des fonctionnalités (pour le contrôle FREE/PREMIUM)
 */
export enum Feature {
  // Fonctionnalités FREE
  PRODUITS = 'PRODUITS',
  CATEGORIES = 'CATEGORIES',
  CLIENTS = 'CLIENTS',
  FOURNISSEURS = 'FOURNISSEURS',
  COMMANDES = 'COMMANDES',
  MOUVEMENTS_STOCK = 'MOUVEMENTS_STOCK',
  DASHBOARD = 'DASHBOARD',
  NOTIFICATIONS = 'NOTIFICATIONS',
  
  // Fonctionnalités PREMIUM
  MULTI_ENTREPOTS = 'MULTI_ENTREPOTS',
  TRANSFERTS_STOCK = 'TRANSFERTS_STOCK',
  INVENTAIRE_PHYSIQUE = 'INVENTAIRE_PHYSIQUE',
  JOURNAL_AUDIT = 'JOURNAL_AUDIT',
  RAPPORTS_AVANCES = 'RAPPORTS_AVANCES',
  EXPORT_PDF = 'EXPORT_PDF',
  EXPORT_EXCEL = 'EXPORT_EXCEL',
  PREVISIONS = 'PREVISIONS',
  REAPPROVISIONNEMENT_AUTO = 'REAPPROVISIONNEMENT_AUTO',
}

/**
 * Fonctionnalités gratuites
 */
export const FREE_FEATURES: Feature[] = [
  Feature.PRODUITS,
  Feature.CATEGORIES,
  Feature.CLIENTS,
  Feature.FOURNISSEURS,
  Feature.COMMANDES,
  Feature.MOUVEMENTS_STOCK,
  Feature.DASHBOARD,
  Feature.NOTIFICATIONS,
];

/**
 * Fonctionnalités premium
 */
export const PREMIUM_FEATURES: Feature[] = [
  Feature.MULTI_ENTREPOTS,
  Feature.TRANSFERTS_STOCK,
  Feature.INVENTAIRE_PHYSIQUE,
  Feature.JOURNAL_AUDIT,
  Feature.RAPPORTS_AVANCES,
  Feature.EXPORT_PDF,
  Feature.EXPORT_EXCEL,
  Feature.PREVISIONS,
  Feature.REAPPROVISIONNEMENT_AUTO,
];

/**
 * Labels des fonctionnalités
 */
export const FeatureLabels: Record<Feature, string> = {
  [Feature.PRODUITS]: 'Gestion des produits',
  [Feature.CATEGORIES]: 'Gestion des catégories',
  [Feature.CLIENTS]: 'Gestion des clients',
  [Feature.FOURNISSEURS]: 'Gestion des fournisseurs',
  [Feature.COMMANDES]: 'Gestion des commandes',
  [Feature.MOUVEMENTS_STOCK]: 'Mouvements de stock',
  [Feature.DASHBOARD]: 'Tableau de bord',
  [Feature.NOTIFICATIONS]: 'Notifications',
  [Feature.MULTI_ENTREPOTS]: 'Multi-entrepôts',
  [Feature.TRANSFERTS_STOCK]: 'Transferts de stock',
  [Feature.INVENTAIRE_PHYSIQUE]: 'Inventaire physique',
  [Feature.JOURNAL_AUDIT]: 'Journal d\'audit',
  [Feature.RAPPORTS_AVANCES]: 'Rapports avancés',
  [Feature.EXPORT_PDF]: 'Export PDF',
  [Feature.EXPORT_EXCEL]: 'Export Excel',
  [Feature.PREVISIONS]: 'Prévisions',
  [Feature.REAPPROVISIONNEMENT_AUTO]: 'Réapprovisionnement automatique',
};
