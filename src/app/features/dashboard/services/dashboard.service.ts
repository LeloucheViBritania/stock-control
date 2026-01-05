/**
 * Service Dashboard
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
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
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`).pipe(
      catchError(() => of(this.getMockStats()))
    );
  }

  /**
   * Évolution du chiffre d'affaires
   */
  getChiffreAffairesEvolution(
    periode: 'semaine' | 'mois' | 'trimestre' | 'annee' = 'mois'
  ): Observable<ChiffreAffairesEvolution[]> {
    const params = new HttpParams().set('periode', periode);
    return this.http.get<ChiffreAffairesEvolution[]>(`${this.apiUrl}/chiffre-affaires`, { params }).pipe(
      catchError(() => of(this.getMockEvolutionCA()))
    );
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
    return this.http.get<TopProduit[]>(`${this.apiUrl}/top-produits`, { params }).pipe(
      catchError(() => of(this.getMockTopProduits()))
    );
  }

  /**
   * Alertes de stock
   */
  getAlertesStock(): Observable<AlerteStock[]> {
    return this.http.get<AlerteStock[]>(`${this.apiUrl}/alertes-stock`).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Activités récentes
   */
  getActivitesRecentes(limite = 10): Observable<ActiviteRecente[]> {
    const params = new HttpParams().set('limite', limite.toString());
    return this.http.get<ActiviteRecente[]>(`${this.apiUrl}/activites`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Commandes récentes
   */
  getCommandesRecentes(limite = 5): Observable<CommandeRecente[]> {
    const params = new HttpParams().set('limite', limite.toString());
    return this.http.get<CommandeRecente[]>(`${this.apiUrl}/commandes-recentes`, { params }).pipe(
      catchError(() => of(this.getMockCommandesRecentes()))
    );
  }

  /**
   * Répartition par catégorie
   */
  getRepartitionCategories(): Observable<RepartitionCategorie[]> {
    return this.http.get<RepartitionCategorie[]>(`${this.apiUrl}/repartition-categories`).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Tendances des ventes (PREMIUM)
   */
  getTendancesVentes(): Observable<{
    tendance: 'hausse' | 'baisse' | 'stable';
    pourcentage: number;
    comparaisonPeriodePrecedente: number;
    prediction?: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/tendances`).pipe(
      catchError(() => of({ tendance: 'hausse' as const, pourcentage: 12.5, comparaisonPeriodePrecedente: 8.3 }))
    );
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
    return this.http.get<any[]>(`${this.apiUrl}/stats-entrepots`).pipe(
      catchError(() => of([]))
    );
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
    return this.http.get<any>(`${this.apiUrl}/performance`).pipe(
      catchError(() => of({ objectifMensuel: 50000, realise: 35000, pourcentageAtteint: 70, joursRestants: 12, projectionFinMois: 48000 }))
    );
  }

  /**
   * Résumé rapide pour widgets
   */
  getWidgetData(widget: 'ventes' | 'stock' | 'commandes' | 'clients'): Observable<any> {
    const params = new HttpParams().set('widget', widget);
    return this.http.get<any>(`${this.apiUrl}/widget`, { params }).pipe(
      catchError(() => of(null))
    );
  }

  // ============ MOCK DATA ============

  private getMockStats(): DashboardStats {
    return {
      totalProduits: 245,
      produitsActifs: 230,
      stockFaible: 12,
      stockCritique: 3,
      valeurStock: 125000,
      totalClients: 156,
      totalFournisseurs: 24,
      commandesEnCours: 23,
      commandesAujourdhui: 8,
      chiffreAffairesJour: 4520,
      chiffreAffairesMois: 45230,
      chiffreAffairesAnnee: 523400,
    };
  }

  private getMockEvolutionCA(): ChiffreAffairesEvolution[] {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => ({
      date: new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
      montant: Math.floor(Math.random() * 5000) + 2000,
      nombreCommandes: Math.floor(Math.random() * 20) + 5,
    }));
  }

  private getMockTopProduits(): TopProduit[] {
    return [
      { produitId: '1', nom: 'Écran LCD 27"', reference: 'ECR-027', quantiteVendue: 45, chiffreAffaires: 13455 },
      { produitId: '2', nom: 'Clavier mécanique', reference: 'CLV-MEC', quantiteVendue: 38, chiffreAffaires: 3382 },
      { produitId: '3', nom: 'Souris sans fil', reference: 'SOU-SF', quantiteVendue: 52, chiffreAffaires: 2340 },
      { produitId: '4', nom: 'Casque Bluetooth', reference: 'CAS-BT', quantiteVendue: 29, chiffreAffaires: 4350 },
      { produitId: '5', nom: 'Hub USB-C', reference: 'HUB-USC', quantiteVendue: 41, chiffreAffaires: 1640 },
    ];
  }

  private getMockCommandesRecentes(): CommandeRecente[] {
    return [
      { id: '1', numero: 'CMD-2025-001', client: 'Tech Solutions', montant: 2450, statut: 'EN_PREPARATION', date: new Date() },
      { id: '2', numero: 'CMD-2025-002', client: 'Bureau Pro', montant: 890, statut: 'CONFIRMEE', date: new Date(Date.now() - 3600000) },
      { id: '3', numero: 'CMD-2025-003', client: 'Digital Corp', montant: 3200, statut: 'EXPEDIEE', date: new Date(Date.now() - 7200000) },
    ];
  }
}
