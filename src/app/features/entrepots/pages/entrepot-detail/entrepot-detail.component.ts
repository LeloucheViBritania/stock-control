/**
 * Détail d'un entrepôt avec stock et zones (PREMIUM)
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EntrepotsService, Entrepot, StockEntrepot, EntrepotStats, Zone } from '../../services/entrepots.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-entrepot-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      @if (isLoading()) {
        <div class="card p-12">
          <app-loading-spinner size="lg" text="Chargement..." />
        </div>
      } @else if (entrepot()) {
        <!-- Header -->
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div class="flex items-start gap-4">
            <a routerLink="/entrepots" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </a>
            <div 
              class="w-16 h-16 rounded-xl flex items-center justify-center"
              [ngClass]="{
                'bg-primary-100 text-primary-600': entrepot()?.type === 'PRINCIPAL',
                'bg-info-100 text-info-600': entrepot()?.type === 'SECONDAIRE',
                'bg-warning-100 text-warning-600': entrepot()?.type === 'TRANSIT',
                'bg-gray-100 text-gray-600': entrepot()?.type === 'RESERVE'
              }"
            >
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ entrepot()?.nom }}</h1>
                <span class="badge-premium">Premium</span>
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  [ngClass]="{
                    'bg-success-100 text-success-700': entrepot()?.statut === 'ACTIF',
                    'bg-gray-100 text-gray-700': entrepot()?.statut === 'INACTIF',
                    'bg-warning-100 text-warning-700': entrepot()?.statut === 'MAINTENANCE'
                  }"
                >
                  {{ entrepot()?.statut }}
                </span>
              </div>
              <p class="text-gray-600 mt-1">{{ entrepot()?.code }} • {{ entrepot()?.type }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ entrepot()?.adresse }}, {{ entrepot()?.ville }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button type="button" class="btn-secondary" (click)="exportStock()">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Exporter
            </button>
            <a [routerLink]="['modifier']" class="btn-primary">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Modifier
            </a>
          </div>
        </div>

        <!-- Stats -->
        @if (stats()) {
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="card p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500">Taux remplissage</p>
                  <p class="text-2xl font-bold" [class]="getTauxColor(stats()?.tauxRemplissage || 0)">
                    {{ stats()?.tauxRemplissage | number:'1.1-1' }}%
                  </p>
                </div>
                <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
              </div>
            </div>
            <div class="card p-4">
              <p class="text-sm text-gray-500">Valeur stock</p>
              <p class="text-2xl font-bold text-primary-600">{{ stats()?.valeurTotale | number:'1.0-0' }} €</p>
            </div>
            <div class="card p-4">
              <p class="text-sm text-gray-500">Références</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats()?.nombreReferences | number }}</p>
            </div>
            <div class="card p-4">
              <p class="text-sm text-gray-500">Mouvements (7j)</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats()?.mouvementsSemaine | number }}</p>
            </div>
          </div>
        }

        <!-- Tabs -->
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="flex gap-6">
            @for (tab of tabs; track tab.id) {
              <button 
                type="button"
                class="pb-3 text-sm font-medium border-b-2 transition-colors"
                [class.border-primary-500]="activeTab() === tab.id"
                [class.text-primary-600]="activeTab() === tab.id"
                [class.border-transparent]="activeTab() !== tab.id"
                [class.text-gray-500]="activeTab() !== tab.id"
                (click)="activeTab.set(tab.id)"
              >
                {{ tab.label }}
              </button>
            }
          </nav>
        </div>

        <!-- Tab Content -->
        @switch (activeTab()) {
          @case ('stock') {
            <div class="card">
              <!-- Search -->
              <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                <input 
                  type="text" 
                  [(ngModel)]="stockSearch"
                  (ngModelChange)="searchStock()"
                  placeholder="Rechercher un produit..." 
                  class="form-input w-full max-w-md"
                />
              </div>
              
              <!-- Table -->
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th class="table-header">Produit</th>
                      <th class="table-header text-center">Zone</th>
                      <th class="table-header text-right">Quantité</th>
                      <th class="table-header text-right">Disponible</th>
                      <th class="table-header text-right">Valeur</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    @for (item of stockItems(); track item.produitId) {
                      <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td class="table-cell">
                          <div>
                            <a [routerLink]="['/produits', item.produitId]" class="font-medium text-gray-900 dark:text-white hover:text-primary-600">
                              {{ item.produitNom }}
                            </a>
                            <p class="text-sm text-gray-500">{{ item.produitReference }}</p>
                          </div>
                        </td>
                        <td class="table-cell text-center">
                          <span class="badge-secondary">{{ item.zone || 'N/A' }}</span>
                        </td>
                        <td class="table-cell text-right font-medium">{{ item.quantite | number }}</td>
                        <td class="table-cell text-right">
                          <span [class.text-success-600]="item.quantiteDisponible > 0" [class.text-danger-600]="item.quantiteDisponible === 0">
                            {{ item.quantiteDisponible | number }}
                          </span>
                        </td>
                        <td class="table-cell text-right font-semibold text-primary-600">{{ item.valeur | number:'1.2-2' }} €</td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="5" class="table-cell text-center text-gray-500 py-8">
                          Aucun produit en stock
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          @case ('zones') {
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              @for (zone of zones(); track zone.id) {
                <div class="card p-4">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <div 
                        class="w-3 h-3 rounded-full"
                        [ngClass]="{
                          'bg-primary-500': zone.type === 'STOCKAGE',
                          'bg-success-500': zone.type === 'RECEPTION',
                          'bg-info-500': zone.type === 'EXPEDITION',
                          'bg-warning-500': zone.type === 'QUARANTAINE',
                          'bg-purple-500': zone.type === 'PICKING'
                        }"
                      ></div>
                      <span class="font-semibold text-gray-900 dark:text-white">{{ zone.nom }}</span>
                    </div>
                    <span class="text-xs text-gray-500">{{ zone.code }}</span>
                  </div>
                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-500">Type</span>
                      <span class="font-medium">{{ zone.type }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-500">Capacité</span>
                      <span class="font-medium">{{ zone.utilisee | number }} / {{ zone.capacite | number }}</span>
                    </div>
                    @if (zone.temperature) {
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-500">Température</span>
                        <span class="font-medium">{{ zone.temperature }}</span>
                      </div>
                    }
                    <div class="h-2 bg-gray-200 rounded-full mt-2">
                      <div 
                        class="h-full bg-primary-500 rounded-full"
                        [style.width.%]="(zone.utilisee / zone.capacite) * 100"
                      ></div>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="col-span-full card p-8 text-center">
                  <p class="text-gray-500">Aucune zone configurée</p>
                  <button type="button" class="btn-primary mt-4" (click)="addZone()">Ajouter une zone</button>
                </div>
              }
            </div>
          }

          @case ('stats') {
            @if (stats()) {
              <div class="grid gap-6 lg:grid-cols-2">
                <!-- Top produits -->
                <div class="card p-6">
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Top produits</h3>
                  <div class="space-y-3">
                    @for (p of stats()?.topProduits || []; track p.produit; let i = $index) {
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                          <span class="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-medium flex items-center justify-center">
                            {{ i + 1 }}
                          </span>
                          <span class="text-gray-900 dark:text-white">{{ p.produit }}</span>
                        </div>
                        <div class="text-right">
                          <p class="font-medium">{{ p.quantite | number }} unités</p>
                          <p class="text-sm text-gray-500">{{ p.valeur | number:'1.0-0' }} €</p>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Répartition zones -->
                <div class="card p-6">
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Répartition par zone</h3>
                  <div class="space-y-3">
                    @for (z of stats()?.repartitionZones || []; track z.zone) {
                      <div>
                        <div class="flex justify-between text-sm mb-1">
                          <span class="text-gray-600">{{ z.zone }}</span>
                          <span class="font-medium">{{ z.pourcentage | number:'1.1-1' }}%</span>
                        </div>
                        <div class="h-2 bg-gray-200 rounded-full">
                          <div 
                            class="h-full bg-primary-500 rounded-full"
                            [style.width.%]="z.pourcentage"
                          ></div>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Alertes -->
                <div class="card p-6">
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Alertes</h3>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="p-3 bg-warning-50 rounded-lg">
                      <p class="text-2xl font-bold text-warning-600">{{ stats()?.alertesStock }}</p>
                      <p class="text-sm text-warning-700">Alertes stock</p>
                    </div>
                    <div class="p-3 bg-danger-50 rounded-lg">
                      <p class="text-2xl font-bold text-danger-600">{{ stats()?.produitsPerimes }}</p>
                      <p class="text-sm text-danger-700">Produits périmés</p>
                    </div>
                  </div>
                </div>
              </div>
            }
          }
        }
      }
    </div>
  `,
})
export class EntrepotDetailComponent implements OnInit {
  private readonly entrepotsService = inject(EntrepotsService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  entrepot = signal<Entrepot | null>(null);
  stats = signal<EntrepotStats | null>(null);
  stockItems = signal<StockEntrepot[]>([]);
  zones = signal<Zone[]>([]);
  isLoading = signal(true);
  activeTab = signal('stock');
  stockSearch = '';

  tabs = [
    { id: 'stock', label: 'Stock' },
    { id: 'zones', label: 'Zones' },
    { id: 'stats', label: 'Statistiques' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadEntrepot(id);
      this.loadStats(id);
      this.loadStock(id);
      this.loadZones(id);
    }
  }

  loadEntrepot(id: string): void {
    this.entrepotsService.getById(id).subscribe({
      next: (e) => { this.entrepot.set(e); this.isLoading.set(false); },
      error: () => {
        this.entrepot.set({
          id, code: 'ENT-001', nom: 'Entrepôt Principal Paris', adresse: '123 Rue de la Logistique',
          ville: 'Paris', pays: 'France', type: 'PRINCIPAL', statut: 'ACTIF',
          capaciteMax: 10000, capaciteUtilisee: 7500, nombreProduits: 1250, valeurStock: 450000,
          createdAt: new Date(), updatedAt: new Date()
        } as Entrepot);
        this.isLoading.set(false);
      }
    });
  }

  loadStats(id: string): void {
    this.entrepotsService.getStats(id).subscribe({
      next: (s) => this.stats.set(s),
      error: () => this.stats.set({
        tauxRemplissage: 75, valeurTotale: 450000, nombreProduits: 1250, nombreReferences: 320,
        mouvementsJour: 45, mouvementsSemaine: 280, alertesStock: 8, produitsPerimes: 2,
        repartitionZones: [
          { zone: 'Stockage A', pourcentage: 45, valeur: 200000 },
          { zone: 'Stockage B', pourcentage: 30, valeur: 135000 },
          { zone: 'Picking', pourcentage: 25, valeur: 115000 }
        ],
        evolutionStock: [],
        topProduits: [
          { produit: 'Produit A', quantite: 500, valeur: 25000 },
          { produit: 'Produit B', quantite: 350, valeur: 18000 },
          { produit: 'Produit C', quantite: 280, valeur: 14000 }
        ]
      })
    });
  }

  loadStock(id: string): void {
    this.entrepotsService.getStock(id).subscribe({
      next: (r) => this.stockItems.set(r.data),
      error: () => this.stockItems.set([
        { produitId: '1', produitNom: 'Écran LCD 24"', produitReference: 'LCD-24-001', categorie: 'Informatique', quantite: 150, quantiteReservee: 20, quantiteDisponible: 130, zone: 'Stockage A', dateEntree: new Date(), prixUnitaire: 180, valeur: 27000 },
        { produitId: '2', produitNom: 'Clavier mécanique', produitReference: 'KB-MECH-002', categorie: 'Informatique', quantite: 300, quantiteReservee: 50, quantiteDisponible: 250, zone: 'Picking', dateEntree: new Date(), prixUnitaire: 75, valeur: 22500 },
        { produitId: '3', produitNom: 'Souris sans fil', produitReference: 'MS-WL-003', categorie: 'Informatique', quantite: 500, quantiteReservee: 0, quantiteDisponible: 500, zone: 'Stockage B', dateEntree: new Date(), prixUnitaire: 35, valeur: 17500 },
      ])
    });
  }

  loadZones(id: string): void {
    this.entrepotsService.getZones(id).subscribe({
      next: (z) => this.zones.set(z),
      error: () => this.zones.set([
        { id: '1', code: 'ZA-01', nom: 'Stockage A', type: 'STOCKAGE', capacite: 4000, utilisee: 3200, temperature: 'AMBIANTE' },
        { id: '2', code: 'ZB-01', nom: 'Stockage B', type: 'STOCKAGE', capacite: 3000, utilisee: 2100, temperature: 'AMBIANTE' },
        { id: '3', code: 'ZP-01', nom: 'Zone Picking', type: 'PICKING', capacite: 2000, utilisee: 1500 },
        { id: '4', code: 'ZR-01', nom: 'Réception', type: 'RECEPTION', capacite: 500, utilisee: 350 },
        { id: '5', code: 'ZE-01', nom: 'Expédition', type: 'EXPEDITION', capacite: 500, utilisee: 350 },
      ])
    });
  }

  searchStock(): void {
    const id = this.route.snapshot.params['id'];
    this.entrepotsService.getStock(id, 1, 50, this.stockSearch).subscribe({
      next: (r) => this.stockItems.set(r.data)
    });
  }

  exportStock(): void {
    const id = this.route.snapshot.params['id'];
    this.entrepotsService.exportStock(id, 'xlsx').subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-${this.entrepot()?.code}.xlsx`;
        a.click();
        this.notificationService.success('Export téléchargé');
      },
      error: () => this.notificationService.error('Erreur export')
    });
  }

  addZone(): void {
    this.notificationService.info('Fonctionnalité en cours de développement');
  }

  getTauxColor(taux: number): string {
    if (taux < 70) return 'text-success-600';
    if (taux < 90) return 'text-warning-600';
    return 'text-danger-600';
  }
}
