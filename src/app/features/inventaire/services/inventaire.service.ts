/**
 * Service de gestion des inventaires (PREMIUM)
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Inventaire {
  id: string;
  numero: string;
  entrepotId: string;
  entrepotNom: string;
  type: 'COMPLET' | 'PARTIEL' | 'TOURNANT';
  statut: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'VALIDE' | 'ANNULE';
  dateDebut: Date;
  dateFin?: Date;
  dateValidation?: Date;
  responsable: string;
  validePar?: string;
  nombreProduits: number;
  nombreComptes: number;
  ecartValeur: number;
  ecartQuantite: number;
  zones?: string[];
  notes?: string;
  lignes?: InventaireLigne[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InventaireLigne {
  id: string;
  produitId: string;
  produitNom: string;
  produitReference: string;
  zone?: string;
  emplacement?: string;
  quantiteTheorique: number;
  quantiteComptee?: number;
  ecart: number;
  ecartPourcentage: number;
  valeurEcart: number;
  statut: 'A_COMPTER' | 'COMPTE' | 'VALIDE' | 'AJUSTE';
  comptePar?: string;
  dateComptage?: Date;
}

export interface CreateInventaireDto {
  entrepotId: string;
  type: 'COMPLET' | 'PARTIEL' | 'TOURNANT';
  zones?: string[];
  produits?: string[];
  dateDebut: Date;
  responsable: string;
  notes?: string;
}

export interface InventaireFilters {
  search?: string;
  statut?: string;
  entrepotId?: string;
  type?: string;
  dateDebut?: string;
  dateFin?: string;
}

@Injectable({ providedIn: 'root' })
export class InventaireService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/inventaires`;

  getAll(page = 1, limit = 20, filters?: InventaireFilters): Observable<{
    data: Inventaire[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.statut) params = params.set('statut', filters.statut);
    if (filters?.entrepotId) params = params.set('entrepotId', filters.entrepotId);
    if (filters?.type) params = params.set('type', filters.type);
    return this.http.get<any>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Inventaire> {
    return this.http.get<Inventaire>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateInventaireDto): Observable<Inventaire> {
    return this.http.post<Inventaire>(this.apiUrl, data);
  }

  update(id: string, data: Partial<CreateInventaireDto>): Observable<Inventaire> {
    return this.http.patch<Inventaire>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getLignes(id: string, page = 1, limit = 50): Observable<{
    data: InventaireLigne[];
    meta: { total: number; page: number; limit: number };
  }> {
    return this.http.get<any>(`${this.apiUrl}/${id}/lignes`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  compterLigne(inventaireId: string, ligneId: string, quantite: number): Observable<InventaireLigne> {
    return this.http.patch<InventaireLigne>(`${this.apiUrl}/${inventaireId}/lignes/${ligneId}`, { quantiteComptee: quantite });
  }

  demarrer(id: string): Observable<Inventaire> {
    return this.http.post<Inventaire>(`${this.apiUrl}/${id}/demarrer`, {});
  }

  terminer(id: string): Observable<Inventaire> {
    return this.http.post<Inventaire>(`${this.apiUrl}/${id}/terminer`, {});
  }

  valider(id: string): Observable<Inventaire> {
    return this.http.post<Inventaire>(`${this.apiUrl}/${id}/valider`, {});
  }

  ajusterStock(id: string): Observable<Inventaire> {
    return this.http.post<Inventaire>(`${this.apiUrl}/${id}/ajuster`, {});
  }

  annuler(id: string, motif: string): Observable<Inventaire> {
    return this.http.post<Inventaire>(`${this.apiUrl}/${id}/annuler`, { motif });
  }

  exportRapport(id: string, format: 'xlsx' | 'pdf'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/export`, { params: { format }, responseType: 'blob' });
  }

  getStats(): Observable<{
    enCours: number;
    planifies: number;
    terminesCeMois: number;
    ecartTotalValeur: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
}
