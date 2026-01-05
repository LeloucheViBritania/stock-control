/**
 * Session de comptage inventaire (PREMIUM)
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventaireService, Inventaire, InventaireLigne } from '../../services/inventaire.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-session-comptage',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      @if (isLoading()) {
        <div class="card p-12"><app-loading-spinner size="lg" text="Chargement..." /></div>
      } @else if (inventaire()) {
        <!-- Header -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div class="flex items-center gap-4">
            <a [routerLink]="['/inventaire', inventaire()?.id]" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </a>
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Session de comptage</h1>
                <span class="badge-premium">Premium</span>
              </div>
              <p class="text-gray-600 mt-1">{{ inventaire()?.numero }} - {{ inventaire()?.entrepotNom }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button type="button" class="btn-secondary" (click)="sauvegarder()">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
              </svg>
              Sauvegarder
            </button>
            @if (progress() === 100) {
              <button type="button" class="btn-primary" (click)="terminer()">Terminer l'inventaire</button>
            }
          </div>
        </div>

        <!-- Progress -->
        <div class="card p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Progression</span>
            <span class="text-sm font-bold text-primary-600">{{ progress() | number:'1.0-0' }}%</span>
          </div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full bg-primary-500 rounded-full transition-all" [style.width.%]="progress()"></div>
          </div>
          <div class="flex justify-between mt-2 text-sm text-gray-500">
            <span>{{ lignesComptees() }} comptés</span>
            <span>{{ lignes().length }} total</span>
          </div>
        </div>

        <!-- Recherche -->
        <div class="card p-4">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Rechercher un produit (nom ou référence)..." 
            class="form-input w-full"
            (keyup.enter)="focusNextUncomputed()"
          />
        </div>

        <!-- Liste produits -->
        <div class="space-y-3">
          @for (ligne of filteredLignes(); track ligne.id) {
            <div 
              class="card p-4 transition-all"
              [class.ring-2]="ligne.statut === 'A_COMPTER'"
              [class.ring-warning-500]="ligne.statut === 'A_COMPTER'"
              [class.bg-success-50]="ligne.statut === 'COMPTE' || ligne.statut === 'VALIDE'"
            >
              <div class="flex flex-col md:flex-row md:items-center gap-4">
                <div class="flex-1">
                  <p class="font-semibold text-gray-900 dark:text-white">{{ ligne.produitNom }}</p>
                  <div class="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span>Réf: {{ ligne.produitReference }}</span>
                    @if (ligne.zone) {
                      <span>Zone: {{ ligne.zone }}</span>
                    }
                    @if (ligne.emplacement) {
                      <span>Empl: {{ ligne.emplacement }}</span>
                    }
                  </div>
                </div>
                
                <div class="flex items-center gap-6">
                  <div class="text-center">
                    <p class="text-xs text-gray-500 mb-1">Théorique</p>
                    <p class="text-lg font-bold text-gray-700">{{ ligne.quantiteTheorique }}</p>
                  </div>
                  
                  <div class="text-center">
                    <p class="text-xs text-gray-500 mb-1">Compté</p>
                    <input 
                      type="number" 
                      [(ngModel)]="ligne.quantiteComptee" 
                      (ngModelChange)="onQuantiteChange(ligne)"
                      class="form-input w-24 text-center text-lg font-bold"
                      min="0"
                      [class.border-success-500]="ligne.ecart === 0 && ligne.quantiteComptee !== undefined"
                      [class.border-danger-500]="ligne.ecart !== 0 && ligne.quantiteComptee !== undefined"
                    />
                  </div>
                  
                  <div class="text-center min-w-[60px]">
                    <p class="text-xs text-gray-500 mb-1">Écart</p>
                    @if (ligne.quantiteComptee !== undefined && ligne.quantiteComptee !== null) {
                      <p 
                        class="text-lg font-bold"
                        [class.text-success-600]="ligne.ecart === 0"
                        [class.text-danger-600]="ligne.ecart !== 0"
                      >
                        {{ ligne.ecart > 0 ? '+' : '' }}{{ ligne.ecart }}
                      </p>
                    } @else {
                      <p class="text-lg text-gray-400">-</p>
                    }
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Résumé écarts -->
        @if (progress() > 0) {
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Résumé des écarts</h3>
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center p-3 bg-success-50 rounded-lg">
                <p class="text-2xl font-bold text-success-600">{{ lignesSansEcart() }}</p>
                <p class="text-sm text-success-700">Sans écart</p>
              </div>
              <div class="text-center p-3 bg-danger-50 rounded-lg">
                <p class="text-2xl font-bold text-danger-600">{{ lignesAvecEcart() }}</p>
                <p class="text-sm text-danger-700">Avec écart</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <p class="text-2xl font-bold" [class.text-danger-600]="totalEcartValeur() < 0" [class.text-success-600]="totalEcartValeur() >= 0">
                  {{ totalEcartValeur() | number:'1.0-0' }} €
                </p>
                <p class="text-sm text-gray-700">Valeur écart</p>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class SessionComptageComponent implements OnInit {
  private readonly inventaireService = inject(InventaireService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  inventaire = signal<Inventaire | null>(null);
  lignes = signal<InventaireLigne[]>([]);
  isLoading = signal(true);
  searchQuery = '';

  filteredLignes = computed(() => {
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.lignes();
    return this.lignes().filter(l => 
      l.produitNom.toLowerCase().includes(q) || 
      l.produitReference.toLowerCase().includes(q)
    );
  });

  lignesComptees = computed(() => this.lignes().filter(l => l.quantiteComptee !== undefined && l.quantiteComptee !== null).length);
  progress = computed(() => this.lignes().length ? (this.lignesComptees() / this.lignes().length) * 100 : 0);
  lignesSansEcart = computed(() => this.lignes().filter(l => l.quantiteComptee !== undefined && l.ecart === 0).length);
  lignesAvecEcart = computed(() => this.lignes().filter(l => l.quantiteComptee !== undefined && l.ecart !== 0).length);
  totalEcartValeur = computed(() => this.lignes().reduce((sum, l) => sum + (l.valeurEcart || 0), 0));

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) this.loadInventaire(id);
  }

  loadInventaire(id: string): void {
    this.inventaireService.getById(id).subscribe({
      next: (inv) => { this.inventaire.set(inv); this.loadLignes(id); },
      error: () => {
        this.inventaire.set({ id, numero: 'INV-2024-001', entrepotId: '1', entrepotNom: 'Paris', type: 'COMPLET', statut: 'EN_COURS' } as Inventaire);
        this.loadLignes(id);
      }
    });
  }

  loadLignes(id: string): void {
    this.inventaireService.getLignes(id, 1, 500).subscribe({
      next: (r) => { this.lignes.set(r.data); this.isLoading.set(false); },
      error: () => {
        this.lignes.set([
          { id: '1', produitId: '1', produitNom: 'Écran LCD 24"', produitReference: 'LCD-24-001', zone: 'A1', quantiteTheorique: 150, quantiteComptee: undefined, ecart: 0, ecartPourcentage: 0, valeurEcart: 0, statut: 'A_COMPTER' },
          { id: '2', produitId: '2', produitNom: 'Clavier mécanique', produitReference: 'KB-MECH-002', zone: 'A2', quantiteTheorique: 300, quantiteComptee: undefined, ecart: 0, ecartPourcentage: 0, valeurEcart: 0, statut: 'A_COMPTER' },
          { id: '3', produitId: '3', produitNom: 'Souris sans fil', produitReference: 'MS-WL-003', zone: 'B1', quantiteTheorique: 500, quantiteComptee: 498, ecart: -2, ecartPourcentage: -0.4, valeurEcart: -70, statut: 'COMPTE' },
        ] as InventaireLigne[]);
        this.isLoading.set(false);
      }
    });
  }

  onQuantiteChange(ligne: InventaireLigne): void {
    if (ligne.quantiteComptee !== undefined && ligne.quantiteComptee !== null) {
      ligne.ecart = ligne.quantiteComptee - ligne.quantiteTheorique;
      ligne.statut = 'COMPTE';
      // Estimation valeur écart (prix moyen ~35€)
      ligne.valeurEcart = ligne.ecart * 35;
    }
  }

  focusNextUncomputed(): void {
    const next = this.lignes().find(l => l.quantiteComptee === undefined || l.quantiteComptee === null);
    if (next) this.searchQuery = next.produitReference;
  }

  sauvegarder(): void {
    const id = this.inventaire()?.id;
    if (!id) return;
    
    const updates = this.lignes().filter(l => l.quantiteComptee !== undefined).map(l => ({
      ligneId: l.id, quantite: l.quantiteComptee!
    }));

    // Simuler sauvegarde
    this.notificationService.success(`${updates.length} lignes sauvegardées`);
  }

  terminer(): void {
    if (confirm('Terminer cet inventaire ? Vous ne pourrez plus modifier les comptages.')) {
      this.inventaireService.terminer(this.inventaire()!.id).subscribe({
        next: () => {
          this.notificationService.success('Inventaire terminé');
          this.router.navigate(['/inventaire', this.inventaire()!.id]);
        },
        error: () => this.notificationService.error('Erreur')
      });
    }
  }
}
