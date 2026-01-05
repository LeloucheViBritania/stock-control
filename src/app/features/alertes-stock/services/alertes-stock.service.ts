/**
 * Service Alertes Stock (PREMIUM)
 */
import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { Observable, of } from 'rxjs';

export interface AlerteStock {
  id: string;
  type: 'RUPTURE' | 'SEUIL_BAS' | 'SURSTOCK' | 'PEREMPTION' | 'ECART';
  priorite: 'CRITIQUE' | 'HAUTE' | 'MOYENNE' | 'BASSE';
  produitId: string;
  entrepotId?: string;
  message: string;
  dateCreation: Date;
  dateResolution?: Date;
  statut: 'ACTIVE' | 'EN_COURS' | 'RESOLUE' | 'IGNOREE';
  actionSuggeree: string;
}

export interface ConfigAlerte {
  seuilRupture: boolean;
  seuilBas: boolean;
  surstock: boolean;
  peremption: boolean;
  ecartInventaire: boolean;
  notificationEmail: boolean;
  notificationPush: boolean;
  frequenceVerification: 'TEMPS_REEL' | 'HORAIRE' | 'QUOTIDIEN';
}

@Injectable({ providedIn: 'root' })
export class AlertesStockService {
  private readonly api = inject(ApiService);

  private _alertes = signal<AlerteStock[]>([]);
  private _config = signal<ConfigAlerte>({
    seuilRupture: true,
    seuilBas: true,
    surstock: true,
    peremption: true,
    ecartInventaire: true,
    notificationEmail: true,
    notificationPush: true,
    frequenceVerification: 'HORAIRE'
  });

  readonly alertes = this._alertes.asReadonly();
  readonly config = this._config.asReadonly();

  getAlertes(filters?: { type?: string; priorite?: string; statut?: string }): Observable<AlerteStock[]> {
    return this.api.get<AlerteStock[]>('/alertes-stock', { params: filters as any });
  }

  getAlerteById(id: string): Observable<AlerteStock> {
    return this.api.get<AlerteStock>(`/alertes-stock/${id}`);
  }

  resoudreAlerte(id: string, commentaire?: string): Observable<AlerteStock> {
    return this.api.patch<AlerteStock>(`/alertes-stock/${id}/resoudre`, { commentaire });
  }

  ignorerAlerte(id: string, raison: string): Observable<AlerteStock> {
    return this.api.patch<AlerteStock>(`/alertes-stock/${id}/ignorer`, { raison });
  }

  getConfig(): Observable<ConfigAlerte> {
    return this.api.get<ConfigAlerte>('/alertes-stock/config');
  }

  updateConfig(config: ConfigAlerte): Observable<ConfigAlerte> {
    return this.api.put<ConfigAlerte>('/alertes-stock/config', config);
  }

  getStatistiques(periode: number = 30): Observable<any> {
    return this.api.get('/alertes-stock/statistiques', { params: { periode } });
  }
}
