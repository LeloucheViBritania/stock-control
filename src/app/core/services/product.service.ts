import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Produit } from '../../../shared/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/produits`;

  constructor(private http: HttpClient) {}

  // Récupérer tous les produits (avec pagination et filtres)
  getAll(page: number = 1, limit: number = 10, search?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search) params = params.set('search', search);

    return this.http.get<any>(this.apiUrl, { params });
  }

  getOne(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/${id}`);
  }

  create(produit: Partial<Produit>): Observable<Produit> {
    return this.http.post<Produit>(this.apiUrl, produit);
  }

  update(id: number, produit: Partial<Produit>): Observable<Produit> {
    return this.http.patch<Produit>(`${this.apiUrl}/${id}`, produit);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}