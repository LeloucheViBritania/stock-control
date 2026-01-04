/**
 * Service de gestion des commandes
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { StatutCommande } from '@enums/statut-commande.enum';

export interface LigneCommande {
  id?: string;
  produitId: string;
  produit?: {
    id: string;
    nom: string;
    reference: string;
    prixVente: number;
    quantiteStock: number;
  };
  quantite: number;
  prixUnitaire: number;
  remise: number;
  tva: number;
  montantHT: number;
  montantTTC: number;
}

export interface Commande {
  id: string;
  numero: string;
  clientId: string;
  client?: {
    id: string;
    nom: string;
    prenom?: string;
    email?: string;
    telephone: string;
  };
  statut: StatutCommande;
  dateCommande: Date;
  dateLivraisonPrevue?: Date;
  dateLivraisonReelle?: Date;
  adresseLivraison?: string;
  lignes: LigneCommande[];
  sousTotal: number;
  remiseGlobale: number;
  montantHT: number;
  montantTVA: number;
  montantTTC: number;
  modePaiement?: 'ESPECES' | 'CARTE' | 'VIREMENT' | 'CHEQUE' | 'CREDIT';
  paye: boolean;
  datePaiement?: Date;
  notes?: string;
  notesInternes?: string;
  createdBy?: { id: string; nom: string };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommandeDto {
  clientId: string;
  dateLivraisonPrevue?: Date;
  adresseLivraison?: string;
  lignes: {
    produitId: string;
    quantite: number;
    prixUnitaire?: number;
    remise?: number;
  }[];
  remiseGlobale?: number;
  modePaiement?: string;
  notes?: string;
  notesInternes?: string;
}

export interface CommandeFilters {
  search?: string;
  clientId?: string;
  statut?: StatutCommande;
  dateDebut?: string;
  dateFin?: string;
  paye?: boolean;
  montantMin?: number;
  montantMax?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CommandeTimeline {
  date: Date;
  statut: StatutCommande;
  commentaire?: string;
  utilisateur?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CommandesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/commandes`;

  /**
   * Récupère la liste des commandes paginée
   */
  getAll(
    page = 1,
    limit = 20,
    filters?: CommandeFilters,
    sortBy = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Observable<PaginatedResponse<Commande>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Commande>>(this.apiUrl, { params });
  }

  /**
   * Récupère une commande par ID
   */
  getById(id: string): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupère une commande par numéro
   */
  getByNumero(numero: string): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/numero/${numero}`);
  }

  /**
   * Crée une commande
   */
  create(data: CreateCommandeDto): Observable<Commande> {
    return this.http.post<Commande>(this.apiUrl, data);
  }

  /**
   * Met à jour une commande
   */
  update(id: string, data: Partial<CreateCommandeDto>): Observable<Commande> {
    return this.http.patch<Commande>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Supprime une commande (si brouillon)
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Change le statut d'une commande
   */
  changeStatut(id: string, statut: StatutCommande, commentaire?: string): Observable<Commande> {
    return this.http.post<Commande>(`${this.apiUrl}/${id}/statut`, { statut, commentaire });
  }

  /**
   * Confirme une commande (déclenche la sortie de stock)
   */
  confirmer(id: string): Observable<Commande> {
    return this.http.post<Commande>(`${this.apiUrl}/${id}/confirmer`, {});
  }

  /**
   * Annule une commande
   */
  annuler(id: string, motif: string): Observable<Commande> {
    return this.http.post<Commande>(`${this.apiUrl}/${id}/annuler`, { motif });
  }

  /**
   * Marque comme livrée
   */
  marquerLivree(id: string): Observable<Commande> {
    return this.http.post<Commande>(`${this.apiUrl}/${id}/livree`, {});
  }

  /**
   * Marque comme payée
   */
  marquerPayee(id: string, modePaiement: string): Observable<Commande> {
    return this.http.post<Commande>(`${this.apiUrl}/${id}/payer`, { modePaiement });
  }

  /**
   * Récupère la timeline d'une commande
   */
  getTimeline(id: string): Observable<CommandeTimeline[]> {
    return this.http.get<CommandeTimeline[]>(`${this.apiUrl}/${id}/timeline`);
  }

  /**
   * Duplique une commande
   */
  dupliquer(id: string): Observable<Commande> {
    return this.http.post<Commande>(`${this.apiUrl}/${id}/dupliquer`, {});
  }

  /**
   * Génère le PDF de la commande (PREMIUM feature visible)
   */
  genererPdf(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }

  /**
   * Génère le bon de livraison PDF (PREMIUM)
   */
  genererBonLivraison(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/bon-livraison`, { responseType: 'blob' });
  }

  /**
   * Génère la facture PDF (PREMIUM)
   */
  genererFacture(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/facture`, { responseType: 'blob' });
  }

  /**
   * Statistiques des commandes
   */
  getStats(periode?: 'jour' | 'semaine' | 'mois' | 'annee'): Observable<{
    totalCommandes: number;
    commandesEnCours: number;
    chiffreAffaires: number;
    panierMoyen: number;
    commandesParStatut: { statut: StatutCommande; count: number }[];
  }> {
    let params = new HttpParams();
    if (periode) params = params.set('periode', periode);
    return this.http.get<any>(`${this.apiUrl}/stats`, { params });
  }

  /**
   * Commandes récentes
   */
  getRecentes(limit = 5): Observable<Commande[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<Commande[]>(`${this.apiUrl}/recentes`, { params });
  }

  /**
   * Export des commandes (PREMIUM)
   */
  export(format: 'csv' | 'excel' | 'pdf', filters?: CommandeFilters): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params = params.set(key, value.toString());
      });
    }
    return this.http.get(`${this.apiUrl}/export`, { params, responseType: 'blob' });
  }

  /**
   * Calcule le total d'une ligne
   */
  calculerLigne(ligne: Partial<LigneCommande>): {
    montantHT: number;
    montantTVA: number;
    montantTTC: number;
  } {
    const quantite = ligne.quantite || 0;
    const prixUnitaire = ligne.prixUnitaire || 0;
    const remise = ligne.remise || 0;
    const tva = ligne.tva || 20;

    const montantBrut = quantite * prixUnitaire;
    const montantRemise = montantBrut * (remise / 100);
    const montantHT = montantBrut - montantRemise;
    const montantTVA = montantHT * (tva / 100);
    const montantTTC = montantHT + montantTVA;

    return { montantHT, montantTVA, montantTTC };
  }
}
