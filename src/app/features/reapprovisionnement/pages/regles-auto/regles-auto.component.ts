/**
 * Configuration des règles de réapprovisionnement automatique (PREMIUM)
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '@services/notification.service';

interface RegleReappro {
  id: string;
  nom: string;
  description: string;
  actif: boolean;
  type: 'SEUIL_MIN' | 'PREVISION' | 'SAISONNIER' | 'COMMANDE_AUTO';
  conditions: {
    seuilStock?: number;
    joursAvantRupture?: number;
    categorieId?: string;
    fournisseurId?: string;
  };
  actions: {
    quantiteCommande: 'FIXE' | 'CALCULE' | 'STOCK_MAX';
    quantiteFixe?: number;
    multiplicateur?: number;
    fournisseurPrefere?: string;
    notifierEmail?: boolean;
    commandeAuto?: boolean;
  };
  derniereExecution?: Date;
  produitsAffectes: number;
  commandesGenerees: number;
}

@Component({
  selector: 'app-regles-auto',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a routerLink="/reapprovisionnement" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Règles Automatiques</h1>
              <span class="badge-premium">Premium</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Configurez le réapprovisionnement intelligent</p>
          </div>
        </div>
        <button type="button" class="btn-primary" (click)="openCreateModal()">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nouvelle règle
        </button>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card p-4">
          <p class="text-sm text-gray-500">Règles actives</p>
          <p class="text-2xl font-bold text-success-600">{{ reglesActives() }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Produits couverts</p>
          <p class="text-2xl font-bold text-primary-600">{{ produitsCouverts() }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Commandes ce mois</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ commandesMois() }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Économies estimées</p>
          <p class="text-2xl font-bold text-success-600">{{ economiesEstimees() | number:'1.0-0' }} €</p>
        </div>
      </div>

      <!-- Liste des règles -->
      <div class="space-y-4">
        @for (regle of regles(); track regle.id) {
          <div class="card p-6">
            <div class="flex items-start justify-between">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center"
                  [class.bg-primary-100]="regle.type === 'SEUIL_MIN'"
                  [class.bg-purple-100]="regle.type === 'PREVISION'"
                  [class.bg-warning-100]="regle.type === 'SAISONNIER'"
                  [class.bg-success-100]="regle.type === 'COMMANDE_AUTO'"
                >
                  @switch (regle.type) {
                    @case ('SEUIL_MIN') {
                      <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
                      </svg>
                    }
                    @case ('PREVISION') {
                      <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                      </svg>
                    }
                    @case ('SAISONNIER') {
                      <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    }
                    @case ('COMMANDE_AUTO') {
                      <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                    }
                  }
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-3">
                    <h3 class="font-semibold text-gray-900 dark:text-white">{{ regle.nom }}</h3>
                    <span class="px-2 py-0.5 text-xs rounded-full"
                      [class.bg-success-100]="regle.actif"
                      [class.text-success-700]="regle.actif"
                      [class.bg-gray-100]="!regle.actif"
                      [class.text-gray-600]="!regle.actif"
                    >{{ regle.actif ? 'Active' : 'Inactive' }}</span>
                  </div>
                  <p class="text-sm text-gray-500 mt-1">{{ regle.description }}</p>
                  
                  <div class="flex items-center gap-6 mt-3 text-sm">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                      </svg>
                      <span class="text-gray-600">{{ regle.produitsAffectes }} produits</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                      <span class="text-gray-600">{{ regle.commandesGenerees }} commandes</span>
                    </div>
                    @if (regle.derniereExecution) {
                      <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span class="text-gray-600">{{ regle.derniereExecution | date:'dd/MM HH:mm' }}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <button type="button" class="p-2 hover:bg-gray-100 rounded-lg" title="Exécuter maintenant" (click)="executerRegle(regle)">
                  <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </button>
                <button type="button" class="p-2 hover:bg-gray-100 rounded-lg" title="Modifier" (click)="editRegle(regle)">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" [checked]="regle.actif" (change)="toggleRegle(regle)" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>

            <!-- Détails de la règle -->
            <div class="mt-4 pt-4 border-t grid gap-4 md:grid-cols-2">
              <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p class="text-xs text-gray-500 uppercase mb-2">Conditions</p>
                <ul class="text-sm text-gray-600 space-y-1">
                  @if (regle.conditions.seuilStock) {
                    <li>• Stock minimum: {{ regle.conditions.seuilStock }} unités</li>
                  }
                  @if (regle.conditions.joursAvantRupture) {
                    <li>• Jours avant rupture: {{ regle.conditions.joursAvantRupture }} jours</li>
                  }
                </ul>
              </div>
              <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p class="text-xs text-gray-500 uppercase mb-2">Actions</p>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li>• Quantité: {{ getQuantiteLabel(regle) }}</li>
                  @if (regle.actions.notifierEmail) {
                    <li>• Notification email activée</li>
                  }
                  @if (regle.actions.commandeAuto) {
                    <li class="text-success-600 font-medium">• Commande automatique</li>
                  }
                </ul>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Modèles suggérés -->
      <div class="card p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Modèles de règles suggérés</h3>
        <div class="grid gap-4 md:grid-cols-3">
          <button type="button" class="p-4 border-2 border-dashed border-gray-300 rounded-lg text-left hover:border-primary-500 hover:bg-primary-50 transition-all" (click)="creerDepuisModele('seuil')">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
                </svg>
              </div>
              <span class="font-medium text-gray-900">Seuil minimum</span>
            </div>
            <p class="text-sm text-gray-500">Commander quand le stock passe sous un seuil défini</p>
          </button>
          <button type="button" class="p-4 border-2 border-dashed border-gray-300 rounded-lg text-left hover:border-purple-500 hover:bg-purple-50 transition-all" (click)="creerDepuisModele('prevision')">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <span class="font-medium text-gray-900">Prévision IA</span>
            </div>
            <p class="text-sm text-gray-500">Commander selon les prévisions de consommation</p>
          </button>
          <button type="button" class="p-4 border-2 border-dashed border-gray-300 rounded-lg text-left hover:border-success-500 hover:bg-success-50 transition-all" (click)="creerDepuisModele('auto')">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </div>
              <span class="font-medium text-gray-900">100% Automatique</span>
            </div>
            <p class="text-sm text-gray-500">Génération et envoi automatique des commandes</p>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ReglesAutoComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  regles = signal<RegleReappro[]>([]);
  
  reglesActives = computed(() => this.regles().filter(r => r.actif).length);
  produitsCouverts = computed(() => this.regles().reduce((sum, r) => sum + r.produitsAffectes, 0));
  commandesMois = computed(() => this.regles().reduce((sum, r) => sum + r.commandesGenerees, 0));
  economiesEstimees = computed(() => this.commandesMois() * 125); // Estimation

  ngOnInit(): void {
    this.loadRegles();
  }

  loadRegles(): void {
    this.regles.set([
      {
        id: '1',
        nom: 'Seuil critique - Tous produits',
        description: 'Commande automatique quand le stock passe sous 20% du stock max',
        actif: true,
        type: 'SEUIL_MIN',
        conditions: { seuilStock: 20 },
        actions: { quantiteCommande: 'STOCK_MAX', notifierEmail: true, commandeAuto: false },
        derniereExecution: new Date(Date.now() - 3600000),
        produitsAffectes: 245,
        commandesGenerees: 12
      },
      {
        id: '2',
        nom: 'Prévision IA - Électronique',
        description: 'Commander 14 jours avant la rupture estimée basée sur les prévisions',
        actif: true,
        type: 'PREVISION',
        conditions: { joursAvantRupture: 14, categorieId: 'electronique' },
        actions: { quantiteCommande: 'CALCULE', multiplicateur: 1.2, notifierEmail: true, commandeAuto: true },
        derniereExecution: new Date(Date.now() - 7200000),
        produitsAffectes: 89,
        commandesGenerees: 8
      },
      {
        id: '3',
        nom: 'Réappro saisonnière - Noël',
        description: 'Augmentation automatique des stocks pour la période de Noël',
        actif: false,
        type: 'SAISONNIER',
        conditions: {},
        actions: { quantiteCommande: 'CALCULE', multiplicateur: 2, notifierEmail: true, commandeAuto: false },
        produitsAffectes: 156,
        commandesGenerees: 0
      }
    ]);
  }

  getQuantiteLabel(regle: RegleReappro): string {
    switch (regle.actions.quantiteCommande) {
      case 'FIXE': return `${regle.actions.quantiteFixe} unités`;
      case 'CALCULE': return `Calculée (x${regle.actions.multiplicateur || 1})`;
      case 'STOCK_MAX': return 'Jusqu\'au stock max';
      default: return 'Non défini';
    }
  }

  toggleRegle(regle: RegleReappro): void {
    regle.actif = !regle.actif;
    this.notificationService.success(`Règle ${regle.actif ? 'activée' : 'désactivée'}`);
  }

  executerRegle(regle: RegleReappro): void {
    this.notificationService.info(`Exécution de la règle "${regle.nom}" en cours...`);
    setTimeout(() => {
      regle.derniereExecution = new Date();
      this.notificationService.success('Règle exécutée avec succès');
    }, 1500);
  }

  editRegle(regle: RegleReappro): void {
    this.notificationService.info('Ouverture de l\'éditeur de règle...');
  }

  openCreateModal(): void {
    this.notificationService.info('Création d\'une nouvelle règle...');
  }

  creerDepuisModele(type: string): void {
    this.notificationService.success(`Création d'une règle depuis le modèle "${type}"`);
  }
}
