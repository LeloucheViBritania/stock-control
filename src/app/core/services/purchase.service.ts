import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaces simplifiées
export interface Fournisseur {
  id: number;
  nom: string;
  email?: string;
}

export interface BonCommande {
  id: number;
  numeroCommande: string;
  fournisseurId: number;
  entrepotId: number;
  statut: 'BROUILLON' | 'EN_ATTENTE' | 'APPROUVE' | 'RECU';
  dateLivraisonPrevue?: Date;
  lignes: any[];
}

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Fournisseurs
  getSuppliers(): Observable<Fournisseur[]> {
    return this.http.get<Fournisseur[]>(`${this.apiUrl}/fournisseurs`);
  }

  // Bons de Commande
  createOrder(orderData: any): Observable<BonCommande> {
    return this.http.post<BonCommande>(`${this.apiUrl}/bons-commande-achat`, orderData);
  }

  getOrder(id: number): Observable<BonCommande> {
    return this.http.get<BonCommande>(`${this.apiUrl}/bons-commande-achat/${id}`);
  }

  // Action importante : Réceptionner une commande (Augmente le stock)
  receiveOrder(id: number, receivedData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/bons-commande-achat/${id}/reception`, receivedData);
  }
}