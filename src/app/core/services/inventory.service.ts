import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Categorie {
  id: number;
  nom: string;
  parentId?: number;
}

export interface AjustementStock {
  entrepotId: number;
  raison: 'INVENTAIRE_PHYSIQUE' | 'DOMMAGE' | 'PERTE' | 'AUTRE';
  lignes: { produitId: number; quantiteAjustee: number }[];
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // --- CATÉGORIES ---
  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.apiUrl}/categories`);
  }

  createCategory(data: Partial<Categorie>): Observable<Categorie> {
    return this.http.post<Categorie>(`${this.apiUrl}/categories`, data);
  }

  // --- INVENTAIRE (Premium - Stock par Entrepôt) ---
  getStockByWarehouse(entrepotId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inventaire/entrepot/${entrepotId}`);
  }

  checkStockAvailability(produitId: number, quantite: number, entrepotId?: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/inventaire/verifier`, { produitId, quantite, entrepotId });
  }

  // --- AJUSTEMENTS (Correction manuelle de stock) ---
  createAdjustment(data: AjustementStock): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ajustements-stock`, data);
  }
  
  validateAdjustment(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/ajustements-stock/${id}/valider`, {});
  }
}