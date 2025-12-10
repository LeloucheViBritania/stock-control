import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Client {
  id: number;
  nom: string;
  email?: string;
  telephone?: string;
  ville?: string;
  estActif?: boolean; 
}

export interface CommandeVente {
  id: number;
  numeroCommande: string;
  clientId: number;
  statut: string;
  montantTotal: number;
  lignes: any[];
}

@Injectable({ providedIn: 'root' })
export class SalesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // --- CLIENTS ---
  getClients(search?: string): Observable<Client[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<Client[]>(`${this.apiUrl}/clients`, { params });
  }

  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/clients/${id}`);
  }

  createClient(data: Partial<Client>): Observable<Client> {
    return this.http.post<Client>(`${this.apiUrl}/clients`, data);
  }

  updateClient(id: number, data: Partial<Client>): Observable<Client> {
    return this.http.patch<Client>(`${this.apiUrl}/clients/${id}`, data);
  }

  // --- COMMANDES (Ventes) ---
  getOrders(): Observable<CommandeVente[]> {
    return this.http.get<CommandeVente[]>(`${this.apiUrl}/commandes`);
  }

  createOrder(data: any): Observable<CommandeVente> {
    return this.http.post<CommandeVente>(`${this.apiUrl}/commandes`, data);
  }

  updateOrderStatus(id: number, statut: string): Observable<CommandeVente> {
    return this.http.patch<CommandeVente>(`${this.apiUrl}/commandes/${id}/statut`, { statut });
  }
}