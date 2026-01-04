/**
 * Enum des statuts de commande
 */
export enum StatutCommande {
  BROUILLON = 'BROUILLON',
  EN_ATTENTE = 'EN_ATTENTE',
  CONFIRMEE = 'CONFIRMEE',
  EN_PREPARATION = 'EN_PREPARATION',
  EXPEDIEE = 'EXPEDIEE',
  LIVREE = 'LIVREE',
  ANNULEE = 'ANNULEE',
}

/**
 * Labels des statuts
 */
export const StatutCommandeLabels: Record<StatutCommande, string> = {
  [StatutCommande.BROUILLON]: 'Brouillon',
  [StatutCommande.EN_ATTENTE]: 'En attente',
  [StatutCommande.CONFIRMEE]: 'Confirmée',
  [StatutCommande.EN_PREPARATION]: 'En préparation',
  [StatutCommande.EXPEDIEE]: 'Expédiée',
  [StatutCommande.LIVREE]: 'Livrée',
  [StatutCommande.ANNULEE]: 'Annulée',
};

/**
 * Couleurs des statuts (classes Tailwind)
 */
export const StatutCommandeColors: Record<StatutCommande, string> = {
  [StatutCommande.BROUILLON]: 'secondary',
  [StatutCommande.EN_ATTENTE]: 'warning',
  [StatutCommande.CONFIRMEE]: 'info',
  [StatutCommande.EN_PREPARATION]: 'primary',
  [StatutCommande.EXPEDIEE]: 'info',
  [StatutCommande.LIVREE]: 'success',
  [StatutCommande.ANNULEE]: 'danger',
};
