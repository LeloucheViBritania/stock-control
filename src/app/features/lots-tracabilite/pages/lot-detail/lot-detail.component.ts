/**
 * Détail d'un Lot (PREMIUM)
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
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

interface Mouvement {
  id: string;
  type: 'ENTREE' | 'SORTIE' | 'AJUSTEMENT' | 'TRANSFERT';
  quantite: number;
  reference?: string;
  utilisateur: string;
  date: Date;
  commentaire?: string;
}

@Component({
  selector: 'app-lot-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a routerLink="/lots" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white font-mono">{{ lot()?.numeroLot }}</h1>
              <span class="badge-premium">Premium</span>
              <span class="px-2 py-1 text-xs font-medium rounded-full"
                [class.bg-success-100]="lot()?.statut === 'ACTIF'"
                [class.text-success-700]="lot()?.statut === 'ACTIF'"
                [class.bg-danger-100]="lot()?.statut === 'BLOQUE'"
                [class.text-danger-700]="lot()?.statut === 'BLOQUE'"
              >{{ lot()?.statut }}</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mt-1">{{ lot()?.produitNom }}</p>
          </div>
        </div>
        <div class="flex gap-2">
          @if (lot()?.statut === 'ACTIF') {
            <button type="button" class="btn-danger" (click)="bloquerLot()">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
              </svg>
              Bloquer
            </button>
          } @else if (lot()?.statut === 'BLOQUE') {
            <button type="button" class="btn-success" (click)="debloquerLot()">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Débloquer
            </button>
          }
          <button type="button" class="btn-secondary" (click)="imprimerEtiquette()">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
            </svg>
            Imprimer étiquette
          </button>
        </div>
      </div>

      <!-- Informations principales -->
      <div class="grid gap-6 lg:grid-cols-3">
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Informations du lot</h3>
          <dl class="space-y-3">
            <div class="flex justify-between">
              <dt class="text-gray-500">N° Lot</dt>
              <dd class="font-mono font-semibold">{{ lot()?.numeroLot }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Produit</dt>
              <dd>
                <a [routerLink]="['/produits', lot()?.produitId]" class="text-primary-600 hover:underline">{{ lot()?.produitNom }}</a>
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Référence</dt>
              <dd>{{ lot()?.produitReference }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Fournisseur</dt>
              <dd>{{ lot()?.fournisseur }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Prix d'achat</dt>
              <dd class="font-semibold">{{ lot()?.prixAchat | number:'1.2-2' }} €</dd>
            </div>
          </dl>
        </div>

        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Stock</h3>
          <div class="text-center mb-4">
            <p class="text-4xl font-bold text-primary-600">{{ lot()?.quantiteRestante }}</p>
            <p class="text-gray-500">sur {{ lot()?.quantiteInitiale }} unités initiales</p>
          </div>
          <div class="w-full h-3 bg-gray-200 rounded-full">
            <div class="h-full bg-primary-500 rounded-full transition-all" 
              [style.width.%]="lot() ? (lot()!.quantiteRestante / lot()!.quantiteInitiale) * 100 : 0"></div>
          </div>
          <div class="mt-4 pt-4 border-t">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Entrepôt</span>
              <span class="font-medium">{{ lot()?.entrepot }}</span>
            </div>
            @if (lot()?.zone) {
              <div class="flex justify-between text-sm mt-2">
                <span class="text-gray-500">Zone</span>
                <span class="font-medium">{{ lot()?.zone }}</span>
              </div>
            }
          </div>
        </div>

        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Dates</h3>
          <dl class="space-y-3">
            <div class="flex justify-between">
              <dt class="text-gray-500">Production</dt>
              <dd class="font-medium">{{ lot()?.dateProduction | date:'dd/MM/yyyy' }}</dd>
            </div>
            @if (lot()?.dateExpiration) {
              <div class="flex justify-between">
                <dt class="text-gray-500">Expiration</dt>
                <dd class="font-medium" [class.text-danger-600]="isExpiringSoon()">
                  {{ lot()?.dateExpiration | date:'dd/MM/yyyy' }}
                  @if (isExpiringSoon()) {
                    <span class="block text-xs">{{ getDaysUntilExpiration() }} jours restants</span>
                  }
                </dd>
              </div>
            }
          </dl>
          @if (lot()?.commentaire) {
            <div class="mt-4 pt-4 border-t">
              <p class="text-sm text-gray-500">Commentaire</p>
              <p class="text-sm mt-1">{{ lot()?.commentaire }}</p>
            </div>
          }
        </div>
      </div>

      <!-- Historique des mouvements -->
      <div class="card p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Historique des mouvements</h3>
        <div class="space-y-4">
          @for (mouvement of mouvements(); track mouvement.id) {
            <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="w-10 h-10 rounded-full flex items-center justify-center"
                [class.bg-success-100]="mouvement.type === 'ENTREE'"
                [class.bg-danger-100]="mouvement.type === 'SORTIE'"
                [class.bg-warning-100]="mouvement.type === 'AJUSTEMENT'"
                [class.bg-primary-100]="mouvement.type === 'TRANSFERT'"
              >
                @switch (mouvement.type) {
                  @case ('ENTREE') {
                    <svg class="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                  }
                  @case ('SORTIE') {
                    <svg class="w-5 h-5 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                    </svg>
                  }
                  @default {
                    <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                    </svg>
                  }
                }
              </div>
              <div class="flex-1">
                <p class="font-medium">{{ mouvement.type }} - {{ mouvement.quantite }} unités</p>
                <p class="text-sm text-gray-500">{{ mouvement.reference || 'Pas de référence' }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium">{{ mouvement.utilisateur }}</p>
                <p class="text-xs text-gray-500">{{ mouvement.date | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
            </div>
          } @empty {
            <p class="text-center text-gray-500 py-4">Aucun mouvement enregistré</p>
          }
        </div>
      </div>
    </div>
  `,
})
export class LotDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);

  lot = signal<Lot | null>(null);
  mouvements = signal<Mouvement[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadLot(id);
  }

  loadLot(id: string): void {
    const today = new Date();
    this.lot.set({
      id, numeroLot: 'LOT-2025-001', produitId: '1', produitNom: 'Écran LCD 27"', produitReference: 'ECR-027',
      quantiteInitiale: 100, quantiteRestante: 45, dateProduction: new Date('2024-11-15'),
      dateExpiration: new Date(today.getTime() + 15 * 86400000), fournisseur: 'TechSupply', entrepot: 'Paris Central',
      zone: 'A1', statut: 'ACTIF', prixAchat: 150
    });

    this.mouvements.set([
      { id: '1', type: 'ENTREE', quantite: 100, reference: 'REC-2024-456', utilisateur: 'Jean Dupont', date: new Date('2024-11-15'), commentaire: 'Réception initiale' },
      { id: '2', type: 'SORTIE', quantite: 30, reference: 'CMD-2024-789', utilisateur: 'Marie Martin', date: new Date('2024-12-01'), commentaire: 'Commande client' },
      { id: '3', type: 'SORTIE', quantite: 25, reference: 'CMD-2024-890', utilisateur: 'Pierre Bernard', date: new Date('2024-12-20') },
    ]);
  }

  isExpiringSoon(): boolean {
    const lot = this.lot();
    if (!lot?.dateExpiration) return false;
    const diff = new Date(lot.dateExpiration).getTime() - new Date().getTime();
    return diff <= 30 * 86400000 && diff > 0;
  }

  getDaysUntilExpiration(): number {
    const lot = this.lot();
    if (!lot?.dateExpiration) return 999;
    const diff = new Date(lot.dateExpiration).getTime() - new Date().getTime();
    return Math.ceil(diff / 86400000);
  }

  bloquerLot(): void {
    const lot = this.lot();
    if (lot) {
      lot.statut = 'BLOQUE';
      this.lot.set({ ...lot });
      this.notificationService.warning('Lot bloqué');
    }
  }

  debloquerLot(): void {
    const lot = this.lot();
    if (lot) {
      lot.statut = 'ACTIF';
      this.lot.set({ ...lot });
      this.notificationService.success('Lot débloqué');
    }
  }

  imprimerEtiquette(): void {
    this.notificationService.info('Impression de l\'étiquette...');
  }
}
