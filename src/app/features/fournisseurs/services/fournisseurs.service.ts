/**
 * Service de gestion des fournisseurs
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Fournisseur {
  id: string;
  code: string;
  nom: string;
  email?: string;
  telephone: string;
  telephoneSecondaire?: string;
  fax?: string;
  siteWeb?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  pays: string;
  siren?: string;
  tvaIntracommunautaire?: string;
  contactNom?: string;
  contactEmail?: string;
  contactTelephone?: string;
  contactPoste?: string;
  delaiLivraison: number; // en jours
  conditionsPaiement?: string;
  notes?: string;
  evaluation: number; // 1-5
  nombreCommandes: number;
  totalAchats: number;
  actif: boolean;
  certifications?: string[];
  produits?: { id: string; nom: string; reference?: string; prixAchat: number }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFournisseurDto {
  nom: string;
  email?: string;
  telephone: string;
  telephoneSecondaire?: string;
  fax?: string;
  siteWeb?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  siren?: string;
  tvaIntracommunautaire?: string;
  contactNom?: string;
  contactEmail?: string;
  contactTelephone?: string;
  contactPoste?: string;
  delaiLivraison?: number;
  conditionsPaiement?: string;
  notes?: string;
}

export interface FournisseurFilters {
  search?: string;
  ville?: string;
  pays?: string;
  evaluationMin?: number;
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

export interface CommandeAchat {
  id: string;
  numero: string;
  fournisseurId: string;
  statut: 'BROUILLON' | 'ENVOYEE' | 'CONFIRMEE' | 'RECUE' | 'ANNULEE';
  dateCommande: Date;
  dateLivraisonPrevue?: Date;
  dateLivraisonReelle?: Date;
  montantHT: number;
  montantTTC: number;
  lignes: {
    produitId: string;
    produit: { nom: string; reference: string };
    quantite: number;
    prixUnitaire: number;
    quantiteRecue: number;
  }[];
  notes?: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class FournisseursService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/fournisseurs`;

  /**
   * Récupère la liste des fournisseurs paginée
   */
  getAll(
    page = 1,
    limit = 20,
    filters?: FournisseurFilters,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Observable<PaginatedResponse<Fournisseur>> {
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

    return this.http.get<PaginatedResponse<Fournisseur>>(this.apiUrl, { params });
  }

  /**
   * Récupère tous les fournisseurs (pour select)
   */
  getAllSimple(): Observable<Fournisseur[]> {
    return this.http.get<Fournisseur[]>(`${this.apiUrl}/all`);
  }

  /**
   * Récupère un fournisseur par ID
   */
  getById(id: string): Observable<Fournisseur> {
    return this.http.get<Fournisseur>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée un fournisseur
   */
  create(data: CreateFournisseurDto): Observable<Fournisseur> {
    return this.http.post<Fournisseur>(this.apiUrl, data);
  }

  /**
   * Met à jour un fournisseur
   */
  update(id: string, data: Partial<CreateFournisseurDto>): Observable<Fournisseur> {
    return this.http.patch<Fournisseur>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Supprime un fournisseur
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Recherche autocomplete
   */
  search(query: string, limit = 10): Observable<Fournisseur[]> {
    const params = new HttpParams().set('search', query).set('limit', limit.toString());
    return this.http.get<Fournisseur[]>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Catalogue produits d'un fournisseur
   */
  getProduits(id: string): Observable<{ id: string; nom: string; reference: string; prixAchat: number }[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/produits`);
  }

  /**
   * Associe des produits à un fournisseur
   */
  associerProduits(id: string, produitIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/produits`, { produitIds });
  }

  /**
   * Historique des commandes d'achat
   */
  getCommandes(id: string, page = 1, limit = 20): Observable<PaginatedResponse<CommandeAchat>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<PaginatedResponse<CommandeAchat>>(`${this.apiUrl}/${id}/commandes`, { params });
  }

  /**
   * Évalue un fournisseur
   */
  evaluer(id: string, evaluation: { note: number; commentaire?: string }): Observable<Fournisseur> {
    return this.http.post<Fournisseur>(`${this.apiUrl}/${id}/evaluation`, evaluation);
  }

  /**
   * Statistiques d'un fournisseur
   */
  getStats(id: string): Observable<{
    totalCommandes: number;
    totalAchats: number;
    delaiMoyenLivraison: number;
    tauxConformite: number;
    derniereCommande?: Date;
  }> {
    return this.http.get<any>(`${this.apiUrl}/${id}/stats`);
  }

  /**
   * Comparaison de fournisseurs (PREMIUM feature visible)
   */
  comparer(ids: string[]): Observable<{
    fournisseur: Fournisseur;
    stats: {
      delaiMoyen: number;
      prixMoyen: number;
      tauxConformite: number;
      evaluation: number;
    };
  }[]> {
    const params = new HttpParams().set('ids', ids.join(','));
    return this.http.get<any[]>(`${this.apiUrl}/comparer`, { params });
  }

  /**
   * Statistiques globales
   */
  getGlobalStats(): Observable<{
    totalFournisseurs: number;
    fournisseursActifs: number;
    evaluationMoyenne: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  /**
   * Export (PREMIUM)
   */
  export(format: 'csv' | 'excel'): Observable<Blob> {
    const params = new HttpParams().set('format', format);
    return this.http.get(`${this.apiUrl}/export`, { params, responseType: 'blob' });
  }
}
