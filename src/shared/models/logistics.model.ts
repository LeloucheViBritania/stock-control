import { Produit } from './product.model';
import { Utilisateur } from './user.model';

export interface Entrepot {
  id: number;
  nom: string;
  code: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  responsableId?: number;
  responsable?: Utilisateur;
  estActif: boolean;
}

export enum StatutTransfert {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_TRANSIT = 'EN_TRANSIT',
  COMPLETE = 'COMPLETE',
  ANNULE = 'ANNULE'
}

export interface LigneTransfert {
  id?: number;
  produitId: number;
  produit?: Produit;
  quantite: number;
  quantiteRecue?: number;
}

export interface TransfertStock {
  id: number;
  numeroTransfert: string;
  entrepotSourceId: number;
  entrepotSource?: Entrepot;
  entrepotDestinationId: number;
  entrepotDestination?: Entrepot;
  dateTransfert: Date;
  statut: StatutTransfert;
  notes?: string;
  lignes: LigneTransfert[];
}