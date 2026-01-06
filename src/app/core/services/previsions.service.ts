import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class PrevisionsService {
  private readonly apiUrl = `${environment.apiUrl}/previsions`;

  constructor(private http: HttpClient) {}

  getPrevisionsDemande(produitId: number, params?: {
    periodes?: number;
    unite?: 'jour' | 'semaine' | 'mois';
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.periodes) httpParams = httpParams.set('periodes', params.periodes.toString());
    if (params?.unite) httpParams = httpParams.set('unite', params.unite);
    
    return this.http.get<any>(`${this.apiUrl}/demande/${produitId}`, { params: httpParams });
  }

  getAllPrevisionsDemande(params?: {
    categorieId?: number;
    entrepotId?: number;
    periodes?: number;
  }): Observable<any[]> {
    let httpParams = new HttpParams();
    if (params?.categorieId) httpParams = httpParams.set('categorieId', params.categorieId.toString());
    if (params?.entrepotId) httpParams = httpParams.set('entrepotId', params.entrepotId.toString());
    if (params?.periodes) httpParams = httpParams.set('periodes', params.periodes.toString());
    
    return this.http.get<any[]>(`${this.apiUrl}/demande`, { params: httpParams });
  }

  getProjectionStock(produitId: number, jours: number = 30): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/projection/${produitId}`, {
      params: { jours: jours.toString() }
    });
  }

  getAnalyseRisqueRupture(entrepotId?: number): Observable<any[]> {
    let params = new HttpParams();
    if (entrepotId) params = params.set('entrepotId', entrepotId.toString());
    
    return this.http.get<any[]>(`${this.apiUrl}/risque-rupture`, { params });
  }

  getAnalyseSaisonnalite(produitId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/saisonnalite/${produitId}`);
  }

  getAnalyseTendance(produitId: number, periode?: string): Observable<any> {
    let params = new HttpParams();
    if (periode) params = params.set('periode', periode);
    
    return this.http.get<any>(`${this.apiUrl}/tendance/${produitId}`, { params });
  }

  /**
   * Get products to order based on forecasts
   * Backend returns: { resume: {...}, produits: [...] }
   */
  getProduitsACommander(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/produits-a-commander`).pipe(
      map(response => {
        // Handle { resume, produits } format from backend
        if (response && response.produits) {
          return response.produits.map((p: any) => this.mapProduitPrevision(p));
        }
        // If response is already an array
        if (Array.isArray(response)) {
          return response.map((p: any) => this.mapProduitPrevision(p));
        }
        return [];
      }),
      catchError(err => {
        console.error('Error loading previsions:', err);
        return of([]);
      })
    );
  }

  private mapProduitPrevision(p: any): any {
    return {
      id: p.id,
      nom: p.nom,
      reference: p.reference,
      stockActuel: p.stockActuel ?? p.quantiteStock ?? 0,
      prevision30j: p.joursAvantRupture ?? 0,
      qteSuggere: p.quantiteSuggereCommande ?? p.quantiteSuggere ?? 0,
      urgence: this.mapNiveauUrgence(p.niveauUrgence ?? p.urgence),
      tendance: p.tendance,
      fournisseurPrefere: p.fournisseurPrefere
    };
  }

  private mapNiveauUrgence(niveau: string): string {
    if (!niveau) return 'BASSE';
    const mapping: Record<string, string> = {
      'CRITIQUE': 'HAUTE',
      'URGENT': 'HAUTE',
      'ATTENTION': 'MOYENNE',
      'OK': 'BASSE',
      'HAUTE': 'HAUTE',
      'MOYENNE': 'MOYENNE',
      'BASSE': 'BASSE'
    };
    return mapping[niveau.toUpperCase()] || 'BASSE';
  }
}

@Injectable({
  providedIn: 'root'
})
export class ReapprovisionnementService {
  private readonly apiUrl = `${environment.apiUrl}/reapprovisionnement`;

  constructor(private http: HttpClient) {}

  getSuggestions(params?: {
    entrepotId?: number;
    categorieId?: number;
    urgenceMin?: number;
  }): Observable<any[]> {
    let httpParams = new HttpParams();
    if (params?.entrepotId) httpParams = httpParams.set('entrepotId', params.entrepotId.toString());
    if (params?.categorieId) httpParams = httpParams.set('categorieId', params.categorieId.toString());
    if (params?.urgenceMin) httpParams = httpParams.set('urgenceMin', params.urgenceMin.toString());
    
    return this.http.get<any[]>(`${this.apiUrl}/suggestions`, { params: httpParams });
  }

  getSuggestionProduit(produitId: number, entrepotId?: number): Observable<any> {
    let params = new HttpParams();
    if (entrepotId) params = params.set('entrepotId', entrepotId.toString());
    
    return this.http.get<any>(`${this.apiUrl}/suggestions/${produitId}`, { params });
  }

  calculerQuantiteOptimale(produitId: number, fournisseurId?: number): Observable<any> {
    let params = new HttpParams();
    if (fournisseurId) params = params.set('fournisseurId', fournisseurId.toString());
    
    return this.http.get<any>(`${this.apiUrl}/quantite-optimale/${produitId}`, { params });
  }

  getPointCommande(produitId: number, entrepotId?: number): Observable<any> {
    let params = new HttpParams();
    if (entrepotId) params = params.set('entrepotId', entrepotId.toString());
    
    return this.http.get<any>(`${this.apiUrl}/point-commande/${produitId}`, { params });
  }

  genererBonCommande(suggestions: {
    fournisseurId: number;
    entrepotId: number;
    lignes: { produitId: number; quantite: number }[];
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/generer-bon-commande`, suggestions);
  }

  getParametres(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/parametres`);
  }

  updateParametres(parametres: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/parametres`, parametres);
  }

  getUrgents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/urgents`);
  }

  getHistorique(params?: {
    page?: number;
    limit?: number;
    dateDebut?: string;
    dateFin?: string;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    
    return this.http.get<any>(`${this.apiUrl}/historique`, { params: httpParams });
  }
}
