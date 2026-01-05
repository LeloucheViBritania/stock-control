/**
 * Service de gestion des Lots (PREMIUM)
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Lot {
  id: string;
  numeroLot: string;
  produitId: string;
  quantiteInitiale: number;
  quantiteRestante: number;
  dateProduction: Date;
  dateExpiration?: Date;
  fournisseurId: string;
  entrepotId: string;
  zoneId?: string;
  statut: 'ACTIF' | 'EPUISE' | 'BLOQUE' | 'RAPPEL' | 'EXPIRE';
  prixAchat: number;
  certificats?: string[];
  commentaire?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MouvementLot {
  id: string;
  lotId: string;
  type: 'ENTREE' | 'SORTIE' | 'AJUSTEMENT' | 'TRANSFERT';
  quantite: number;
  reference?: string;
  utilisateur: string;
  date: Date;
  commentaire?: string;
}

export interface CreateLotDto {
  produitId: string;
  quantite: number;
  dateProduction: Date;
  dateExpiration?: Date;
  fournisseurId: string;
  entrepotId: string;
  zoneId?: string;
  prixAchat: number;
  certificats?: string[];
  commentaire?: string;
}

@Injectable({ providedIn: 'root' })
export class LotsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/lots`;

  getAll(page = 1, limit = 20, filters?: { statut?: string; entrepotId?: string; produitId?: string; search?: string }): Observable<{
    data: Lot[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (filters?.statut) params = params.set('statut', filters.statut);
    if (filters?.entrepotId) params = params.set('entrepotId', filters.entrepotId);
    if (filters?.produitId) params = params.set('produitId', filters.produitId);
    if (filters?.search) params = params.set('search', filters.search);
    return this.http.get<any>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Lot> {
    return this.http.get<Lot>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateLotDto): Observable<Lot> {
    return this.http.post<Lot>(this.apiUrl, data);
  }

  update(id: string, data: Partial<CreateLotDto>): Observable<Lot> {
    return this.http.patch<Lot>(`${this.apiUrl}/${id}`, data);
  }

  bloquer(id: string, raison: string): Observable<Lot> {
    return this.http.patch<Lot>(`${this.apiUrl}/${id}/bloquer`, { raison });
  }

  debloquer(id: string): Observable<Lot> {
    return this.http.patch<Lot>(`${this.apiUrl}/${id}/debloquer`, {});
  }

  getMouvements(id: string): Observable<MouvementLot[]> {
    return this.http.get<MouvementLot[]>(`${this.apiUrl}/${id}/mouvements`);
  }

  getExpirationProche(jours: number = 30): Observable<Lot[]> {
    return this.http.get<Lot[]>(`${this.apiUrl}/expiration-proche`, { params: { jours } });
  }

  getStatistiques(): Observable<{
    totalLots: number;
    lotsActifs: number;
    lotsBloques: number;
    expirationProche: number;
    valeurTotale: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/statistiques`);
  }

  export(format: 'xlsx' | 'csv' | 'pdf'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, { params: { format }, responseType: 'blob' });
  }
}
