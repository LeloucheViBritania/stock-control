import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class RapportsService {
  private readonly apiUrl = `${environment.apiUrl}/rapports`;

  constructor(private http: HttpClient) {}

  /**
   * Generate a report by type
   */
  generer(type: 'ventes' | 'stock' | 'clients' | 'fournisseurs' | 'inventaire' | 'financier', params?: { format?: string }): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params?.format) httpParams = httpParams.set('format', params.format);
    
    return this.http.get(`${this.apiUrl}/${type}`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  /**
   * Get available report types
   */
  getTypesRapport(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/types`);
  }

  /**
   * Generate stock report
   */
  genererRapportStock(params?: {
    entrepotId?: number;
    categorieId?: number;
    format?: 'pdf' | 'excel';
  }): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params?.entrepotId) httpParams = httpParams.set('entrepotId', params.entrepotId.toString());
    if (params?.categorieId) httpParams = httpParams.set('categorieId', params.categorieId.toString());
    if (params?.format) httpParams = httpParams.set('format', params.format);
    
    return this.http.get(`${this.apiUrl}/stock`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  /**
   * Generate sales report
   */
  genererRapportVentes(params: {
    dateDebut: string;
    dateFin: string;
    clientId?: number;
    produitId?: number;
    format?: 'pdf' | 'excel';
  }): Observable<Blob> {
    let httpParams = new HttpParams()
      .set('dateDebut', params.dateDebut)
      .set('dateFin', params.dateFin);
    
    if (params.clientId) httpParams = httpParams.set('clientId', params.clientId.toString());
    if (params.produitId) httpParams = httpParams.set('produitId', params.produitId.toString());
    if (params.format) httpParams = httpParams.set('format', params.format);
    
    return this.http.get(`${this.apiUrl}/ventes`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  /**
   * Generate movements report
   */
  genererRapportMouvements(params: {
    dateDebut: string;
    dateFin: string;
    entrepotId?: number;
    produitId?: number;
    type?: string;
    format?: 'pdf' | 'excel';
  }): Observable<Blob> {
    let httpParams = new HttpParams()
      .set('dateDebut', params.dateDebut)
      .set('dateFin', params.dateFin);
    
    if (params.entrepotId) httpParams = httpParams.set('entrepotId', params.entrepotId.toString());
    if (params.produitId) httpParams = httpParams.set('produitId', params.produitId.toString());
    if (params.type) httpParams = httpParams.set('type', params.type);
    if (params.format) httpParams = httpParams.set('format', params.format);
    
    return this.http.get(`${this.apiUrl}/mouvements`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  /**
   * Generate inventory valuation report
   */
  genererRapportValorisation(params?: {
    entrepotId?: number;
    categorieId?: number;
    format?: 'pdf' | 'excel';
  }): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params?.entrepotId) httpParams = httpParams.set('entrepotId', params.entrepotId.toString());
    if (params?.categorieId) httpParams = httpParams.set('categorieId', params.categorieId.toString());
    if (params?.format) httpParams = httpParams.set('format', params.format);
    
    return this.http.get(`${this.apiUrl}/valorisation`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  /**
   * Generate supplier performance report
   */
  genererRapportFournisseurs(params?: {
    dateDebut?: string;
    dateFin?: string;
    fournisseurId?: number;
    format?: 'pdf' | 'excel';
  }): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    if (params?.fournisseurId) httpParams = httpParams.set('fournisseurId', params.fournisseurId.toString());
    if (params?.format) httpParams = httpParams.set('format', params.format);
    
    return this.http.get(`${this.apiUrl}/fournisseurs`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  /**
   * Generate client performance report
   */
  genererRapportClients(params?: {
    dateDebut?: string;
    dateFin?: string;
    segment?: string;
    format?: 'pdf' | 'excel';
  }): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    if (params?.segment) httpParams = httpParams.set('segment', params.segment);
    if (params?.format) httpParams = httpParams.set('format', params.format);
    
    return this.http.get(`${this.apiUrl}/clients`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  /**
   * Generate ABC analysis report
   */
  genererRapportABC(params?: {
    entrepotId?: number;
    format?: 'pdf' | 'excel';
  }): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params?.entrepotId) httpParams = httpParams.set('entrepotId', params.entrepotId.toString());
    if (params?.format) httpParams = httpParams.set('format', params.format);
    
    return this.http.get(`${this.apiUrl}/abc`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  /**
   * Generate stock turnover report
   */
  genererRapportRotation(params?: {
    dateDebut?: string;
    dateFin?: string;
    entrepotId?: number;
    format?: 'pdf' | 'excel';
  }): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    if (params?.entrepotId) httpParams = httpParams.set('entrepotId', params.entrepotId.toString());
    if (params?.format) httpParams = httpParams.set('format', params.format);
    
    return this.http.get(`${this.apiUrl}/rotation`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  /**
   * Get scheduled reports
   */
  getRapportsProgrammes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/programmes`);
  }

  /**
   * Schedule a report
   */
  programmerRapport(rapport: {
    type: string;
    frequence: string;
    destinataires: string[];
    parametres?: any;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/programmer`, rapport);
  }

  /**
   * Cancel scheduled report
   */
  annulerRapportProgramme(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/programmes/${id}`);
  }
}
