/**
 * Gestion des Écarts d'Inventaire (PREMIUM)
 * Analyse et traitement des écarts détectés
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '@services/notification.service';

interface EcartInventaire {
  id: string;
  produitId: string;
  produitNom: string;
  produitReference: string;
  entrepot: string;
  zone?: string;
  stockTheorique: number;
  stockReel: number;
  ecart: number;
  ecartPourcentage: number;
  valeurEcart: number;
  dateDetection: Date;
  statut: 'A_TRAITER' | 'EN_COURS' | 'JUSTIFIE' | 'AJUSTE' | 'IGNORE';
  cause?: 'VOL' | 'CASSE' | 'ERREUR_SAISIE' | 'PEREMPTION' | 'AUTRE';
  commentaire?: string;
  traitePar?: string;
  dateTraitement?: Date;
}

@Component({
  selector: 'app-ecarts-inventaire',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a routerLink="/inventaire" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Écarts d'Inventaire</h1>
              <span class="badge-premium">Premium</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Analysez et traitez les écarts détectés</p>
          </div>
        </div>
        <button type="button" class="btn-primary" (click)="exporterEcarts()">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Exporter
        </button>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="card p-4 border-l-4 border-danger-500">
          <p class="text-sm text-gray-500">À traiter</p>
          <p class="text-3xl font-bold text-danger-600">{{ ecartsATraiter() }}</p>
        </div>
        <div class="card p-4 border-l-4 border-warning-500">
          <p class="text-sm text-gray-500">En cours</p>
          <p class="text-3xl font-bold text-warning-600">{{ ecartsEnCours() }}</p>
        </div>
        <div class="card p-4 border-l-4 border-success-500">
          <p class="text-sm text-gray-500">Résolus (30j)</p>
          <p class="text-3xl font-bold text-success-600">{{ ecartsResolus() }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Valeur écarts</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ valeurTotaleEcarts() | number:'1.0-0' }} €</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Écart moyen</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ ecartMoyen() | number:'1.1-1' }}%</p>
        </div>
      </div>

      <!-- Filtres -->
      <div class="card p-4">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-48">
            <input type="text" [(ngModel)]="searchQuery" placeholder="Rechercher produit..." class="form-input w-full" />
          </div>
          <select [(ngModel)]="filterStatut" class="form-input">
            <option value="">Tous statuts</option>
            <option value="A_TRAITER">À traiter</option>
            <option value="EN_COURS">En cours</option>
            <option value="JUSTIFIE">Justifié</option>
            <option value="AJUSTE">Ajusté</option>
          </select>
          <select [(ngModel)]="filterEntrepot" class="form-input">
            <option value="">Tous entrepôts</option>
            <option value="Paris">Paris Central</option>
            <option value="Lyon">Lyon</option>
            <option value="Marseille">Marseille</option>
          </select>
          <select [(ngModel)]="filterType" class="form-input">
            <option value="">Tout type</option>
            <option value="negatif">Manquants</option>
            <option value="positif">Excédents</option>
          </select>
        </div>
      </div>

      <!-- Tableau des écarts -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Produit</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Entrepôt</th>
                <th class="text-right py-3 px-4 font-medium text-gray-600">Théorique</th>
                <th class="text-right py-3 px-4 font-medium text-gray-600">Réel</th>
                <th class="text-right py-3 px-4 font-medium text-gray-600">Écart</th>
                <th class="text-right py-3 px-4 font-medium text-gray-600">Valeur</th>
                <th class="text-center py-3 px-4 font-medium text-gray-600">Statut</th>
                <th class="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              @for (ecart of ecartsFiltres(); track ecart.id) {
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td class="py-3 px-4">
                    <a [routerLink]="['/produits', ecart.produitId]" class="font-medium text-gray-900 dark:text-white hover:text-primary-600">
                      {{ ecart.produitNom }}
                    </a>
                    <p class="text-xs text-gray-500">{{ ecart.produitReference }}</p>
                  </td>
                  <td class="py-3 px-4">
                    <span class="text-gray-600">{{ ecart.entrepot }}</span>
                    @if (ecart.zone) {
                      <span class="text-xs text-gray-400 block">Zone: {{ ecart.zone }}</span>
                    }
                  </td>
                  <td class="py-3 px-4 text-right font-mono">{{ ecart.stockTheorique }}</td>
                  <td class="py-3 px-4 text-right font-mono">{{ ecart.stockReel }}</td>
                  <td class="py-3 px-4 text-right">
                    <span class="font-semibold" 
                      [class.text-danger-600]="ecart.ecart < 0"
                      [class.text-success-600]="ecart.ecart > 0"
                    >
                      {{ ecart.ecart > 0 ? '+' : '' }}{{ ecart.ecart }}
                    </span>
                    <span class="text-xs text-gray-400 block">({{ ecart.ecartPourcentage | number:'1.1-1' }}%)</span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <span class="font-medium" [class.text-danger-600]="ecart.valeurEcart < 0">
                      {{ ecart.valeurEcart | number:'1.0-0' }} €
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span class="px-2 py-1 text-xs font-medium rounded-full"
                      [class.bg-danger-100]="ecart.statut === 'A_TRAITER'"
                      [class.text-danger-700]="ecart.statut === 'A_TRAITER'"
                      [class.bg-warning-100]="ecart.statut === 'EN_COURS'"
                      [class.text-warning-700]="ecart.statut === 'EN_COURS'"
                      [class.bg-success-100]="ecart.statut === 'JUSTIFIE' || ecart.statut === 'AJUSTE'"
                      [class.text-success-700]="ecart.statut === 'JUSTIFIE' || ecart.statut === 'AJUSTE'"
                    >{{ getStatutLabel(ecart.statut) }}</span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    @if (ecart.statut === 'A_TRAITER' || ecart.statut === 'EN_COURS') {
                      <div class="flex items-center justify-center gap-1">
                        <button type="button" class="p-1.5 hover:bg-primary-100 rounded text-primary-600" title="Justifier" (click)="justifierEcart(ecart)">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </button>
                        <button type="button" class="p-1.5 hover:bg-success-100 rounded text-success-600" title="Ajuster stock" (click)="ajusterStock(ecart)">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button type="button" class="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Détails" (click)="voirDetails(ecart)">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                      </div>
                    } @else {
                      <span class="text-xs text-gray-400">Traité</span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="py-8 text-center text-gray-500">
                    Aucun écart trouvé
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Analyse par cause -->
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Répartition par cause</h3>
          <div class="space-y-3">
            @for (cause of repartitionCauses(); track cause.nom) {
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm text-gray-600">{{ cause.nom }}</span>
                  <span class="text-sm font-medium">{{ cause.nombre }} ({{ cause.pourcentage }}%)</span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full">
                  <div class="h-full rounded-full" 
                    [class.bg-danger-500]="cause.id === 'VOL'"
                    [class.bg-warning-500]="cause.id === 'CASSE'"
                    [class.bg-primary-500]="cause.id === 'ERREUR_SAISIE'"
                    [class.bg-purple-500]="cause.id === 'PEREMPTION'"
                    [class.bg-gray-500]="cause.id === 'AUTRE'"
                    [style.width.%]="cause.pourcentage"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Tendance mensuelle</h3>
          <div class="space-y-3">
            @for (mois of tendanceMensuelle(); track mois.mois) {
              <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span class="text-sm text-gray-600">{{ mois.mois }}</span>
                <div class="flex items-center gap-4">
                  <span class="text-sm">{{ mois.nombre }} écarts</span>
                  <span class="text-sm font-semibold" [class.text-danger-600]="mois.valeur < 0">
                    {{ mois.valeur | number:'1.0-0' }} €
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EcartsInventaireComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  ecarts = signal<EcartInventaire[]>([]);
  searchQuery = '';
  filterStatut = '';
  filterEntrepot = '';
  filterType = '';

  ecartsATraiter = computed(() => this.ecarts().filter(e => e.statut === 'A_TRAITER').length);
  ecartsEnCours = computed(() => this.ecarts().filter(e => e.statut === 'EN_COURS').length);
  ecartsResolus = computed(() => this.ecarts().filter(e => e.statut === 'JUSTIFIE' || e.statut === 'AJUSTE').length);
  valeurTotaleEcarts = computed(() => this.ecarts().filter(e => e.statut === 'A_TRAITER').reduce((sum, e) => sum + Math.abs(e.valeurEcart), 0));
  ecartMoyen = computed(() => {
    const ecarts = this.ecarts().filter(e => e.statut === 'A_TRAITER');
    return ecarts.length ? ecarts.reduce((sum, e) => sum + Math.abs(e.ecartPourcentage), 0) / ecarts.length : 0;
  });

  ecartsFiltres = computed(() => {
    return this.ecarts().filter(e => {
      if (this.searchQuery && !e.produitNom.toLowerCase().includes(this.searchQuery.toLowerCase())) return false;
      if (this.filterStatut && e.statut !== this.filterStatut) return false;
      if (this.filterEntrepot && e.entrepot !== this.filterEntrepot) return false;
      if (this.filterType === 'negatif' && e.ecart >= 0) return false;
      if (this.filterType === 'positif' && e.ecart <= 0) return false;
      return true;
    });
  });

  repartitionCauses = signal([
    { id: 'ERREUR_SAISIE', nom: 'Erreur de saisie', nombre: 45, pourcentage: 40 },
    { id: 'CASSE', nom: 'Casse / Détérioration', nombre: 28, pourcentage: 25 },
    { id: 'VOL', nom: 'Vol / Perte', nombre: 17, pourcentage: 15 },
    { id: 'PEREMPTION', nom: 'Péremption', nombre: 12, pourcentage: 11 },
    { id: 'AUTRE', nom: 'Autre', nombre: 10, pourcentage: 9 },
  ]);

  tendanceMensuelle = signal([
    { mois: 'Janvier', nombre: 32, valeur: -4520 },
    { mois: 'Décembre', nombre: 28, valeur: -3890 },
    { mois: 'Novembre', nombre: 41, valeur: -5230 },
    { mois: 'Octobre', nombre: 25, valeur: -2980 },
  ]);

  ngOnInit(): void {
    this.loadEcarts();
  }

  loadEcarts(): void {
    this.ecarts.set([
      { id: '1', produitId: '1', produitNom: 'Écran LCD 27"', produitReference: 'ECR-027-HD', entrepot: 'Paris', zone: 'A1', stockTheorique: 50, stockReel: 47, ecart: -3, ecartPourcentage: -6, valeurEcart: -450, dateDetection: new Date(), statut: 'A_TRAITER' },
      { id: '2', produitId: '2', produitNom: 'Clavier mécanique RGB', produitReference: 'CLV-MEC-RGB', entrepot: 'Paris', zone: 'B2', stockTheorique: 100, stockReel: 95, ecart: -5, ecartPourcentage: -5, valeurEcart: -175, dateDetection: new Date(Date.now() - 86400000), statut: 'EN_COURS', cause: 'CASSE' },
      { id: '3', produitId: '3', produitNom: 'Souris sans fil', produitReference: 'SOU-SF-PRO', entrepot: 'Lyon', stockTheorique: 200, stockReel: 205, ecart: 5, ecartPourcentage: 2.5, valeurEcart: 125, dateDetection: new Date(Date.now() - 172800000), statut: 'JUSTIFIE', cause: 'ERREUR_SAISIE', commentaire: 'Retour client non enregistré', traitePar: 'Jean Dupont' },
      { id: '4', produitId: '4', produitNom: 'Casque audio Pro', produitReference: 'CAS-PRO-BT', entrepot: 'Marseille', zone: 'C1', stockTheorique: 30, stockReel: 28, ecart: -2, ecartPourcentage: -6.7, valeurEcart: -180, dateDetection: new Date(), statut: 'A_TRAITER' },
    ]);
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = { 'A_TRAITER': 'À traiter', 'EN_COURS': 'En cours', 'JUSTIFIE': 'Justifié', 'AJUSTE': 'Ajusté', 'IGNORE': 'Ignoré' };
    return labels[statut] || statut;
  }

  justifierEcart(ecart: EcartInventaire): void {
    this.notificationService.info('Ouverture du formulaire de justification...');
  }

  ajusterStock(ecart: EcartInventaire): void {
    ecart.statut = 'AJUSTE';
    this.notificationService.success('Stock ajusté avec succès');
  }

  voirDetails(ecart: EcartInventaire): void {
    this.notificationService.info('Affichage des détails...');
  }

  exporterEcarts(): void {
    this.notificationService.success('Export des écarts en cours...');
  }
}
