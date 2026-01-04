export interface Inventaire {
  id: string;
  reference: string;
  entrepotId: string;
  entrepot?: { id: string; nom: string };
  dateDebut: Date;
  dateFin?: Date;
  statut: 'EN_COURS' | 'TERMINE' | 'VALIDE';
  lignes: LigneInventaire[];
  userId: string;
  user?: { id: string; nom: string; prenom: string };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LigneInventaire {
  id: string;
  produitId: string;
  produit?: { id: string; nom: string; reference: string };
  quantiteTheorique: number;
  quantiteComptee?: number;
  ecart: number;
  notes?: string;
}
