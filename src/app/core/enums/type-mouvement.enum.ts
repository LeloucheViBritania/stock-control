/**
 * Enum des types de mouvement de stock
 */
export enum TypeMouvement {
  ENTREE = 'ENTREE',
  SORTIE = 'SORTIE',
  TRANSFERT_ENTRANT = 'TRANSFERT_ENTRANT',
  TRANSFERT_SORTANT = 'TRANSFERT_SORTANT',
  AJUSTEMENT_POSITIF = 'AJUSTEMENT_POSITIF',
  AJUSTEMENT_NEGATIF = 'AJUSTEMENT_NEGATIF',
  INVENTAIRE = 'INVENTAIRE',
}

/**
 * Labels des types
 */
export const TypeMouvementLabels: Record<TypeMouvement, string> = {
  [TypeMouvement.ENTREE]: 'Entrée',
  [TypeMouvement.SORTIE]: 'Sortie',
  [TypeMouvement.TRANSFERT_ENTRANT]: 'Transfert entrant',
  [TypeMouvement.TRANSFERT_SORTANT]: 'Transfert sortant',
  [TypeMouvement.AJUSTEMENT_POSITIF]: 'Ajustement +',
  [TypeMouvement.AJUSTEMENT_NEGATIF]: 'Ajustement -',
  [TypeMouvement.INVENTAIRE]: 'Inventaire',
};

/**
 * Couleurs des types
 */
export const TypeMouvementColors: Record<TypeMouvement, string> = {
  [TypeMouvement.ENTREE]: 'success',
  [TypeMouvement.SORTIE]: 'danger',
  [TypeMouvement.TRANSFERT_ENTRANT]: 'info',
  [TypeMouvement.TRANSFERT_SORTANT]: 'warning',
  [TypeMouvement.AJUSTEMENT_POSITIF]: 'success',
  [TypeMouvement.AJUSTEMENT_NEGATIF]: 'danger',
  [TypeMouvement.INVENTAIRE]: 'primary',
};

/**
 * Icônes des types
 */
export const TypeMouvementIcons: Record<TypeMouvement, string> = {
  [TypeMouvement.ENTREE]: 'arrow-down',
  [TypeMouvement.SORTIE]: 'arrow-up',
  [TypeMouvement.TRANSFERT_ENTRANT]: 'arrow-left',
  [TypeMouvement.TRANSFERT_SORTANT]: 'arrow-right',
  [TypeMouvement.AJUSTEMENT_POSITIF]: 'plus',
  [TypeMouvement.AJUSTEMENT_NEGATIF]: 'minus',
  [TypeMouvement.INVENTAIRE]: 'clipboard-list',
};
