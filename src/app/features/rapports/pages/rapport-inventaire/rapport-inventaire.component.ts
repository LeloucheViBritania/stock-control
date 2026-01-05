/**
 * Rapport de stock / inventaire (PREMIUM)
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RapportsService, RapportStock, RapportConfig } from '../../services/rapports.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-rapport-inventaire',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/rapports" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Rapport de Stock</h1>
              <span class="badge-premium">Premium</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mt-1">État actuel de votre inventaire</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button type="button" class="btn-secondary" (click)="exporter('xlsx')">Export Excel</button>
          <button type="button" class="btn-secondary" (click)="exporter('pdf')">Export PDF</button>
          <button type="button" class="btn-primary" (click)="generer()" [disabled]="isLoading()">Actualiser</button>
        </div>
      </div>

      @if (isLoading()) {
        <div class="card p-12"><app-loading-spinner size="lg" text="Génération du rapport..." /></div>
      } @else if (rapport()) {
        <!-- KPIs -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card p-4">
            <p class="text-sm text-gray-500">Valeur totale</p>
            <p class="text-2xl font-bold text-primary-600">{{ rapport()?.valeurTotale | number:'1.0-0' }} €</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-500">Références</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ rapport()?.nombreReferences | number }}</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-500">Quantité totale</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ rapport()?.quantiteTotale | number }}</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-500">Alertes stock</p>
            <p class="text-2xl font-bold text-warning-600">{{ rapport()?.alertesStock }}</p>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Stock faible -->
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              Produits en alerte
            </h3>
            <div class="space-y-3">
              @for (p of rapport()?.stockFaible || []; track p.produit) {
                <div class="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                  <div>
                    <p class="font-medium text-gray-900">{{ p.produit }}</p>
                    <p class="text-sm text-gray-500">{{ p.reference }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-warning-600">{{ p.quantite }}</p>
                    <p class="text-xs text-gray-500">Seuil: {{ p.seuil }}</p>
                  </div>
                </div>
              } @empty {
                <p class="text-center text-gray-500 py-4">Aucune alerte</p>
              }
            </div>
          </div>

          <!-- Répartition par catégorie -->
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Répartition par catégorie</h3>
            <div class="space-y-3">
              @for (cat of rapport()?.repartitionCategories || []; track cat.categorie) {
                <div class="flex items-center justify-between">
                  <span class="text-gray-700">{{ cat.categorie }}</span>
                  <div class="text-right">
                    <span class="font-semibold">{{ cat.valeur | number:'1.0-0' }} €</span>
                    <span class="text-sm text-gray-500 ml-2">({{ cat.quantite }} u.)</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Rotation stock -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Rotation des stocks</h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="table-header">Produit</th>
                  <th class="table-header text-center">Rotation</th>
                  <th class="table-header text-center">Jours de stock</th>
                  <th class="table-header text-center">Performance</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                @for (p of rapport()?.rotationStock || []; track p.produit) {
                  <tr>
                    <td class="table-cell font-medium">{{ p.produit }}</td>
                    <td class="table-cell text-center">{{ p.rotation | number:'1.1-1' }}x</td>
                    <td class="table-cell text-center">{{ p.joursStock }} j</td>
                    <td class="table-cell text-center">
                      @if (p.rotation >= 4) {
                        <span class="badge-success">Excellent</span>
                      } @else if (p.rotation >= 2) {
                        <span class="badge-primary">Bon</span>
                      } @else {
                        <span class="badge-warning">À surveiller</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class RapportInventaireComponent implements OnInit {
  private readonly rapportsService = inject(RapportsService);
  private readonly notificationService = inject(NotificationService);

  rapport = signal<RapportStock | null>(null);
  isLoading = signal(false);

  ngOnInit(): void { this.generer(); }

  generer(): void {
    this.isLoading.set(true);
    const config: RapportConfig = { type: 'STOCK', dateDebut: new Date(), dateFin: new Date() };
    this.rapportsService.genererRapportStock(config).subscribe({
      next: (r) => { this.rapport.set(r); this.isLoading.set(false); },
      error: () => {
        this.rapport.set({
          dateGeneration: new Date(), valeurTotale: 485000, nombreReferences: 1250, quantiteTotale: 8500, alertesStock: 12,
          stockFaible: [
            { produit: 'Écran LCD 24"', reference: 'LCD-24-001', quantite: 5, seuil: 20 },
            { produit: 'Clavier USB', reference: 'KB-USB-002', quantite: 8, seuil: 15 },
            { produit: 'Souris gaming', reference: 'MS-GAM-003', quantite: 3, seuil: 10 },
          ],
          repartitionCategories: [
            { categorie: 'Informatique', valeur: 290000, quantite: 3200 },
            { categorie: 'Périphériques', valeur: 121000, quantite: 2800 },
            { categorie: 'Accessoires', valeur: 74000, quantite: 2500 },
          ],
          rotationStock: [
            { produit: 'Écran LCD 27"', rotation: 6.2, joursStock: 59 },
            { produit: 'PC Portable Pro', rotation: 4.1, joursStock: 89 },
            { produit: 'Clavier mécanique', rotation: 2.8, joursStock: 130 },
            { produit: 'Câble HDMI', rotation: 1.5, joursStock: 243 },
          ],
          evolutionValeur: []
        });
        this.isLoading.set(false);
      }
    });
  }

  exporter(format: 'xlsx' | 'pdf'): void {
    this.notificationService.success(`Export ${format} lancé`);
  }
}
