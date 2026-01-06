import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { MouvementStock, PaginatedResponse, TypeMouvement } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MouvementsStockService {
  private readonly apiUrl = `${environment.apiUrl}/mouvements-stock`;

  constructor(private http: HttpClient) {}

  /**
   * Get all stock movements with filters
   */
  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    produitId?: number;
    entrepotId?: number;
    typeMouvement?: TypeMouvement;
    dateDebut?: string;
    dateFin?: string;
    effectuePar?: number;
  }): Observable<PaginatedResponse<MouvementStock>> {
    let httpParams = new HttpParams();
    
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.produitId) httpParams = httpParams.set('produitId', params.produitId.toString());
    if (params?.entrepotId) httpParams = httpParams.set('entrepotId', params.entrepotId.toString());
    if (params?.typeMouvement) httpParams = httpParams.set('typeMouvement', params.typeMouvement);
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    if (params?.effectuePar) httpParams = httpParams.set('effectuePar', params.effectuePar.toString());

    return this.http.get<PaginatedResponse<MouvementStock>>(this.apiUrl, { params: httpParams });
  }

  /**
   * Get movement by ID
   */
  getById(id: number): Observable<MouvementStock> {
    return this.http.get<MouvementStock>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get movements for a product
   */
  getByProduit(produitId: number, params?: {
    page?: number;
    limit?: number;
    dateDebut?: string;
    dateFin?: string;
  }): Observable<PaginatedResponse<MouvementStock>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    
    return this.http.get<PaginatedResponse<MouvementStock>>(
      `${this.apiUrl}/produit/${produitId}`, 
      { params: httpParams }
    );
  }

  /**
   * Get movements for a warehouse
   */
  getByEntrepot(entrepotId: number, params?: {
    page?: number;
    limit?: number;
    dateDebut?: string;
    dateFin?: string;
  }): Observable<PaginatedResponse<MouvementStock>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    
    return this.http.get<PaginatedResponse<MouvementStock>>(
      `${this.apiUrl}/entrepot/${entrepotId}`, 
      { params: httpParams }
    );
  }

  /**
   * Get movements by type
   */
  getByType(type: TypeMouvement, params?: {
    page?: number;
    limit?: number;
    dateDebut?: string;
    dateFin?: string;
  }): Observable<PaginatedResponse<MouvementStock>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    
    return this.http.get<PaginatedResponse<MouvementStock>>(
      `${this.apiUrl}/type/${type}`, 
      { params: httpParams }
    );
  }

  /**
   * Get recent movements
   */
  getRecent(limit: number = 20): Observable<MouvementStock[]> {
    return this.http.get<MouvementStock[]>(`${this.apiUrl}/recent`, {
      params: { limit: limit.toString() }
    });
  }

  /**
   * Get statistics
   */
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

  /**
   * Get movements grouped by type
   */
  getParType(params?: {
    dateDebut?: string;
    dateFin?: string;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    
    return this.http.get<any>(`${this.apiUrl}/par-type`, { params: httpParams });
  }

  /**
   * Export movements
   */
  export(format: 'csv' | 'excel' = 'excel', params?: {
    dateDebut?: string;
    dateFin?: string;
    produitId?: number;
    entrepotId?: number;
    typeMouvement?: TypeMouvement;
  }): Observable<Blob> {
    let httpParams = new HttpParams().set('format', format);
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    if (params?.produitId) httpParams = httpParams.set('produitId', params.produitId.toString());
    if (params?.entrepotId) httpParams = httpParams.set('entrepotId', params.entrepotId.toString());
    if (params?.typeMouvement) httpParams = httpParams.set('typeMouvement', params.typeMouvement);
    
    return this.http.get(`${this.apiUrl}/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }
}
