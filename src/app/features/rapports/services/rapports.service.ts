/**
 * Service de génération de rapports (PREMIUM)
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface RapportConfig {
  type: 'VENTES' | 'STOCK' | 'MOUVEMENTS' | 'INVENTAIRE' | 'CLIENTS' | 'FOURNISSEURS';
  dateDebut: Date;
  dateFin: Date;
  entrepotId?: string;
  categorieId?: string;
  groupePar?: 'jour' | 'semaine' | 'mois';
  inclureGraphiques?: boolean;
}

export interface RapportVentes {
  periode: { debut: Date; fin: Date };
  totalVentes: number;
  nombreCommandes: number;
  panierMoyen: number;
  evolution: { date: string; montant: number; commandes: number }[];
  topProduits: { produit: string; quantite: number; montant: number }[];
  topClients: { client: string; montant: number; commandes: number }[];
  repartitionCategories: { categorie: string; montant: number; pourcentage: number }[];
}

export interface RapportStock {
  dateGeneration: Date;
  valeurTotale: number;
  nombreReferences: number;
  quantiteTotale: number;
  alertesStock: number;
  stockFaible: { produit: string; reference: string; quantite: number; seuil: number }[];
  repartitionCategories: { categorie: string; valeur: number; quantite: number }[];
  rotationStock: { produit: string; rotation: number; joursStock: number }[];
  evolutionValeur: { date: string; valeur: number }[];
}

export interface RapportMouvements {
  periode: { debut: Date; fin: Date };
  totalEntrees: number;
  totalSorties: number;
  nombreMouvements: number;
  mouvementsParType: { type: string; quantite: number; valeur: number }[];
  mouvementsParJour: { date: string; entrees: number; sorties: number }[];
  topProduitsMouvements: { produit: string; entrees: number; sorties: number }[];
}

@Injectable({ providedIn: 'root' })
export class RapportsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/rapports`;

  genererRapportVentes(config: RapportConfig): Observable<RapportVentes> {
    return this.http.post<RapportVentes>(`${this.apiUrl}/ventes`, config);
  }

  genererRapportStock(config: RapportConfig): Observable<RapportStock> {
    return this.http.post<RapportStock>(`${this.apiUrl}/stock`, config);
  }

  genererRapportMouvements(config: RapportConfig): Observable<RapportMouvements> {
    return this.http.post<RapportMouvements>(`${this.apiUrl}/mouvements`, config);
  }

  exporterRapport(type: string, config: RapportConfig, format: 'xlsx' | 'pdf' | 'csv'): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/${type}/export`, { ...config, format }, { responseType: 'blob' });
  }

  getRapportsGeneres(): Observable<{
    id: string;
    type: string;
    dateGeneration: Date;
    generePar: string;
    statut: string;
  }[]> {
    return this.http.get<any[]>(`${this.apiUrl}/historique`);
  }

  planifierRapport(config: RapportConfig & { frequence: 'quotidien' | 'hebdomadaire' | 'mensuel'; email: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/planifier`, config);
  }
}
