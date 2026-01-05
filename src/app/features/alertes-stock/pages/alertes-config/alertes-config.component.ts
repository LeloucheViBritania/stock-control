/**
 * Configuration des Alertes Stock (PREMIUM)
 */
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '@services/notification.service';

interface RegleAlerte {
  id: string;
  nom: string;
  type: 'RUPTURE' | 'SEUIL_BAS' | 'SURSTOCK' | 'PEREMPTION' | 'ECART';
  actif: boolean;
  conditions: {
    seuilPourcentage?: number;
    joursAvant?: number;
    ecartMaximum?: number;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  destinataires: string[];
  priorite: 'CRITIQUE' | 'HAUTE' | 'MOYENNE' | 'BASSE';
}

@Component({
  selector: 'app-alertes-config',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a routerLink="/alertes-stock" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Configuration des Alertes</h1>
              <span class="badge-premium">Premium</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Personnalisez vos règles d'alerte</p>
          </div>
        </div>
        <button type="button" class="btn-primary" (click)="sauvegarder()">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          Sauvegarder
        </button>
      </div>

      <!-- Paramètres globaux -->
      <div class="card p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Paramètres globaux</h3>
        <div class="grid gap-6 md:grid-cols-2">
          <div>
            <label class="form-label">Fréquence de vérification</label>
            <select [(ngModel)]="configGlobale.frequence" class="form-input">
              <option value="TEMPS_REEL">Temps réel</option>
              <option value="5MIN">Toutes les 5 minutes</option>
              <option value="15MIN">Toutes les 15 minutes</option>
              <option value="HORAIRE">Toutes les heures</option>
              <option value="QUOTIDIEN">Quotidien</option>
            </select>
          </div>
          <div>
            <label class="form-label">Email de notification</label>
            <input type="email" [(ngModel)]="configGlobale.emailNotification" class="form-input" placeholder="alertes@example.com" />
          </div>
        </div>
        <div class="flex flex-wrap gap-6 mt-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" [(ngModel)]="configGlobale.notifEmail" class="rounded border-gray-300" />
            <span class="text-sm">Notifications email</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" [(ngModel)]="configGlobale.notifPush" class="rounded border-gray-300" />
            <span class="text-sm">Notifications push</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" [(ngModel)]="configGlobale.notifSms" class="rounded border-gray-300" />
            <span class="text-sm">Notifications SMS</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" [(ngModel)]="configGlobale.regrouper" class="rounded border-gray-300" />
            <span class="text-sm">Regrouper les alertes</span>
          </label>
        </div>
      </div>

      <!-- Règles d'alerte -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 dark:text-white">Règles d'alerte</h3>
          <button type="button" class="btn-secondary text-sm" (click)="ajouterRegle()">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouvelle règle
          </button>
        </div>

        @for (regle of regles(); track regle.id) {
          <div class="card p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" [(ngModel)]="regle.actif" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
                <input type="text" [(ngModel)]="regle.nom" class="text-lg font-semibold bg-transparent border-none focus:ring-0 p-0" />
              </div>
              <button type="button" class="text-danger-500 hover:text-danger-700" (click)="supprimerRegle(regle.id)">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>

            <div class="grid gap-4 md:grid-cols-3">
              <div>
                <label class="form-label">Type d'alerte</label>
                <select [(ngModel)]="regle.type" class="form-input">
                  <option value="RUPTURE">Rupture de stock</option>
                  <option value="SEUIL_BAS">Stock sous seuil</option>
                  <option value="SURSTOCK">Surstock</option>
                  <option value="PEREMPTION">Péremption proche</option>
                  <option value="ECART">Écart inventaire</option>
                </select>
              </div>
              <div>
                <label class="form-label">Priorité</label>
                <select [(ngModel)]="regle.priorite" class="form-input">
                  <option value="CRITIQUE">Critique</option>
                  <option value="HAUTE">Haute</option>
                  <option value="MOYENNE">Moyenne</option>
                  <option value="BASSE">Basse</option>
                </select>
              </div>
              <div>
                @switch (regle.type) {
                  @case ('SEUIL_BAS') {
                    <label class="form-label">Seuil (%)</label>
                    <input type="number" [(ngModel)]="regle.conditions.seuilPourcentage" class="form-input" min="0" max="100" />
                  }
                  @case ('SURSTOCK') {
                    <label class="form-label">% au-dessus du max</label>
                    <input type="number" [(ngModel)]="regle.conditions.seuilPourcentage" class="form-input" min="0" />
                  }
                  @case ('PEREMPTION') {
                    <label class="form-label">Jours avant expiration</label>
                    <input type="number" [(ngModel)]="regle.conditions.joursAvant" class="form-input" min="1" />
                  }
                  @case ('ECART') {
                    <label class="form-label">Écart max (%)</label>
                    <input type="number" [(ngModel)]="regle.conditions.ecartMaximum" class="form-input" min="0" />
                  }
                  @default {
                    <label class="form-label">Paramètre</label>
                    <input type="number" class="form-input" disabled placeholder="N/A" />
                  }
                }
              </div>
            </div>

            <div class="mt-4 pt-4 border-t">
              <p class="text-sm text-gray-500 mb-2">Canaux de notification</p>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="regle.notifications.email" class="rounded border-gray-300" />
                  <span class="text-sm">Email</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="regle.notifications.push" class="rounded border-gray-300" />
                  <span class="text-sm">Push</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="regle.notifications.sms" class="rounded border-gray-300" />
                  <span class="text-sm">SMS</span>
                </label>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Modèles prédéfinis -->
      <div class="card p-6 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Modèles prédéfinis</h3>
        <div class="grid gap-4 md:grid-cols-3">
          <button type="button" class="p-4 bg-white dark:bg-gray-800 rounded-lg text-left hover:shadow-md transition-shadow" (click)="chargerModele('ecommerce')">
            <p class="font-medium text-gray-900 dark:text-white">🛒 E-commerce</p>
            <p class="text-sm text-gray-500 mt-1">Optimisé pour la vente en ligne avec alertes rupture rapides</p>
          </button>
          <button type="button" class="p-4 bg-white dark:bg-gray-800 rounded-lg text-left hover:shadow-md transition-shadow" (click)="chargerModele('retail')">
            <p class="font-medium text-gray-900 dark:text-white">🏪 Retail</p>
            <p class="text-sm text-gray-500 mt-1">Adapté aux magasins physiques avec gestion péremption</p>
          </button>
          <button type="button" class="p-4 bg-white dark:bg-gray-800 rounded-lg text-left hover:shadow-md transition-shadow" (click)="chargerModele('industrie')">
            <p class="font-medium text-gray-900 dark:text-white">🏭 Industrie</p>
            <p class="text-sm text-gray-500 mt-1">Focus sur les écarts d'inventaire et surstock</p>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class AlertesConfigComponent {
  private readonly notificationService = inject(NotificationService);

  configGlobale = {
    frequence: 'HORAIRE',
    emailNotification: '',
    notifEmail: true,
    notifPush: true,
    notifSms: false,
    regrouper: true
  };

  regles = signal<RegleAlerte[]>([
    { id: '1', nom: 'Alerte rupture critique', type: 'RUPTURE', actif: true, conditions: {}, notifications: { email: true, push: true, sms: true }, destinataires: [], priorite: 'CRITIQUE' },
    { id: '2', nom: 'Stock bas standard', type: 'SEUIL_BAS', actif: true, conditions: { seuilPourcentage: 20 }, notifications: { email: true, push: true, sms: false }, destinataires: [], priorite: 'HAUTE' },
    { id: '3', nom: 'Surstock entrepôt', type: 'SURSTOCK', actif: false, conditions: { seuilPourcentage: 150 }, notifications: { email: true, push: false, sms: false }, destinataires: [], priorite: 'MOYENNE' },
  ]);

  ajouterRegle(): void {
    const newRegle: RegleAlerte = {
      id: Date.now().toString(),
      nom: 'Nouvelle règle',
      type: 'SEUIL_BAS',
      actif: true,
      conditions: { seuilPourcentage: 20 },
      notifications: { email: true, push: false, sms: false },
      destinataires: [],
      priorite: 'MOYENNE'
    };
    this.regles.update(r => [...r, newRegle]);
  }

  supprimerRegle(id: string): void {
    this.regles.update(r => r.filter(x => x.id !== id));
    this.notificationService.warning('Règle supprimée');
  }

  chargerModele(modele: string): void {
    this.notificationService.success(`Modèle "${modele}" chargé`);
  }

  sauvegarder(): void {
    this.notificationService.success('Configuration sauvegardée avec succès');
  }
}
