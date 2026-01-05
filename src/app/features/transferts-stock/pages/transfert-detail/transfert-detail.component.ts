/**
 * Détail d'un transfert de stock (PREMIUM)
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TransfertsStockService, TransfertStock } from '../../services/transferts-stock.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-transfert-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      @if (isLoading()) {
        <div class="card p-12"><app-loading-spinner size="lg" text="Chargement..." /></div>
      } @else if (transfert()) {
        <!-- Header -->
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div class="flex items-start gap-4">
            <a routerLink="/transferts-stock" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </a>
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ transfert()?.numero }}</h1>
                <span class="badge-premium">Premium</span>
                <span class="px-3 py-1 text-sm font-medium rounded-full" [ngClass]="getStatutClass(transfert()?.statut || '')">
                  {{ getStatutLabel(transfert()?.statut || '') }}
                </span>
              </div>
              <div class="flex items-center gap-2 mt-2 text-gray-600">
                <span>{{ transfert()?.entrepotSourceNom }}</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
                <span>{{ transfert()?.entrepotDestinationNom }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            @switch (transfert()?.statut) {
              @case ('BROUILLON') {
                <button type="button" class="btn-primary" (click)="valider()">Valider le transfert</button>
              }
              @case ('EN_ATTENTE') {
                <button type="button" class="btn-primary" (click)="expedier()">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Expédier
                </button>
              }
              @case ('EN_COURS') {
                <button type="button" class="btn-primary" (click)="showReception.set(true)">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4"/>
                  </svg>
                  Réceptionner
                </button>
              }
            }
            @if (transfert()?.statut !== 'RECEPTIONNE' && transfert()?.statut !== 'ANNULE') {
              <button type="button" class="btn-secondary text-danger-600" (click)="annuler()">Annuler</button>
            }
          </div>
        </div>

        <!-- Infos -->
        <div class="grid gap-6 lg:grid-cols-3">
          <div class="card p-4">
            <p class="text-sm text-gray-500">Date création</p>
            <p class="font-semibold text-gray-900 dark:text-white">{{ transfert()?.dateCreation | date:'dd/MM/yyyy HH:mm' }}</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-500">Date expédition</p>
            <p class="font-semibold text-gray-900 dark:text-white">{{ transfert()?.dateExpedition ? (transfert()?.dateExpedition | date:'dd/MM/yyyy HH:mm') : '-' }}</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-500">Date réception</p>
            <p class="font-semibold text-gray-900 dark:text-white">{{ transfert()?.dateReception ? (transfert()?.dateReception | date:'dd/MM/yyyy HH:mm') : '-' }}</p>
          </div>
        </div>

        <!-- Lignes -->
        <div class="card overflow-hidden">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="font-semibold text-gray-900 dark:text-white">Articles ({{ transfert()?.lignes?.length || 0 }})</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="table-header">Produit</th>
                  <th class="table-header text-center">Demandé</th>
                  <th class="table-header text-center">Expédié</th>
                  <th class="table-header text-center">Reçu</th>
                  <th class="table-header text-center">Écart</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                @for (ligne of transfert()?.lignes || []; track ligne.id) {
                  <tr>
                    <td class="table-cell">
                      <p class="font-medium text-gray-900 dark:text-white">{{ ligne.produitNom }}</p>
                      <p class="text-sm text-gray-500">{{ ligne.produitReference }}</p>
                    </td>
                    <td class="table-cell text-center font-medium">{{ ligne.quantiteDemandee }}</td>
                    <td class="table-cell text-center">{{ ligne.quantiteExpediee || '-' }}</td>
                    <td class="table-cell text-center">{{ ligne.quantiteRecue || '-' }}</td>
                    <td class="table-cell text-center">
                      @if (ligne.ecart !== undefined && ligne.ecart !== null) {
                        <span [class.text-danger-600]="ligne.ecart < 0" [class.text-success-600]="ligne.ecart > 0">
                          {{ ligne.ecart > 0 ? '+' : '' }}{{ ligne.ecart }}
                        </span>
                      } @else {
                        -
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Notes -->
        @if (transfert()?.notes) {
          <div class="card p-4">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
            <p class="text-gray-600">{{ transfert()?.notes }}</p>
          </div>
        }

        <!-- Modal réception -->
        @if (showReception()) {
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">Réception du transfert</h2>
              </div>
              <div class="p-6 space-y-4">
                @for (ligne of receptionLignes; track ligne.ligneId; let i = $index) {
                  <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p class="font-medium">{{ ligne.produitNom }}</p>
                      <p class="text-sm text-gray-500">Expédié: {{ ligne.quantiteExpediee }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <label class="text-sm text-gray-500">Reçu:</label>
                      <input type="number" [(ngModel)]="ligne.quantiteRecue" min="0" [max]="ligne.quantiteExpediee" class="form-input w-24 text-center" />
                    </div>
                  </div>
                }
              </div>
              <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button type="button" class="btn-secondary" (click)="showReception.set(false)">Annuler</button>
                <button type="button" class="btn-primary" (click)="confirmerReception()">Confirmer la réception</button>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class TransfertDetailComponent implements OnInit {
  private readonly transfertsService = inject(TransfertsStockService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  transfert = signal<TransfertStock | null>(null);
  isLoading = signal(true);
  showReception = signal(false);
  receptionLignes: { ligneId: string; produitNom: string; quantiteExpediee: number; quantiteRecue: number }[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) this.loadTransfert(id);
  }

  loadTransfert(id: string): void {
    this.transfertsService.getById(id).subscribe({
      next: (t) => { this.transfert.set(t); this.prepareReception(t); this.isLoading.set(false); },
      error: () => {
        this.transfert.set({
          id, numero: 'TR-2024-001', entrepotSourceId: '1', entrepotSourceNom: 'Paris',
          entrepotDestinationId: '2', entrepotDestinationNom: 'Lyon', statut: 'EN_COURS',
          dateCreation: new Date(), dateExpedition: new Date(), nombreArticles: 3, demandePar: 'Admin',
          lignes: [
            { id: '1', produitId: '1', produitNom: 'Écran LCD 24"', produitReference: 'LCD-24-001', quantiteDemandee: 50, quantiteExpediee: 50, quantiteRecue: 0, ecart: 0 },
            { id: '2', produitId: '2', produitNom: 'Clavier mécanique', produitReference: 'KB-MECH-002', quantiteDemandee: 100, quantiteExpediee: 100, quantiteRecue: 0, ecart: 0 },
          ],
          createdAt: new Date(), updatedAt: new Date()
        } as TransfertStock);
        this.prepareReception(this.transfert()!);
        this.isLoading.set(false);
      }
    });
  }

  prepareReception(t: TransfertStock): void {
    this.receptionLignes = (t.lignes || []).map(l => ({
      ligneId: l.id, produitNom: l.produitNom, quantiteExpediee: l.quantiteExpediee, quantiteRecue: l.quantiteExpediee
    }));
  }

  valider(): void {
    this.transfertsService.valider(this.transfert()!.id).subscribe({
      next: () => { this.notificationService.success('Transfert validé'); this.loadTransfert(this.transfert()!.id); },
      error: () => this.notificationService.error('Erreur')
    });
  }

  expedier(): void {
    this.transfertsService.expedier(this.transfert()!.id).subscribe({
      next: () => { this.notificationService.success('Transfert expédié'); this.loadTransfert(this.transfert()!.id); },
      error: () => this.notificationService.error('Erreur')
    });
  }

  confirmerReception(): void {
    const lignes = this.receptionLignes.map(l => ({ ligneId: l.ligneId, quantiteRecue: l.quantiteRecue }));
    this.transfertsService.receptionner(this.transfert()!.id, lignes).subscribe({
      next: () => { this.notificationService.success('Transfert réceptionné'); this.showReception.set(false); this.loadTransfert(this.transfert()!.id); },
      error: () => this.notificationService.error('Erreur')
    });
  }

  annuler(): void {
    if (confirm('Annuler ce transfert ?')) {
      this.transfertsService.annuler(this.transfert()!.id, 'Annulation manuelle').subscribe({
        next: () => { this.notificationService.success('Transfert annulé'); this.router.navigate(['/transferts-stock']); },
        error: () => this.notificationService.error('Erreur')
      });
    }
  }

  getStatutClass(statut: string): string {
    const classes: Record<string, string> = {
      'BROUILLON': 'bg-gray-100 text-gray-700', 'EN_ATTENTE': 'bg-warning-100 text-warning-700',
      'EN_COURS': 'bg-primary-100 text-primary-700', 'RECEPTIONNE': 'bg-success-100 text-success-700', 'ANNULE': 'bg-danger-100 text-danger-700'
    };
    return classes[statut] || 'bg-gray-100 text-gray-700';
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = { 'BROUILLON': 'Brouillon', 'EN_ATTENTE': 'En attente', 'EN_COURS': 'En cours', 'RECEPTIONNE': 'Réceptionné', 'ANNULE': 'Annulé' };
    return labels[statut] || statut;
  }
}
