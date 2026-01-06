import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Fournisseur, CreateFournisseurRequest, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class FournisseursService {
  private readonly apiUrl = `${environment.apiUrl}/fournisseurs`;

  constructor(private http: HttpClient) {}

  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    estActif?: boolean;
  }): Observable<PaginatedResponse<Fournisseur>> {
    let httpParams = new HttpParams();
    
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.estActif !== undefined) httpParams = httpParams.set('estActif', params.estActif.toString());

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

  getById(id: number): Observable<Fournisseur> {
    return this.http.get<Fournisseur>(`${this.apiUrl}/${id}`);
  }

  getProduits(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/produits`);
  }

  getCommandes(id: number, params?: { page?: number; limit?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    
    return this.http.get<any>(`${this.apiUrl}/${id}/commandes`, { params: httpParams });
  }

  getStatistiques(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/statistiques`);
  }

  create(fournisseur: CreateFournisseurRequest): Observable<Fournisseur> {
    return this.http.post<Fournisseur>(this.apiUrl, fournisseur);
  }

  update(id: number, fournisseur: Partial<CreateFournisseurRequest>): Observable<Fournisseur> {
    return this.http.patch<Fournisseur>(`${this.apiUrl}/${id}`, fournisseur);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  export(format: 'excel' | 'csv' | 'pdf' = 'excel'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, {
      params: { format },
      responseType: 'blob'
    });
  }

  import(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/import`, formData);
  }

  evaluerPerformance(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/performance`);
  }
}
