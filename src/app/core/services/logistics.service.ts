import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Entrepot, TransfertStock } from '../../../shared/models/logistics.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class LogisticsService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  // --- GESTION ENTREPÔTS ---

  getWarehouses(): Observable<Entrepot[]> {
    return this.http.get<Entrepot[]>(`${this.apiUrl}/entrepots`).pipe(
      catchError(error => {
        this.notificationService.handleError(error, 'Erreur lors du chargement des entrepôts');
        return throwError(() => error);
      })
    );
  }

  getWarehouse(id: number): Observable<Entrepot> {
    return this.http.get<Entrepot>(`${this.apiUrl}/entrepots/${id}`).pipe(
      catchError(error => {
        this.notificationService.handleError(error, 'Erreur lors du chargement de l\'entrepôt');
        return throwError(() => error);
      })
    );
  }

  createWarehouse(data: Partial<Entrepot>): Observable<Entrepot> {
    return this.http.post<Entrepot>(`${this.apiUrl}/entrepots`, data).pipe(
      tap(() => {
        this.notificationService.success('Entrepôt créé avec succès');
      }),
      catchError(error => {
        this.notificationService.handleError(error, 'Erreur lors de la création de l\'entrepôt');
        return throwError(() => error);
      })
    );
  }

  updateWarehouse(id: number, data: Partial<Entrepot>): Observable<Entrepot> {
    return this.http.patch<Entrepot>(`${this.apiUrl}/entrepots/${id}`, data).pipe(
      tap(() => {
        this.notificationService.success('Entrepôt mis à jour avec succès');
      }),
      catchError(error => {
        this.notificationService.handleError(error, 'Erreur lors de la mise à jour de l\'entrepôt');
        return throwError(() => error);
      })
    );
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
    return this.http.post<TransfertStock>(`${this.apiUrl}/transferts-stock`, data).pipe(
      tap(() => {
        this.notificationService.success('Transfert créé avec succès');
      }),
      catchError(error => {
        this.notificationService.handleError(error, 'Erreur lors de la création du transfert');
        return throwError(() => error);
      })
    );
  }

  updateTransferStatus(id: number, statut: string): Observable<TransfertStock> {
    return this.http.patch<TransfertStock>(`${this.apiUrl}/transferts-stock/${id}/statut`, { statut }).pipe(
      tap(() => {
        this.notificationService.success('Statut du transfert mis à jour');
      }),
      catchError(error => {
        this.notificationService.handleError(error, 'Erreur lors de la mise à jour du statut');
        return throwError(() => error);
      })
    );
  }
}