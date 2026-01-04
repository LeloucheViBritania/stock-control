/**
 * Enum des tiers d'abonnement
 */
export enum TierAbonnement {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}

/**
 * Labels des tiers
 */
export const TierLabels: Record<TierAbonnement, string> = {
  [TierAbonnement.FREE]: 'Gratuit',
  [TierAbonnement.PREMIUM]: 'Premium',
};

/**
 * Configuration des tiers
 */
export const TierConfig: Record<TierAbonnement, { maxProduits: number; maxEntrepots: number; maxUtilisateurs: number }> = {
  [TierAbonnement.FREE]: {
    maxProduits: 100,
    maxEntrepots: 1,
    maxUtilisateurs: 3,
  },
  [TierAbonnement.PREMIUM]: {
    maxProduits: -1, // Illimité
    maxEntrepots: -1,
    maxUtilisateurs: -1,
  },
};
