/**
 * Gestion des zones d'entrepôt (PREMIUM)
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EntrepotsService } from '../../services/entrepots.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

interface Zone {
  id: string;
  code: string;
  nom: string;
  type: 'STOCKAGE' | 'RECEPTION' | 'EXPEDITION' | 'QUARANTAINE' | 'RETOUR';
  capacite: number;
  occupation: number;
  temperature?: { min: number; max: number };
  produits: number;
  allees: number;
  actif: boolean;
}

@Component({
  selector: 'app-entrepot-zones',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a [routerLink]="['/entrepots', entrepotId]" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Zones de l'entrepôt</h1>
              <span class="badge-premium">Premium</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mt-1">{{ entrepotNom() }}</p>
          </div>
        </div>
        <button type="button" class="btn-primary" (click)="showAddZone = true">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Ajouter une zone
        </button>
      </div>

      <!-- Vue visuelle de l'entrepôt -->
      <div class="card p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Vue de l'entrepôt</h3>
        <div class="grid grid-cols-4 gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg min-h-[300px]">
          @for (zone of zones(); track zone.id) {
            <div 
              class="relative p-4 rounded-lg cursor-pointer transition-all hover:scale-105"
              [class.bg-blue-100]="zone.type === 'STOCKAGE'"
              [class.bg-green-100]="zone.type === 'RECEPTION'"
              [class.bg-orange-100]="zone.type === 'EXPEDITION'"
              [class.bg-yellow-100]="zone.type === 'QUARANTAINE'"
              [class.bg-purple-100]="zone.type === 'RETOUR'"
              [class.border-2]="selectedZone()?.id === zone.id"
              [class.border-primary-500]="selectedZone()?.id === zone.id"
              (click)="selectZone(zone)"
            >
              <div class="text-xs font-bold text-gray-700">{{ zone.code }}</div>
              <div class="text-sm font-medium mt-1">{{ zone.nom }}</div>
              <div class="mt-2">
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all"
                    [class.bg-success-500]="zone.occupation < 70"
                    [class.bg-warning-500]="zone.occupation >= 70 && zone.occupation < 90"
                    [class.bg-danger-500]="zone.occupation >= 90"
                    [style.width.%]="zone.occupation"
                  ></div>
                </div>
                <div class="text-xs text-gray-500 mt-1">{{ zone.occupation }}% occupé</div>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Liste des zones -->
        <div class="lg:col-span-2">
          <div class="card">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3">
                <input 
                  type="text" 
                  [(ngModel)]="searchQuery" 
                  placeholder="Rechercher une zone..." 
                  class="form-input flex-1"
                />
                <select [(ngModel)]="filterType" class="form-input w-40">
                  <option value="">Tous types</option>
                  <option value="STOCKAGE">Stockage</option>
                  <option value="RECEPTION">Réception</option>
                  <option value="EXPEDITION">Expédition</option>
                  <option value="QUARANTAINE">Quarantaine</option>
                  <option value="RETOUR">Retours</option>
                </select>
              </div>
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-700">
              @for (zone of filteredZones(); track zone.id) {
                <div 
                  class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  [class.bg-primary-50]="selectedZone()?.id === zone.id"
                  (click)="selectZone(zone)"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                        [class.bg-blue-100]="zone.type === 'STOCKAGE'"
                        [class.bg-green-100]="zone.type === 'RECEPTION'"
                        [class.bg-orange-100]="zone.type === 'EXPEDITION'"
                        [class.bg-yellow-100]="zone.type === 'QUARANTAINE'"
                        [class.bg-purple-100]="zone.type === 'RETOUR'"
                      >
                        <span class="text-sm font-bold">{{ zone.code }}</span>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900 dark:text-white">{{ zone.nom }}</p>
                        <p class="text-sm text-gray-500">{{ getTypeLabel(zone.type) }} • {{ zone.produits }} produits</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="font-semibold" [class.text-success-600]="zone.occupation < 70" [class.text-warning-600]="zone.occupation >= 70 && zone.occupation < 90" [class.text-danger-600]="zone.occupation >= 90">
                        {{ zone.occupation }}%
                      </p>
                      <p class="text-xs text-gray-500">{{ zone.allees }} allées</p>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="p-8 text-center text-gray-500">Aucune zone trouvée</div>
              }
            </div>
          </div>
        </div>

        <!-- Détails zone sélectionnée -->
        <div class="lg:col-span-1">
          @if (selectedZone()) {
            <div class="card p-6 sticky top-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-900 dark:text-white">{{ selectedZone()!.nom }}</h3>
                <span class="px-2 py-1 text-xs font-medium rounded-full"
                  [class.bg-blue-100]="selectedZone()!.type === 'STOCKAGE'"
                  [class.text-blue-700]="selectedZone()!.type === 'STOCKAGE'"
                  [class.bg-green-100]="selectedZone()!.type === 'RECEPTION'"
                  [class.text-green-700]="selectedZone()!.type === 'RECEPTION'"
                >{{ getTypeLabel(selectedZone()!.type) }}</span>
              </div>

              <div class="space-y-4">
                <div>
                  <p class="text-sm text-gray-500">Capacité</p>
                  <div class="flex items-center gap-2 mt-1">
                    <div class="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        class="h-full rounded-full"
                        [class.bg-success-500]="selectedZone()!.occupation < 70"
                        [class.bg-warning-500]="selectedZone()!.occupation >= 70"
                        [style.width.%]="selectedZone()!.occupation"
                      ></div>
                    </div>
                    <span class="text-sm font-medium">{{ selectedZone()!.occupation }}%</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">{{ selectedZone()!.capacite }} emplacements</p>
                </div>

                @if (selectedZone()!.temperature) {
                  <div>
                    <p class="text-sm text-gray-500">Température contrôlée</p>
                    <p class="font-medium text-primary-600">
                      {{ selectedZone()!.temperature!.min }}°C - {{ selectedZone()!.temperature!.max }}°C
                    </p>
                  </div>
                }

                <div class="grid grid-cols-2 gap-4">
                  <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedZone()!.produits }}</p>
                    <p class="text-xs text-gray-500">Produits</p>
                  </div>
                  <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedZone()!.allees }}</p>
                    <p class="text-xs text-gray-500">Allées</p>
                  </div>
                </div>

                <div class="pt-4 border-t border-gray-200 space-y-2">
                  <button type="button" class="btn-secondary w-full">Voir les produits</button>
                  <button type="button" class="btn-outline-secondary w-full" (click)="editZone(selectedZone()!)">Modifier</button>
                </div>
              </div>
            </div>
          } @else {
            <div class="card p-6 text-center text-gray-500">
              <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
              <p>Sélectionnez une zone pour voir les détails</p>
            </div>
          }
        </div>
      </div>

      <!-- Modal ajout zone -->
      @if (showAddZone) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" (click)="showAddZone = false">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md" (click)="$event.stopPropagation()">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nouvelle zone</h3>
            <form (ngSubmit)="addZone()" class="space-y-4">
              <div>
                <label class="form-label">Code</label>
                <input type="text" [(ngModel)]="newZone.code" name="code" class="form-input" placeholder="A1" required />
              </div>
              <div>
                <label class="form-label">Nom</label>
                <input type="text" [(ngModel)]="newZone.nom" name="nom" class="form-input" placeholder="Zone A1 - Stockage principal" required />
              </div>
              <div>
                <label class="form-label">Type</label>
                <select [(ngModel)]="newZone.type" name="type" class="form-input">
                  <option value="STOCKAGE">Stockage</option>
                  <option value="RECEPTION">Réception</option>
                  <option value="EXPEDITION">Expédition</option>
                  <option value="QUARANTAINE">Quarantaine</option>
                  <option value="RETOUR">Retours</option>
                </select>
              </div>
              <div>
                <label class="form-label">Capacité (emplacements)</label>
                <input type="number" [(ngModel)]="newZone.capacite" name="capacite" class="form-input" />
              </div>
              <div>
                <label class="form-label">Nombre d'allées</label>
                <input type="number" [(ngModel)]="newZone.allees" name="allees" class="form-input" />
              </div>
              <div class="flex gap-3 pt-4">
                <button type="button" class="btn-secondary flex-1" (click)="showAddZone = false">Annuler</button>
                <button type="submit" class="btn-primary flex-1">Créer</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class EntrepotZonesComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly entrepotsService = inject(EntrepotsService);

  entrepotId = '';
  entrepotNom = signal('');
  zones = signal<Zone[]>([]);
  selectedZone = signal<Zone | null>(null);
  searchQuery = '';
  filterType = '';
  showAddZone = false;
  newZone = { code: '', nom: '', type: 'STOCKAGE' as const, capacite: 100, allees: 4 };

  filteredZones = signal<Zone[]>([]);

  ngOnInit(): void {
    this.entrepotId = this.route.snapshot.params['id'];
    this.loadZones();
  }

  loadZones(): void {
    // Mock data
    this.entrepotNom.set('Entrepôt Paris Central');
    const mockZones: Zone[] = [
      { id: '1', code: 'A1', nom: 'Stockage Principal', type: 'STOCKAGE', capacite: 500, occupation: 78, produits: 245, allees: 8, actif: true },
      { id: '2', code: 'A2', nom: 'Stockage Secondaire', type: 'STOCKAGE', capacite: 300, occupation: 45, produits: 120, allees: 5, actif: true },
      { id: '3', code: 'R1', nom: 'Zone Réception', type: 'RECEPTION', capacite: 100, occupation: 25, produits: 18, allees: 2, actif: true },
      { id: '4', code: 'E1', nom: 'Zone Expédition', type: 'EXPEDITION', capacite: 150, occupation: 60, produits: 45, allees: 3, actif: true },
      { id: '5', code: 'Q1', nom: 'Quarantaine', type: 'QUARANTAINE', capacite: 50, occupation: 12, produits: 5, allees: 1, actif: true },
      { id: '6', code: 'F1', nom: 'Zone Froid', type: 'STOCKAGE', capacite: 80, occupation: 92, temperature: { min: 2, max: 8 }, produits: 35, allees: 2, actif: true },
    ];
    this.zones.set(mockZones);
    this.filteredZones.set(mockZones);
  }

  selectZone(zone: Zone): void {
    this.selectedZone.set(zone);
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'STOCKAGE': 'Stockage',
      'RECEPTION': 'Réception',
      'EXPEDITION': 'Expédition',
      'QUARANTAINE': 'Quarantaine',
      'RETOUR': 'Retours'
    };
    return labels[type] || type;
  }

  addZone(): void {
    const zone: Zone = {
      id: Date.now().toString(),
      ...this.newZone,
      occupation: 0,
      produits: 0,
      actif: true
    };
    this.zones.update(z => [...z, zone]);
    this.filteredZones.set(this.zones());
    this.showAddZone = false;
    this.newZone = { code: '', nom: '', type: 'STOCKAGE', capacite: 100, allees: 4 };
  }

  editZone(zone: Zone): void {
    // TODO: Implement edit
  }
}
