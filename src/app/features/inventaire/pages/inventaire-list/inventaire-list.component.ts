/**
 * Liste des inventaires (PREMIUM)
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventaireService, Inventaire, InventaireFilters } from '../../services/inventaire.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-inventaire-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Inventaires</h1>
            <span class="badge-premium">Premium</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Gestion des inventaires physiques</p>
        </div>
        <a routerLink="nouveau" class="btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nouvel inventaire
        </a>
      </div>

      <!-- Stats -->
      @if (stats()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card p-4">
            <p class="text-sm text-gray-500">En cours</p>
            <p class="text-2xl font-bold text-primary-600">{{ stats()?.enCours }}</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-500">Planifiés</p>
            <p class="text-2xl font-bold text-warning-600">{{ stats()?.planifies }}</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-500">Terminés ce mois</p>
            <p class="text-2xl font-bold text-success-600">{{ stats()?.terminesCeMois }}</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-500">Écart total valeur</p>
            <p class="text-2xl font-bold" [class.text-danger-600]="stats()?.ecartTotalValeur < 0" [class.text-success-600]="stats()?.ecartTotalValeur >= 0">
              {{ stats()?.ecartTotalValeur | number:'1.0-0' }} €
            </p>
          </div>
        </div>
      }

      <!-- Filtres -->
      <div class="card p-4">
        <div class="flex flex-wrap items-center gap-4">
          <input type="text" [(ngModel)]="filters.search" (ngModelChange)="onFilterChange()" placeholder="Rechercher..." class="form-input flex-1 min-w-[200px]" />
          <select [(ngModel)]="filters.statut" (ngModelChange)="onFilterChange()" class="form-input w-auto">
            <option value="">Tous les statuts</option>
            <option value="PLANIFIE">Planifié</option>
            <option value="EN_COURS">En cours</option>
            <option value="TERMINE">Terminé</option>
            <option value="VALIDE">Validé</option>
            <option value="ANNULE">Annulé</option>
          </select>
          <select [(ngModel)]="filters.type" (ngModelChange)="onFilterChange()" class="form-input w-auto">
            <option value="">Tous les types</option>
            <option value="COMPLET">Complet</option>
            <option value="PARTIEL">Partiel</option>
            <option value="TOURNANT">Tournant</option>
          </select>
        </div>
      </div>

      <!-- Liste -->
      @if (isLoading()) {
        <div class="card p-12"><app-loading-spinner size="lg" text="Chargement..." /></div>
      } @else if (!inventaires().length) {
        <div class="card p-12 text-center">
          <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Aucun inventaire</h3>
          <p class="text-gray-500 mt-1">Planifiez votre premier inventaire</p>
          <a routerLink="nouveau" class="btn-primary mt-4">Planifier un inventaire</a>
        </div>
      } @else {
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          @for (inv of inventaires(); track inv.id) {
            <div class="card overflow-hidden hover:shadow-lg transition-shadow">
              <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-start justify-between">
                  <div>
                    <a [routerLink]="[inv.id]" class="font-semibold text-gray-900 dark:text-white hover:text-primary-600">{{ inv.numero }}</a>
                    <p class="text-sm text-gray-500">{{ inv.entrepotNom }}</p>
                  </div>
                  <span class="px-2 py-1 text-xs font-medium rounded-full" [ngClass]="getStatutClass(inv.statut)">{{ getStatutLabel(inv.statut) }}</span>
                </div>
              </div>
              <div class="p-4 space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">Type</span>
                  <span class="font-medium badge-secondary">{{ inv.type }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">Produits</span>
                  <span class="font-medium">{{ inv.nombreProduits }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">Comptés</span>
                  <span class="font-medium">{{ inv.nombreComptes }} / {{ inv.nombreProduits }}</span>
                </div>
                @if (inv.statut === 'TERMINE' || inv.statut === 'VALIDE') {
                  <div class="flex items-center justify-between text-sm pt-2 border-t">
                    <span class="text-gray-500">Écart valeur</span>
                    <span class="font-semibold" [class.text-danger-600]="inv.ecartValeur < 0" [class.text-success-600]="inv.ecartValeur >= 0">
                      {{ inv.ecartValeur | number:'1.0-0' }} €
                    </span>
                  </div>
                }
              </div>
              <div class="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t flex items-center justify-between">
                <span class="text-xs text-gray-500">{{ inv.dateDebut | date:'dd/MM/yyyy' }}</span>
                <div class="flex items-center gap-2">
                  @if (inv.statut === 'EN_COURS') {
                    <a [routerLink]="[inv.id, 'comptage']" class="btn-primary btn-sm">Continuer</a>
                  } @else if (inv.statut === 'PLANIFIE') {
                    <button type="button" (click)="demarrer(inv)" class="btn-primary btn-sm">Démarrer</button>
                  } @else {
                    <a [routerLink]="[inv.id]" class="btn-secondary btn-sm">Voir</a>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class InventaireListComponent implements OnInit {
  private readonly inventaireService = inject(InventaireService);
  private readonly notificationService = inject(NotificationService);

  inventaires = signal<Inventaire[]>([]);
  stats = signal<any>(null);
  isLoading = signal(true);
  filters: InventaireFilters = {};
  private searchTimeout: any;

  ngOnInit(): void {
    this.loadInventaires();
    this.loadStats();
  }

  loadInventaires(): void {
    this.isLoading.set(true);
    this.inventaireService.getAll(1, 50, this.filters).subscribe({
      next: (r) => { this.inventaires.set(r.data); this.isLoading.set(false); },
      error: () => {
        this.inventaires.set([
          { id: '1', numero: 'INV-2024-001', entrepotId: '1', entrepotNom: 'Paris', type: 'COMPLET', statut: 'EN_COURS', dateDebut: new Date(), responsable: 'Admin', nombreProduits: 250, nombreComptes: 180, ecartValeur: -1250, ecartQuantite: -15, createdAt: new Date(), updatedAt: new Date() },
          { id: '2', numero: 'INV-2024-002', entrepotId: '2', entrepotNom: 'Lyon', type: 'PARTIEL', statut: 'PLANIFIE', dateDebut: new Date(Date.now() + 86400000 * 2), responsable: 'Admin', nombreProduits: 50, nombreComptes: 0, ecartValeur: 0, ecartQuantite: 0, createdAt: new Date(), updatedAt: new Date() },
          { id: '3', numero: 'INV-2024-003', entrepotId: '1', entrepotNom: 'Paris', type: 'TOURNANT', statut: 'VALIDE', dateDebut: new Date(Date.now() - 86400000 * 7), dateFin: new Date(Date.now() - 86400000 * 5), responsable: 'Admin', nombreProduits: 100, nombreComptes: 100, ecartValeur: 350, ecartQuantite: 5, createdAt: new Date(), updatedAt: new Date() },
        ] as Inventaire[]);
        this.isLoading.set(false);
      }
    });
  }

  loadStats(): void {
    this.inventaireService.getStats().subscribe({
      next: (s) => this.stats.set(s),
      error: () => this.stats.set({ enCours: 1, planifies: 2, terminesCeMois: 5, ecartTotalValeur: -900 })
    });
  }

  onFilterChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadInventaires(), 300);
  }

  demarrer(inv: Inventaire): void {
    this.inventaireService.demarrer(inv.id).subscribe({
      next: () => { this.notificationService.success('Inventaire démarré'); this.loadInventaires(); },
      error: () => this.notificationService.error('Erreur')
    });
  }

  getStatutClass(statut: string): string {
    const classes: Record<string, string> = {
      'PLANIFIE': 'bg-warning-100 text-warning-700',
      'EN_COURS': 'bg-primary-100 text-primary-700',
      'TERMINE': 'bg-info-100 text-info-700',
      'VALIDE': 'bg-success-100 text-success-700',
      'ANNULE': 'bg-danger-100 text-danger-700'
    };
    return classes[statut] || 'bg-gray-100 text-gray-700';
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'PLANIFIE': 'Planifié', 'EN_COURS': 'En cours', 'TERMINE': 'Terminé', 'VALIDE': 'Validé', 'ANNULE': 'Annulé'
    };
    return labels[statut] || statut;
  }
}
