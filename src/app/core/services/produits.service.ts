import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { 
  Produit, 
  CreateProduitRequest, 
  AjusterStockRequest,
  PaginatedResponse,
  ProduitFournisseur
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProduitsService {
  private readonly apiUrl = `${environment.apiUrl}/produits`;

  constructor(private http: HttpClient) {}

  /**
   * Get all products with filters and pagination
   */
  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categorieId?: number;
    estActif?: boolean;
  }): Observable<PaginatedResponse<Produit>> {
    let httpParams = new HttpParams();
    
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.categorieId) httpParams = httpParams.set('categorieId', params.categorieId.toString());
    if (params?.estActif !== undefined) httpParams = httpParams.set('estActif', params.estActif.toString());

    return this.http.get<PaginatedResponse<Produit>>(this.apiUrl, { params: httpParams });
  }

  /**
   * Get product by ID
   */
  getById(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new product
   */
  create(produit: CreateProduitRequest): Observable<Produit> {
    return this.http.post<Produit>(this.apiUrl, produit);
  }

  /**
   * Update product
   */
  update(id: number, produit: Partial<CreateProduitRequest>): Observable<Produit> {
    return this.http.patch<Produit>(`${this.apiUrl}/${id}`, produit);
  }

  /**
   * Delete (deactivate) product
   */
  delete(id: number): Observable<Produit> {
    return this.http.delete<Produit>(`${this.apiUrl}/${id}`);
  }

  /**
   * Adjust product stock
   */
  ajusterStock(id: number, data: AjusterStockRequest): Observable<Produit> {
    return this.http.post<Produit>(`${this.apiUrl}/${id}/ajuster-stock`, data);
  }

  /**
   * Get products with low stock
   */
  getStockFaible(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/stock-faible`);
  }

  /**
   * Get product statistics
   */
  getStatistiques(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistiques`);
  }

  /**
   * Get top products
   */
  getTopProduits(limit: number = 10): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/top`, { 
      params: { limit: limit.toString() } 
    });
  }

  // ==========================================
  // FOURNISSEURS DU PRODUIT
  // ==========================================

  /**
   * Get suppliers for a product
   */
  getFournisseurs(produitId: number): Observable<ProduitFournisseur[]> {
    return this.http.get<ProduitFournisseur[]>(`${this.apiUrl}/${produitId}/fournisseurs`);
  }

  /**
   * Add supplier to product
   */
  ajouterFournisseur(produitId: number, fournisseurId: number, data: {
    referenceFournisseur?: string;
    prixUnitaire?: number;
    delaiLivraisonJours?: number;
    quantiteMinimumCommande?: number;
    estPrefere?: boolean;
  }): Observable<ProduitFournisseur> {
    return this.http.post<ProduitFournisseur>(
      `${this.apiUrl}/${produitId}/fournisseurs/${fournisseurId}`, 
      data
    );
  }

  /**
   * Update product-supplier relation
   */
  modifierFournisseur(produitId: number, fournisseurId: number, data: {
    referenceFournisseur?: string;
    prixUnitaire?: number;
    delaiLivraisonJours?: number;
    quantiteMinimumCommande?: number;
    estPrefere?: boolean;
  }): Observable<ProduitFournisseur> {
    return this.http.patch<ProduitFournisseur>(
      `${this.apiUrl}/${produitId}/fournisseurs/${fournisseurId}`, 
      data
    );
  }

  /**
   * Remove supplier from product
   */
  retirerFournisseur(produitId: number, fournisseurId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${produitId}/fournisseurs/${fournisseurId}`);
  }

  /**
   * Set preferred supplier
   */
  setFournisseurPrefere(produitId: number, fournisseurId: number): Observable<ProduitFournisseur> {
    return this.http.post<ProduitFournisseur>(
      `${this.apiUrl}/${produitId}/fournisseurs/${fournisseurId}/prefere`, 
      {}
    );
  }

  /**
   * Get preferred supplier
   */
  getFournisseurPrefere(produitId: number): Observable<ProduitFournisseur | null> {
    return this.http.get<ProduitFournisseur | null>(`${this.apiUrl}/${produitId}/fournisseur-prefere`);
  }

  /**
   * Get best price
   */
  getMeilleurPrix(produitId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${produitId}/meilleur-prix`);
  }

  // ==========================================
  // IMPORT / EXPORT
  // ==========================================

  /**
   * Export products to CSV/Excel
   */
  export(format: 'csv' | 'excel' = 'excel'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, {
      params: { format },
      responseType: 'blob'
    });
  }

  /**
   * Import products from file
   */
  import(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/import`, formData);
  }
}
