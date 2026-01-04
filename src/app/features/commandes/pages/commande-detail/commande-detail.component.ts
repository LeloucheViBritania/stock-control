/**
 * Détail d'une commande avec timeline et actions
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommandesService, Commande, CommandeTimeline } from '../../services/commandes.service';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';
import { StatutCommande, StatutCommandeLabels, StatutCommandeColors } from '@enums/statut-commande.enum';

@Component({
  selector: 'app-commande-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      @if (isLoading()) {
        <div class="card p-12">
          <app-loading-spinner size="lg" text="Chargement de la commande..." />
        </div>
      } @else if (commande()) {
        <!-- Header -->
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div class="flex items-start gap-4">
            <a routerLink="/commandes" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors mt-1">
              <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </a>
            
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white font-mono">
                  {{ commande()?.numero }}
                </h1>
                <span 
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  [style.background-color]="getStatutColor(commande()!.statut) + '20'"
                  [style.color]="getStatutColor(commande()!.statut)"
                >
                  {{ getStatutLabel(commande()!.statut) }}
                </span>
                @if (commande()?.paye) {
                  <span class="badge-success">Payée</span>
                } @else {
                  <span class="badge-warning">Non payée</span>
                }
              </div>
              <p class="text-gray-600 dark:text-gray-400 mt-1">
                Créée le {{ commande()?.createdAt | date:'dd/MM/yyyy à HH:mm' }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <!-- Actions selon statut -->
            @switch (commande()?.statut) {
              @case (StatutCommande.BROUILLON) {
                <a [routerLink]="['modifier']" class="btn-secondary">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Modifier
                </a>
                <button type="button" class="btn-primary" (click)="confirmer()">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Confirmer
                </button>
              }
              @case (StatutCommande.CONFIRMEE) {
                <button type="button" class="btn-secondary" (click)="changeStatut(StatutCommande.EN_PREPARATION)">
                  Marquer en préparation
                </button>
              }
              @case (StatutCommande.EN_PREPARATION) {
                <button type="button" class="btn-secondary" (click)="changeStatut(StatutCommande.EXPEDIEE)">
                  Marquer expédiée
                </button>
              }
              @case (StatutCommande.EXPEDIEE) {
                <button type="button" class="btn-primary" (click)="marquerLivree()">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Marquer livrée
                </button>
              }
            }

            @if (!commande()?.paye && commande()?.statut !== 'ANNULEE') {
              <button type="button" class="btn-success" (click)="marquerPayee()">
                Encaisser
              </button>
            }

            <!-- Documents PDF (PREMIUM) -->
            <div class="relative">
              <button 
                type="button"
                class="btn-secondary flex items-center gap-2"
                [class.opacity-60]="!isPremium()"
                (click)="isPremium() ? togglePdfMenu() : showPremiumPrompt('documents')"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
                Documents
                @if (!isPremium()) {
                  <span class="badge-premium text-xs">PRO</span>
                }
              </button>
              
              @if (showPdfMenu() && isPremium()) {
                <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                  <button (click)="downloadPdf('commande')" class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                    📄 Bon de commande
                  </button>
                  <button (click)="downloadPdf('livraison')" class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                    🚚 Bon de livraison
                  </button>
                  <button (click)="downloadPdf('facture')" class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                    🧾 Facture
                  </button>
                </div>
              }
            </div>

            @if (commande()?.statut !== 'ANNULEE' && commande()?.statut !== 'LIVREE') {
              <button type="button" class="btn-danger" (click)="annuler()">
                Annuler
              </button>
            }
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Contenu principal -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Client -->
            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Client</h3>
              @if (commande()?.client) {
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <span class="font-semibold text-primary-600">
                        {{ commande()?.client?.prenom?.charAt(0) || commande()?.client?.nom?.charAt(0) }}{{ commande()?.client?.nom?.charAt(0) }}
                      </span>
                    </div>
                    <div>
                      <a [routerLink]="['/clients', commande()?.clientId]" class="font-medium text-gray-900 dark:text-white hover:text-primary-600">
                        {{ commande()?.client?.prenom ? commande()?.client?.prenom + ' ' + commande()?.client?.nom : commande()?.client?.nom }}
                      </a>
                      <p class="text-sm text-gray-500">{{ commande()?.client?.email }}</p>
                      <p class="text-sm text-gray-500">{{ commande()?.client?.telephone }}</p>
                    </div>
                  </div>
                  <a [routerLink]="['/clients', commande()?.clientId]" class="btn-secondary btn-sm">
                    Voir fiche
                  </a>
                </div>
              }
            </div>

            <!-- Lignes de commande -->
            <div class="card overflow-hidden">
              <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 class="font-semibold text-gray-900 dark:text-white">Articles ({{ commande()?.lignes?.length }})</h3>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prix unit.</th>
                      <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qté</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Remise</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total HT</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    @for (ligne of commande()?.lignes; track ligne.id || $index) {
                      <tr>
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-3">
                            @if (ligne.produit) {
                              <a [routerLink]="['/produits', ligne.produitId]" class="font-medium text-gray-900 dark:text-white hover:text-primary-600">
                                {{ ligne.produit.nom }}
                              </a>
                            } @else {
                              <span class="text-gray-500">Produit supprimé</span>
                            }
                          </div>
                          <p class="text-sm text-gray-500">{{ ligne.produit?.reference }}</p>
                        </td>
                        <td class="px-6 py-4 text-right text-gray-900 dark:text-white">
                          {{ ligne.prixUnitaire | number:'1.2-2' }} €
                        </td>
                        <td class="px-6 py-4 text-center font-medium">
                          {{ ligne.quantite }}
                        </td>
                        <td class="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                          @if (ligne.remise > 0) {
                            -{{ ligne.remise }}%
                          } @else {
                            —
                          }
                        </td>
                        <td class="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                          {{ ligne.montantHT | number:'1.2-2' }} €
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              
              <!-- Totaux -->
              <div class="p-6 bg-gray-50 dark:bg-gray-700/50">
                <div class="max-w-xs ml-auto space-y-2">
                  <div class="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Sous-total HT</span>
                    <span>{{ commande()?.sousTotal | number:'1.2-2' }} €</span>
                  </div>
                  @if ((commande()?.remiseGlobale || 0) > 0) {
                    <div class="flex justify-between text-danger-600">
                      <span>Remise ({{ commande()?.remiseGlobale }}%)</span>
                      <span>-{{ (commande()!.sousTotal * commande()!.remiseGlobale / 100) | number:'1.2-2' }} €</span>
                    </div>
                  }
                  <div class="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Total HT</span>
                    <span>{{ commande()?.montantHT | number:'1.2-2' }} €</span>
                  </div>
                  <div class="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>TVA</span>
                    <span>{{ commande()?.montantTVA | number:'1.2-2' }} €</span>
                  </div>
                  <div class="pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div class="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                      <span>Total TTC</span>
                      <span class="text-primary-600">{{ commande()?.montantTTC | number:'1.2-2' }} €</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notes -->
            @if (commande()?.notes || commande()?.notesInternes) {
              <div class="card p-6">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Notes</h3>
                @if (commande()?.notes) {
                  <div class="mb-4">
                    <p class="text-sm text-gray-500 mb-1">Notes client</p>
                    <p class="text-gray-900 dark:text-white">{{ commande()?.notes }}</p>
                  </div>
                }
                @if (commande()?.notesInternes) {
                  <div class="p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                    <p class="text-sm text-warning-600 mb-1">Notes internes</p>
                    <p class="text-gray-900 dark:text-white">{{ commande()?.notesInternes }}</p>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Timeline -->
            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Historique</h3>
              <div class="space-y-4">
                @for (event of timeline(); track $index) {
                  <div class="flex gap-3">
                    <div class="flex flex-col items-center">
                      <div class="w-3 h-3 rounded-full bg-primary-500"></div>
                      @if (!$last) {
                        <div class="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-1"></div>
                      }
                    </div>
                    <div class="pb-4">
                      <p class="font-medium text-gray-900 dark:text-white">
                        {{ getStatutLabel(event.statut) }}
                      </p>
                      <p class="text-sm text-gray-500">
                        {{ event.date | date:'dd/MM/yyyy HH:mm' }}
                      </p>
                      @if (event.commentaire) {
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ event.commentaire }}</p>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Informations -->
            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Informations</h3>
              <dl class="space-y-3">
                @if (commande()?.dateLivraisonPrevue) {
                  <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Livraison prévue</dt>
                    <dd class="font-medium text-gray-900 dark:text-white">
                      {{ commande()?.dateLivraisonPrevue | date:'dd/MM/yyyy' }}
                    </dd>
                  </div>
                }
                @if (commande()?.dateLivraisonReelle) {
                  <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Livré le</dt>
                    <dd class="font-medium text-success-600">
                      {{ commande()?.dateLivraisonReelle | date:'dd/MM/yyyy' }}
                    </dd>
                  </div>
                }
                @if (commande()?.modePaiement) {
                  <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Mode paiement</dt>
                    <dd class="font-medium text-gray-900 dark:text-white">
                      {{ getModePaiementLabel(commande()!.modePaiement!) }}
                    </dd>
                  </div>
                }
                @if (commande()?.datePaiement) {
                  <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Payé le</dt>
                    <dd class="font-medium text-success-600">
                      {{ commande()?.datePaiement | date:'dd/MM/yyyy' }}
                    </dd>
                  </div>
                }
                @if (commande()?.createdBy) {
                  <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">Créé par</dt>
                    <dd class="font-medium text-gray-900 dark:text-white">
                      {{ commande()?.createdBy?.nom }}
                    </dd>
                  </div>
                }
              </dl>
            </div>

            <!-- Adresse livraison -->
            @if (commande()?.adresseLivraison) {
              <div class="card p-6">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Adresse de livraison</h3>
                <p class="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {{ commande()?.adresseLivraison }}
                </p>
              </div>
            }

            <!-- Actions -->
            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
              <div class="space-y-2">
                <button type="button" class="w-full btn-secondary justify-start" (click)="dupliquer()">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  Dupliquer
                </button>
                <button type="button" class="w-full btn-secondary justify-start" (click)="envoyerEmail()">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  Envoyer par email
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Modal Paiement -->
      @if (showPaiementModal()) {
        <div class="fixed inset-0 z-50 overflow-y-auto">
          <div class="fixed inset-0 bg-black/50" (click)="closePaiementModal()"></div>
          <div class="relative min-h-screen flex items-center justify-center p-4">
            <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Encaisser le paiement</h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                Montant: <span class="font-bold text-primary-600">{{ commande()?.montantTTC | number:'1.2-2' }} €</span>
              </p>
              
              <div class="space-y-4">
                <div>
                  <label class="form-label">Mode de paiement</label>
                  <select [(ngModel)]="selectedModePaiement" class="form-input w-full">
                    <option value="ESPECES">Espèces</option>
                    <option value="CARTE">Carte bancaire</option>
                    <option value="VIREMENT">Virement</option>
                    <option value="CHEQUE">Chèque</option>
                  </select>
                </div>
              </div>

              <div class="flex justify-end gap-3 mt-6">
                <button type="button" class="btn-secondary" (click)="closePaiementModal()">Annuler</button>
                <button type="button" class="btn-success" (click)="confirmerPaiement()">Confirmer</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CommandeDetailComponent implements OnInit {
  private readonly commandesService = inject(CommandesService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Exposer l'enum pour le template
  readonly StatutCommande = StatutCommande;

  commande = signal<Commande | null>(null);
  timeline = signal<CommandeTimeline[]>([]);
  isLoading = signal(true);
  showPdfMenu = signal(false);
  showPaiementModal = signal(false);
  selectedModePaiement = 'ESPECES';

  isPremium = computed(() => this.authService.isPremium());

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadCommande(id);
      this.loadTimeline(id);
    }
  }

  loadCommande(id: string): void {
    this.commandesService.getById(id).subscribe({
      next: (commande) => {
        this.commande.set(commande);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.error('Commande non trouvée');
        this.router.navigate(['/commandes']);
      },
    });
  }

  loadTimeline(id: string): void {
    this.commandesService.getTimeline(id).subscribe({
      next: (timeline) => this.timeline.set(timeline),
    });
  }

  getStatutLabel(statut: StatutCommande): string {
    return StatutCommandeLabels[statut] || statut;
  }

  getStatutColor(statut: StatutCommande): string {
    return StatutCommandeColors[statut] || '#6b7280';
  }

  getModePaiementLabel(mode: string): string {
    const labels: Record<string, string> = {
      'ESPECES': 'Espèces',
      'CARTE': 'Carte bancaire',
      'VIREMENT': 'Virement',
      'CHEQUE': 'Chèque',
      'CREDIT': 'Crédit',
    };
    return labels[mode] || mode;
  }

  confirmer(): void {
    this.commandesService.confirmer(this.commande()!.id).subscribe({
      next: () => {
        this.notificationService.success('Commande confirmée');
        this.loadCommande(this.commande()!.id);
        this.loadTimeline(this.commande()!.id);
      },
      error: () => this.notificationService.error('Erreur'),
    });
  }

  changeStatut(statut: StatutCommande): void {
    this.commandesService.changeStatut(this.commande()!.id, statut).subscribe({
      next: () => {
        this.notificationService.success('Statut mis à jour');
        this.loadCommande(this.commande()!.id);
        this.loadTimeline(this.commande()!.id);
      },
      error: () => this.notificationService.error('Erreur'),
    });
  }

  marquerLivree(): void {
    this.commandesService.marquerLivree(this.commande()!.id).subscribe({
      next: () => {
        this.notificationService.success('Commande livrée');
        this.loadCommande(this.commande()!.id);
        this.loadTimeline(this.commande()!.id);
      },
      error: () => this.notificationService.error('Erreur'),
    });
  }

  marquerPayee(): void {
    this.showPaiementModal.set(true);
  }

  closePaiementModal(): void {
    this.showPaiementModal.set(false);
  }

  confirmerPaiement(): void {
    this.commandesService.marquerPayee(this.commande()!.id, this.selectedModePaiement).subscribe({
      next: () => {
        this.notificationService.success('Paiement enregistré');
        this.closePaiementModal();
        this.loadCommande(this.commande()!.id);
      },
      error: () => this.notificationService.error('Erreur'),
    });
  }

  annuler(): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      this.commandesService.annuler(this.commande()!.id, 'Annulation manuelle').subscribe({
        next: () => {
          this.notificationService.success('Commande annulée');
          this.loadCommande(this.commande()!.id);
          this.loadTimeline(this.commande()!.id);
        },
        error: () => this.notificationService.error('Erreur'),
      });
    }
  }

  dupliquer(): void {
    this.commandesService.dupliquer(this.commande()!.id).subscribe({
      next: (newCommande) => {
        this.notificationService.success('Commande dupliquée');
        this.router.navigate(['/commandes', newCommande.id]);
      },
      error: () => this.notificationService.error('Erreur'),
    });
  }

  envoyerEmail(): void {
    this.notificationService.info('Fonctionnalité en cours de développement');
  }

  togglePdfMenu(): void {
    this.showPdfMenu.set(!this.showPdfMenu());
  }

  downloadPdf(type: 'commande' | 'livraison' | 'facture'): void {
    this.showPdfMenu.set(false);
    let download$;
    
    switch (type) {
      case 'commande':
        download$ = this.commandesService.genererPdf(this.commande()!.id);
        break;
      case 'livraison':
        download$ = this.commandesService.genererBonLivraison(this.commande()!.id);
        break;
      case 'facture':
        download$ = this.commandesService.genererFacture(this.commande()!.id);
        break;
    }

    download$.subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-${this.commande()!.numero}.pdf`;
        a.click();
      },
      error: () => this.notificationService.error('Erreur lors de la génération'),
    });
  }

  showPremiumPrompt(feature: string): void {
    this.router.navigate(['/premium-requis'], { queryParams: { feature } });
  }
}
