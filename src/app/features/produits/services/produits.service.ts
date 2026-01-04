/**
 * Service de gestion des produits
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Produit {
  id: string;
  reference: string;
  nom: string;
  description?: string;
  categorieId: string;
  categorie?: { id: string; nom: string; couleur?: string };
  prixAchat: number;
  prixVente: number;
  tva: number;
  quantiteStock: number;
  seuilAlerte: number;
  seuilCritique: number;
  unite: string;
  emplacement?: string;
  codeBarres?: string;
  image?: string;
  actif: boolean;
  fournisseurPrincipalId?: string;
  fournisseurPrincipal?: { id: string; nom: string };
  entrepotId?: string;
  entrepot?: { id: string; nom: string };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProduitFilters {
  search?: string;
  categorieId?: string;
  fournisseurId?: string;
  stockFaible?: boolean;
  stockCritique?: boolean;
  actif?: boolean;
  entrepotId?: string;
}

export interface CreateProduitDto {
  reference: string;
  nom: string;
  description?: string;
  categorieId: string;
  prixAchat: number;
  prixVente: number;
  tva?: number;
  quantiteStock?: number;
  seuilAlerte: number;
  seuilCritique?: number;
  unite?: string;
  emplacement?: string;
  codeBarres?: string;
  fournisseurPrincipalId?: string;
  actif?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface StockMovementDto {
  type: 'ENTREE' | 'SORTIE' | 'AJUSTEMENT_POSITIF' | 'AJUSTEMENT_NEGATIF';
  quantite: number;
  motif: string;
  reference?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProduitsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/produits`;

  /**
   * Récupère la liste des produits paginée
   */
  getAll(
    page = 1,
    limit = 20,
    filters?: ProduitFilters,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Observable<PaginatedResponse<Produit>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    if (sortBy) {
      params = params.set('sortBy', sortBy).set('sortOrder', sortOrder);
    }

    return this.http.get<PaginatedResponse<Produit>>(this.apiUrl, { params });
  }

  /**
   * Récupère un produit par ID
   */
  getById(id: string): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée un nouveau produit
   */
  create(data: CreateProduitDto): Observable<Produit> {
    return this.http.post<Produit>(this.apiUrl, data);
  }

  /**
   * Met à jour un produit
   */
  update(id: string, data: Partial<CreateProduitDto>): Observable<Produit> {
    return this.http.patch<Produit>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Supprime un produit
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupère les produits en stock faible
   */
  getStockFaible(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/stock-faible`);
  }

  /**
   * Récupère les produits en stock critique
   */
  getStockCritique(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/stock-critique`);
  }

  /**
   * Effectue un mouvement de stock
   */
  mouvementStock(id: string, data: StockMovementDto): Observable<Produit> {
    return this.http.post<Produit>(`${this.apiUrl}/${id}/mouvement`, data);
  }

  /**
   * Historique des mouvements d'un produit
   */
  getHistoriqueMouvements(id: string, page = 1, limit = 20): Observable<PaginatedResponse<any>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<PaginatedResponse<any>>(`${this.apiUrl}/${id}/mouvements`, { params });
  }

  /**
   * Recherche autocomplete
   */
  search(query: string, limit = 10): Observable<Produit[]> {
    const params = new HttpParams().set('search', query).set('limit', limit.toString());
    return this.http.get<Produit[]>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Statistiques des produits
   */
  getStats(): Observable<{
    totalProduits: number;
    produitsActifs: number;
    stockFaible: number;
    stockCritique: number;
    valeurStock: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  /**
   * Export (PREMIUM feature)
   */
  export(format: 'csv' | 'excel' | 'pdf', filters?: ProduitFilters): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params = params.set(key, value.toString());
      });
    }
    return this.http.get(`${this.apiUrl}/export`, { params, responseType: 'blob' });
  }

  /**
   * Upload image
   */
  uploadImage(id: string, file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/${id}/image`, formData);
  }

  /**
   * Génère un code-barres
   */
  generateBarcode(): Observable<{ barcode: string }> {
    return this.http.get<{ barcode: string }>(`${this.apiUrl}/generate-barcode`);
  }

  /**
   * Vérifie unicité référence
   */
  checkReference(reference: string, excludeId?: string): Observable<{ exists: boolean }> {
    let params = new HttpParams().set('reference', reference);
    if (excludeId) params = params.set('excludeId', excludeId);
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-reference`, { params });
  }
}
