export interface RapportConfig {
  type: 'INVENTAIRE' | 'VENTES' | 'MOUVEMENTS' | 'FOURNISSEURS';
  dateDebut: Date;
  dateFin: Date;
  entrepotId?: string;
  categorieId?: string;
  format: 'PDF' | 'EXCEL' | 'CSV';
}

export interface RapportInventaire {
  produits: {
    reference: string;
    nom: string;
    categorie: string;
    quantite: number;
    valeur: number;
    statut: string;
  }[];
  total: number;
  valeurTotale: number;
}
