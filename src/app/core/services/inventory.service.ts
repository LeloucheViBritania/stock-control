import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { NotificationService } from './notification.service';

export interface Categorie {
  id: number;
  nom: string;
  parentId?: number;
}

export interface AjustementStock {
  entrepotId: number;
  raison: 'INVENTAIRE_PHYSIQUE' | 'DOMMAGE' | 'PERTE' | 'AUTRE';
  lignes: { produitId: number; quantiteAjustee: number }[];
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  // --- CATÉGORIES ---
  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.apiUrl}/categories`).pipe(
      catchError(error => {
        this.notificationService.handleError(error, 'Erreur lors du chargement des catégories');
        return throwError(() => error);
      })
    );
  }

  createCategory(data: Partial<Categorie>): Observable<Categorie> {
    return this.http.post<Categorie>(`${this.apiUrl}/categories`, data).pipe(
      tap(() => {
        this.notificationService.success('Catégorie créée avec succès');
      }),
      catchError(error => {
        this.notificationService.handleError(error, 'Erreur lors de la création de la catégorie');
        return throwError(() => error);
      })
    );
  }

  // --- INVENTAIRE (Premium - Stock par Entrepôt) ---
  getStockByWarehouse(entrepotId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inventaire/entrepot/${entrepotId}`).pipe(
      catchError(error => {
        this.notificationService.handleError(error, 'Erreur lors du chargement du stock');
        return throwError(() => error);
      })
    );
  }

  checkStockAvailability(produitId: number, quantite: number, entrepotId?: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/inventaire/verifier`, { produitId, quantite, entrepotId }).pipe(
      catchError(error => {
        this.notificationService.handleError(error, 'Erreur lors de la vérification du stock');
        return throwError(() => error);
      })
    );
  }

  // --- AJUSTEMENTS (Correction manuelle de stock) ---
  createAdjustment(data: AjustementStock): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ajustements-stock`, data).pipe(
      tap(() => {
        this.notificationService.success('Ajustement de stock créé avec succès');
      }),
      catchError(error => {
        this.notificationService.handleError(error, 'Erreur lors de la création de l\'ajustement');
        return throwError(() => error);
      })
    );
  }

  validateAdjustment(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/ajustements-stock/${id}/valider`, {}).pipe(
      tap(() => {
        this.notificationService.success('Ajustement validé avec succès');
      }),
      catchError(error => {
        this.notificationService.handleError(error, 'Erreur lors de la validation de l\'ajustement');
        return throwError(() => error);
      })
    );
  }
}