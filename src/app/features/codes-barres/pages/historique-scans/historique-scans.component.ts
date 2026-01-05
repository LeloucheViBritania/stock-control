/**
 * Historique des Scans (PREMIUM)
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ScanHistorique {
  id: string;
  codeBarre: string;
  produitNom?: string;
  produitRef?: string;
  utilisateur: string;
  dateHeure: Date;
  succes: boolean;
  action: string;
  entrepot?: string;
}

@Component({
  selector: 'app-historique-scans',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a routerLink="/codes-barres" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Historique des Scans</h1>
              <span class="badge-premium">Premium</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Consultez l'historique de tous les scans</p>
          </div>
        </div>
        <button type="button" class="btn-secondary" (click)="exporterHistorique()">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Exporter
        </button>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card p-4">
          <p class="text-sm text-gray-500">Scans aujourd'hui</p>
          <p class="text-2xl font-bold text-primary-600">{{ scansAujourdhui() }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Taux de succès</p>
          <p class="text-2xl font-bold text-success-600">{{ tauxSucces() }}%</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Codes non reconnus</p>
          <p class="text-2xl font-bold text-warning-600">{{ codesNonReconnus() }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Total scans (30j)</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalScans30j() }}</p>
        </div>
      </div>

      <!-- Filtres -->
      <div class="card p-4">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-48">
            <input type="text" [(ngModel)]="searchQuery" placeholder="Rechercher code ou produit..." class="form-input w-full" />
          </div>
          <select [(ngModel)]="filterStatut" class="form-input">
            <option value="">Tous statuts</option>
            <option value="succes">Succès</option>
            <option value="echec">Échec</option>
          </select>
          <select [(ngModel)]="filterUtilisateur" class="form-input">
            <option value="">Tous utilisateurs</option>
            <option value="jean">Jean Dupont</option>
            <option value="marie">Marie Martin</option>
            <option value="pierre">Pierre Bernard</option>
          </select>
          <input type="date" [(ngModel)]="filterDate" class="form-input" />
        </div>
      </div>

      <!-- Liste -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Date/Heure</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Code</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Produit</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600">Utilisateur</th>
                <th class="text-center py-3 px-4 font-medium text-gray-600">Statut</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              @for (scan of scansFiltres(); track scan.id) {
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td class="py-3 px-4">
                    <p class="font-medium">{{ scan.dateHeure | date:'dd/MM/yyyy' }}</p>
                    <p class="text-xs text-gray-500">{{ scan.dateHeure | date:'HH:mm:ss' }}</p>
                  </td>
                  <td class="py-3 px-4 font-mono text-sm">{{ scan.codeBarre }}</td>
                  <td class="py-3 px-4">
                    @if (scan.produitNom) {
                      <p class="font-medium text-gray-900 dark:text-white">{{ scan.produitNom }}</p>
                      <p class="text-xs text-gray-500">{{ scan.produitRef }}</p>
                    } @else {
                      <span class="text-gray-400 italic">Non trouvé</span>
                    }
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-1 text-xs rounded-full"
                      [class.bg-primary-100]="scan.action === 'CONSULTATION'"
                      [class.text-primary-700]="scan.action === 'CONSULTATION'"
                      [class.bg-success-100]="scan.action === 'RECEPTION'"
                      [class.text-success-700]="scan.action === 'RECEPTION'"
                      [class.bg-warning-100]="scan.action === 'INVENTAIRE'"
                      [class.text-warning-700]="scan.action === 'INVENTAIRE'"
                    >{{ scan.action }}</span>
                  </td>
                  <td class="py-3 px-4 text-gray-600">{{ scan.utilisateur }}</td>
                  <td class="py-3 px-4 text-center">
                    @if (scan.succes) {
                      <span class="inline-flex items-center justify-center w-6 h-6 bg-success-100 rounded-full">
                        <svg class="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      </span>
                    } @else {
                      <span class="inline-flex items-center justify-center w-6 h-6 bg-danger-100 rounded-full">
                        <svg class="w-4 h-4 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="py-12 text-center text-gray-500">Aucun scan trouvé</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class HistoriqueScansComponent implements OnInit {
  scans = signal<ScanHistorique[]>([]);
  searchQuery = '';
  filterStatut = '';
  filterUtilisateur = '';
  filterDate = '';

  scansAujourdhui = signal(47);
  tauxSucces = signal(94);
  codesNonReconnus = signal(3);
  totalScans30j = signal(1245);

  scansFiltres = computed(() => {
    return this.scans().filter(s => {
      if (this.searchQuery && !s.codeBarre.includes(this.searchQuery) && !s.produitNom?.toLowerCase().includes(this.searchQuery.toLowerCase())) return false;
      if (this.filterStatut === 'succes' && !s.succes) return false;
      if (this.filterStatut === 'echec' && s.succes) return false;
      return true;
    });
  });

  ngOnInit(): void {
    this.loadScans();
  }

  loadScans(): void {
    const actions = ['CONSULTATION', 'RECEPTION', 'INVENTAIRE'];
    const users = ['Jean Dupont', 'Marie Martin', 'Pierre Bernard'];
    const scans: ScanHistorique[] = [];

    for (let i = 0; i < 20; i++) {
      const succes = Math.random() > 0.1;
      scans.push({
        id: `${i}`,
        codeBarre: `370012345${6780 + i}`,
        produitNom: succes ? `Produit ${i + 1}` : undefined,
        produitRef: succes ? `REF-00${i}` : undefined,
        utilisateur: users[Math.floor(Math.random() * users.length)],
        dateHeure: new Date(Date.now() - Math.random() * 7 * 24 * 3600000),
        succes,
        action: actions[Math.floor(Math.random() * actions.length)]
      });
    }

    this.scans.set(scans.sort((a, b) => b.dateHeure.getTime() - a.dateHeure.getTime()));
  }

  exporterHistorique(): void {}
}
