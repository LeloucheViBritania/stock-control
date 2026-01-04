/**
 * Service de gestion des catégories
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '@env/environment';

export interface Categorie {
  id: string;
  nom: string;
  description?: string;
  couleur: string;
  icone?: string;
  parentId?: string;
  parent?: Categorie;
  children?: Categorie[];
  nombreProduits: number;
  actif: boolean;
  ordre: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategorieDto {
  nom: string;
  description?: string;
  couleur?: string;
  icone?: string;
  parentId?: string;
  actif?: boolean;
  ordre?: number;
}

export interface CategorieTree extends Categorie {
  children: CategorieTree[];
  level: number;
}

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/categories`;

  // Cache des catégories
  private categoriesCache$ = new BehaviorSubject<Categorie[]>([]);
  readonly categories$ = this.categoriesCache$.asObservable();

  /**
   * Récupère toutes les catégories
   */
  getAll(includeInactive = false): Observable<Categorie[]> {
    const params = new HttpParams().set('includeInactive', includeInactive.toString());
    return this.http.get<Categorie[]>(this.apiUrl, { params }).pipe(
      tap(categories => this.categoriesCache$.next(categories))
    );
  }

  /**
   * Récupère l'arborescence des catégories
   */
  getTree(): Observable<CategorieTree[]> {
    return this.http.get<CategorieTree[]>(`${this.apiUrl}/tree`);
  }

  /**
   * Récupère une catégorie par ID
   */
  getById(id: string): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée une catégorie
   */
  create(data: CreateCategorieDto): Observable<Categorie> {
    return this.http.post<Categorie>(this.apiUrl, data).pipe(
      tap(() => this.refreshCache())
    );
  }

  /**
   * Met à jour une catégorie
   */
  update(id: string, data: Partial<CreateCategorieDto>): Observable<Categorie> {
    return this.http.patch<Categorie>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => this.refreshCache())
    );
  }

  /**
   * Supprime une catégorie
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshCache())
    );
  }

  /**
   * Récupère les produits d'une catégorie
   */
  getProduits(id: string, page = 1, limit = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get(`${this.apiUrl}/${id}/produits`, { params });
  }

  /**
   * Change l'ordre des catégories
   */
  reorder(ordres: { id: string; ordre: number }[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reorder`, { ordres }).pipe(
      tap(() => this.refreshCache())
    );
  }

  /**
   * Statistiques par catégorie
   */
  getStats(): Observable<{
    categorieId: string;
    nom: string;
    couleur: string;
    nombreProduits: number;
    valeurStock: number;
  }[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stats`);
  }

  /**
   * Rafraîchit le cache
   */
  private refreshCache(): void {
    this.getAll().subscribe();
  }

  /**
   * Récupère depuis le cache ou l'API
   */
  getCached(): Categorie[] {
    return this.categoriesCache$.getValue();
  }
}
