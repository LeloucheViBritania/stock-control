/**
 * Service de gestion des entrepôts (PREMIUM)
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '@env/environment';

export interface Entrepot {
  id: string;
  code: string;
  nom: string;
  description?: string;
  adresse: string;
  ville: string;
  codePostal?: string;
  pays: string;
  telephone?: string;
  email?: string;
  responsable?: string;
  capaciteMax: number;
  capaciteUtilisee: number;
  surface?: number;
  type: 'PRINCIPAL' | 'SECONDAIRE' | 'TRANSIT' | 'RESERVE';
  statut: 'ACTIF' | 'INACTIF' | 'MAINTENANCE';
  nombreProduits: number;
  valeurStock: number;
  coordonnees?: { latitude: number; longitude: number };
  horaires?: { ouverture: string; fermeture: string };
  zones?: Zone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Zone {
  id: string;
  code: string;
  nom: string;
  type: 'STOCKAGE' | 'RECEPTION' | 'EXPEDITION' | 'QUARANTAINE' | 'PICKING';
  capacite: number;
  utilisee: number;
  temperature?: 'AMBIANTE' | 'REFRIGEREE' | 'CONGELEE';
}

export interface StockEntrepot {
  produitId: string;
  produitNom: string;
  produitReference: string;
  categorie: string;
  quantite: number;
  quantiteReservee: number;
  quantiteDisponible: number;
  emplacement?: string;
  zone?: string;
  dateEntree: Date;
  prixUnitaire: number;
  valeur: number;
}

export interface EntrepotStats {
  tauxRemplissage: number;
  valeurTotale: number;
  nombreProduits: number;
  nombreReferences: number;
  mouvementsJour: number;
  mouvementsSemaine: number;
  alertesStock: number;
  produitsPerimes: number;
  repartitionZones: { zone: string; pourcentage: number; valeur: number }[];
  evolutionStock: { date: Date; valeur: number }[];
  topProduits: { produit: string; quantite: number; valeur: number }[];
}

export interface CreateEntrepotDto {
  nom: string;
  description?: string;
  adresse: string;
  ville: string;
  codePostal?: string;
  pays?: string;
  telephone?: string;
  email?: string;
  responsable?: string;
  capaciteMax: number;
  surface?: number;
  type?: 'PRINCIPAL' | 'SECONDAIRE' | 'TRANSIT' | 'RESERVE';
}

export interface EntrepotFilters {
  search?: string;
  type?: string;
  statut?: string;
  ville?: string;
}

@Injectable({ providedIn: 'root' })
export class EntrepotsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/entrepots`;
  private entrepotsCache$ = new BehaviorSubject<Entrepot[]>([]);
  readonly entrepots$ = this.entrepotsCache$.asObservable();

  getAll(page = 1, limit = 20, filters?: EntrepotFilters): Observable<{
    data: Entrepot[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.type) params = params.set('type', filters.type);
    if (filters?.statut) params = params.set('statut', filters.statut);
    if (filters?.ville) params = params.set('ville', filters.ville);
    return this.http.get<any>(`${this.apiUrl}`, { params });
  }

  getById(id: string): Observable<Entrepot> {
    return this.http.get<Entrepot>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateEntrepotDto): Observable<Entrepot> {
    return this.http.post<Entrepot>(this.apiUrl, data);
  }

  update(id: string, data: Partial<CreateEntrepotDto>): Observable<Entrepot> {
    return this.http.patch<Entrepot>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStock(id: string, page = 1, limit = 50, search?: string): Observable<{
    data: StockEntrepot[];
    meta: { total: number; page: number; limit: number };
  }> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (search) params = params.set('search', search);
    return this.http.get<any>(`${this.apiUrl}/${id}/stock`, { params });
  }

  getStats(id: string): Observable<EntrepotStats> {
    return this.http.get<EntrepotStats>(`${this.apiUrl}/${id}/stats`);
  }

  getZones(id: string): Observable<Zone[]> {
    return this.http.get<Zone[]>(`${this.apiUrl}/${id}/zones`);
  }

  createZone(entrepotId: string, zone: Partial<Zone>): Observable<Zone> {
    return this.http.post<Zone>(`${this.apiUrl}/${entrepotId}/zones`, zone);
  }

  updateZone(entrepotId: string, zoneId: string, zone: Partial<Zone>): Observable<Zone> {
    return this.http.patch<Zone>(`${this.apiUrl}/${entrepotId}/zones/${zoneId}`, zone);
  }

  deleteZone(entrepotId: string, zoneId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${entrepotId}/zones/${zoneId}`);
  }

  changeStatut(id: string, statut: 'ACTIF' | 'INACTIF' | 'MAINTENANCE'): Observable<Entrepot> {
    return this.http.patch<Entrepot>(`${this.apiUrl}/${id}/statut`, { statut });
  }

  getGlobalStats(): Observable<{
    totalEntrepots: number;
    capaciteTotale: number;
    capaciteUtilisee: number;
    valeurTotaleStock: number;
    nombreProduitsTotal: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/stats/global`);
  }

  exportStock(id: string, format: 'xlsx' | 'pdf' | 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/export`, { params: { format }, responseType: 'blob' });
  }

  refreshCache(): void {
    this.getAll(1, 100).subscribe({ next: (r) => this.entrepotsCache$.next(r.data) });
  }

  getCached(): Entrepot[] {
    return this.entrepotsCache$.getValue();
  }
}
