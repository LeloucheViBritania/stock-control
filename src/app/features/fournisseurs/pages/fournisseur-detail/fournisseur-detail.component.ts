/**
 * Détail d'un fournisseur
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FournisseursService, Fournisseur } from '../../services/fournisseurs.service';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-fournisseur-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      @if (isLoading()) {
        <div class="card p-12">
          <app-loading-spinner size="lg" text="Chargement..." />
        </div>
      } @else if (fournisseur()) {
        <!-- Header -->
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div class="flex items-start gap-4">
            <a routerLink="/fournisseurs" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mt-1">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </a>
            
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 rounded-full bg-info-100 flex items-center justify-center">
                <span class="text-xl font-bold text-info-600">{{ (fournisseur()?.nom || '').substring(0, 2).toUpperCase() }}</span>
              </div>
              
              <div>
                <div class="flex items-center gap-3">
                  <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ fournisseur()?.nom }}</h1>
                  @if (fournisseur()?.actif) {
                    <span class="badge-success">Actif</span>
                  } @else {
                    <span class="badge-secondary">Inactif</span>
                  }
                </div>
                <p class="text-gray-600 mt-1">{{ fournisseur()?.code }}</p>
                
                <!-- Évaluation -->
                <div class="flex items-center gap-2 mt-2">
                  @for (star of [1,2,3,4,5]; track star) {
                    <button 
                      type="button"
                      (click)="setEvaluation(star)"
                      class="focus:outline-none"
                    >
                      <svg 
                        class="w-6 h-6 transition-colors"
                        [class.text-warning-500]="star <= (fournisseur()?.evaluation || 0)"
                        [class.text-gray-300]="star > (fournisseur()?.evaluation || 0)"
                        [class.hover:text-warning-400]="true"
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </button>
                  }
                  <span class="text-sm text-gray-500 ml-2">{{ fournisseur()?.evaluation || 0 }}/5</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <a [routerLink]="['modifier']" class="btn-primary">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Modifier
            </a>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card p-4">
            <p class="text-sm text-gray-600">Total achats</p>
            <p class="text-2xl font-bold text-primary-600">{{ fournisseur()?.totalAchats | number:'1.0-0' }} €</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-600">Commandes</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ fournisseur()?.nombreCommandes }}</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-600">Délai livraison</p>
            <p class="text-2xl font-bold text-info-600">{{ fournisseur()?.delaiLivraison }} jours</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-600">Produits</p>
            <p class="text-2xl font-bold text-success-600">{{ fournisseur()?.produits?.length || 0 }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <!-- Coordonnées -->
            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Coordonnées</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @if (fournisseur()?.email) {
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Email</p>
                      <a [href]="'mailto:' + fournisseur()?.email" class="text-primary-600 hover:underline">{{ fournisseur()?.email }}</a>
                    </div>
                  </div>
                }
                
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Téléphone</p>
                    <a [href]="'tel:' + fournisseur()?.telephone" class="text-gray-900 dark:text-white">{{ fournisseur()?.telephone }}</a>
                  </div>
                </div>

                @if (fournisseur()?.siteWeb) {
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Site web</p>
                      <a [href]="fournisseur()?.siteWeb" target="_blank" class="text-primary-600 hover:underline">{{ fournisseur()?.siteWeb }}</a>
                    </div>
                  </div>
                }

                @if (fournisseur()?.adresse) {
                  <div class="flex items-start gap-3 md:col-span-2">
                    <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Adresse</p>
                      <p class="text-gray-900 dark:text-white">
                        {{ fournisseur()?.adresse }}<br>
                        {{ fournisseur()?.codePostal }} {{ fournisseur()?.ville }}<br>
                        {{ fournisseur()?.pays }}
                      </p>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Produits fournis -->
            <div class="card p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-900 dark:text-white">Catalogue produits</h3>
                <button type="button" class="btn-secondary btn-sm" (click)="showAssocierProduits = true">
                  + Associer produits
                </button>
              </div>

              @if (!fournisseur()?.produits?.length) {
                <p class="text-gray-500 text-center py-8">Aucun produit associé</p>
              } @else {
                <div class="space-y-2">
                  @for (produit of fournisseur()?.produits; track produit.id) {
                    <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <a [routerLink]="['/produits', produit.id]" class="font-medium text-gray-900 dark:text-white hover:text-primary-600">
                          {{ produit.nom }}
                        </a>
                        <p class="text-sm text-gray-500">{{ produit.reference }}</p>
                      </div>
                      <span class="font-semibold text-primary-600">{{ produit.prixAchat | number:'1.2-2' }} €</span>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Historique commandes d'achat (PREMIUM teaser) -->
            <div class="card p-6 relative overflow-hidden">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Historique commandes</h3>
              
              @if (!isPremium()) {
                <div class="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-800 via-white/90 dark:via-gray-800/90 to-transparent flex items-end justify-center pb-8 z-10">
                  <div class="text-center">
                    <span class="badge-premium mb-3">Premium</span>
                    <p class="text-sm text-gray-600 mb-3">Accédez à l'historique complet des commandes</p>
                    <a routerLink="/abonnement" class="btn bg-gradient-to-r from-warning-500 to-warning-600 text-white">
                      Passer à Premium
                    </a>
                  </div>
                </div>
              }
              
              <div class="space-y-3 opacity-50">
                @for (i of [1,2,3]; track i) {
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p class="font-medium text-gray-400">Commande #CA-00{{ i }}</p>
                      <p class="text-sm text-gray-300">01/01/2024</p>
                    </div>
                    <span class="font-semibold text-gray-400">xxx €</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Contact -->
            @if (fournisseur()?.contactNom) {
              <div class="card p-6">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Contact principal</h3>
                <div class="space-y-2">
                  <p class="font-medium text-gray-900 dark:text-white">{{ fournisseur()?.contactNom }}</p>
                  @if (fournisseur()?.contactPoste) {
                    <p class="text-sm text-gray-500">{{ fournisseur()?.contactPoste }}</p>
                  }
                  @if (fournisseur()?.contactEmail) {
                    <a [href]="'mailto:' + fournisseur()?.contactEmail" class="text-sm text-primary-600 hover:underline block">
                      {{ fournisseur()?.contactEmail }}
                    </a>
                  }
                  @if (fournisseur()?.contactTelephone) {
                    <p class="text-sm text-gray-600">{{ fournisseur()?.contactTelephone }}</p>
                  }
                </div>
              </div>
            }

            <!-- Infos -->
            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Informations</h3>
              <dl class="space-y-3">
                @if (fournisseur()?.siren) {
                  <div class="flex justify-between">
                    <dt class="text-gray-600">SIREN</dt>
                    <dd class="font-mono text-gray-900 dark:text-white">{{ fournisseur()?.siren }}</dd>
                  </div>
                }
                @if (fournisseur()?.conditionsPaiement) {
                  <div class="flex justify-between">
                    <dt class="text-gray-600">Paiement</dt>
                    <dd class="text-gray-900 dark:text-white">{{ fournisseur()?.conditionsPaiement }}</dd>
                  </div>
                }
                <div class="flex justify-between">
                  <dt class="text-gray-600">Créé le</dt>
                  <dd class="text-gray-900 dark:text-white">{{ fournisseur()?.createdAt | date:'dd/MM/yyyy' }}</dd>
                </div>
              </dl>
            </div>

            <!-- Notes -->
            @if (fournisseur()?.notes) {
              <div class="card p-6">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Notes</h3>
                <p class="text-gray-600 text-sm whitespace-pre-wrap">{{ fournisseur()?.notes }}</p>
              </div>
            }

            <!-- Actions -->
            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
              <div class="space-y-2">
                <button type="button" class="w-full btn-secondary justify-start text-danger-600 hover:bg-danger-50" (click)="confirmDelete()">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class FournisseurDetailComponent implements OnInit {
  private readonly fournisseursService = inject(FournisseursService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  fournisseur = signal<Fournisseur | null>(null);
  isLoading = signal(true);
  showAssocierProduits = false;

  isPremium = computed(() => this.authService.isPremium());

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadFournisseur(id);
    }
  }

  loadFournisseur(id: string): void {
    this.fournisseursService.getById(id).subscribe({
      next: (fournisseur) => {
        this.fournisseur.set(fournisseur);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.error('Fournisseur non trouvé');
        this.router.navigate(['/fournisseurs']);
      },
    });
  }

  setEvaluation(note: number): void {
    this.fournisseursService.evaluer(this.fournisseur()!.id, { note }).subscribe({
      next: (updated) => {
        this.fournisseur.set(updated);
        this.notificationService.success('Évaluation enregistrée');
      },
      error: () => this.notificationService.error('Erreur'),
    });
  }

  confirmDelete(): void {
    if (confirm(`Supprimer ${this.fournisseur()?.nom} ?`)) {
      this.fournisseursService.delete(this.fournisseur()!.id).subscribe({
        next: () => {
          this.notificationService.success('Fournisseur supprimé');
          this.router.navigate(['/fournisseurs']);
        },
        error: () => this.notificationService.error('Erreur'),
      });
    }
  }
}
