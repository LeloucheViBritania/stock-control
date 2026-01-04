/**
 * Service de gestion des clients
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Client {
  id: string;
  code: string;
  type: 'PARTICULIER' | 'ENTREPRISE';
  nom: string;
  prenom?: string;
  email?: string;
  telephone: string;
  telephoneSecondaire?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  pays: string;
  siren?: string;
  tvaIntracommunautaire?: string;
  contactNom?: string;
  contactEmail?: string;
  contactTelephone?: string;
  notes?: string;
  plafondCredit: number;
  soldeCompte: number;
  totalAchats: number;
  nombreCommandes: number;
  segment?: 'NOUVEAU' | 'REGULIER' | 'VIP' | 'INACTIF';
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientDto {
  type: 'PARTICULIER' | 'ENTREPRISE';
  nom: string;
  prenom?: string;
  email?: string;
  telephone: string;
  telephoneSecondaire?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  siren?: string;
  tvaIntracommunautaire?: string;
  contactNom?: string;
  contactEmail?: string;
  contactTelephone?: string;
  notes?: string;
  plafondCredit?: number;
}

export interface ClientFilters {
  search?: string;
  type?: 'PARTICULIER' | 'ENTREPRISE';
  segment?: string;
  ville?: string;
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

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/clients`;

  /**
   * Récupère la liste des clients paginée
   */
  getAll(
    page = 1,
    limit = 20,
    filters?: ClientFilters,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Observable<PaginatedResponse<Client>> {
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

    return this.http.get<PaginatedResponse<Client>>(this.apiUrl, { params });
  }

  /**
   * Récupère un client par ID
   */
  getById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée un client
   */
  create(data: CreateClientDto): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, data);
  }

  /**
   * Met à jour un client
   */
  update(id: string, data: Partial<CreateClientDto>): Observable<Client> {
    return this.http.patch<Client>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Supprime un client
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Recherche autocomplete
   */
  search(query: string, limit = 10): Observable<Client[]> {
    const params = new HttpParams().set('search', query).set('limit', limit.toString());
    return this.http.get<Client[]>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Historique des commandes d'un client
   */
  getCommandes(id: string, page = 1, limit = 20): Observable<PaginatedResponse<any>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<PaginatedResponse<any>>(`${this.apiUrl}/${id}/commandes`, { params });
  }

  /**
   * Statistiques d'un client
   */
  getClientStats(id: string): Observable<{
    totalAchats: number;
    nombreCommandes: number;
    panierMoyen: number;
    derniereCommande?: Date;
    produitsLesPlusAchetes: { produitId: string; nom: string; quantite: number }[];
  }> {
    return this.http.get<any>(`${this.apiUrl}/${id}/stats`);
  }

  /**
   * Segmentation des clients (aperçu gratuit, détails PREMIUM)
   */
  getSegmentation(): Observable<{
    segment: string;
    count: number;
    totalAchats: number;
  }[]> {
    return this.http.get<any[]>(`${this.apiUrl}/segmentation`);
  }

  /**
   * Statistiques globales clients
   */
  getStats(): Observable<{
    totalClients: number;
    clientsActifs: number;
    nouveauxClientsMois: number;
    clientsParType: { type: string; count: number }[];
  }> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  /**
   * Export clients (PREMIUM)
   */
  export(format: 'csv' | 'excel', filters?: ClientFilters): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params = params.set(key, value.toString());
      });
    }
    return this.http.get(`${this.apiUrl}/export`, { params, responseType: 'blob' });
  }

  /**
   * Vérifie unicité email
   */
  checkEmail(email: string, excludeId?: string): Observable<{ exists: boolean }> {
    let params = new HttpParams().set('email', email);
    if (excludeId) params = params.set('excludeId', excludeId);
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-email`, { params });
  }

  /**
   * Ajoute une note à un client
   */
  addNote(id: string, note: string): Observable<Client> {
    return this.http.post<Client>(`${this.apiUrl}/${id}/notes`, { note });
  }
}
