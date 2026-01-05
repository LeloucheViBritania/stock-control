/**
 * Service de prévisions et analyses (PREMIUM)
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface PrevisionVentes {
  produitId?: string;
  periode: 'semaine' | 'mois' | 'trimestre';
  donnees: {
    date: string;
    reel?: number;
    prevu: number;
    intervalleBas: number;
    intervalleHaut: number;
  }[];
  tendance: 'HAUSSE' | 'STABLE' | 'BAISSE';
  croissancePrevue: number;
  fiabilite: number;
}

export interface PrevisionStock {
  produitId: string;
  produitNom: string;
  stockActuel: number;
  consommationMoyenne: number;
  joursRestants: number;
  dateRupturePrevue?: Date;
  quantiteRecommandee: number;
  dateRecommandeeCommande: Date;
  tendanceConsommation: 'HAUSSE' | 'STABLE' | 'BAISSE';
}

export interface AnalyseTendance {
  type: 'VENTES' | 'STOCK' | 'COMMANDES';
  periode: { debut: Date; fin: Date };
  tendanceGlobale: 'HAUSSE' | 'STABLE' | 'BAISSE';
  croissance: number;
  saisonnalite?: { mois: number; facteur: number }[];
  anomalies?: { date: Date; valeur: number; attendu: number }[];
  correlation?: { facteur: string; correlation: number }[];
}

export interface RecommandationReapprovisionnement {
  produitId: string;
  produitNom: string;
  produitReference: string;
  fournisseurId?: string;
  fournisseurNom?: string;
  stockActuel: number;
  seuilAlerte: number;
  quantiteRecommandee: number;
  coutEstime: number;
  urgence: 'CRITIQUE' | 'HAUTE' | 'NORMALE' | 'BASSE';
  raisonRecommandation: string;
  delaiLivraison?: number;
}

@Injectable({ providedIn: 'root' })
export class PrevisionsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/previsions`;

  getPrevisionVentes(periode: 'semaine' | 'mois' | 'trimestre', produitId?: string): Observable<PrevisionVentes> {
    let params = new HttpParams().set('periode', periode);
    if (produitId) params = params.set('produitId', produitId);
    return this.http.get<PrevisionVentes>(`${this.apiUrl}/ventes`, { params });
  }

  getPrevisionStock(): Observable<PrevisionStock[]> {
    return this.http.get<PrevisionStock[]>(`${this.apiUrl}/stock`);
  }

  getAnalyseTendance(type: 'VENTES' | 'STOCK' | 'COMMANDES', mois = 6): Observable<AnalyseTendance> {
    return this.http.get<AnalyseTendance>(`${this.apiUrl}/tendances`, { params: { type, mois: mois.toString() } });
  }

  getRecommandationsReapprovisionnement(): Observable<RecommandationReapprovisionnement[]> {
    return this.http.get<RecommandationReapprovisionnement[]>(`${this.apiUrl}/reapprovisionnement`);
  }

  getScenario(params: { croissanceVentes?: number; nouveauxProduits?: number; nouveauxClients?: number }): Observable<{
    impactCA: number;
    impactStock: number;
    investissementNecessaire: number;
    roi: number;
  }> {
    return this.http.post<any>(`${this.apiUrl}/scenario`, params);
  }

  getDashboardPrevisions(): Observable<{
    tendanceVentes: 'HAUSSE' | 'STABLE' | 'BAISSE';
    croissancePrevue: number;
    alertesStock: number;
    produitsARisque: number;
    recommandationsUrgentes: number;
    fiabiliteModele: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }
}
