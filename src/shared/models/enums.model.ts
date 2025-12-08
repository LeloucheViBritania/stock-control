// Basé sur src/common/enums/subscription-tier.enum.ts du backend
export enum TierAbonnement {
  GRATUIT = 'GRATUIT',
  PREMIUM = 'PREMIUM',
}

// Basé sur le schema.prisma (Role)
export enum Role {
  ADMIN = 'ADMIN',
  GESTIONNAIRE = 'GESTIONNAIRE',
  EMPLOYE = 'EMPLOYE',
}

// Basé sur src/common/enums/features.enum.ts
// Utile pour masquer des boutons dans l'interface
export enum Feature {
  MULTI_ENTREPOTS = 'multi_entrepots',
  TRANSFERTS_STOCK = 'transferts_stock',
  AJUSTEMENTS_AVANCES = 'ajustements_avances',
  BONS_COMMANDE_ACHAT = 'bons_commande_achat',
  GESTION_ROLES = 'gestion_roles',
  JOURNAL_AUDIT = 'journal_audit',
  RAPPORTS_AVANCES = 'rapports_avances',
  RELATION_PRODUITS_FOURNISSEURS = 'relation_produits_fournisseurs',
}

// Basé sur le schema.prisma
export enum StatutCommande {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_TRAITEMENT = 'EN_TRAITEMENT',
  EXPEDIE = 'EXPEDIE',
  LIVRE = 'LIVRE',
  ANNULE = 'ANNULE',
}