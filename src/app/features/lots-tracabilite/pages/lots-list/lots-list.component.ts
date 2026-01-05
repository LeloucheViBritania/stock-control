/**
 * Liste des Lots - Traçabilité (PREMIUM)
 * Gestion complète des lots de produits
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '@services/notification.service';

interface Lot {
  id: string;
  numeroLot: string;
  produitId: string;
  produitNom: string;
  produitReference: string;
  quantiteInitiale: number;
  quantiteRestante: number;
  dateProduction: Date;
  dateExpiration?: Date;
  fournisseur: string;
  entrepot: string;
  zone?: string;
  statut: 'ACTIF' | 'EPUISE' | 'BLOQUE' | 'RAPPEL' | 'EXPIRE';
  prixAchat: number;
  commentaire?: string;
}

@Component({
  selector: 'app-lots-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Traçabilité des Lots</h1>
            <span class="badge-premium">Premium</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Gérez et tracez vos lots de produits</p>
        </div>
        <div class="flex gap-2">
          <button type="button" class="btn-secondary" (click)="exporterLots()">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Exporter
          </button>
          <a routerLink="nouveau" class="btn-primary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouveau lot
          </a>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="card p-4">
          <p class="text-sm text-gray-500">Lots actifs</p>
          <p class="text-2xl font-bold text-primary-600">{{ lotsActifs() }}</p>
        </div>
        <div class="card p-4 border-l-4 border-warning-500">
          <p class="text-sm text-gray-500">Expiration proche</p>
          <p class="text-2xl font-bold text-warning-600">{{ lotsExpirationProche() }}</p>
        </div>
        <div class="card p-4 border-l-4 border-danger-500">
          <p class="text-sm text-gray-500">Lots bloqués</p>
          <p class="text-2xl font-bold text-danger-600">{{ lotsBloques() }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Valeur stock</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ valeurTotale() | number:'1.0-0' }} €</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Taux rotation</p>
          <p class="text-2xl font-bold text-success-600">{{ tauxRotation() }}%</p>
        </div>
      </div>

      <!-- Filtres -->
      <div class="card p-4">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-64">
            <input type="text" [(ngModel)]="searchQuery" placeholder="Rechercher par n° lot, produit..." class="form-input w-full" />
          </div>
          <select [(ngModel)]="filterStatut" class="form-input">
            <option value="">Tous statuts</option>
            <option value="ACTIF">Actif</option>
            <option value="EPUISE">Épuisé</option>
            <option value="BLOQUE">Bloqué</option>
            <option value="EXPIRE">Expiré</option>
          </select>
          <select [(ngModel)]="filterEntrepot" class="form-input">
            <option value="">Tous entrepôts</option>
            <option value="Paris">Paris Central</option>
            <option value="Lyon">Lyon</option>
            <option value="Marseille">Marseille</option>
          </select>
        </div>
      </div>

      <!-- Liste des lots -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="text-left py-3 px-4 font-medium text-gray-600">N° Lot</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Produit</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Fournisseur</th>
                <th class="text-right py-3 px-4 font-medium text-gray-600">Qté restante</th>
                <th class="text-center py-3 px-4 font-medium text-gray-600">Production</th>
                <th class="text-center py-3 px-4 font-medium text-gray-600">Expiration</th>
                <th class="text-center py-3 px-4 font-medium text-gray-600">Statut</th>
                <th class="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              @for (lot of lotsFiltres(); track lot.id) {
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td class="py-3 px-4">
                    <a [routerLink]="[lot.id]" class="font-mono font-semibold text-primary-600 hover:underline">
                      {{ lot.numeroLot }}
                    </a>
                  </td>
                  <td class="py-3 px-4">
                    <p class="font-medium text-gray-900 dark:text-white">{{ lot.produitNom }}</p>
                    <p class="text-xs text-gray-500">{{ lot.produitReference }}</p>
                  </td>
                  <td class="py-3 px-4 text-gray-600">{{ lot.fournisseur }}</td>
                  <td class="py-3 px-4 text-right">
                    <span class="font-semibold">{{ lot.quantiteRestante }}</span>
                    <span class="text-gray-400 text-sm"> / {{ lot.quantiteInitiale }}</span>
                  </td>
                  <td class="py-3 px-4 text-center text-sm">{{ lot.dateProduction | date:'dd/MM/yyyy' }}</td>
                  <td class="py-3 px-4 text-center">
                    @if (lot.dateExpiration) {
                      <span class="text-sm" [class.text-danger-600]="isExpiringSoon(lot)">
                        {{ lot.dateExpiration | date:'dd/MM/yyyy' }}
                      </span>
                    } @else {
                      <span class="text-gray-400">-</span>
                    }
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span class="px-2 py-1 text-xs font-medium rounded-full"
                      [class.bg-success-100]="lot.statut === 'ACTIF'"
                      [class.text-success-700]="lot.statut === 'ACTIF'"
                      [class.bg-gray-100]="lot.statut === 'EPUISE'"
                      [class.text-gray-700]="lot.statut === 'EPUISE'"
                      [class.bg-danger-100]="lot.statut === 'BLOQUE'"
                      [class.text-danger-700]="lot.statut === 'BLOQUE'"
                    >{{ getStatutLabel(lot.statut) }}</span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <a [routerLink]="[lot.id]" class="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                      <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class LotsListComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  lots = signal<Lot[]>([]);
  searchQuery = '';
  filterStatut = '';
  filterEntrepot = '';

  lotsActifs = computed(() => this.lots().filter(l => l.statut === 'ACTIF').length);
  lotsExpirationProche = computed(() => this.lots().filter(l => l.statut === 'ACTIF' && this.isExpiringSoon(l)).length);
  lotsBloques = computed(() => this.lots().filter(l => l.statut === 'BLOQUE').length);
  valeurTotale = computed(() => this.lots().filter(l => l.statut === 'ACTIF').reduce((sum, l) => sum + (l.quantiteRestante * l.prixAchat), 0));
  tauxRotation = signal(78);

  lotsFiltres = computed(() => {
    return this.lots().filter(l => {
      if (this.searchQuery && !l.numeroLot.toLowerCase().includes(this.searchQuery.toLowerCase())) return false;
      if (this.filterStatut && l.statut !== this.filterStatut) return false;
      if (this.filterEntrepot && l.entrepot !== this.filterEntrepot) return false;
      return true;
    });
  });

  ngOnInit(): void {
    this.loadLots();
  }

  loadLots(): void {
    const today = new Date();
    this.lots.set([
      { id: '1', numeroLot: 'LOT-2025-001', produitId: '1', produitNom: 'Écran LCD 27"', produitReference: 'ECR-027', quantiteInitiale: 100, quantiteRestante: 45, dateProduction: new Date('2024-11-15'), dateExpiration: new Date(today.getTime() + 15 * 86400000), fournisseur: 'TechSupply', entrepot: 'Paris', zone: 'A1', statut: 'ACTIF', prixAchat: 150 },
      { id: '2', numeroLot: 'LOT-2025-002', produitId: '2', produitNom: 'Clavier mécanique', produitReference: 'CLV-MEC', quantiteInitiale: 200, quantiteRestante: 180, dateProduction: new Date('2024-12-01'), fournisseur: 'PeriphPro', entrepot: 'Lyon', statut: 'ACTIF', prixAchat: 35 },
      { id: '3', numeroLot: 'LOT-2024-089', produitId: '3', produitNom: 'Cartouche encre', produitReference: 'ENC-HP-BK', quantiteInitiale: 500, quantiteRestante: 12, dateProduction: new Date('2024-06-01'), dateExpiration: new Date(today.getTime() + 8 * 86400000), fournisseur: 'OfficeDirect', entrepot: 'Paris', zone: 'B3', statut: 'ACTIF', prixAchat: 18 },
      { id: '4', numeroLot: 'LOT-2024-076', produitId: '4', produitNom: 'Souris sans fil', produitReference: 'SOU-SF', quantiteInitiale: 150, quantiteRestante: 0, dateProduction: new Date('2024-08-01'), fournisseur: 'TechSupply', entrepot: 'Marseille', statut: 'EPUISE', prixAchat: 22 },
      { id: '5', numeroLot: 'LOT-2024-090', produitId: '5', produitNom: 'Câble USB-C', produitReference: 'CAB-USBC', quantiteInitiale: 1000, quantiteRestante: 850, dateProduction: new Date('2024-10-15'), fournisseur: 'CablePro', entrepot: 'Paris', statut: 'BLOQUE', prixAchat: 8, commentaire: 'Défaut qualité signalé' },
    ]);
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = { 'ACTIF': 'Actif', 'EPUISE': 'Épuisé', 'BLOQUE': 'Bloqué', 'RAPPEL': 'Rappel', 'EXPIRE': 'Expiré' };
    return labels[statut] || statut;
  }

  isExpiringSoon(lot: Lot): boolean {
    if (!lot.dateExpiration) return false;
    const diff = new Date(lot.dateExpiration).getTime() - new Date().getTime();
    return diff <= 30 * 86400000 && diff > 0;
  }

  exporterLots(): void {
    this.notificationService.success('Export des lots en cours...');
  }
}
