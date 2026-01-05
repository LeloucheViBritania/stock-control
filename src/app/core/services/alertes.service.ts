/**
 * Service d'alertes automatiques (PREMIUM)
 */
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, startWith } from 'rxjs';
import { environment } from '@env/environment';

export interface Alerte {
  id: string;
  type: 'STOCK_FAIBLE' | 'RUPTURE' | 'PEREMPTION' | 'COMMANDE_RETARD' | 'INVENTAIRE' | 'SYSTEME';
  niveau: 'INFO' | 'WARNING' | 'CRITICAL';
  titre: string;
  message: string;
  entite?: string;
  entiteId?: string;
  data?: Record<string, any>;
  lue: boolean;
  traitee: boolean;
  dateCreation: Date;
  dateTraitement?: Date;
}

export interface AlerteConfig {
  stockFaibleActif: boolean;
  seuilStockFaible: number;
  ruptureActif: boolean;
  peremptionActif: boolean;
  joursAvantPeremption: number;
  commandeRetardActif: boolean;
  joursRetard: number;
  notificationEmail: boolean;
  notificationPush: boolean;
}

@Injectable({ providedIn: 'root' })
export class AlertesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/alertes`;

  private alertesSignal = signal<Alerte[]>([]);
  readonly alertes = this.alertesSignal.asReadonly();

  readonly alertesNonLues = computed(() => this.alertesSignal().filter(a => !a.lue));
  readonly alertesCritiques = computed(() => this.alertesSignal().filter(a => a.niveau === 'CRITICAL' && !a.traitee));
  readonly nombreNonLues = computed(() => this.alertesNonLues().length);

  getAlertes(page = 1, limit = 50, type?: string): Observable<{
    data: Alerte[];
    meta: { total: number; page: number; limit: number };
  }> {
    const params: any = { page, limit };
    if (type) params.type = type;
    return this.http.get<any>(this.apiUrl, { params });
  }

  marquerCommeLue(id: string): Observable<Alerte> {
    return this.http.patch<Alerte>(`${this.apiUrl}/${id}/lue`, {});
  }

  marquerCommeTraitee(id: string): Observable<Alerte> {
    return this.http.patch<Alerte>(`${this.apiUrl}/${id}/traitee`, {});
  }

  marquerToutesLues(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/marquer-toutes-lues`, {});
  }

  supprimerAlerte(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getConfig(): Observable<AlerteConfig> {
    return this.http.get<AlerteConfig>(`${this.apiUrl}/config`);
  }

  updateConfig(config: Partial<AlerteConfig>): Observable<AlerteConfig> {
    return this.http.patch<AlerteConfig>(`${this.apiUrl}/config`, config);
  }

  // Polling automatique
  startPolling(intervalMs = 60000): void {
    interval(intervalMs).pipe(
      startWith(0),
      switchMap(() => this.getAlertes(1, 100))
    ).subscribe({
      next: (response) => this.alertesSignal.set(response.data)
    });
  }

  // Rafraîchir manuellement
  refresh(): void {
    this.getAlertes(1, 100).subscribe({
      next: (response) => this.alertesSignal.set(response.data)
    });
  }

  // Helpers
  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'STOCK_FAIBLE': '📦',
      'RUPTURE': '🚨',
      'PEREMPTION': '⏰',
      'COMMANDE_RETARD': '📋',
      'INVENTAIRE': '📝',
      'SYSTEME': '⚙️'
    };
    return icons[type] || '📌';
  }

  getNiveauClass(niveau: string): string {
    const classes: Record<string, string> = {
      'INFO': 'bg-info-100 text-info-700 border-info-200',
      'WARNING': 'bg-warning-100 text-warning-700 border-warning-200',
      'CRITICAL': 'bg-danger-100 text-danger-700 border-danger-200'
    };
    return classes[niveau] || '';
  }
}
