import { StatutCommande } from '@enums/statut-commande.enum';
import { Client } from './client.model';

export interface Commande {
  id: string;
  numero: string;
  clientId: string;
  client?: Client;
  statut: StatutCommande;
  dateCommande: Date;
  dateLivraison?: Date;
  lignes: LigneCommande[];
  sousTotal: number;
  taxe: number;
  remise: number;
  total: number;
  notes?: string;
  adresseLivraison?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LigneCommande {
  id: string;
  produitId: string;
  produit?: { id: string; nom: string; reference: string };
  quantite: number;
  prixUnitaire: number;
  remise: number;
  total: number;
}

export interface CreateCommandeDto {
  clientId: string;
  lignes: { produitId: string; quantite: number; prixUnitaire: number; remise?: number }[];
  notes?: string;
  adresseLivraison?: string;
}
