import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { 
  Client, 
  CreateClientRequest, 
  PaginatedResponse,
  StatutClient,
  SegmentClient,
  EncoursClient,
  StatistiquesClient
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  private readonly apiUrl = `${environment.apiUrl}/clients`;
  private readonly apiUrlAvance = `${environment.apiUrl}/clients-avances`;

  constructor(private http: HttpClient) {}

  // ==========================================
  // CRUD DE BASE
  // ==========================================

  /**
   * Get all clients with filters
   */
  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    estActif?: boolean;
    statut?: StatutClient;
    segment?: SegmentClient;
  }): Observable<PaginatedResponse<Client>> {
    let httpParams = new HttpParams();
    
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.estActif !== undefined) httpParams = httpParams.set('estActif', params.estActif.toString());
    if (params?.statut) httpParams = httpParams.set('statut', params.statut);
    if (params?.segment) httpParams = httpParams.set('segment', params.segment);

    return this.http.get<PaginatedResponse<Client>>(this.apiUrl, { params: httpParams });
  }

  /**
   * Get client by ID
   */
  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new client
   */
  create(client: CreateClientRequest): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  /**
   * Update client
   */
  update(id: number, client: Partial<CreateClientRequest>): Observable<Client> {
    return this.http.patch<Client>(`${this.apiUrl}/${id}`, client);
  }

  /**
   * Delete (deactivate) client
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ==========================================
  // FONCTIONNALITÉS AVANCÉES
  // ==========================================

  /**
   * Get client orders
   */
  getCommandes(clientId: number, params?: { page?: number; limit?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    
    return this.http.get<any>(`${this.apiUrl}/${clientId}/commandes`, { params: httpParams });
  }

  /**
   * Get client statistics
   */
  getStatistiques(clientId: number): Observable<StatistiquesClient> {
    return this.http.get<StatistiquesClient>(`${this.apiUrlAvance}/${clientId}/statistiques`);
  }

  /**
   * Get client encours (outstanding balance)
   */
  getEncours(clientId: number): Observable<EncoursClient> {
    return this.http.get<EncoursClient>(`${this.apiUrlAvance}/${clientId}/encours`);
  }

  /**
   * Get client history
   */
  getHistorique(clientId: number, params?: { 
    page?: number; 
    limit?: number;
    type?: string;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.type) httpParams = httpParams.set('type', params.type);
    
    return this.http.get<any>(`${this.apiUrlAvance}/${clientId}/historique`, { params: httpParams });
  }

  /**
   * Block client
   */
  bloquer(clientId: number, data: {
    raison: string;
    description: string;
    montantImpaye?: number;
  }): Observable<Client> {
    return this.http.post<Client>(`${this.apiUrlAvance}/${clientId}/bloquer`, data);
  }

  /**
   * Unblock client
   */
  debloquer(clientId: number, notes?: string): Observable<Client> {
    return this.http.post<Client>(`${this.apiUrlAvance}/${clientId}/debloquer`, { notes });
  }

  /**
   * Change client segment
   */
  changerSegment(clientId: number, segment: SegmentClient): Observable<Client> {
    return this.http.patch<Client>(`${this.apiUrlAvance}/${clientId}/segment`, { segment });
  }

  /**
   * Update credit limit
   */
  updateLimiteCredit(clientId: number, limiteCredit: number): Observable<Client> {
    return this.http.patch<Client>(`${this.apiUrlAvance}/${clientId}/limite-credit`, { limiteCredit });
  }

  /**
   * Get client notes
   */
  getNotes(clientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrlAvance}/${clientId}/notes`);
  }

  /**
   * Add note to client
   */
  addNote(clientId: number, note: {
    titre: string;
    contenu: string;
    priorite?: string;
    categorie?: string;
    dateRappel?: Date;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrlAvance}/${clientId}/notes`, note);
  }

  /**
   * Delete note
   */
  deleteNote(clientId: number, noteId: number): Observable<any> {
    return this.http.delete(`${this.apiUrlAvance}/${clientId}/notes/${noteId}`);
  }

  // ==========================================
  // STATISTIQUES GLOBALES
  // ==========================================

  /**
   * Get global statistics
   */
  getGlobalStatistiques(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistiques`);
  }

  /**
   * Get clients by segment
   */
  getBySegment(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlAvance}/par-segment`);
  }

  /**
   * Get top clients
   */
  getTopClients(limit: number = 10): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrlAvance}/top`, { 
      params: { limit: limit.toString() } 
    });
  }

  /**
   * Get clients with overdue payments
   */
  getClientsEnRetard(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrlAvance}/en-retard`);
  }

  // ==========================================
  // IMPORT / EXPORT
  // ==========================================

  /**
   * Export clients
   */
  export(format: 'csv' | 'excel' = 'excel'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, {
      params: { format },
      responseType: 'blob'
    });
  }

  /**
   * Import clients
   */
  import(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/import`, formData);
  }
}
