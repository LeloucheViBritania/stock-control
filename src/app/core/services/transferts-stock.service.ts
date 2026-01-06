import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { 
  TransfertStock, 
  CreateTransfertRequest, 
  PaginatedResponse,
  StatutTransfert 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class TransfertsStockService {
  private readonly apiUrl = `${environment.apiUrl}/transferts-stock`;

  constructor(private http: HttpClient) {}

  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    statut?: StatutTransfert;
    entrepotSourceId?: number;
    entrepotDestinationId?: number;
    dateDebut?: string;
    dateFin?: string;
  }): Observable<PaginatedResponse<TransfertStock>> {
    let httpParams = new HttpParams();
    
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.statut) httpParams = httpParams.set('statut', params.statut);
    if (params?.entrepotSourceId) httpParams = httpParams.set('entrepotSourceId', params.entrepotSourceId.toString());
    if (params?.entrepotDestinationId) httpParams = httpParams.set('entrepotDestinationId', params.entrepotDestinationId.toString());
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);

    return this.http.get<any>(this.apiUrl, { params: httpParams }).pipe(
      map(response => {
        // Backend returns array directly from findAll()
        if (Array.isArray(response)) {
          // Map backend field names to frontend expected names
          const mapped = response.map(t => this.mapTransfert(t));
          return {
            data: mapped,
            meta: { total: response.length, page: 1, limit: response.length || 20, totalPages: 1 }
          };
        }
        // Handle paginated response
        if (response.data) {
          return {
            data: response.data.map((t: any) => this.mapTransfert(t)),
            meta: response.meta || { total: response.data.length, page: 1, limit: 20, totalPages: 1 }
          };
        }
        return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
      })
    );
  }

  private mapTransfert(t: any): TransfertStock {
    return {
      ...t,
      // Map entrepotSource to entrepotOrigine for frontend compatibility
      entrepotOrigine: t.entrepotSource || t.entrepotOrigine,
      entrepotDestination: t.entrepotDestination,
      _count: t._count || { lignes: t.lignes?.length || 0 }
    };
  }

  getById(id: number): Observable<TransfertStock> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(t => this.mapTransfert(t))
    );
  }

  create(transfert: CreateTransfertRequest): Observable<TransfertStock> {
    // Map frontend field names to backend expected names if needed
    const payload: any = {
      ...transfert,
      entrepotSourceId: transfert.entrepotSourceId || (transfert as any).entrepotOrigineId,
      entrepotDestinationId: transfert.entrepotDestinationId
    };
    return this.http.post<TransfertStock>(this.apiUrl, payload);
  }

  update(id: number, data: Partial<CreateTransfertRequest>): Observable<TransfertStock> {
    return this.http.patch<TransfertStock>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  expedier(id: number, data?: {
    lignes?: { ligneId: number; quantiteEnvoyee: number }[];
    notes?: string;
  }): Observable<TransfertStock> {
    return this.http.post<TransfertStock>(`${this.apiUrl}/${id}/expedier`, data || {});
  }

  envoyer(id: number, data?: any): Observable<TransfertStock> {
    return this.expedier(id, data);
  }

  recevoir(id: number, data?: {
    lignes?: { ligneId: number; quantiteRecue: number }[];
    notes?: string;
  }): Observable<TransfertStock> {
    return this.http.post<TransfertStock>(`${this.apiUrl}/${id}/recevoir`, data || {});
  }

  annuler(id: number, raison?: string): Observable<TransfertStock> {
    return this.http.post<TransfertStock>(`${this.apiUrl}/${id}/annuler`, { raison });
  }

  ajouterLigne(transfertId: number, ligne: {
    produitId: number;
    quantiteDemandee: number;
  }): Observable<TransfertStock> {
    return this.http.post<TransfertStock>(`${this.apiUrl}/${transfertId}/lignes`, ligne);
  }

  modifierLigne(transfertId: number, ligneId: number, data: {
    quantiteDemandee?: number;
  }): Observable<TransfertStock> {
    return this.http.patch<TransfertStock>(`${this.apiUrl}/${transfertId}/lignes/${ligneId}`, data);
  }

  supprimerLigne(transfertId: number, ligneId: number): Observable<TransfertStock> {
    return this.http.delete<TransfertStock>(`${this.apiUrl}/${transfertId}/lignes/${ligneId}`);
  }

  getPendingForEntrepot(entrepotId: number, type: 'source' | 'destination' = 'destination'): Observable<TransfertStock[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pending/${entrepotId}`, {
      params: { type }
    }).pipe(
      map(response => Array.isArray(response) ? response.map(t => this.mapTransfert(t)) : [])
    );
  }

  getEnTransit(): Observable<TransfertStock[]> {
    return this.http.get<any[]>(`${this.apiUrl}/en-transit`).pipe(
      map(response => Array.isArray(response) ? response.map(t => this.mapTransfert(t)) : [])
    );
  }

  getRecent(limit: number = 10): Observable<TransfertStock[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recent`, {
      params: { limit: limit.toString() }
    }).pipe(
      map(response => Array.isArray(response) ? response.map(t => this.mapTransfert(t)) : [])
    );
  }

  getStatistiques(params?: {
    dateDebut?: string;
    dateFin?: string;
    entrepotId?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    if (params?.entrepotId) httpParams = httpParams.set('entrepotId', params.entrepotId.toString());
    
    return this.http.get<any>(`${this.apiUrl}/statistiques`, { params: httpParams });
  }

  export(format: 'csv' | 'excel' | 'pdf' = 'excel', params?: {
    dateDebut?: string;
    dateFin?: string;
    statut?: StatutTransfert;
  }): Observable<Blob> {
    let httpParams = new HttpParams().set('format', format);
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    if (params?.statut) httpParams = httpParams.set('statut', params.statut);
    
    return this.http.get(`${this.apiUrl}/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  genererDocument(transfertId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${transfertId}/document`, {
      responseType: 'blob'
    });
  }
}
