import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { DashboardStats, AlerteStock, Produit } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  /**
   * Get all dashboard statistics
   */
  getStatistiques(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/statistiques`);
  }

  /**
   * Get low stock alerts
   */
  getAlertesStock(): Observable<AlerteStock[]> {
    return this.http.get<AlerteStock[]>(`${this.apiUrl}/alertes-stock`);
  }

  /**
   * Get products requiring reorder
   */
  getProduitsACommander(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/produits-a-commander`);
  }

  /**
   * Get recent orders
   */
  getCommandesRecentes(limit: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/commandes-recentes`, {
      params: { limit: limit.toString() }
    });
  }

  /**
   * Get recent stock movements
   */
  getMouvementsRecents(limit: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mouvements-recents`, {
      params: { limit: limit.toString() }
    });
  }

  /**
   * Get sales summary
   */
  getResumeVentes(periode?: 'jour' | 'semaine' | 'mois' | 'annee'): Observable<any> {
    let params = new HttpParams();
    if (periode) params = params.set('periode', periode);
    
    return this.http.get<any>(`${this.apiUrl}/resume-ventes`, { params });
  }

  /**
   * Get sales chart data
   */
  getVentesGraphique(params?: {
    dateDebut?: string;
    dateFin?: string;
    granularite?: 'jour' | 'semaine' | 'mois';
  }): Observable<any[]> {
    let httpParams = new HttpParams();
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    if (params?.granularite) httpParams = httpParams.set('granularite', params.granularite);
    
    return this.http.get<any[]>(`${this.apiUrl}/ventes-graphique`, { params: httpParams });
  }

  /**
   * Get stock evolution chart data
   */
  getEvolutionStock(produitId?: number): Observable<any[]> {
    let params = new HttpParams();
    if (produitId) params = params.set('produitId', produitId.toString());
    
    return this.http.get<any[]>(`${this.apiUrl}/evolution-stock`, { params });
  }

  /**
   * Get top selling products
   */
  getTopProduits(limit: number = 10, periode?: string): Observable<any[]> {
    let params = new HttpParams().set('limit', limit.toString());
    if (periode) params = params.set('periode', periode);
    
    return this.http.get<any[]>(`${this.apiUrl}/top-produits`, { params });
  }

  /**
   * Get top clients
   */
  getTopClients(limit: number = 10, periode?: string): Observable<any[]> {
    let params = new HttpParams().set('limit', limit.toString());
    if (periode) params = params.set('periode', periode);
    
    return this.http.get<any[]>(`${this.apiUrl}/top-clients`, { params });
  }

  /**
   * Get orders by status
   */
  getCommandesParStatut(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/commandes-par-statut`);
  }

  /**
   * Get stock value by category
   */
  getValeurStockParCategorie(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/valeur-stock-categorie`);
  }

  /**
   * Get warehouse summary (Premium)
   */
  getResumeEntrepots(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/resume-entrepots`);
  }

  /**
   * Get pending transfers (Premium)
   */
  getTransfertsEnCours(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/transferts-en-cours`);
  }

  /**
   * Get KPIs
   */
  getKPIs(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/kpis`);
  }
}
