/**
 * Scanner de Produits (PREMIUM)
 * Scan rapide avec caméra ou saisie manuelle
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '@services/notification.service';

interface ProduitScanne {
  id: string;
  reference: string;
  codeBarre: string;
  nom: string;
  stock: number;
  prixVente: number;
  emplacement: string;
  dateExpiration?: Date;
  image?: string;
}

interface HistoriqueScan {
  codeBarre: string;
  produit?: ProduitScanne;
  dateHeure: Date;
  succes: boolean;
}

@Component({
  selector: 'app-scanner-produit',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Scanner Produits</h1>
            <span class="badge-premium">Premium</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Scannez ou saisissez un code-barres</p>
        </div>
        <div class="flex gap-2">
          <a routerLink="/codes-barres/generation" class="btn-secondary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Générer codes
          </a>
          <a routerLink="/codes-barres/historique" class="btn-secondary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Historique
          </a>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Zone de scan -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Scanner un code-barres</h3>
          
          <!-- Caméra simulée -->
          <div class="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
            @if (cameraActive()) {
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-64 h-32 border-2 border-primary-500 rounded-lg animate-pulse"></div>
              </div>
              <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded">
                Positionnez le code-barres dans le cadre
              </div>
            } @else {
              <div class="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <svg class="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <p>Caméra inactive</p>
              </div>
            }
          </div>

          <div class="flex gap-2 mb-4">
            <button type="button" class="btn-primary flex-1" (click)="toggleCamera()">
              @if (cameraActive()) {
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/>
                </svg>
                Arrêter
              } @else {
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Activer caméra
              }
            </button>
            <button type="button" class="btn-secondary" (click)="simulerScan()" [disabled]="!cameraActive()">
              Simuler scan
            </button>
          </div>

          <!-- Saisie manuelle -->
          <div class="border-t pt-4">
            <label class="form-label">Saisie manuelle</label>
            <div class="flex gap-2">
              <input type="text" [(ngModel)]="codeManuel" class="form-input flex-1 font-mono" 
                placeholder="Ex: 3700123456789" (keyup.enter)="rechercherCode()" />
              <button type="button" class="btn-primary" (click)="rechercherCode()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Résultat du scan -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Résultat</h3>
          
          @if (produitActuel()) {
            <div class="space-y-4">
              <div class="flex items-start gap-4">
                <div class="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <h4 class="text-lg font-semibold text-gray-900 dark:text-white">{{ produitActuel()!.nom }}</h4>
                  <p class="text-sm text-gray-500">Réf: {{ produitActuel()!.reference }}</p>
                  <p class="text-xs text-gray-400 font-mono mt-1">{{ produitActuel()!.codeBarre }}</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p class="text-sm text-gray-500">Stock</p>
                  <p class="text-xl font-bold" [class.text-danger-600]="produitActuel()!.stock < 10">
                    {{ produitActuel()!.stock }} unités
                  </p>
                </div>
                <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p class="text-sm text-gray-500">Prix de vente</p>
                  <p class="text-xl font-bold text-primary-600">{{ produitActuel()!.prixVente | number:'1.2-2' }} €</p>
                </div>
                <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p class="text-sm text-gray-500">Emplacement</p>
                  <p class="font-semibold">{{ produitActuel()!.emplacement }}</p>
                </div>
                @if (produitActuel()!.dateExpiration) {
                  <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p class="text-sm text-gray-500">Expiration</p>
                    <p class="font-semibold">{{ produitActuel()!.dateExpiration | date:'dd/MM/yyyy' }}</p>
                  </div>
                }
              </div>

              <div class="flex gap-2 pt-4 border-t">
                <a [routerLink]="['/produits', produitActuel()!.id]" class="btn-primary flex-1">
                  Voir détails
                </a>
                <button type="button" class="btn-secondary" (click)="ajouterAuPanier()">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  Ajouter
                </button>
                <button type="button" class="btn-secondary" (click)="ajusterStock()">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Ajuster
                </button>
              </div>
            </div>
          } @else {
            <div class="text-center py-12 text-gray-400">
              <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
              </svg>
              <p>Scannez un code-barres pour voir les informations produit</p>
            </div>
          }
        </div>
      </div>

      <!-- Historique récent -->
      <div class="card p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Derniers scans</h3>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="text-left py-2 px-4 font-medium text-gray-600">Heure</th>
                <th class="text-left py-2 px-4 font-medium text-gray-600">Code</th>
                <th class="text-left py-2 px-4 font-medium text-gray-600">Produit</th>
                <th class="text-center py-2 px-4 font-medium text-gray-600">Statut</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              @for (scan of historiqueRecent(); track scan.dateHeure.getTime()) {
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td class="py-2 px-4 text-sm">{{ scan.dateHeure | date:'HH:mm:ss' }}</td>
                  <td class="py-2 px-4 font-mono text-sm">{{ scan.codeBarre }}</td>
                  <td class="py-2 px-4">
                    @if (scan.produit) {
                      <span class="text-gray-900 dark:text-white">{{ scan.produit.nom }}</span>
                    } @else {
                      <span class="text-gray-400 italic">Non trouvé</span>
                    }
                  </td>
                  <td class="py-2 px-4 text-center">
                    @if (scan.succes) {
                      <span class="px-2 py-1 text-xs bg-success-100 text-success-700 rounded-full">Trouvé</span>
                    } @else {
                      <span class="px-2 py-1 text-xs bg-danger-100 text-danger-700 rounded-full">Inconnu</span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="py-8 text-center text-gray-500">Aucun scan effectué</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class ScannerProduitComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  cameraActive = signal(false);
  codeManuel = '';
  produitActuel = signal<ProduitScanne | null>(null);
  historiqueRecent = signal<HistoriqueScan[]>([]);

  // Mock produits
  private produits: ProduitScanne[] = [
    { id: '1', reference: 'ECR-027-HD', codeBarre: '3700123456789', nom: 'Écran LCD 27"', stock: 45, prixVente: 299, emplacement: 'A1-R2-E3' },
    { id: '2', reference: 'CLV-MEC-RGB', codeBarre: '3700987654321', nom: 'Clavier mécanique RGB', stock: 120, prixVente: 89, emplacement: 'B2-R1-E1' },
    { id: '3', reference: 'SOU-SF-PRO', codeBarre: '3700111222333', nom: 'Souris sans fil Pro', stock: 8, prixVente: 45, emplacement: 'B2-R1-E2', dateExpiration: new Date('2025-06-15') },
  ];

  ngOnInit(): void {}

  toggleCamera(): void {
    this.cameraActive.update(v => !v);
    if (this.cameraActive()) {
      this.notificationService.info('Caméra activée');
    }
  }

  simulerScan(): void {
    const randomProduit = this.produits[Math.floor(Math.random() * this.produits.length)];
    this.traiterCode(randomProduit.codeBarre);
  }

  rechercherCode(): void {
    if (!this.codeManuel.trim()) return;
    this.traiterCode(this.codeManuel.trim());
    this.codeManuel = '';
  }

  private traiterCode(code: string): void {
    const produit = this.produits.find(p => p.codeBarre === code);
    const scan: HistoriqueScan = {
      codeBarre: code,
      produit: produit || undefined,
      dateHeure: new Date(),
      succes: !!produit
    };

    this.historiqueRecent.update(h => [scan, ...h.slice(0, 9)]);

    if (produit) {
      this.produitActuel.set(produit);
      this.notificationService.success(`Produit trouvé: ${produit.nom}`);
    } else {
      this.produitActuel.set(null);
      this.notificationService.warning('Code-barres non reconnu');
    }
  }

  ajouterAuPanier(): void {
    this.notificationService.success('Produit ajouté au panier');
  }

  ajusterStock(): void {
    this.notificationService.info('Ouverture du formulaire d\'ajustement...');
  }
}
