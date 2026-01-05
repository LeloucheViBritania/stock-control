/**
 * Création de bon de commande achat (PREMIUM)
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '@services/notification.service';

@Component({
  selector: 'app-bon-commande-achat',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center gap-4">
        <a routerLink="/reapprovisionnement" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Bon de Commande Achat</h1>
            <span class="badge-premium">Premium</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Créez une commande fournisseur</p>
        </div>
      </div>

      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fournisseur</h2>
        <select [(ngModel)]="fournisseurId" class="form-input w-full">
          <option value="">Sélectionner un fournisseur...</option>
          <option value="1">TechSupply - contact&#64;techsupply.com</option>
          <option value="2">DisplayPro - commandes&#64;displaypro.fr</option>
          <option value="3">KeyboardWorld - sales&#64;keyboardworld.com</option>
        </select>
      </div>

      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Produits</h2>
          <button type="button" class="btn-secondary btn-sm" (click)="addLigne()">+ Ajouter</button>
        </div>
        <div class="space-y-3">
          @for (ligne of lignes; track $index; let i = $index) {
            <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <select [(ngModel)]="ligne.produitId" class="form-input flex-1">
                <option value="">Sélectionner un produit...</option>
                <option value="1">Souris gaming RGB (MS-GAM-001)</option>
                <option value="2">Écran LCD 24" (LCD-24-002)</option>
                <option value="3">Clavier mécanique (KB-MECH-003)</option>
              </select>
              <input type="number" [(ngModel)]="ligne.quantite" placeholder="Qté" min="1" class="form-input w-24 text-center" />
              <input type="number" [(ngModel)]="ligne.prixUnitaire" placeholder="Prix" min="0" step="0.01" class="form-input w-32 text-right" />
              <span class="w-24 text-right font-semibold">{{ (ligne.quantite * ligne.prixUnitaire) | number:'1.2-2' }} €</span>
              <button type="button" (click)="removeLigne(i)" class="p-2 text-danger-600 hover:bg-danger-50 rounded">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          }
        </div>
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <div class="text-right">
            <p class="text-sm text-gray-500">Total HT</p>
            <p class="text-2xl font-bold text-primary-600">{{ totalHT() | number:'1.2-2' }} €</p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="form-label">Date de livraison souhaitée</label>
            <input type="date" [(ngModel)]="dateLivraison" class="form-input" />
          </div>
          <div>
            <label class="form-label">Référence interne</label>
            <input type="text" [(ngModel)]="reference" class="form-input" placeholder="BC-2024-XXX" />
          </div>
        </div>
        <div class="mt-4">
          <label class="form-label">Notes / Instructions</label>
          <textarea [(ngModel)]="notes" class="form-input" rows="3" placeholder="Instructions particulières..."></textarea>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3">
        <a routerLink="/reapprovisionnement" class="btn-secondary">Annuler</a>
        <button type="button" class="btn-secondary" (click)="sauvegarderBrouillon()">Sauvegarder brouillon</button>
        <button type="button" class="btn-primary" (click)="envoyerCommande()">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
          Envoyer la commande
        </button>
      </div>
    </div>
  `,
})
export class BonCommandeAchatComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  fournisseurId = '';
  dateLivraison = '';
  reference = '';
  notes = '';
  lignes: { produitId: string; quantite: number; prixUnitaire: number }[] = [];

  ngOnInit(): void {
    const produits = this.route.snapshot.queryParams['produits'];
    if (produits) {
      produits.split(',').forEach((id: string) => {
        this.lignes.push({ produitId: id, quantite: 1, prixUnitaire: 0 });
      });
    }
    if (!this.lignes.length) this.addLigne();
  }

  addLigne(): void {
    this.lignes.push({ produitId: '', quantite: 1, prixUnitaire: 0 });
  }

  removeLigne(index: number): void {
    this.lignes.splice(index, 1);
  }

  totalHT(): number {
    return this.lignes.reduce((sum, l) => sum + (l.quantite * l.prixUnitaire), 0);
  }

  sauvegarderBrouillon(): void {
    this.notificationService.success('Brouillon sauvegardé');
  }

  envoyerCommande(): void {
    this.notificationService.success('Commande envoyée au fournisseur');
    this.router.navigate(['/reapprovisionnement']);
  }
}
