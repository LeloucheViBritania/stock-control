import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { 
  Inventaire, 
  CreateInventaireRequest, 
  AjusterQuantiteRequest,
  ReserverStockRequest,
  PaginatedResponse 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class InventaireService {
  private readonly apiUrl = `${environment.apiUrl}/inventaire`;

  constructor(private http: HttpClient) {}

  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    entrepotId?: number;
    produitId?: number;
    categorieId?: number;
    stockFaible?: boolean;
  }): Observable<PaginatedResponse<Inventaire>> {
    let httpParams = new HttpParams();
    
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.entrepotId) httpParams = httpParams.set('entrepotId', params.entrepotId.toString());
    if (params?.produitId) httpParams = httpParams.set('produitId', params.produitId.toString());
    if (params?.categorieId) httpParams = httpParams.set('categorieId', params.categorieId.toString());
    if (params?.stockFaible) httpParams = httpParams.set('stockFaible', params.stockFaible.toString());

    return this.http.get<any>(this.apiUrl, { params: httpParams }).pipe(
      map(response => {
        // Backend returns array directly from findAll()
        if (Array.isArray(response)) {
          return {
            data: response,
            meta: { total: response.length, page: 1, limit: response.length || 20, totalPages: 1 }
          };
        }
        // Handle paginated response
        if (response.data) {
          return {
            data: response.data,
            meta: response.meta || { total: response.data.length, page: 1, limit: 20, totalPages: 1 }
          };
        }
        return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
      })
    );
  }

  getById(id: number): Observable<Inventaire> {
    return this.http.get<Inventaire>(`${this.apiUrl}/${id}`);
  }

  getByProduit(produitId: number): Observable<Inventaire[]> {
    return this.http.get<any>(`${this.apiUrl}/produit/${produitId}`).pipe(
      map(response => Array.isArray(response) ? response : response.data || [])
    );
  }

  getByEntrepot(entrepotId: number, params?: {
    page?: number;
    limit?: number;
    search?: string;
    stockFaible?: boolean;
  }): Observable<PaginatedResponse<Inventaire>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.stockFaible) httpParams = httpParams.set('stockFaible', params.stockFaible.toString());
    
    return this.http.get<any>(
      `${this.apiUrl}/entrepot/${entrepotId}`, 
      { params: httpParams }
    ).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return {
            data: response,
            meta: { total: response.length, page: 1, limit: response.length || 20, totalPages: 1 }
          };
        }
        if (response.data) {
          return {
            data: response.data,
            meta: response.meta || { total: response.data.length, page: 1, limit: 20, totalPages: 1 }
          };
        }
        return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
      })
    );
  }

  create(inventaire: CreateInventaireRequest): Observable<Inventaire> {
    return this.http.post<Inventaire>(this.apiUrl, inventaire);
  }

  update(id: number, data: Partial<CreateInventaireRequest>): Observable<Inventaire> {
    return this.http.patch<Inventaire>(`${this.apiUrl}/${id}`, data);
  }

  ajusterQuantite(id: number, data: AjusterQuantiteRequest): Observable<Inventaire> {
    return this.http.post<Inventaire>(`${this.apiUrl}/${id}/ajuster`, data);
  }

  reserverStock(id: number, data: ReserverStockRequest): Observable<Inventaire> {
    return this.http.post<Inventaire>(`${this.apiUrl}/${id}/reserver`, data);
  }

  libererReservation(id: number, quantite: number): Observable<Inventaire> {
    return this.http.post<Inventaire>(`${this.apiUrl}/${id}/liberer`, { quantite });
  }

  getStockFaible(entrepotId?: number): Observable<Inventaire[]> {
    let params = new HttpParams();
    if (entrepotId) params = params.set('entrepotId', entrepotId.toString());
    
    return this.http.get<any>(`${this.apiUrl}/stock-faible`, { params }).pipe(
      map(response => Array.isArray(response) ? response : response.data || [])
    );
  }

  getACommander(entrepotId?: number): Observable<Inventaire[]> {
    let params = new HttpParams();
    if (entrepotId) params = params.set('entrepotId', entrepotId.toString());
    
    return this.http.get<any>(`${this.apiUrl}/a-commander`, { params }).pipe(
      map(response => Array.isArray(response) ? response : response.data || [])
    );
  }

  getValeur(entrepotId?: number): Observable<any> {
    let params = new HttpParams();
    if (entrepotId) params = params.set('entrepotId', entrepotId.toString());
    
    return this.http.get<any>(`${this.apiUrl}/valeur`, { params });
  }

  getStatistiques(entrepotId?: number): Observable<any> {
    let params = new HttpParams();
    if (entrepotId) params = params.set('entrepotId', entrepotId.toString());
    
    return this.http.get<any>(`${this.apiUrl}/statistiques`, { params });
  }

  updateEmplacement(id: number, emplacement: string): Observable<Inventaire> {
    return this.http.patch<Inventaire>(`${this.apiUrl}/${id}/emplacement`, { emplacement });
  }

  export(format: 'csv' | 'excel' = 'excel', entrepotId?: number): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (entrepotId) params = params.set('entrepotId', entrepotId.toString());
    
    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }
}
