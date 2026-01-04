/**
 * Enum des statuts de transfert
 */
export enum StatutTransfert {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_TRANSIT = 'EN_TRANSIT',
  RECU_PARTIELLEMENT = 'RECU_PARTIELLEMENT',
  COMPLETE = 'COMPLETE',
  ANNULE = 'ANNULE',
}

/**
 * Labels des statuts
 */
export const StatutTransfertLabels: Record<StatutTransfert, string> = {
  [StatutTransfert.EN_ATTENTE]: 'En attente',
  [StatutTransfert.EN_TRANSIT]: 'En transit',
  [StatutTransfert.RECU_PARTIELLEMENT]: 'Reçu partiellement',
  [StatutTransfert.COMPLETE]: 'Complété',
  [StatutTransfert.ANNULE]: 'Annulé',
};

/**
 * Couleurs des statuts
 */
export const StatutTransfertColors: Record<StatutTransfert, string> = {
  [StatutTransfert.EN_ATTENTE]: 'warning',
  [StatutTransfert.EN_TRANSIT]: 'info',
  [StatutTransfert.RECU_PARTIELLEMENT]: 'primary',
  [StatutTransfert.COMPLETE]: 'success',
  [StatutTransfert.ANNULE]: 'danger',
};
