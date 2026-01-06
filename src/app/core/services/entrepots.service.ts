import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Entrepot, CreateEntrepotRequest, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EntrepotsService {
  private readonly apiUrl = `${environment.apiUrl}/entrepots`;

  constructor(private http: HttpClient) {}

  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    estActif?: boolean;
  }): Observable<PaginatedResponse<Entrepot>> {
    let httpParams = new HttpParams();
    
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.estActif !== undefined) httpParams = httpParams.set('estActif', params.estActif.toString());

    return this.http.get<any>(this.apiUrl, { params: httpParams }).pipe(
      map(response => {
        // Handle array response
        if (Array.isArray(response)) {
          return {
            data: response,
            meta: { total: response.length, page: 1, limit: response.length || 20, totalPages: 1 }
          };
        }
        // Handle { data, total, page, limit, totalPages } format from backend
        if (response.data && response.total !== undefined) {
          return {
            data: response.data,
            meta: {
              total: response.total,
              page: response.page || 1,
              limit: response.limit || 20,
              totalPages: response.totalPages || 1
            }
          };
        }
        // Handle { data, meta } format
        if (response.data && response.meta) {
          return response;
        }
        return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
      })
    );
  }

  getAllActive(): Observable<Entrepot[]> {
    return this.http.get<any>(`${this.apiUrl}/actifs`).pipe(
      map(response => Array.isArray(response) ? response : response.data || [])
    );
  }

  getById(id: number): Observable<Entrepot> {
    return this.http.get<Entrepot>(`${this.apiUrl}/${id}`);
  }

  create(entrepot: CreateEntrepotRequest): Observable<Entrepot> {
    return this.http.post<Entrepot>(this.apiUrl, entrepot);
  }

  update(id: number, entrepot: Partial<CreateEntrepotRequest>): Observable<Entrepot> {
    return this.http.patch<Entrepot>(`${this.apiUrl}/${id}`, entrepot);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getInventaire(entrepotId: number, params?: {
    page?: number;
    limit?: number;
    search?: string;
    categorieId?: number;
    stockFaible?: boolean;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.categorieId) httpParams = httpParams.set('categorieId', params.categorieId.toString());
    if (params?.stockFaible) httpParams = httpParams.set('stockFaible', params.stockFaible.toString());
    
    return this.http.get<any>(`${this.apiUrl}/${entrepotId}/inventaire`, { params: httpParams });
  }

  getMouvements(entrepotId: number, params?: {
    page?: number;
    limit?: number;
    dateDebut?: string;
    dateFin?: string;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    
    return this.http.get<any>(`${this.apiUrl}/${entrepotId}/mouvements`, { params: httpParams });
  }

  getStatistiques(entrepotId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${entrepotId}/statistiques`);
  }

  getStockFaible(entrepotId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${entrepotId}/stock-faible`);
  }

  getTransfertsPending(entrepotId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${entrepotId}/transferts-pending`);
  }

  getCommandes(entrepotId: number, params?: {
    page?: number;
    limit?: number;
    statut?: string;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.statut) httpParams = httpParams.set('statut', params.statut);
    
    return this.http.get<any>(`${this.apiUrl}/${entrepotId}/commandes`, { params: httpParams });
  }

  getUtilisationCapacite(entrepotId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${entrepotId}/capacite`);
  }

  assignerResponsable(entrepotId: number, utilisateurId: number): Observable<Entrepot> {
    return this.http.patch<Entrepot>(`${this.apiUrl}/${entrepotId}/responsable`, { 
      responsableId: utilisateurId 
    });
  }

  getGlobalStatistiques(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistiques`);
  }

  comparer(entrepotIds: number[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/comparer`, { entrepotIds });
  }
}
