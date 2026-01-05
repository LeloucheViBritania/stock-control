/**
 * Service Codes-Barres (PREMIUM)
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface CodeBarreGenere {
  produitId: string;
  code: string;
  type: 'CODE128' | 'EAN13' | 'QR';
  imageBase64: string;
  createdAt: Date;
}

export interface HistoriqueScan {
  id: string;
  codeBarre: string;
  produitId?: string;
  utilisateurId: string;
  dateHeure: Date;
  succes: boolean;
  action?: string;
}

@Injectable({ providedIn: 'root' })
export class CodesBarresService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/codes-barres`;

  generer(produitId: string, type: 'CODE128' | 'EAN13' | 'QR'): Observable<CodeBarreGenere> {
    return this.http.post<CodeBarreGenere>(`${this.apiUrl}/generer`, { produitId, type });
  }

  genererMultiple(produitIds: string[], type: 'CODE128' | 'EAN13' | 'QR'): Observable<CodeBarreGenere[]> {
    return this.http.post<CodeBarreGenere[]>(`${this.apiUrl}/generer-multiple`, { produitIds, type });
  }

  scanner(code: string): Observable<{ produit?: any; succes: boolean }> {
    return this.http.get<any>(`${this.apiUrl}/scanner/${code}`);
  }

  getHistorique(page = 1, limit = 20): Observable<{ data: HistoriqueScan[]; total: number }> {
    return this.http.get<any>(`${this.apiUrl}/historique`, { params: { page, limit } });
  }

  imprimerEtiquettes(produitIds: string[], options: {
    modele: string;
    quantite: number;
    inclureNom: boolean;
    inclurePrix: boolean;
    inclureRef: boolean;
  }): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/imprimer`, { produitIds, ...options }, { responseType: 'blob' });
  }

  exporterPDF(produitIds: string[], options: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/export-pdf`, { produitIds, ...options }, { responseType: 'blob' });
  }
}
