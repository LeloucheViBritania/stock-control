import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { 
  Commande, 
  CreateCommandeRequest, 
  PaginatedResponse,
  StatutCommande
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class CommandesService {
  private readonly apiUrl = `${environment.apiUrl}/commandes`;
  private readonly apiUrlAvance = `${environment.apiUrl}/commandes-avancees`;

  constructor(private http: HttpClient) {}

  // ==========================================
  // CRUD DE BASE
  // ==========================================

  /**
   * Get all orders with filters
   */
  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    statut?: StatutCommande;
    clientId?: number;
    entrepotId?: number;
    dateDebut?: string;
    dateFin?: string;
  }): Observable<PaginatedResponse<Commande>> {
    let httpParams = new HttpParams();
    
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.statut) httpParams = httpParams.set('statut', params.statut);
    if (params?.clientId) httpParams = httpParams.set('clientId', params.clientId.toString());
    if (params?.entrepotId) httpParams = httpParams.set('entrepotId', params.entrepotId.toString());
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);

    return this.http.get<PaginatedResponse<Commande>>(this.apiUrl, { params: httpParams });
  }

  /**
   * Get order by ID
   */
  getById(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new order
   */
  create(commande: CreateCommandeRequest): Observable<Commande> {
    return this.http.post<Commande>(this.apiUrl, commande);
  }

  /**
   * Update order
   */
  update(id: number, commande: Partial<CreateCommandeRequest>): Observable<Commande> {
    return this.http.patch<Commande>(`${this.apiUrl}/${id}`, commande);
  }

  /**
   * Delete order
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ==========================================
  // GESTION DES STATUTS
  // ==========================================

  /**
   * Change order status
   */
  changerStatut(id: number, statut: StatutCommande, notes?: string): Observable<Commande> {
    return this.http.patch<Commande>(`${this.apiUrl}/${id}/statut`, { statut, notes });
  }

  /**
   * Validate order
   */
  valider(id: number): Observable<Commande> {
    return this.http.post<Commande>(`${this.apiUrl}/${id}/valider`, {});
  }

  /**
   * Ship order
   */
  expedier(id: number, data?: { transporteur?: string; numeroSuivi?: string }): Observable<Commande> {
    return this.http.post<Commande>(`${this.apiUrl}/${id}/expedier`, data || {});
  }

  /**
   * Mark as delivered
   */
  livrer(id: number): Observable<Commande> {
    return this.http.post<Commande>(`${this.apiUrl}/${id}/livrer`, {});
  }

  /**
   * Cancel order
   */
  annuler(id: number, raison?: string): Observable<Commande> {
    return this.http.post<Commande>(`${this.apiUrl}/${id}/annuler`, { raison });
  }

  // ==========================================
  // LIGNES DE COMMANDE
  // ==========================================

  /**
   * Add line to order
   */
  ajouterLigne(commandeId: number, ligne: {
    produitId: number;
    quantite: number;
    prixUnitaire: number;
  }): Observable<Commande> {
    return this.http.post<Commande>(`${this.apiUrl}/${commandeId}/lignes`, ligne);
  }

  /**
   * Update order line
   */
  modifierLigne(commandeId: number, ligneId: number, data: {
    quantite?: number;
    prixUnitaire?: number;
  }): Observable<Commande> {
    return this.http.patch<Commande>(`${this.apiUrl}/${commandeId}/lignes/${ligneId}`, data);
  }

  /**
   * Remove order line
   */
  supprimerLigne(commandeId: number, ligneId: number): Observable<Commande> {
    return this.http.delete<Commande>(`${this.apiUrl}/${commandeId}/lignes/${ligneId}`);
  }

  // ==========================================
  // FONCTIONNALITÉS AVANCÉES (PREMIUM)
  // ==========================================

  /**
   * Get order history
   */
  getHistorique(commandeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrlAvance}/${commandeId}/historique`);
  }

  /**
   * Duplicate order
   */
  dupliquer(commandeId: number): Observable<Commande> {
    return this.http.post<Commande>(`${this.apiUrlAvance}/${commandeId}/dupliquer`, {});
  }

  /**
   * Convert quote to order
   */
  convertirDepuisDevis(devisId: number): Observable<Commande> {
    return this.http.post<Commande>(`${this.apiUrlAvance}/depuis-devis/${devisId}`, {});
  }

  /**
   * Get pending orders for a warehouse
   */
  getEnAttenteParEntrepot(entrepotId: number): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.apiUrlAvance}/en-attente/entrepot/${entrepotId}`);
  }

  // ==========================================
  // STATISTIQUES
  // ==========================================

  /**
   * Get order statistics
   */
  getStatistiques(params?: {
    dateDebut?: string;
    dateFin?: string;
    entrepotId?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    if (params?.entrepotId) httpParams = httpParams.set('entrepotId', params.entrepotId.toString());
    
    return this.http.get<any>(`${this.apiUrl}/statistiques`, { params: httpParams });
  }

  /**
   * Get orders by status
   */
  getByStatut(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/par-statut`);
  }

  /**
   * Get sales by period
   */
  getVentesParPeriode(periode: 'jour' | 'semaine' | 'mois' | 'annee'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrlAvance}/ventes/${periode}`);
  }

  // ==========================================
  // EXPORT
  // ==========================================

  /**
   * Export orders
   */
  export(format: 'csv' | 'excel' | 'pdf' = 'excel', params?: {
    dateDebut?: string;
    dateFin?: string;
    statut?: StatutCommande;
  }): Observable<Blob> {
    let httpParams = new HttpParams().set('format', format);
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    if (params?.statut) httpParams = httpParams.set('statut', params.statut);
    
    return this.http.get(`${this.apiUrl}/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  /**
   * Generate invoice PDF
   */
  genererFacture(commandeId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${commandeId}/facture`, {
      responseType: 'blob'
    });
  }

  /**
   * Generate delivery note PDF
   */
  genererBonLivraison(commandeId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${commandeId}/bon-livraison`, {
      responseType: 'blob'
    });
  }
}
