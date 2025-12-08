import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = `${environment.apiUrl}/rapports`;

  constructor(private http: HttpClient) {}

  getInventoryValuation(): Observable<any> {
    return this.http.get(`${this.apiUrl}/valorisation-stock`);
  }

  getSalesReport(startDate: string, endDate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/ventes`, { 
      params: { startDate, endDate } 
    });
  }

  getStockMovementHistory(produitId?: number): Observable<any> {
    const params = produitId ? { produitId: produitId.toString() } : {};
    return this.http.get(`${this.apiUrl}/mouvements`, { params });
  }
  
  // Téléchargement PDF/CSV
  exportReport(type: string, format: 'pdf' | 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/${type}`, { 
      params: { format },
      responseType: 'blob' 
    });
  }
}