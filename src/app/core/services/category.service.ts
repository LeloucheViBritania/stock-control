import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Categorie {
  id: number;
  nom: string;
  description?: string;
  categorieParenteId?: number | null;
  categorieParente?: Categorie | null;
  sousCategories?: Categorie[];
  dateCreation?: Date;
  _count?: {
    produits: number;
    sousCategories?: number;
  };
}

export interface CreateCategoryDto {
  nom: string;
  description?: string;
  categorieParenteId?: number | null;
}

export interface UpdateCategoryDto {
  nom?: string;
  description?: string;
  categorieParenteId?: number | null;
}

export interface CategorieStatistiques {
  totalCategories: number;
  categoriesRacines: number;
  categoriesAvecProduits: number;
  categoriesVides: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  /**
   * Liste toutes les catégories (structure plate)
   * GET /api/categories
   */
  findAll(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.apiUrl);
  }

  /**
   * Récupère l'arbre hiérarchique des catégories
   * GET /api/categories/tree
   */
  findTree(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.apiUrl}/tree`);
  }

  /**
   * Obtient les statistiques des catégories
   * GET /api/categories/statistiques
   */
  getStatistiques(): Observable<CategorieStatistiques> {
    return this.http.get<CategorieStatistiques>(`${this.apiUrl}/statistiques`);
  }

  /**
   * Obtient les détails d'une catégorie
   * GET /api/categories/:id
   */
  findOne(id: number): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée une nouvelle catégorie
   * POST /api/categories
   */
  create(data: CreateCategoryDto): Observable<Categorie> {
    return this.http.post<Categorie>(this.apiUrl, data);
  }

  /**
   * Met à jour une catégorie
   * PATCH /api/categories/:id
   */
  update(id: number, data: UpdateCategoryDto): Observable<Categorie> {
    return this.http.patch<Categorie>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Supprime une catégorie
   * DELETE /api/categories/:id
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
