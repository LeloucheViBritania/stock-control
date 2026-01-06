import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { 
  SessionInventairePhysique, 
  LigneInventairePhysique,
  PaginatedResponse,
  StatutSessionInventaire 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class InventairePhysiqueService {
  private readonly apiUrl = `${environment.apiUrl}/inventaire-physique`;

  constructor(private http: HttpClient) {}

  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    statut?: StatutSessionInventaire;
    entrepotId?: number;
    dateDebut?: string;
    dateFin?: string;
  }): Observable<PaginatedResponse<SessionInventairePhysique>> {
    let httpParams = new HttpParams();
    
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.statut) httpParams = httpParams.set('statut', params.statut);
    if (params?.entrepotId) httpParams = httpParams.set('entrepotId', params.entrepotId.toString());
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);

    return this.http.get<any>(this.apiUrl, { params: httpParams }).pipe(
      map(response => {
        // Handle array response
        if (Array.isArray(response)) {
          return {
            data: response,
            meta: { total: response.length, page: 1, limit: response.length || 20, totalPages: 1 }
          };
        }
        // Handle paginated response
        if (response.data) {
          return {
            data: response.data,
            meta: response.meta || { total: response.data.length, page: 1, limit: 20, totalPages: 1 }
          };
        }
        return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
      })
    );
  }

  getById(id: number): Observable<SessionInventairePhysique> {
    return this.http.get<SessionInventairePhysique>(`${this.apiUrl}/${id}`);
  }

  create(session: {
    nom: string;
    entrepotId: number;
    categorieId?: number;
    notes?: string;
  }): Observable<SessionInventairePhysique> {
    return this.http.post<SessionInventairePhysique>(this.apiUrl, session);
  }

  update(id: number, data: Partial<{
    nom: string;
    notes: string;
  }>): Observable<SessionInventairePhysique> {
    return this.http.patch<SessionInventairePhysique>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  demarrer(id: number): Observable<SessionInventairePhysique> {
    return this.http.post<SessionInventairePhysique>(`${this.apiUrl}/${id}/demarrer`, {});
  }

  terminer(id: number): Observable<SessionInventairePhysique> {
    return this.http.post<SessionInventairePhysique>(`${this.apiUrl}/${id}/terminer`, {});
  }

  valider(id: number, appliquerAjustements: boolean = true): Observable<SessionInventairePhysique> {
    return this.http.post<SessionInventairePhysique>(`${this.apiUrl}/${id}/valider`, { 
      appliquerAjustements 
    });
  }

  annuler(id: number, raison?: string): Observable<SessionInventairePhysique> {
    return this.http.post<SessionInventairePhysique>(`${this.apiUrl}/${id}/annuler`, { raison });
  }

  getLignes(sessionId: number, params?: {
    page?: number;
    limit?: number;
    comptees?: boolean;
    avecEcart?: boolean;
  }): Observable<PaginatedResponse<LigneInventairePhysique>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.comptees !== undefined) httpParams = httpParams.set('comptees', params.comptees.toString());
    if (params?.avecEcart !== undefined) httpParams = httpParams.set('avecEcart', params.avecEcart.toString());
    
    return this.http.get<any>(
      `${this.apiUrl}/${sessionId}/lignes`, 
      { params: httpParams }
    ).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return {
            data: response,
            meta: { total: response.length, page: 1, limit: response.length || 20, totalPages: 1 }
          };
        }
        if (response.data) {
          return response;
        }
        return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
      })
    );
  }

  compter(sessionId: number, ligneId: number, quantiteComptee: number, notes?: string): Observable<LigneInventairePhysique> {
    return this.http.post<LigneInventairePhysique>(
      `${this.apiUrl}/${sessionId}/lignes/${ligneId}/compter`, 
      { quantiteComptee, notes }
    );
  }

  demanderRecomptage(sessionId: number, ligneId: number): Observable<LigneInventairePhysique> {
    return this.http.post<LigneInventairePhysique>(
      `${this.apiUrl}/${sessionId}/lignes/${ligneId}/recomptage`, 
      {}
    );
  }

  recompter(sessionId: number, ligneId: number, quantiteRecomptee: number, notes?: string): Observable<LigneInventairePhysique> {
    return this.http.post<LigneInventairePhysique>(
      `${this.apiUrl}/${sessionId}/lignes/${ligneId}/recompter`, 
      { quantiteRecomptee, notes }
    );
  }

  ajouterProduit(sessionId: number, produitId: number): Observable<LigneInventairePhysique> {
    return this.http.post<LigneInventairePhysique>(
      `${this.apiUrl}/${sessionId}/lignes`, 
      { produitId }
    );
  }

  getResume(sessionId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${sessionId}/resume`);
  }

  getEcarts(sessionId: number): Observable<LigneInventairePhysique[]> {
    return this.http.get<any>(`${this.apiUrl}/${sessionId}/ecarts`).pipe(
      map(response => Array.isArray(response) ? response : response.data || [])
    );
  }

  getProgression(sessionId: number): Observable<{
    total: number;
    comptees: number;
    restantes: number;
    pourcentage: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/${sessionId}/progression`);
  }

  getSessionsActives(): Observable<SessionInventairePhysique[]> {
    return this.http.get<any>(`${this.apiUrl}/actives`).pipe(
      map(response => Array.isArray(response) ? response : response.data || [])
    );
  }

  getStatistiques(params?: {
    dateDebut?: string;
    dateFin?: string;
    entrepotId?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.dateDebut) httpParams = httpParams.set('dateDebut', params.dateDebut);
    if (params?.dateFin) httpParams = httpParams.set('dateFin', params.dateFin);
    if (params?.entrepotId) httpParams = httpParams.set('entrepotId', params.entrepotId.toString());
    
    return this.http.get<any>(`${this.apiUrl}/statistiques`, { params: httpParams });
  }

  exportRapport(sessionId: number, format: 'pdf' | 'excel' = 'pdf'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${sessionId}/rapport`, {
      params: { format },
      responseType: 'blob'
    });
  }
}
