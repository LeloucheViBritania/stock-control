import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { JournalAudit, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class JournalAuditService {
  private readonly apiUrl = `${environment.apiUrl}/journal-audit`;

  constructor(private http: HttpClient) {}

  /**
   * Get all audit entries with filters
   */
  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    utilisateurId?: number;
    action?: string;
    nomTable?: string;
    dateDebut?: string;
    dateFin?: string;
  }): Observable<PaginatedResponse<JournalAudit>> {
    let httpParams = new HttpParams();
    
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.utilisateurId) httpParams = httpParams.set('utilisateurId', params.utilisateurId.toString());
    if (params?.action) httpParams = httpParams.set('action', params.action);
    if (params?.nomTable) httpParams = httpParams.set('nomTable', params.nomTable);
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);

    return this.http.get<PaginatedResponse<JournalAudit>>(this.apiUrl, { params: httpParams });
  }

  /**
   * Get audit entry by ID
   */
  getById(id: number): Observable<JournalAudit> {
    return this.http.get<JournalAudit>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get audit entries for a specific record
   */
  getByRecord(nomTable: string, enregistrementId: number): Observable<JournalAudit[]> {
    return this.http.get<JournalAudit[]>(`${this.apiUrl}/record/${nomTable}/${enregistrementId}`);
  }

  /**
   * Get audit entries for a user
   */
  getByUtilisateur(utilisateurId: number, params?: {
    page?: number;
    limit?: number;
    dateDebut?: string;
    dateFin?: string;
  }): Observable<PaginatedResponse<JournalAudit>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    
    return this.http.get<PaginatedResponse<JournalAudit>>(
      `${this.apiUrl}/utilisateur/${utilisateurId}`, 
      { params: httpParams }
    );
  }

  /**
   * Get available actions
   */
  getActions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/actions`);
  }

  /**
   * Get available tables
   */
  getTables(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/tables`);
  }

  /**
   * Get recent entries
   */
  getRecent(limit: number = 50): Observable<JournalAudit[]> {
    return this.http.get<JournalAudit[]>(`${this.apiUrl}/recent`, {
      params: { limit: limit.toString() }
    });
  }

  /**
   * Get statistics
   */
  getStatistiques(params?: {
    dateDebut?: string;
    dateFin?: string;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    
    return this.http.get<any>(`${this.apiUrl}/statistiques`, { params: httpParams });
  }

  /**
   * Get activity by user
   */
  getActiviteParUtilisateur(params?: {
    dateDebut?: string;
    dateFin?: string;
  }): Observable<any[]> {
    let httpParams = new HttpParams();
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    
    return this.http.get<any[]>(`${this.apiUrl}/activite-utilisateurs`, { params: httpParams });
  }

  /**
   * Export audit log
   */
  export(format: 'csv' | 'excel' = 'excel', params?: {
    dateDebut?: string;
    dateFin?: string;
    utilisateurId?: number;
    action?: string;
    nomTable?: string;
  }): Observable<Blob> {
    let httpParams = new HttpParams().set('format', format);
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    if (params?.utilisateurId) httpParams = httpParams.set('utilisateurId', params.utilisateurId.toString());
    if (params?.action) httpParams = httpParams.set('action', params.action);
    if (params?.nomTable) httpParams = httpParams.set('nomTable', params.nomTable);
    
    return this.http.get(`${this.apiUrl}/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }
}
