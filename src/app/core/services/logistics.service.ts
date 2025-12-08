import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Entrepot, TransfertStock } from '../../../shared/models/logistics.model';

@Injectable({
  providedIn: 'root'
})
export class LogisticsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // --- GESTION ENTREPÔTS ---

  getWarehouses(): Observable<Entrepot[]> {
    return this.http.get<Entrepot[]>(`${this.apiUrl}/entrepots`);
  }

  getWarehouse(id: number): Observable<Entrepot> {
    return this.http.get<Entrepot>(`${this.apiUrl}/entrepots/${id}`);
  }

  createWarehouse(data: Partial<Entrepot>): Observable<Entrepot> {
    return this.http.post<Entrepot>(`${this.apiUrl}/entrepots`, data);
  }

  // --- GESTION TRANSFERTS ---

  createTransfer(data: {
    entrepotSourceId: number;
    entrepotDestinationId: number;
    dateTransfert: Date;
    notes?: string;
    lignes: { produitId: number; quantite: number }[]
  }): Observable<TransfertStock> {
    // Correspond au DTO CreateTransfertDto du backend
    return this.http.post<TransfertStock>(`${this.apiUrl}/transferts-stock`, data);
  }
  
  updateTransferStatus(id: number, statut: string): Observable<TransfertStock> {
    return this.http.patch<TransfertStock>(`${this.apiUrl}/transferts-stock/${id}/statut`, { statut });
  }
}