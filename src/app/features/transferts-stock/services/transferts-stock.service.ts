/**
 * Service de gestion des transferts de stock (PREMIUM)
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '@env/environment';

export interface TransfertStock {
  id: string;
  numero: string;
  entrepotSourceId: string;
  entrepotSourceNom: string;
  entrepotDestinationId: string;
  entrepotDestinationNom: string;
  statut: 'BROUILLON' | 'EN_ATTENTE' | 'EN_COURS' | 'RECEPTIONNE' | 'ANNULE';
  dateCreation: Date;
  dateExpedition?: Date;
  dateReception?: Date;
  demandePar: string;
  validePar?: string;
  lignes: TransfertLigne[];
  nombreArticles: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransfertLigne {
  id: string;
  produitId: string;
  produitNom: string;
  produitReference: string;
  quantiteDemandee: number;
  quantiteExpediee: number;
  quantiteRecue: number;
  ecart?: number;
}

export interface CreateTransfertDto {
  entrepotSourceId: string;
  entrepotDestinationId: string;
  lignes: { produitId: string; quantite: number }[];
  notes?: string;
}

export interface TransfertFilters {
  search?: string;
  statut?: string;
  entrepotSourceId?: string;
  entrepotDestinationId?: string;
  dateDebut?: string;
  dateFin?: string;
}

@Injectable({ providedIn: 'root' })
export class TransfertsStockService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/transferts-stock`;

  getAll(page = 1, limit = 20, filters?: TransfertFilters): Observable<{
    data: TransfertStock[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.statut) params = params.set('statut', filters.statut);
    if (filters?.entrepotSourceId) params = params.set('entrepotSourceId', filters.entrepotSourceId);
    if (filters?.entrepotDestinationId) params = params.set('entrepotDestinationId', filters.entrepotDestinationId);
    return this.http.get<any>(this.apiUrl, { params });
  }

  getById(id: string): Observable<TransfertStock> {
    return this.http.get<TransfertStock>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateTransfertDto): Observable<TransfertStock> {
    return this.http.post<TransfertStock>(this.apiUrl, data);
  }

  update(id: string, data: Partial<CreateTransfertDto>): Observable<TransfertStock> {
    return this.http.patch<TransfertStock>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  valider(id: string): Observable<TransfertStock> {
    return this.http.post<TransfertStock>(`${this.apiUrl}/${id}/valider`, {});
  }

  expedier(id: string): Observable<TransfertStock> {
    return this.http.post<TransfertStock>(`${this.apiUrl}/${id}/expedier`, {});
  }

  receptionner(id: string, lignes: { ligneId: string; quantiteRecue: number }[]): Observable<TransfertStock> {
    return this.http.post<TransfertStock>(`${this.apiUrl}/${id}/receptionner`, { lignes });
  }

  annuler(id: string, motif: string): Observable<TransfertStock> {
    return this.http.post<TransfertStock>(`${this.apiUrl}/${id}/annuler`, { motif });
  }

  getStats(): Observable<{
    enAttente: number;
    enCours: number;
    receptionnes: number;
    annules: number;
    totalMois: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
}
