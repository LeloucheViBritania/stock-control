import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Categorie, CreateCategorieRequest, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private readonly apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    estActif?: boolean;
    parentId?: number;
  }): Observable<PaginatedResponse<Categorie>> {
    let httpParams = new HttpParams();
    
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.estActif !== undefined) httpParams = httpParams.set('estActif', params.estActif.toString());
    if (params?.parentId) httpParams = httpParams.set('parentId', params.parentId.toString());

    return this.http.get<any>(this.apiUrl, { params: httpParams }).pipe(
      map(response => {
        // Backend returns array directly from findAll()
        if (Array.isArray(response)) {
          return {
            data: response.map(c => this.mapCategorie(c)),
            meta: { total: response.length, page: 1, limit: response.length || 100, totalPages: 1 }
          };
        }
        // Handle paginated response
        if (response.data) {
          return {
            data: response.data.map((c: any) => this.mapCategorie(c)),
            meta: response.meta || { total: response.data.length, page: 1, limit: 100, totalPages: 1 }
          };
        }
        return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
      })
    );
  }

  private mapCategorie(c: any): Categorie {
    return {
      ...c,
      parent: c.categorieParente || c.parent,
      _count: c._count || { produits: 0 }
    };
  }

  getTree(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.apiUrl}/tree`);
  }

  getRootCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.apiUrl}/root`);
  }

  getById(id: number): Observable<Categorie> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(c => this.mapCategorie(c))
    );
  }

  getSousCategories(id: number): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.apiUrl}/${id}/sous-categories`);
  }

  getProduits(id: number, params?: { page?: number; limit?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    
    return this.http.get<any>(`${this.apiUrl}/${id}/produits`, { params: httpParams });
  }

  create(categorie: CreateCategorieRequest): Observable<Categorie> {
    return this.http.post<Categorie>(this.apiUrl, categorie);
  }

  update(id: number, categorie: Partial<CreateCategorieRequest>): Observable<Categorie> {
    return this.http.patch<Categorie>(`${this.apiUrl}/${id}`, categorie);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getStatistiques(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistiques`);
  }

  moveToParent(id: number, newParentId: number | null): Observable<Categorie> {
    return this.http.patch<Categorie>(`${this.apiUrl}/${id}/move`, { 
      categorieParenteId: newParentId 
    });
  }
}
