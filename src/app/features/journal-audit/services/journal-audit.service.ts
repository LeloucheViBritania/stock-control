/**
 * Service du journal d'audit (PREMIUM + ADMIN)
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface AuditLog {
  id: string;
  timestamp: Date;
  utilisateurId: string;
  utilisateurNom: string;
  utilisateurEmail: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT' | 'VIEW';
  entite: string;
  entiteId?: string;
  entiteNom?: string;
  details?: Record<string, any>;
  anciennesValeurs?: Record<string, any>;
  nouvellesValeurs?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  statut: 'SUCCESS' | 'FAILURE' | 'WARNING';
  message?: string;
}

export interface AuditFilters {
  search?: string;
  utilisateurId?: string;
  action?: string;
  entite?: string;
  statut?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface AuditStats {
  totalActions: number;
  actionsParJour: { date: string; count: number }[];
  repartitionActions: { action: string; count: number }[];
  repartitionEntites: { entite: string; count: number }[];
  utilisateursActifs: { utilisateur: string; actions: number }[];
  erreurs: number;
}

@Injectable({ providedIn: 'root' })
export class JournalAuditService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/audit`;

  getLogs(page = 1, limit = 50, filters?: AuditFilters): Observable<{
    data: AuditLog[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.utilisateurId) params = params.set('utilisateurId', filters.utilisateurId);
    if (filters?.action) params = params.set('action', filters.action);
    if (filters?.entite) params = params.set('entite', filters.entite);
    if (filters?.statut) params = params.set('statut', filters.statut);
    if (filters?.dateDebut) params = params.set('dateDebut', filters.dateDebut);
    if (filters?.dateFin) params = params.set('dateFin', filters.dateFin);
    return this.http.get<any>(this.apiUrl, { params });
  }

  getById(id: string): Observable<AuditLog> {
    return this.http.get<AuditLog>(`${this.apiUrl}/${id}`);
  }

  getStats(dateDebut?: string, dateFin?: string): Observable<AuditStats> {
    let params = new HttpParams();
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);
    return this.http.get<AuditStats>(`${this.apiUrl}/stats`, { params });
  }

  getUtilisateurLogs(utilisateurId: string, limit = 50): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/utilisateur/${utilisateurId}`, { params: { limit: limit.toString() } });
  }

  getEntiteLogs(entite: string, entiteId: string, limit = 50): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/entite/${entite}/${entiteId}`, { params: { limit: limit.toString() } });
  }

  exportLogs(filters: AuditFilters, format: 'xlsx' | 'csv'): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/export`, { ...filters, format }, { responseType: 'blob' });
  }
}
