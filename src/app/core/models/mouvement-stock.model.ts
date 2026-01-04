import { TypeMouvement } from '@enums/type-mouvement.enum';

export interface MouvementStock {
  id: string;
  type: TypeMouvement;
  produitId: string;
  produit?: { id: string; nom: string; reference: string };
  entrepotId?: string;
  entrepot?: { id: string; nom: string };
  quantite: number;
  quantiteAvant: number;
  quantiteApres: number;
  reference?: string;
  notes?: string;
  userId: string;
  user?: { id: string; nom: string; prenom: string };
  createdAt: Date;
}

export interface CreateMouvementDto {
  type: TypeMouvement;
  produitId: string;
  entrepotId?: string;
  quantite: number;
  reference?: string;
  notes?: string;
}
