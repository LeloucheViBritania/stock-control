import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  totalProduits: number;
  alerteStock: number;
  commandesEnAttente: number;
  totalVentes: number;
  totalClients: number;
  totalFournisseurs: number;
  // Champs Premium potentiels
  valeurStock?: number;
  chiffreAffaires?: number;
  topProduits?: TopProduct[];
  recentInvoices?: Invoice[];
  expenseData?: ExpenseData[];
  todoList?: TodoItem[];
}

export interface TopProduct {
  code: string;
  nom: string;
  quantite: number;
  montant: number;
}

export interface Invoice {
  numero: number;
  client: string;
  date: string;
  montant: number;
  statut: 'paid' | 'due';
}

export interface ExpenseData {
  month: string;
  expense: number;
  earning: number;
}

export interface TodoItem {
  id: number;
  date: string;
  title: string;
  icon: string;
  color: string;
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