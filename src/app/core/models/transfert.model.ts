import { StatutTransfert } from '@enums/statut-transfert.enum';

export interface Transfert {
  id: string;
  numero: string;
  entrepotSourceId: string;
  entrepotSource?: { id: string; nom: string };
  entrepotDestinationId: string;
  entrepotDestination?: { id: string; nom: string };
  statut: StatutTransfert;
  dateTransfert: Date;
  dateReception?: Date;
  lignes: LigneTransfert[];
  notes?: string;
  userId: string;
  user?: { id: string; nom: string; prenom: string };
  createdAt: Date;
  updatedAt: Date;
}

export interface LigneTransfert {
  id: string;
  produitId: string;
  produit?: { id: string; nom: string; reference: string };
  quantiteDemandee: number;
  quantiteRecue?: number;
}
