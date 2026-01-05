/**
 * Planning des Transferts (PREMIUM)
 * Vue calendrier pour planifier et visualiser les transferts
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '@services/notification.service';

interface TransfertPlanifie {
  id: string;
  reference: string;
  entrepotSource: string;
  entrepotDestination: string;
  datePlanifiee: Date;
  statut: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
  priorite: 'HAUTE' | 'NORMALE' | 'BASSE';
  nombreProduits: number;
  valeurEstimee: number;
  responsable: string;
}

interface JourCalendrier {
  date: Date;
  estMoisCourant: boolean;
  estAujourdhui: boolean;
  transferts: TransfertPlanifie[];
}

@Component({
  selector: 'app-transferts-planning',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a routerLink="/transferts-stock" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Planning Transferts</h1>
              <span class="badge-premium">Premium</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Planifiez et suivez vos transferts</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button type="button" class="btn-secondary" (click)="vueActuelle = vueActuelle === 'mois' ? 'semaine' : 'mois'">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
            </svg>
            Vue {{ vueActuelle === 'mois' ? 'Semaine' : 'Mois' }}
          </button>
          <a routerLink="/transferts-stock/nouveau" class="btn-primary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouveau transfert
          </a>
        </div>
      </div>

      <!-- Navigation mois -->
      <div class="card p-4">
        <div class="flex items-center justify-between">
          <button type="button" class="p-2 hover:bg-gray-100 rounded-lg" (click)="moisPrecedent()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ getMoisAnnee() }}
          </h2>
          <button type="button" class="p-2 hover:bg-gray-100 rounded-lg" (click)="moisSuivant()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <!-- Légende -->
        <div class="flex items-center gap-4 mt-4 text-sm">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-warning-500"></span>
            <span class="text-gray-600">Planifié</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-primary-500"></span>
            <span class="text-gray-600">En cours</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-success-500"></span>
            <span class="text-gray-600">Terminé</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-danger-500"></span>
            <span class="text-gray-600">Priorité haute</span>
          </div>
        </div>
      </div>

      <!-- Calendrier -->
      <div class="card overflow-hidden">
        <!-- En-têtes jours -->
        <div class="grid grid-cols-7 bg-gray-50 dark:bg-gray-800 border-b">
          @for (jour of joursHeader; track jour) {
            <div class="p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
              {{ jour }}
            </div>
          }
        </div>

        <!-- Grille calendrier -->
        <div class="grid grid-cols-7">
          @for (jour of joursCalendrier(); track jour.date.getTime()) {
            <div class="min-h-32 p-2 border-b border-r last:border-r-0"
              [class.bg-gray-50]="!jour.estMoisCourant"
              [class.bg-primary-50]="jour.estAujourdhui"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium"
                  [class.text-gray-400]="!jour.estMoisCourant"
                  [class.text-primary-600]="jour.estAujourdhui"
                  [class.font-bold]="jour.estAujourdhui"
                >{{ jour.date.getDate() }}</span>
                @if (jour.transferts.length > 0) {
                  <span class="text-xs px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                    {{ jour.transferts.length }}
                  </span>
                }
              </div>

              <!-- Transferts du jour -->
              <div class="space-y-1">
                @for (transfert of jour.transferts.slice(0, 3); track transfert.id) {
                  <button type="button" 
                    class="w-full text-left p-1.5 rounded text-xs truncate"
                    [class.bg-warning-100]="transfert.statut === 'PLANIFIE'"
                    [class.text-warning-800]="transfert.statut === 'PLANIFIE'"
                    [class.bg-primary-100]="transfert.statut === 'EN_COURS'"
                    [class.text-primary-800]="transfert.statut === 'EN_COURS'"
                    [class.bg-success-100]="transfert.statut === 'TERMINE'"
                    [class.text-success-800]="transfert.statut === 'TERMINE'"
                    [class.border-l-2]="transfert.priorite === 'HAUTE'"
                    [class.border-danger-500]="transfert.priorite === 'HAUTE'"
                    (click)="selectTransfert(transfert)"
                  >
                    <span class="font-medium">{{ transfert.reference }}</span>
                    <br>
                    <span class="opacity-75">{{ transfert.entrepotSource }} → {{ transfert.entrepotDestination }}</span>
                  </button>
                }
                @if (jour.transferts.length > 3) {
                  <button type="button" class="w-full text-xs text-primary-600 hover:underline text-left">
                    +{{ jour.transferts.length - 3 }} autres
                  </button>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Détail transfert sélectionné -->
      @if (transfertSelectionne()) {
        <div class="card p-6">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ transfertSelectionne()!.reference }}
              </h3>
              <p class="text-gray-500 mt-1">
                {{ transfertSelectionne()!.entrepotSource }} → {{ transfertSelectionne()!.entrepotDestination }}
              </p>
            </div>
            <div class="flex gap-2">
              <a [routerLink]="['/transferts-stock', transfertSelectionne()!.id]" class="btn-secondary">
                Voir détails
              </a>
              <button type="button" class="btn-primary" (click)="transfertSelectionne.set(null)">
                Fermer
              </button>
            </div>
          </div>

          <div class="grid grid-cols-4 gap-4 mt-4">
            <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p class="text-sm text-gray-500">Date planifiée</p>
              <p class="font-semibold">{{ transfertSelectionne()!.datePlanifiee | date:'dd/MM/yyyy' }}</p>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p class="text-sm text-gray-500">Produits</p>
              <p class="font-semibold">{{ transfertSelectionne()!.nombreProduits }}</p>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p class="text-sm text-gray-500">Valeur estimée</p>
              <p class="font-semibold">{{ transfertSelectionne()!.valeurEstimee | number:'1.0-0' }} €</p>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p class="text-sm text-gray-500">Responsable</p>
              <p class="font-semibold">{{ transfertSelectionne()!.responsable }}</p>
            </div>
          </div>
        </div>
      }

      <!-- Liste des prochains transferts -->
      <div class="card p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Prochains transferts planifiés</h3>
        <div class="space-y-3">
          @for (transfert of prochainsTransferts(); track transfert.id) {
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-lg flex items-center justify-center"
                  [class.bg-warning-100]="transfert.statut === 'PLANIFIE'"
                  [class.bg-primary-100]="transfert.statut === 'EN_COURS'"
                >
                  <svg class="w-6 h-6" 
                    [class.text-warning-600]="transfert.statut === 'PLANIFIE'"
                    [class.text-primary-600]="transfert.statut === 'EN_COURS'"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">{{ transfert.reference }}</p>
                  <p class="text-sm text-gray-500">{{ transfert.entrepotSource }} → {{ transfert.entrepotDestination }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-medium">{{ transfert.datePlanifiee | date:'dd/MM/yyyy' }}</p>
                <p class="text-sm text-gray-500">{{ transfert.nombreProduits }} produits</p>
              </div>
            </div>
          } @empty {
            <p class="text-center text-gray-500 py-4">Aucun transfert planifié</p>
          }
        </div>
      </div>
    </div>
  `,
})
export class TransfertsPlanningComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  joursHeader = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  vueActuelle: 'mois' | 'semaine' = 'mois';
  moisActuel = new Date();
  
  transferts = signal<TransfertPlanifie[]>([]);
  transfertSelectionne = signal<TransfertPlanifie | null>(null);

  joursCalendrier = computed(() => this.genererCalendrier());
  prochainsTransferts = computed(() => 
    this.transferts()
      .filter(t => t.statut === 'PLANIFIE' || t.statut === 'EN_COURS')
      .sort((a, b) => a.datePlanifiee.getTime() - b.datePlanifiee.getTime())
      .slice(0, 5)
  );

  ngOnInit(): void {
    this.loadTransferts();
  }

  loadTransferts(): void {
    const today = new Date();
    this.transferts.set([
      { id: '1', reference: 'TRF-2025-001', entrepotSource: 'Paris', entrepotDestination: 'Lyon', datePlanifiee: new Date(today.getTime() + 86400000), statut: 'PLANIFIE', priorite: 'HAUTE', nombreProduits: 45, valeurEstimee: 12500, responsable: 'Jean Dupont' },
      { id: '2', reference: 'TRF-2025-002', entrepotSource: 'Lyon', entrepotDestination: 'Marseille', datePlanifiee: new Date(today.getTime() + 172800000), statut: 'PLANIFIE', priorite: 'NORMALE', nombreProduits: 28, valeurEstimee: 8200, responsable: 'Marie Martin' },
      { id: '3', reference: 'TRF-2025-003', entrepotSource: 'Paris', entrepotDestination: 'Bordeaux', datePlanifiee: today, statut: 'EN_COURS', priorite: 'NORMALE', nombreProduits: 62, valeurEstimee: 18900, responsable: 'Pierre Bernard' },
      { id: '4', reference: 'TRF-2024-098', entrepotSource: 'Marseille', entrepotDestination: 'Paris', datePlanifiee: new Date(today.getTime() - 86400000), statut: 'TERMINE', priorite: 'BASSE', nombreProduits: 15, valeurEstimee: 4500, responsable: 'Sophie Petit' },
    ]);
  }

  getMoisAnnee(): string {
    return this.moisActuel.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  moisPrecedent(): void {
    this.moisActuel = new Date(this.moisActuel.getFullYear(), this.moisActuel.getMonth() - 1, 1);
  }

  moisSuivant(): void {
    this.moisActuel = new Date(this.moisActuel.getFullYear(), this.moisActuel.getMonth() + 1, 1);
  }

  genererCalendrier(): JourCalendrier[] {
    const jours: JourCalendrier[] = [];
    const premierJour = new Date(this.moisActuel.getFullYear(), this.moisActuel.getMonth(), 1);
    const dernierJour = new Date(this.moisActuel.getFullYear(), this.moisActuel.getMonth() + 1, 0);
    
    // Ajuster au lundi
    let debutSemaine = premierJour.getDay() - 1;
    if (debutSemaine < 0) debutSemaine = 6;
    
    const debut = new Date(premierJour);
    debut.setDate(debut.getDate() - debutSemaine);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(debut);
      date.setDate(debut.getDate() + i);
      
      const transfertsJour = this.transferts().filter(t => {
        const d = new Date(t.datePlanifiee);
        return d.toDateString() === date.toDateString();
      });

      jours.push({
        date,
        estMoisCourant: date.getMonth() === this.moisActuel.getMonth(),
        estAujourdhui: date.toDateString() === today.toDateString(),
        transferts: transfertsJour
      });
    }
    
    return jours;
  }

  selectTransfert(transfert: TransfertPlanifie): void {
    this.transfertSelectionne.set(transfert);
  }
}
