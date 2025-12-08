import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = `${environment.apiUrl}/rapports`;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  getInventoryValuation(): Observable<any> {
    return this.http.get(`${this.apiUrl}/valorisation-stock`).pipe(
      catchError(error => {
        this.notificationService.handleError(error, 'Erreur lors du chargement de la valorisation du stock');
        return throwError(() => error);
      })
    );
  }

  getSalesReport(startDate: string, endDate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/ventes`, {
      params: { startDate, endDate }
    }).pipe(
      catchError(error => {
        this.notificationService.handleError(error, 'Erreur lors du chargement du rapport des ventes');
        return throwError(() => error);
      })
    );
  }

  getStockMovementHistory(produitId?: number): Observable<any> {
    const params = produitId ? { produitId: produitId.toString() } : undefined;
    return this.http.get(`${this.apiUrl}/mouvements`, { params }).pipe(
      catchError(error => {
        this.notificationService.handleError(error, 'Erreur lors du chargement de l\'historique des mouvements');
        return throwError(() => error);
      })
    );
  }

  // Téléchargement PDF/CSV
  exportReport(type: string, format: 'pdf' | 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/${type}`, {
      params: { format },
      responseType: 'blob'
    }).pipe(
      tap(() => {
        this.notificationService.success('Rapport exporté avec succès');
      }),
      catchError(error => {
        this.notificationService.handleError(error, 'Erreur lors de l\'export du rapport');
        return throwError(() => error);
      })
    );
  }
}