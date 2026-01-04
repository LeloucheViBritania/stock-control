/**
 * Service de gestion des mouvements de stock
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { TypeMouvement } from '@enums/type-mouvement.enum';

export interface MouvementStock {
  id: string;
  type: TypeMouvement;
  produitId: string;
  produit?: {
    id: string;
    nom: string;
    reference: string;
    unite: string;
  };
  quantite: number;
  quantiteAvant: number;
  quantiteApres: number;
  prixUnitaire?: number;
  valeurMouvement?: number;
  entrepotSourceId?: string;
  entrepotSource?: { id: string; nom: string };
  entrepotDestinationId?: string;
  entrepotDestination?: { id: string; nom: string };
  reference?: string;
  motif: string;
  notes?: string;
  commandeId?: string;
  commande?: { id: string; numero: string };
  transfertId?: string;
  inventaireId?: string;
  createdBy?: { id: string; nom: string; prenom: string };
  createdAt: Date;
}

export interface CreateMouvementDto {
  type: TypeMouvement;
  produitId: string;
  quantite: number;
  prixUnitaire?: number;
  entrepotId?: string;
  reference?: string;
  motif: string;
  notes?: string;
}

export interface MouvementFilters {
  search?: string;
  produitId?: string;
  type?: TypeMouvement;
  entrepotId?: string;
  dateDebut?: string;
  dateFin?: string;
  userId?: string;
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

@Injectable({
  providedIn: 'root',
})
export class MouvementsStockService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/mouvements-stock`;

  /**
   * Récupère la liste des mouvements paginée
   */
  getAll(
    page = 1,
    limit = 20,
    filters?: MouvementFilters,
    sortBy = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Observable<PaginatedResponse<MouvementStock>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<MouvementStock>>(this.apiUrl, { params });
  }

  /**
   * Récupère un mouvement par ID
   */
  getById(id: string): Observable<MouvementStock> {
    return this.http.get<MouvementStock>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée un mouvement d'entrée
   */
  creerEntree(data: {
    produitId: string;
    quantite: number;
    prixUnitaire?: number;
    reference?: string;
    motif: string;
    notes?: string;
  }): Observable<MouvementStock> {
    return this.http.post<MouvementStock>(`${this.apiUrl}/entree`, data);
  }

  /**
   * Crée un mouvement de sortie
   */
  creerSortie(data: {
    produitId: string;
    quantite: number;
    reference?: string;
    motif: string;
    notes?: string;
  }): Observable<MouvementStock> {
    return this.http.post<MouvementStock>(`${this.apiUrl}/sortie`, data);
  }

  /**
   * Crée un ajustement de stock
   */
  creerAjustement(data: {
    produitId: string;
    nouvelleQuantite: number;
    motif: string;
    notes?: string;
  }): Observable<MouvementStock> {
    return this.http.post<MouvementStock>(`${this.apiUrl}/ajustement`, data);
  }

  /**
   * Mouvement de masse (plusieurs produits)
   */
  creerMouvementMasse(data: {
    type: 'ENTREE' | 'SORTIE';
    mouvements: {
      produitId: string;
      quantite: number;
      prixUnitaire?: number;
    }[];
    reference?: string;
    motif: string;
  }): Observable<MouvementStock[]> {
    return this.http.post<MouvementStock[]>(`${this.apiUrl}/masse`, data);
  }

  /**
   * Mouvements récents
   */
  getRecents(limit = 10): Observable<MouvementStock[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<MouvementStock[]>(`${this.apiUrl}/recents`, { params });
  }

  /**
   * Mouvements d'un produit
   */
  getByProduit(produitId: string, page = 1, limit = 20): Observable<PaginatedResponse<MouvementStock>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<PaginatedResponse<MouvementStock>>(`${this.apiUrl}/produit/${produitId}`, { params });
  }

  /**
   * Statistiques des mouvements
   */
  getStats(periode?: 'jour' | 'semaine' | 'mois' | 'annee'): Observable<{
    totalMouvements: number;
    entrees: number;
    sorties: number;
    ajustements: number;
    valeurEntrees: number;
    valeurSorties: number;
    mouvementsParType: { type: TypeMouvement; count: number; valeur: number }[];
    evolutionJour: { date: string; entrees: number; sorties: number }[];
  }> {
    let params = new HttpParams();
    if (periode) params = params.set('periode', periode);
    return this.http.get<any>(`${this.apiUrl}/stats`, { params });
  }

  /**
   * Export des mouvements (PREMIUM)
   */
  export(format: 'csv' | 'excel' | 'pdf', filters?: MouvementFilters): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params = params.set(key, value.toString());
      });
    }
    return this.http.get(`${this.apiUrl}/export`, { params, responseType: 'blob' });
  }

  /**
   * Annule un mouvement (crée un mouvement inverse)
   */
  annuler(id: string, motif: string): Observable<MouvementStock> {
    return this.http.post<MouvementStock>(`${this.apiUrl}/${id}/annuler`, { motif });
  }

  /**
   * Motifs prédéfinis
   */
  getMotifsPredefinits(): Observable<{ type: TypeMouvement; motifs: string[] }[]> {
    return this.http.get<any[]>(`${this.apiUrl}/motifs`);
  }
}
