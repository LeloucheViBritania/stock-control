import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  totalProduits: number;
  alerteStock: number;
  commandesEnAttente: number;
  // Champs Premium potentiels
  valeurStock?: number;
  chiffreAffaires?: number;
  topProduits?: { nom: string; vendu: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  // Pour les graphiques (Premium)
  getSalesEvolution(period: 'week' | 'month' | 'year'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/evolution-ventes`, { params: { period } });
  }
}