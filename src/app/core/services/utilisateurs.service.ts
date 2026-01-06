import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Utilisateur, PaginatedResponse, Role, TierAbonnement } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UtilisateursService {
  private readonly apiUrl = `${environment.apiUrl}/utilisateurs`;

  constructor(private http: HttpClient) {}

  /**
   * Get all users with filters
   */
  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
    estActif?: boolean;
  }): Observable<PaginatedResponse<Utilisateur>> {
    let httpParams = new HttpParams();
    
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.role) httpParams = httpParams.set('role', params.role);
    if (params?.estActif !== undefined) httpParams = httpParams.set('estActif', params.estActif.toString());

    return this.http.get<PaginatedResponse<Utilisateur>>(this.apiUrl, { params: httpParams });
  }

  /**
   * Get user by ID
   */
  getById(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new user
   */
  create(user: {
    nomUtilisateur: string;
    email: string;
    motDePasse: string;
    nomComplet?: string;
    role?: Role;
  }): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(this.apiUrl, user);
  }

  /**
   * Update user
   */
  update(id: number, data: Partial<{
    email: string;
    nomComplet: string;
    role: Role;
    estActif: boolean;
    tierAbonnement: TierAbonnement;
  }>): Observable<Utilisateur> {
    return this.http.patch<Utilisateur>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Update subscription tier (simple toggle)
   */
  updateTierAbonnement(id: number, tier: TierAbonnement): Observable<Utilisateur> {
    return this.http.patch<Utilisateur>(`${this.apiUrl}/${id}`, { tierAbonnement: tier });
  }

  /**
   * Delete (deactivate) user
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Activate user
   */
  activer(id: number): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.apiUrl}/${id}/activer`, {});
  }

  /**
   * Deactivate user
   */
  desactiver(id: number): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.apiUrl}/${id}/desactiver`, {});
  }

  /**
   * Change user role
   */
  changerRole(id: number, role: Role): Observable<Utilisateur> {
    return this.http.patch<Utilisateur>(`${this.apiUrl}/${id}/role`, { role });
  }

  /**
   * Reset user password (admin)
   */
  resetPassword(id: number, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/reset-password`, { newPassword });
  }

  /**
   * Toggle premium status (activation/désactivation simple)
   */
  togglePremium(id: number): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.apiUrl}/${id}/toggle-premium`, {});
  }

  /**
   * Activate premium for user
   */
  activerPremium(id: number, dateExpiration?: Date): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.apiUrl}/${id}/activer-premium`, { 
      dateExpiration 
    });
  }

  /**
   * Deactivate premium for user
   */
  desactiverPremium(id: number): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.apiUrl}/${id}/desactiver-premium`, {});
  }

  /**
   * Get users by role
   */
  getByRole(role: Role): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.apiUrl}/role/${role}`);
  }

  /**
   * Get statistics
   */
  getStatistiques(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistiques`);
  }

  /**
   * Get all active users (simple list)
   */
  getAllActive(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.apiUrl}/actifs`);
  }

  /**
   * Get gestionnaires (for assignments)
   */
  getGestionnaires(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.apiUrl}/gestionnaires`);
  }
}
