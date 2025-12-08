import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Utilisateur } from '../../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // --- GESTION UTILISATEURS ---
  getUsers(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.apiUrl}/utilisateurs`);
  }

  createUser(user: Partial<Utilisateur>): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.apiUrl}/utilisateurs`, user);
  }

  updateUserRole(id: number, role: string): Observable<Utilisateur> {
    return this.http.patch<Utilisateur>(`${this.apiUrl}/utilisateurs/${id}/role`, { role });
  }

  // --- JOURNAL D'AUDIT (Logs) ---
  getAuditLogs(limit: number = 50): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/journal-audit?limit=${limit}`);
  }

  // --- ABONNEMENT ---
  getSubscriptionStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/subscription/status`);
  }
  
  upgradeSubscription(plan: 'PREMIUM'): Observable<any> {
    return this.http.post(`${this.apiUrl}/subscription/upgrade`, { plan });
  }
}