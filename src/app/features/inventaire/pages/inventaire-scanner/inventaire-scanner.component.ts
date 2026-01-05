/**
 * Scanner d'inventaire avec code-barres (PREMIUM)
 */
import { Component, OnInit, inject, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventaireService } from '../../services/inventaire.service';
import { NotificationService } from '@services/notification.service';

interface ProduitScan {
  id: string;
  reference: string;
  codeBarre: string;
  nom: string;
  stockTheorique: number;
  stockCompte: number;
  ecart: number;
  valide: boolean;
  dateComptage: Date;
}

@Component({
  selector: 'app-inventaire-scanner',
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
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Scanner Inventaire</h1>
              <span class="badge-premium">Premium</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Comptage rapide par code-barres</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500">{{ produitsScanes().length }} produits scannés</span>
          <button type="button" class="btn-primary" (click)="validerSession()" [disabled]="produitsScanes().length === 0">
            Valider la session
          </button>
        </div>
      </div>

      <!-- Zone de scan -->
      <div class="card p-6">
        <div class="flex items-center gap-4 mb-6">
          <div class="flex-1 relative">
            <input 
              #scanInput
              type="text" 
              [(ngModel)]="codeBarreInput"
              (keydown.enter)="scanCodeBarre()"
              placeholder="Scanner ou saisir le code-barres..."
              class="form-input text-lg pl-12"
              autofocus
            />
            <svg class="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
            </svg>
          </div>
          <button type="button" class="btn-secondary" (click)="toggleCamera()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Caméra
          </button>
        </div>

        <!-- Produit en cours de comptage -->
        @if (produitEnCours()) {
          <div class="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border-2 border-primary-500">
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-sm text-primary-600 font-medium">Produit scanné</p>
                <p class="text-xl font-bold text-gray-900 dark:text-white">{{ produitEnCours()!.nom }}</p>
                <p class="text-sm text-gray-500">Réf: {{ produitEnCours()!.reference }} | Code: {{ produitEnCours()!.codeBarre }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-500">Stock théorique</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ produitEnCours()!.stockTheorique }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <label class="form-label">Quantité comptée</label>
                <input 
                  #quantiteInput
                  type="number" 
                  [(ngModel)]="quantiteComptee"
                  (keydown.enter)="validerComptage()"
                  class="form-input text-2xl font-bold text-center"
                  min="0"
                />
              </div>
              <button type="button" class="btn-primary h-14 px-8" (click)="validerComptage()">
                Valider
              </button>
            </div>
            @if (quantiteComptee !== null && quantiteComptee !== produitEnCours()!.stockTheorique) {
              <div class="mt-3 p-3 rounded-lg" [class.bg-danger-100]="ecartActuel() < 0" [class.bg-warning-100]="ecartActuel() > 0">
                <p class="text-sm font-medium" [class.text-danger-700]="ecartActuel() < 0" [class.text-warning-700]="ecartActuel() > 0">
                  Écart détecté: {{ ecartActuel() > 0 ? '+' : '' }}{{ ecartActuel() }} unités
                </p>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-8 text-gray-500">
            <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
            </svg>
            <p class="text-lg">Scannez un code-barres pour commencer</p>
            <p class="text-sm mt-2">Ou saisissez le code manuellement</p>
          </div>
        }
      </div>

      <!-- Résumé session -->
      <div class="grid grid-cols-4 gap-4">
        <div class="card p-4 text-center">
          <p class="text-3xl font-bold text-primary-600">{{ produitsScanes().length }}</p>
          <p class="text-sm text-gray-500">Produits scannés</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-3xl font-bold text-success-600">{{ produitsOK() }}</p>
          <p class="text-sm text-gray-500">Sans écart</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-3xl font-bold text-warning-600">{{ produitsEcartPositif() }}</p>
          <p class="text-sm text-gray-500">Surplus</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-3xl font-bold text-danger-600">{{ produitsEcartNegatif() }}</p>
          <p class="text-sm text-gray-500">Manquants</p>
        </div>
      </div>

      <!-- Liste des produits scannés -->
      @if (produitsScanes().length > 0) {
        <div class="card">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 class="font-semibold text-gray-900 dark:text-white">Produits comptés</h3>
            <button type="button" class="text-sm text-danger-600 hover:underline" (click)="clearSession()">
              Effacer tout
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Théorique</th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Compté</th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Écart</th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Heure</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                @for (p of produitsScanes(); track p.id) {
                  <tr>
                    <td class="px-4 py-3">
                      <p class="font-medium text-gray-900 dark:text-white">{{ p.nom }}</p>
                      <p class="text-xs text-gray-500">{{ p.reference }}</p>
                    </td>
                    <td class="px-4 py-3 text-center">{{ p.stockTheorique }}</td>
                    <td class="px-4 py-3 text-center font-semibold">{{ p.stockCompte }}</td>
                    <td class="px-4 py-3 text-center">
                      <span class="px-2 py-1 text-xs font-medium rounded-full"
                        [class.bg-success-100]="p.ecart === 0"
                        [class.text-success-700]="p.ecart === 0"
                        [class.bg-warning-100]="p.ecart > 0"
                        [class.text-warning-700]="p.ecart > 0"
                        [class.bg-danger-100]="p.ecart < 0"
                        [class.text-danger-700]="p.ecart < 0"
                      >
                        {{ p.ecart === 0 ? 'OK' : (p.ecart > 0 ? '+' : '') + p.ecart }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center text-sm text-gray-500">{{ p.dateComptage | date:'HH:mm' }}</td>
                    <td class="px-4 py-3 text-right">
                      <button type="button" class="text-primary-600 hover:underline text-sm" (click)="recompter(p)">
                        Recompter
                      </button>
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
export class InventaireScannerComponent implements OnInit {
  @ViewChild('scanInput') scanInput!: ElementRef<HTMLInputElement>;
  @ViewChild('quantiteInput') quantiteInput!: ElementRef<HTMLInputElement>;

  private readonly inventaireService = inject(InventaireService);
  private readonly notificationService = inject(NotificationService);

  codeBarreInput = '';
  quantiteComptee: number | null = null;
  produitEnCours = signal<ProduitScan | null>(null);
  produitsScanes = signal<ProduitScan[]>([]);

  // Mock produits
  private mockProduits: Record<string, Partial<ProduitScan>> = {
    '3760123456789': { id: '1', reference: 'LCD-24-001', nom: 'Écran LCD 24"', stockTheorique: 45 },
    '3760123456790': { id: '2', reference: 'KB-MECH-001', nom: 'Clavier mécanique RGB', stockTheorique: 120 },
    '3760123456791': { id: '3', reference: 'MS-GAM-001', nom: 'Souris gaming', stockTheorique: 85 },
    '3760123456792': { id: '4', reference: 'HDMI-2M', nom: 'Câble HDMI 2m', stockTheorique: 250 },
    '3760123456793': { id: '5', reference: 'USB-HUB-4', nom: 'Hub USB 4 ports', stockTheorique: 67 },
  };

  ecartActuel = computed(() => {
    const p = this.produitEnCours();
    if (!p || this.quantiteComptee === null) return 0;
    return this.quantiteComptee - p.stockTheorique;
  });

  produitsOK = computed(() => this.produitsScanes().filter(p => p.ecart === 0).length);
  produitsEcartPositif = computed(() => this.produitsScanes().filter(p => p.ecart > 0).length);
  produitsEcartNegatif = computed(() => this.produitsScanes().filter(p => p.ecart < 0).length);

  ngOnInit(): void {}

  scanCodeBarre(): void {
    const code = this.codeBarreInput.trim();
    if (!code) return;

    const produitData = this.mockProduits[code];
    if (produitData) {
      this.produitEnCours.set({
        ...produitData,
        codeBarre: code,
        stockCompte: 0,
        ecart: 0,
        valide: false,
        dateComptage: new Date()
      } as ProduitScan);
      this.quantiteComptee = produitData.stockTheorique || 0;
      this.codeBarreInput = '';
      
      setTimeout(() => {
        this.quantiteInput?.nativeElement?.focus();
        this.quantiteInput?.nativeElement?.select();
      }, 100);
    } else {
      this.notificationService.warning('Produit non trouvé: ' + code);
      this.codeBarreInput = '';
    }
  }

  validerComptage(): void {
    const p = this.produitEnCours();
    if (!p || this.quantiteComptee === null) return;

    const produitCompte: ProduitScan = {
      ...p,
      stockCompte: this.quantiteComptee,
      ecart: this.quantiteComptee - p.stockTheorique,
      valide: true,
      dateComptage: new Date()
    };

    // Remplacer si déjà scanné, sinon ajouter
    const existing = this.produitsScanes().findIndex(x => x.id === p.id);
    if (existing >= 0) {
      this.produitsScanes.update(list => {
        const updated = [...list];
        updated[existing] = produitCompte;
        return updated;
      });
    } else {
      this.produitsScanes.update(list => [produitCompte, ...list]);
    }

    this.notificationService.success(`${p.nom} compté: ${this.quantiteComptee} unités`);
    this.produitEnCours.set(null);
    this.quantiteComptee = null;
    this.scanInput?.nativeElement?.focus();
  }

  recompter(produit: ProduitScan): void {
    this.produitEnCours.set(produit);
    this.quantiteComptee = produit.stockCompte;
    setTimeout(() => {
      this.quantiteInput?.nativeElement?.focus();
      this.quantiteInput?.nativeElement?.select();
    }, 100);
  }

  clearSession(): void {
    if (confirm('Effacer tous les comptages de cette session ?')) {
      this.produitsScanes.set([]);
      this.produitEnCours.set(null);
      this.quantiteComptee = null;
    }
  }

  validerSession(): void {
    if (confirm(`Valider ${this.produitsScanes().length} produits comptés ?`)) {
      this.notificationService.success('Session de comptage validée !');
      // TODO: Envoyer au backend
    }
  }

  toggleCamera(): void {
    this.notificationService.info('Fonctionnalité caméra disponible sur mobile');
  }
}
