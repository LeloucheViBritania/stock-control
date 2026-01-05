/**
 * Génération de Codes-Barres (PREMIUM)
 * Création et impression de codes-barres/QR codes
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '@services/notification.service';

interface ProduitCode {
  id: string;
  reference: string;
  nom: string;
  codeBarre?: string;
  codeQR?: string;
}

interface ModeleEtiquette {
  id: string;
  nom: string;
  largeur: number;
  hauteur: number;
  format: 'CODE128' | 'EAN13' | 'QR';
  inclureNom: boolean;
  inclurePrix: boolean;
  inclureRef: boolean;
}

@Component({
  selector: 'app-generation-codes',
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
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Génération Codes-Barres</h1>
              <span class="badge-premium">Premium</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Créez et imprimez vos étiquettes</p>
          </div>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Configuration -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Type de code -->
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Type de code</h3>
            <div class="grid grid-cols-3 gap-4">
              @for (type of typesCode; track type.id) {
                <button type="button" class="p-4 border-2 rounded-lg text-center transition-all"
                  [class.border-primary-500]="typeSelectionne === type.id"
                  [class.bg-primary-50]="typeSelectionne === type.id"
                  (click)="typeSelectionne = type.id"
                >
                  <div class="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span class="text-2xl">{{ type.icon }}</span>
                  </div>
                  <p class="font-medium">{{ type.nom }}</p>
                  <p class="text-xs text-gray-500">{{ type.description }}</p>
                </button>
              }
            </div>
          </div>

          <!-- Sélection produits -->
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Produits à étiqueter</h3>
            <div class="flex gap-2 mb-4">
              <input type="text" [(ngModel)]="rechercheProduit" class="form-input flex-1" placeholder="Rechercher un produit..." />
              <button type="button" class="btn-secondary" (click)="selectionnerTous()">Tout sélectionner</button>
            </div>
            <div class="max-h-64 overflow-y-auto space-y-2">
              @for (produit of produitsFiltres(); track produit.id) {
                <label class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input type="checkbox" [checked]="produitsSelectionnes().includes(produit.id)" 
                    (change)="toggleProduit(produit.id)" class="rounded border-gray-300" />
                  <div class="flex-1">
                    <p class="font-medium text-gray-900 dark:text-white">{{ produit.nom }}</p>
                    <p class="text-xs text-gray-500">Réf: {{ produit.reference }}</p>
                  </div>
                  @if (produit.codeBarre) {
                    <span class="text-xs px-2 py-1 bg-success-100 text-success-700 rounded">Code existant</span>
                  } @else {
                    <span class="text-xs px-2 py-1 bg-warning-100 text-warning-700 rounded">À générer</span>
                  }
                </label>
              }
            </div>
            <p class="text-sm text-gray-500 mt-2">{{ produitsSelectionnes().length }} produit(s) sélectionné(s)</p>
          </div>

          <!-- Options d'impression -->
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Options d'étiquette</h3>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="form-label">Modèle</label>
                <select [(ngModel)]="modeleSelectionne" class="form-input">
                  @for (modele of modeles; track modele.id) {
                    <option [value]="modele.id">{{ modele.nom }} ({{ modele.largeur }}x{{ modele.hauteur }}mm)</option>
                  }
                </select>
              </div>
              <div>
                <label class="form-label">Quantité par produit</label>
                <input type="number" [(ngModel)]="quantiteParProduit" min="1" max="100" class="form-input" />
              </div>
            </div>
            <div class="mt-4 space-y-2">
              <label class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="options.inclureNom" class="rounded border-gray-300" />
                <span class="text-sm">Inclure le nom du produit</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="options.inclurePrix" class="rounded border-gray-300" />
                <span class="text-sm">Inclure le prix</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="options.inclureRef" class="rounded border-gray-300" />
                <span class="text-sm">Inclure la référence</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Aperçu -->
        <div class="space-y-6">
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Aperçu</h3>
            <div class="border-2 border-dashed rounded-lg p-4 bg-white">
              <div class="text-center">
                <!-- Simulation code-barres -->
                <div class="h-16 bg-gray-900 mx-auto mb-2" style="width: 150px; background: repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 2px, #fff 4px, #000 4px, #000 5px, #fff 5px, #fff 8px);"></div>
                <p class="font-mono text-sm">3700123456789</p>
                @if (options.inclureNom) {
                  <p class="font-medium text-sm mt-2">Nom du produit</p>
                }
                @if (options.inclureRef) {
                  <p class="text-xs text-gray-500">Réf: XXX-000</p>
                }
                @if (options.inclurePrix) {
                  <p class="font-bold text-primary-600 mt-1">29,99 €</p>
                }
              </div>
            </div>
            <p class="text-xs text-gray-500 text-center mt-2">
              {{ getModeleActuel()?.largeur }}mm x {{ getModeleActuel()?.hauteur }}mm
            </p>
          </div>

          <!-- Résumé -->
          <div class="card p-6 bg-primary-50 dark:bg-primary-900/20">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Résumé</h3>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="text-gray-600">Produits</dt>
                <dd class="font-semibold">{{ produitsSelectionnes().length }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-600">Étiquettes/produit</dt>
                <dd class="font-semibold">{{ quantiteParProduit }}</dd>
              </div>
              <div class="flex justify-between border-t pt-2">
                <dt class="text-gray-900 font-medium">Total étiquettes</dt>
                <dd class="font-bold text-primary-600">{{ produitsSelectionnes().length * quantiteParProduit }}</dd>
              </div>
            </dl>
          </div>

          <!-- Actions -->
          <div class="space-y-2">
            <button type="button" class="btn-primary w-full" (click)="genererCodes()" [disabled]="produitsSelectionnes().length === 0">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
              </svg>
              Générer les codes
            </button>
            <button type="button" class="btn-secondary w-full" (click)="imprimer()" [disabled]="produitsSelectionnes().length === 0">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              Imprimer
            </button>
            <button type="button" class="btn-secondary w-full" (click)="exporterPDF()">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Exporter PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class GenerationCodesComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  typesCode = [
    { id: 'CODE128', nom: 'Code 128', icon: '📊', description: 'Usage général' },
    { id: 'EAN13', nom: 'EAN-13', icon: '🏷️', description: 'Commerce détail' },
    { id: 'QR', nom: 'QR Code', icon: '📱', description: 'Mobile friendly' },
  ];

  modeles: ModeleEtiquette[] = [
    { id: '1', nom: 'Standard', largeur: 50, hauteur: 25, format: 'CODE128', inclureNom: true, inclurePrix: false, inclureRef: true },
    { id: '2', nom: 'Prix', largeur: 40, hauteur: 30, format: 'EAN13', inclureNom: true, inclurePrix: true, inclureRef: false },
    { id: '3', nom: 'Compact', largeur: 30, hauteur: 20, format: 'CODE128', inclureNom: false, inclurePrix: false, inclureRef: false },
  ];

  produits = signal<ProduitCode[]>([
    { id: '1', reference: 'ECR-027-HD', nom: 'Écran LCD 27"', codeBarre: '3700123456789' },
    { id: '2', reference: 'CLV-MEC-RGB', nom: 'Clavier mécanique RGB', codeBarre: '3700987654321' },
    { id: '3', reference: 'SOU-SF-PRO', nom: 'Souris sans fil Pro' },
    { id: '4', reference: 'CAS-BT-ANC', nom: 'Casque Bluetooth ANC' },
    { id: '5', reference: 'HUB-USB-4P', nom: 'Hub USB 4 ports' },
  ]);

  typeSelectionne = 'CODE128';
  modeleSelectionne = '1';
  quantiteParProduit = 1;
  rechercheProduit = '';
  produitsSelectionnes = signal<string[]>([]);
  options = { inclureNom: true, inclurePrix: false, inclureRef: true };

  produitsFiltres = signal<ProduitCode[]>([]);

  ngOnInit(): void {
    this.produitsFiltres.set(this.produits());
  }

  toggleProduit(id: string): void {
    this.produitsSelectionnes.update(sel => 
      sel.includes(id) ? sel.filter(s => s !== id) : [...sel, id]
    );
  }

  selectionnerTous(): void {
    const tous = this.produits().map(p => p.id);
    this.produitsSelectionnes.set(tous);
  }

  getModeleActuel(): ModeleEtiquette | undefined {
    return this.modeles.find(m => m.id === this.modeleSelectionne);
  }

  genererCodes(): void {
    const count = this.produitsSelectionnes().length;
    this.notificationService.success(`${count} code(s)-barres générés`);
  }

  imprimer(): void {
    this.notificationService.info('Préparation de l\'impression...');
  }

  exporterPDF(): void {
    this.notificationService.success('Export PDF en cours...');
  }
}
