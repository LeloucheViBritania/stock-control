import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Produit } from '../../../shared/models/product.model';
import { NotificationService } from './notification.service';

export interface ProduitStatistiques {
  totalProduits: number;
  produitsActifs: number;
  produitsInactifs: number;
  stockFaible: number;
  totalArticlesEnStock: number;
  valeurTotaleStock: number;
}

export interface AjusterStockDto {
  quantite: number;
  type: 'entree' | 'sortie';
  raison: string;
  notes?: string;
}

export interface ProduitFournisseur {
  fournisseur: {
    id: number;
    nom: string;
    email: string;
    telephone?: string;
    estActif: boolean;
  };
  prixAchat: number;
  referenceFournisseur?: string;
  delaiLivraison?: number;
  quantiteMinimum?: number;
  estPrefere: boolean;
  estDisponible: boolean;
  notes?: string;
}

export interface AjouterFournisseurDto {
  fournisseurId: number;
  prixAchat: number;
  referenceFournisseur?: string;
  delaiLivraison?: number;
  quantiteMinimum?: number;
  estPrefere?: boolean;
  estDisponible?: boolean;
  notes?: string;
}

export interface ModifierFournisseurDto {
  prixAchat?: number;
  referenceFournisseur?: string;
  delaiLivraison?: number;
  quantiteMinimum?: number;
  estDisponible?: boolean;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/produits`;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  /**
   * Récupérer tous les produits avec pagination et filtres
   * GET /api/produits?page&limit&search&categorieId&estActif
   */
  getAll(
    page: number = 1,
    limit: number = 50,
    search?: string,
    categorieId?: number,
    estActif?: boolean
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (categorieId) params = params.set('categorieId', categorieId.toString());
    if (estActif !== undefined) params = params.set('estActif', estActif.toString());

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      catchError(error => {
        this.notificationService.handleError(error, 'Erreur lors du chargement des produits');
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtenir les statistiques globales des produits
   * GET /api/produits/statistiques
   */
  getStatistiques(): Observable<ProduitStatistiques> {
    return this.http.get<ProduitStatistiques>(`${this.apiUrl}/statistiques`);
  }

  /**
   * Obtenir les produits en stock faible
   * GET /api/produits/stock-faible
   */
  getStockFaible(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/stock-faible`);
  }

  /**
   * Obtenir les produits avec le plus de stock
   * GET /api/produits/top?limit=10
   */
  getTopProduits(limit: number = 10): Observable<Produit[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<Produit[]>(`${this.apiUrl}/top`, { params });
  }

  /**
   * Obtenir les détails d'un produit
   * GET /api/produits/:id
   */
  getOne(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer un nouveau produit
   * POST /api/produits
   */
  create(produit: Partial<Produit>): Observable<Produit> {
    return this.http.post<Produit>(this.apiUrl, produit).pipe(
      tap(() => {
        this.notificationService.success('Produit créé avec succès');
      }),
      catchError(error => {
        this.notificationService.handleError(error, 'Erreur lors de la création du produit');
        return throwError(() => error);
      })
    );
  }

  /**
   * Mettre à jour un produit
   * PATCH /api/produits/:id
   */
  update(id: number, produit: Partial<Produit>): Observable<Produit> {
    return this.http.patch<Produit>(`${this.apiUrl}/${id}`, produit).pipe(
      tap(() => {
        this.notificationService.success('Produit mis à jour avec succès');
      }),
      catchError(error => {
        this.notificationService.handleError(error, 'Erreur lors de la mise à jour du produit');
        return throwError(() => error);
      })
    );
  }

  /**
   * Supprimer un produit
   * DELETE /api/produits/:id
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.notificationService.success('Produit supprimé avec succès');
      }),
      catchError(error => {
        this.notificationService.handleError(error, 'Erreur lors de la suppression du produit');
        return throwError(() => error);
      })
    );
  }

  /**
   * Ajuster manuellement le stock d'un produit
   * POST /api/produits/:id/ajuster-stock
   */
  ajusterStock(id: number, data: AjusterStockDto): Observable<Produit> {
    return this.http.post<Produit>(`${this.apiUrl}/${id}/ajuster-stock`, data).pipe(
      tap(() => {
        this.notificationService.success('Stock ajusté avec succès');
      }),
      catchError(error => {
        this.notificationService.handleError(error, 'Erreur lors de l\'ajustement du stock');
        return throwError(() => error);
      })
    );
  }

  // ==================== FONCTIONNALITÉS PREMIUM ====================

  /**
   * Obtenir tous les fournisseurs d'un produit (PREMIUM)
   * GET /api/produits/:id/fournisseurs
   */
  getFournisseurs(id: number): Observable<ProduitFournisseur[]> {
    return this.http.get<ProduitFournisseur[]>(`${this.apiUrl}/${id}/fournisseurs`);
  }

  /**
   * Ajouter un fournisseur à un produit (PREMIUM)
   * POST /api/produits/:id/fournisseurs
   */
  ajouterFournisseur(id: number, data: AjouterFournisseurDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/fournisseurs`, data);
  }

  /**
   * Obtenir le fournisseur préféré d'un produit (PREMIUM)
   * GET /api/produits/:id/fournisseurs/prefere
   */
  getFournisseurPrefere(id: number): Observable<ProduitFournisseur | null> {
    return this.http.get<ProduitFournisseur | null>(`${this.apiUrl}/${id}/fournisseurs/prefere`);
  }

  /**
   * Obtenir le fournisseur avec le meilleur prix (PREMIUM)
   * GET /api/produits/:id/fournisseurs/meilleur-prix
   */
  getMeilleurPrix(id: number): Observable<ProduitFournisseur> {
    return this.http.get<ProduitFournisseur>(`${this.apiUrl}/${id}/fournisseurs/meilleur-prix`);
  }

  /**
   * Modifier les conditions d'un fournisseur (PREMIUM)
   * PATCH /api/produits/:id/fournisseurs/:fournisseurId
   */
  modifierFournisseur(
    id: number,
    fournisseurId: number,
    data: ModifierFournisseurDto
  ): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/fournisseurs/${fournisseurId}`, data);
  }

  /**
   * Retirer un fournisseur d'un produit (PREMIUM)
   * DELETE /api/produits/:id/fournisseurs/:fournisseurId
   */
  retirerFournisseur(id: number, fournisseurId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/fournisseurs/${fournisseurId}`);
  }

  /**
   * Définir un fournisseur comme préféré (PREMIUM)
   * PATCH /api/produits/:id/fournisseurs/:fournisseurId/prefere
   */
  definirFournisseurPrefere(id: number, fournisseurId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/fournisseurs/${fournisseurId}/prefere`, {});
  }
}