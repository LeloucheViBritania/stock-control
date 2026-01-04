/**
 * Service Dashboard
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface DashboardStats {
  totalProduits: number;
  produitsActifs: number;
  stockFaible: number;
  stockCritique: number;
  valeurStock: number;
  totalClients: number;
  totalFournisseurs: number;
  commandesEnCours: number;
  commandesAujourdhui: number;
  chiffreAffairesJour: number;
  chiffreAffairesMois: number;
  chiffreAffairesAnnee: number;
}

export interface ChiffreAffairesEvolution {
  date: string;
  montant: number;
  nombreCommandes: number;
}

export interface TopProduit {
  produitId: string;
  nom: string;
  reference: string;
  quantiteVendue: number;
  chiffreAffaires: number;
  image?: string;
}

export interface AlerteStock {
  produitId: string;
  nom: string;
  reference: string;
  quantiteStock: number;
  seuilAlerte: number;
  seuilCritique: number;
  type: 'FAIBLE' | 'CRITIQUE' | 'RUPTURE';
  categorie?: string;
}

export interface ActiviteRecente {
  id: string;
  type: 'COMMANDE' | 'MOUVEMENT' | 'CLIENT' | 'PRODUIT';
  action: string;
  description: string;
  reference?: string;
  date: Date;
  utilisateur?: string;
}

export interface CommandeRecente {
  id: string;
  numero: string;
  client: string;
  montant: number;
  statut: string;
  date: Date;
}

export interface RepartitionCategorie {
  categorieId: string;
  nom: string;
  couleur: string;
  nombreProduits: number;
  valeurStock: number;
  pourcentage: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  /**
   * Récupère les statistiques principales
   */
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  /**
   * Évolution du chiffre d'affaires
   */
  getChiffreAffairesEvolution(
    periode: 'semaine' | 'mois' | 'trimestre' | 'annee' = 'mois'
  ): Observable<ChiffreAffairesEvolution[]> {
    const params = new HttpParams().set('periode', periode);
    return this.http.get<ChiffreAffairesEvolution[]>(`${this.apiUrl}/chiffre-affaires`, { params });
  }

  /**
   * Top produits vendus
   */
  getTopProduits(
    limite = 5,
    periode: 'semaine' | 'mois' | 'trimestre' | 'annee' = 'mois'
  ): Observable<TopProduit[]> {
    const params = new HttpParams()
      .set('limite', limite.toString())
      .set('periode', periode);
    return this.http.get<TopProduit[]>(`${this.apiUrl}/top-produits`, { params });
  }

  /**
   * Alertes de stock
   */
  getAlertesStock(): Observable<AlerteStock[]> {
    return this.http.get<AlerteStock[]>(`${this.apiUrl}/alertes-stock`);
  }

  /**
   * Activités récentes
   */
  getActivitesRecentes(limite = 10): Observable<ActiviteRecente[]> {
    const params = new HttpParams().set('limite', limite.toString());
    return this.http.get<ActiviteRecente[]>(`${this.apiUrl}/activites`, { params });
  }

  /**
   * Commandes récentes
   */
  getCommandesRecentes(limite = 5): Observable<CommandeRecente[]> {
    const params = new HttpParams().set('limite', limite.toString());
    return this.http.get<CommandeRecente[]>(`${this.apiUrl}/commandes-recentes`, { params });
  }

  /**
   * Répartition par catégorie
   */
  getRepartitionCategories(): Observable<RepartitionCategorie[]> {
    return this.http.get<RepartitionCategorie[]>(`${this.apiUrl}/repartition-categories`);
  }

  /**
   * Tendances des ventes (PREMIUM - aperçu gratuit limité)
   */
  getTendancesVentes(): Observable<{
    tendance: 'hausse' | 'baisse' | 'stable';
    pourcentage: number;
    comparaisonPeriodePrecedente: number;
    prediction?: number; // PREMIUM only
  }> {
    return this.http.get<any>(`${this.apiUrl}/tendances`);
  }

  /**
   * Statistiques par entrepôt (PREMIUM)
   */
  getStatsParEntrepot(): Observable<{
    entrepotId: string;
    nom: string;
    nombreProduits: number;
    valeurStock: number;
    tauxRemplissage: number;
  }[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stats-entrepots`);
  }

  /**
   * Performance globale
   */
  getPerformance(): Observable<{
    objectifMensuel: number;
    realise: number;
    pourcentageAtteint: number;
    joursRestants: number;
    projectionFinMois: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/performance`);
  }

  /**
   * Résumé rapide pour widgets
   */
  getWidgetData(widget: 'ventes' | 'stock' | 'commandes' | 'clients'): Observable<any> {
    const params = new HttpParams().set('widget', widget);
    return this.http.get<any>(`${this.apiUrl}/widget`, { params });
  }
}
