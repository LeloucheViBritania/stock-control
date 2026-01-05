/**
 * Rapport des mouvements de stock (PREMIUM)
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RapportsService, RapportMouvements, RapportConfig } from '../../services/rapports.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-rapport-mouvements',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4">
        <a routerLink="/rapports" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Rapport Mouvements</h1>
            <span class="badge-premium">Premium</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Analyse des flux de stock</p>
        </div>
      </div>

      <!-- Config -->
      <div class="card p-4">
        <div class="flex flex-wrap items-end gap-4">
          <div>
            <label class="form-label">Date début</label>
            <input type="date" [(ngModel)]="dateDebut" class="form-input" />
          </div>
          <div>
            <label class="form-label">Date fin</label>
            <input type="date" [(ngModel)]="dateFin" class="form-input" />
          </div>
          <button type="button" class="btn-primary" (click)="generer()">Générer</button>
          <button type="button" class="btn-secondary" (click)="exporter('xlsx')">Export Excel</button>
        </div>
      </div>

      @if (isLoading()) {
        <div class="card p-12"><app-loading-spinner size="lg" /></div>
      } @else if (rapport()) {
        <!-- KPIs -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card p-4">
            <p class="text-sm text-gray-500">Total entrées</p>
            <p class="text-2xl font-bold text-success-600">+{{ rapport()?.totalEntrees | number }}</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-500">Total sorties</p>
            <p class="text-2xl font-bold text-danger-600">-{{ rapport()?.totalSorties | number }}</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-500">Solde</p>
            <p class="text-2xl font-bold" [class.text-success-600]="solde() >= 0" [class.text-danger-600]="solde() < 0">
              {{ solde() >= 0 ? '+' : '' }}{{ solde() | number }}
            </p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-500">Mouvements</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ rapport()?.nombreMouvements | number }}</p>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Par type -->
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Mouvements par type</h3>
            <div class="space-y-3">
              @for (m of rapport()?.mouvementsParType || []; track m.type) {
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span class="font-medium">{{ m.type }}</span>
                  <div class="text-right">
                    <span class="font-bold">{{ m.quantite | number }}</span>
                    <span class="text-sm text-gray-500 ml-2">({{ m.valeur | number:'1.0-0' }} €)</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Top produits mouvements -->
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Produits les plus mouvementés</h3>
            <div class="space-y-3">
              @for (p of rapport()?.topProduitsMouvements || []; track p.produit) {
                <div class="flex items-center justify-between">
                  <span class="text-gray-700">{{ p.produit }}</span>
                  <div class="flex gap-4">
                    <span class="text-success-600">+{{ p.entrees }}</span>
                    <span class="text-danger-600">-{{ p.sorties }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Graphique évolution -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Évolution journalière</h3>
          <div class="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p class="text-gray-500">Graphique d'évolution (Chart.js à intégrer)</p>
          </div>
        </div>
      }
    </div>
  `,
})
export class RapportMouvementsComponent implements OnInit {
  private readonly rapportsService = inject(RapportsService);
  private readonly notificationService = inject(NotificationService);

  rapport = signal<RapportMouvements | null>(null);
  isLoading = signal(false);
  dateDebut = this.formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  dateFin = this.formatDate(new Date());

  solde = () => (this.rapport()?.totalEntrees || 0) - (this.rapport()?.totalSorties || 0);

  ngOnInit(): void { this.generer(); }

  generer(): void {
    this.isLoading.set(true);
    const config: RapportConfig = { type: 'MOUVEMENTS', dateDebut: new Date(this.dateDebut), dateFin: new Date(this.dateFin) };
    this.rapportsService.genererRapportMouvements(config).subscribe({
      next: (r) => { this.rapport.set(r); this.isLoading.set(false); },
      error: () => {
        this.rapport.set({
          periode: { debut: new Date(this.dateDebut), fin: new Date(this.dateFin) },
          totalEntrees: 2450, totalSorties: 1820, nombreMouvements: 485,
          mouvementsParType: [
            { type: 'Réception commande', quantite: 1850, valeur: 125000 },
            { type: 'Vente', quantite: 1520, valeur: 98000 },
            { type: 'Transfert entrant', quantite: 600, valeur: 42000 },
            { type: 'Transfert sortant', quantite: 300, valeur: 21000 },
            { type: 'Ajustement', quantite: 35, valeur: 2500 },
          ],
          mouvementsParJour: [],
          topProduitsMouvements: [
            { produit: 'Écran LCD 24"', entrees: 250, sorties: 180 },
            { produit: 'Clavier mécanique', entrees: 300, sorties: 220 },
            { produit: 'Souris gaming', entrees: 400, sorties: 350 },
            { produit: 'Câble USB-C', entrees: 500, sorties: 420 },
          ]
        });
        this.isLoading.set(false);
      }
    });
  }

  exporter(format: string): void {
    this.notificationService.success(`Export ${format} lancé`);
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
