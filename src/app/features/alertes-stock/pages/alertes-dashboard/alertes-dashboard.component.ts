/**
 * Dashboard Alertes Stock (PREMIUM)
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '@services/notification.service';

interface AlerteStock {
  id: string;
  type: 'RUPTURE' | 'SEUIL_BAS' | 'SURSTOCK' | 'PEREMPTION' | 'ECART';
  priorite: 'CRITIQUE' | 'HAUTE' | 'MOYENNE' | 'BASSE';
  produit: { id: string; nom: string; reference: string; stock: number; seuilMin: number; seuilMax: number };
  message: string;
  dateCreation: Date;
  dateResolution?: Date;
  statut: 'ACTIVE' | 'EN_COURS' | 'RESOLUE' | 'IGNOREE';
  actionSuggeree: string;
  entrepot?: string;
}

@Component({
  selector: 'app-alertes-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Centre d'Alertes</h1>
            <span class="badge-premium">Premium</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Surveillance intelligente de votre stock</p>
        </div>
        <div class="flex gap-2">
          <button type="button" class="btn-secondary" (click)="configurerAlertes()">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Configurer
          </button>
          <button type="button" class="btn-primary" (click)="marquerToutesLues()">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Tout marquer lu
          </button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="card p-4 border-l-4 border-danger-500">
          <p class="text-sm text-gray-500">Critiques</p>
          <p class="text-3xl font-bold text-danger-600">{{ alertesCritiques() }}</p>
        </div>
        <div class="card p-4 border-l-4 border-warning-500">
          <p class="text-sm text-gray-500">Haute priorité</p>
          <p class="text-3xl font-bold text-warning-600">{{ alertesHautes() }}</p>
        </div>
        <div class="card p-4 border-l-4 border-primary-500">
          <p class="text-sm text-gray-500">Moyennes</p>
          <p class="text-3xl font-bold text-primary-600">{{ alertesMoyennes() }}</p>
        </div>
        <div class="card p-4 border-l-4 border-success-500">
          <p class="text-sm text-gray-500">Résolues (7j)</p>
          <p class="text-3xl font-bold text-success-600">{{ alertesResolues() }}</p>
        </div>
        <div class="card p-4 border-l-4 border-gray-500">
          <p class="text-sm text-gray-500">Temps moyen résolution</p>
          <p class="text-3xl font-bold text-gray-700">{{ tempsResolution() }}h</p>
        </div>
      </div>

      <!-- Filtres -->
      <div class="card p-4">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-48">
            <input type="text" [(ngModel)]="searchQuery" placeholder="Rechercher..." class="form-input w-full" />
          </div>
          <select [(ngModel)]="filterType" class="form-input">
            <option value="">Tous les types</option>
            <option value="RUPTURE">Rupture de stock</option>
            <option value="SEUIL_BAS">Seuil bas</option>
            <option value="SURSTOCK">Surstock</option>
            <option value="PEREMPTION">Péremption</option>
            <option value="ECART">Écart inventaire</option>
          </select>
          <select [(ngModel)]="filterPriorite" class="form-input">
            <option value="">Toutes priorités</option>
            <option value="CRITIQUE">Critique</option>
            <option value="HAUTE">Haute</option>
            <option value="MOYENNE">Moyenne</option>
            <option value="BASSE">Basse</option>
          </select>
          <select [(ngModel)]="filterStatut" class="form-input">
            <option value="">Tous statuts</option>
            <option value="ACTIVE">Active</option>
            <option value="EN_COURS">En cours</option>
            <option value="RESOLUE">Résolue</option>
          </select>
        </div>
      </div>

      <!-- Liste des alertes -->
      <div class="space-y-4">
        @for (alerte of alertesFiltrees(); track alerte.id) {
          <div class="card p-4 transition-all hover:shadow-md"
            [class.border-l-4]="true"
            [class.border-danger-500]="alerte.priorite === 'CRITIQUE'"
            [class.border-warning-500]="alerte.priorite === 'HAUTE'"
            [class.border-primary-500]="alerte.priorite === 'MOYENNE'"
            [class.border-gray-300]="alerte.priorite === 'BASSE'"
            [class.opacity-60]="alerte.statut === 'RESOLUE' || alerte.statut === 'IGNOREE'"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center"
                  [class.bg-danger-100]="alerte.type === 'RUPTURE'"
                  [class.bg-warning-100]="alerte.type === 'SEUIL_BAS'"
                  [class.bg-purple-100]="alerte.type === 'SURSTOCK'"
                  [class.bg-orange-100]="alerte.type === 'PEREMPTION'"
                  [class.bg-primary-100]="alerte.type === 'ECART'"
                >
                  @switch (alerte.type) {
                    @case ('RUPTURE') {
                      <svg class="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                      </svg>
                    }
                    @case ('SEUIL_BAS') {
                      <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
                      </svg>
                    }
                    @case ('SURSTOCK') {
                      <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                      </svg>
                    }
                    @case ('PEREMPTION') {
                      <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    }
                    @default {
                      <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                    }
                  }
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-3">
                    <a [routerLink]="['/produits', alerte.produit.id]" class="font-semibold text-gray-900 dark:text-white hover:text-primary-600">
                      {{ alerte.produit.nom }}
                    </a>
                    <span class="px-2 py-0.5 text-xs rounded-full"
                      [class.bg-danger-100]="alerte.priorite === 'CRITIQUE'"
                      [class.text-danger-700]="alerte.priorite === 'CRITIQUE'"
                      [class.bg-warning-100]="alerte.priorite === 'HAUTE'"
                      [class.text-warning-700]="alerte.priorite === 'HAUTE'"
                      [class.bg-primary-100]="alerte.priorite === 'MOYENNE'"
                      [class.text-primary-700]="alerte.priorite === 'MOYENNE'"
                      [class.bg-gray-100]="alerte.priorite === 'BASSE'"
                      [class.text-gray-700]="alerte.priorite === 'BASSE'"
                    >{{ alerte.priorite }}</span>
                    <span class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">{{ getTypeLabel(alerte.type) }}</span>
                  </div>
                  <p class="text-sm text-gray-500 mt-1">Réf: {{ alerte.produit.reference }}</p>
                  <p class="text-sm text-gray-700 dark:text-gray-300 mt-2">{{ alerte.message }}</p>
                  
                  <!-- Stock info -->
                  <div class="flex items-center gap-4 mt-3">
                    <div class="text-sm">
                      <span class="text-gray-500">Stock actuel:</span>
                      <span class="font-semibold ml-1" [class.text-danger-600]="alerte.produit.stock <= alerte.produit.seuilMin">
                        {{ alerte.produit.stock }}
                      </span>
                    </div>
                    <div class="text-sm">
                      <span class="text-gray-500">Seuil min:</span>
                      <span class="font-semibold ml-1">{{ alerte.produit.seuilMin }}</span>
                    </div>
                    @if (alerte.entrepot) {
                      <div class="text-sm">
                        <span class="text-gray-500">Entrepôt:</span>
                        <span class="font-semibold ml-1">{{ alerte.entrepot }}</span>
                      </div>
                    }
                  </div>

                  <!-- Action suggérée -->
                  <div class="mt-3 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <p class="text-sm text-primary-700 dark:text-primary-300">
                      <span class="font-medium">💡 Suggestion:</span> {{ alerte.actionSuggeree }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex flex-col items-end gap-2">
                <span class="text-xs text-gray-500">{{ alerte.dateCreation | date:'dd/MM HH:mm' }}</span>
                @if (alerte.statut === 'ACTIVE') {
                  <div class="flex gap-1">
                    <button type="button" class="p-2 hover:bg-success-100 rounded-lg text-success-600" title="Résoudre" (click)="resoudreAlerte(alerte)">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </button>
                    <button type="button" class="p-2 hover:bg-warning-100 rounded-lg text-warning-600" title="En cours" (click)="mettreEnCours(alerte)">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </button>
                    <button type="button" class="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="Ignorer" (click)="ignorerAlerte(alerte)">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                } @else {
                  <span class="px-2 py-1 text-xs rounded-full"
                    [class.bg-success-100]="alerte.statut === 'RESOLUE'"
                    [class.text-success-700]="alerte.statut === 'RESOLUE'"
                    [class.bg-warning-100]="alerte.statut === 'EN_COURS'"
                    [class.text-warning-700]="alerte.statut === 'EN_COURS'"
                    [class.bg-gray-100]="alerte.statut === 'IGNOREE'"
                    [class.text-gray-700]="alerte.statut === 'IGNOREE'"
                  >{{ alerte.statut }}</span>
                }
              </div>
            </div>
          </div>
        } @empty {
          <div class="card p-12 text-center">
            <svg class="w-16 h-16 mx-auto text-success-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Aucune alerte</h3>
            <p class="text-gray-500 mt-1">Tout est sous contrôle ! 🎉</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class AlertesDashboardComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  alertes = signal<AlerteStock[]>([]);
  searchQuery = '';
  filterType = '';
  filterPriorite = '';
  filterStatut = '';

  alertesCritiques = computed(() => this.alertes().filter(a => a.priorite === 'CRITIQUE' && a.statut === 'ACTIVE').length);
  alertesHautes = computed(() => this.alertes().filter(a => a.priorite === 'HAUTE' && a.statut === 'ACTIVE').length);
  alertesMoyennes = computed(() => this.alertes().filter(a => a.priorite === 'MOYENNE' && a.statut === 'ACTIVE').length);
  alertesResolues = computed(() => this.alertes().filter(a => a.statut === 'RESOLUE').length);
  tempsResolution = signal(4.5);

  alertesFiltrees = computed(() => {
    return this.alertes().filter(a => {
      if (this.searchQuery && !a.produit.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) && 
          !a.produit.reference.toLowerCase().includes(this.searchQuery.toLowerCase())) return false;
      if (this.filterType && a.type !== this.filterType) return false;
      if (this.filterPriorite && a.priorite !== this.filterPriorite) return false;
      if (this.filterStatut && a.statut !== this.filterStatut) return false;
      return true;
    });
  });

  ngOnInit(): void {
    this.loadAlertes();
  }

  loadAlertes(): void {
    this.alertes.set([
      { id: '1', type: 'RUPTURE', priorite: 'CRITIQUE', produit: { id: '1', nom: 'Écran LCD 27"', reference: 'ECR-027', stock: 0, seuilMin: 10, seuilMax: 100 }, message: 'Stock épuisé - 5 commandes en attente', dateCreation: new Date(), statut: 'ACTIVE', actionSuggeree: 'Commander 50 unités chez Fournisseur A', entrepot: 'Paris Central' },
      { id: '2', type: 'SEUIL_BAS', priorite: 'HAUTE', produit: { id: '2', nom: 'Clavier mécanique', reference: 'CLV-MEC-01', stock: 8, seuilMin: 15, seuilMax: 80 }, message: 'Stock sous le seuil minimum', dateCreation: new Date(Date.now() - 3600000), statut: 'ACTIVE', actionSuggeree: 'Prévoir réapprovisionnement sous 48h' },
      { id: '3', type: 'SURSTOCK', priorite: 'MOYENNE', produit: { id: '3', nom: 'Câble HDMI 2m', reference: 'CAB-HDMI-2', stock: 450, seuilMin: 50, seuilMax: 200 }, message: 'Stock 125% au-dessus du maximum', dateCreation: new Date(Date.now() - 86400000), statut: 'ACTIVE', actionSuggeree: 'Envisager promotion ou transfert vers autre entrepôt' },
      { id: '4', type: 'PEREMPTION', priorite: 'HAUTE', produit: { id: '4', nom: 'Cartouche encre HP', reference: 'ENC-HP-BK', stock: 25, seuilMin: 10, seuilMax: 50 }, message: '25 unités expirent dans 30 jours', dateCreation: new Date(Date.now() - 7200000), statut: 'EN_COURS', actionSuggeree: 'Prioriser ces articles pour les prochaines ventes' },
      { id: '5', type: 'SEUIL_BAS', priorite: 'BASSE', produit: { id: '5', nom: 'Souris sans fil', reference: 'SOU-SF-01', stock: 12, seuilMin: 20, seuilMax: 100 }, message: 'Stock légèrement sous le seuil', dateCreation: new Date(Date.now() - 172800000), statut: 'RESOLUE', actionSuggeree: 'Commande passée', dateResolution: new Date(Date.now() - 86400000) },
    ]);
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = { 'RUPTURE': 'Rupture', 'SEUIL_BAS': 'Seuil bas', 'SURSTOCK': 'Surstock', 'PEREMPTION': 'Péremption', 'ECART': 'Écart' };
    return labels[type] || type;
  }

  resoudreAlerte(alerte: AlerteStock): void {
    alerte.statut = 'RESOLUE';
    alerte.dateResolution = new Date();
    this.notificationService.success('Alerte marquée comme résolue');
  }

  mettreEnCours(alerte: AlerteStock): void {
    alerte.statut = 'EN_COURS';
    this.notificationService.info('Alerte en cours de traitement');
  }

  ignorerAlerte(alerte: AlerteStock): void {
    alerte.statut = 'IGNOREE';
    this.notificationService.warning('Alerte ignorée');
  }

  marquerToutesLues(): void {
    this.notificationService.success('Toutes les alertes ont été marquées comme lues');
  }

  configurerAlertes(): void {
    this.notificationService.info('Configuration des alertes...');
  }
}
