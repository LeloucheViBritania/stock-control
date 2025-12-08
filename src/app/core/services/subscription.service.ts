import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TierAbonnement } from '../../../shared/models/enums.model';

export interface SubscriptionStatus {
  tierAbonnement: TierAbonnement;
  estActif: boolean;
  dateExpiration?: Date;
  joursRestants?: number;
  autoRenew?: boolean;
}

export interface FeatureAccess {
  feature: string;
  nom: string;
  description: string;
  estDisponible: boolean;
  tier: TierAbonnement;
}

export interface UpgradeResponse {
  message: string;
  nouveauTier: TierAbonnement;
  dateExpiration: Date;
  montant?: number;
}

export interface DowngradeResponse {
  message: string;
  ancienTier: TierAbonnement;
  nouveauTier: TierAbonnement;
  dateEffective: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = `${environment.apiUrl}/subscription`;

  constructor(private http: HttpClient) {}

  /**
   * Vérifie le statut de l'abonnement de l'utilisateur actuel
   * GET /api/subscription/status
   */
  checkStatus(): Observable<SubscriptionStatus> {
    return this.http.get<SubscriptionStatus>(`${this.apiUrl}/status`);
  }

  /**
   * Obtient la liste des fonctionnalités disponibles selon le tier
   * GET /api/subscription/features
   */
  getFeatures(): Observable<FeatureAccess[]> {
    return this.http.get<FeatureAccess[]>(`${this.apiUrl}/features`);
  }

  /**
   * Upgrade vers PREMIUM
   * POST /api/subscription/upgrade
   */
  upgrade(): Observable<UpgradeResponse> {
    return this.http.post<UpgradeResponse>(`${this.apiUrl}/upgrade`, {});
  }

  /**
   * Downgrade vers GRATUIT
   * POST /api/subscription/downgrade
   */
  downgrade(): Observable<DowngradeResponse> {
    return this.http.post<DowngradeResponse>(`${this.apiUrl}/downgrade`, {});
  }
}
