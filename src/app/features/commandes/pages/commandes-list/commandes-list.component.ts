/**
 * Liste des commandes avec filtres et actions
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommandesService, Commande, CommandeFilters } from '../../services/commandes.service';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';
import { StatutCommande, StatutCommandeLabels, StatutCommandeColors } from '@enums/statut-commande.enum';

@Component({
  selector: 'app-commandes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Commandes</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            {{ totalItems() }} commande{{ totalItems() > 1 ? 's' : '' }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Export (PREMIUM) -->
          <button 
            type="button"
            class="btn-secondary flex items-center gap-2"
            [class.opacity-60]="!isPremium()"
            (click)="isPremium() ? exportCommandes() : showPremiumPrompt('export')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Exporter
            @if (!isPremium()) {
              <span class="badge-premium text-xs">PRO</span>
            }
          </button>
          
          <a routerLink="nouveau" class="btn-primary flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouvelle commande
          </a>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Aujourd'hui</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats()?.commandesAujourdhui || 0 }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">En cours</p>
          <p class="text-2xl font-bold text-warning-600">{{ stats()?.commandesEnCours || 0 }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">CA Jour</p>
          <p class="text-2xl font-bold text-success-600">{{ stats()?.chiffreAffaires || 0 | number:'1.0-0' }} €</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Panier moyen</p>
          <p class="text-2xl font-bold text-primary-600">{{ stats()?.panierMoyen || 0 | number:'1.0-0' }} €</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">Total</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats()?.totalCommandes || 0 }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card p-4">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="filters.search"
                (ngModelChange)="onSearchChange()"
                placeholder="Rechercher par n° commande, client..."
                class="form-input pl-10 w-full"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>

          <!-- Statut Filter -->
          <div class="w-full lg:w-48">
            <select [(ngModel)]="filters.statut" (ngModelChange)="loadCommandes()" class="form-input w-full">
              <option value="">Tous statuts</option>
              @for (statut of statutOptions; track statut.value) {
                <option [value]="statut.value">{{ statut.label }}</option>
              }
            </select>
          </div>

          <!-- Date Range -->
          <div class="w-full lg:w-40">
            <input type="date" [(ngModel)]="filters.dateDebut" (ngModelChange)="loadCommandes()" class="form-input w-full" placeholder="Date début" />
          </div>
          <div class="w-full lg:w-40">
            <input type="date" [(ngModel)]="filters.dateFin" (ngModelChange)="loadCommandes()" class="form-input w-full" placeholder="Date fin" />
          </div>

          <!-- Paiement -->
          <div class="w-full lg:w-36">
            <select [(ngModel)]="filters.paye" (ngModelChange)="loadCommandes()" class="form-input w-full">
              <option [ngValue]="undefined">Tous</option>
              <option [ngValue]="true">Payées</option>
              <option [ngValue]="false">Non payées</option>
            </select>
          </div>

          @if (hasActiveFilters()) {
            <button type="button" (click)="resetFilters()" class="btn-secondary whitespace-nowrap">
              Réinitialiser
            </button>
          }
        </div>
      </div>

      <!-- Table -->
      <div class="card overflow-hidden">
        @if (isLoading()) {
          <div class="p-12">
            <app-loading-spinner size="lg" text="Chargement des commandes..." />
          </div>
        } @else if (commandes().length === 0) {
          <div class="p-12 text-center">
            <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Aucune commande trouvée</h3>
            <p class="mt-2 text-gray-500">
              <a routerLink="nouveau" class="text-primary-600 hover:underline">Créer une commande</a>
            </p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="table-header">N° Commande</th>
                  <th class="table-header">Client</th>
                  <th class="table-header">Date</th>
                  <th class="table-header text-center">Articles</th>
                  <th class="table-header text-right">Montant TTC</th>
                  <th class="table-header text-center">Statut</th>
                  <th class="table-header text-center">Paiement</th>
                  <th class="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                @for (commande of commandes(); track commande.id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td class="table-cell">
                      <a [routerLink]="[commande.id]" class="font-mono font-medium text-primary-600 hover:underline">
                        {{ commande.numero }}
                      </a>
                    </td>
                    <td class="table-cell">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            {{ getClientInitials(commande) }}
                          </span>
                        </div>
                        <div>
                          @if (commande.client) {
                            <a [routerLink]="['/clients', commande.clientId]" class="text-gray-900 dark:text-white hover:text-primary-600">
                              {{ commande.client.prenom ? commande.client.prenom + ' ' + commande.client.nom : commande.client.nom }}
                            </a>
                          } @else {
                            <span class="text-gray-500">Client supprimé</span>
                          }
                        </div>
                      </div>
                    </td>
                    <td class="table-cell text-gray-600 dark:text-gray-400">
                      {{ commande.dateCommande | date:'dd/MM/yyyy HH:mm' }}
                    </td>
                    <td class="table-cell text-center">
                      <span class="font-medium">{{ commande.lignes.length || 0 }}</span>
                    </td>
                    <td class="table-cell text-right font-semibold text-gray-900 dark:text-white">
                      {{ commande.montantTTC | number:'1.2-2' }} €
                    </td>
                    <td class="table-cell text-center">
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [style.background-color]="getStatutColor(commande.statut) + '20'"
                        [style.color]="getStatutColor(commande.statut)"
                      >
                        {{ getStatutLabel(commande.statut) }}
                      </span>
                    </td>
                    <td class="table-cell text-center">
                      @if (commande.paye) {
                        <span class="badge-success">Payée</span>
                      } @else {
                        <span class="badge-warning">En attente</span>
                      }
                    </td>
                    <td class="table-cell">
                      <div class="flex items-center justify-end gap-1">
                        <a [routerLink]="[commande.id]" class="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Voir">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </a>
                        
                        @if (isStatut(commande, 'BROUILLON')) {
                          <a [routerLink]="[commande.id, 'modifier']" class="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Modifier">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </a>
                        }

                        <!-- PDF (PREMIUM) -->
                        <button 
                          type="button"
                          class="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative"
                          [class.opacity-60]="!isPremium()"
                          (click)="isPremium() ? downloadPdf(commande) : showPremiumPrompt('pdf')"
                          title="Télécharger PDF"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                          </svg>
                          @if (!isPremium()) {
                            <span class="absolute -top-1 -right-1 w-3 h-3 bg-warning-500 rounded-full"></span>
                          }
                        </button>

                        <!-- Actions rapides -->
                        <div class="relative">
                          <button 
                            type="button"
                            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            (click)="toggleActionMenu(commande.id)"
                          >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                            </svg>
                          </button>
                          
                          @if (activeMenuId() === commande.id) {
                            <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                              @if (isStatut(commande, 'BROUILLON')) {
                                <button (click)="confirmerCommande(commande)" class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-success-600">
                                  Confirmer
                                </button>
                              }
                              @if (isStatut(commande, 'CONFIRMEE')) {
                                <button (click)="preparerCommande(commande)" class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                  Marquer en préparation
                                </button>
                              }
                              @if (isStatut(commande, 'EN_PREPARATION')) {
                                <button (click)="expedierCommande(commande)" class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                  Marquer expédiée
                                </button>
                              }
                              @if (isStatut(commande, 'EXPEDIEE')) {
                                <button (click)="livrerCommande(commande)" class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-success-600">
                                  Marquer livrée
                                </button>
                              }
                              @if (!commande.paye && !isStatut(commande, 'ANNULEE')) {
                                <button (click)="marquerPayee(commande)" class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-success-600">
                                  Marquer payée
                                </button>
                              }
                              <button (click)="dupliquerCommande(commande)" class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                Dupliquer
                              </button>
                              @if (!isStatut(commande, 'ANNULEE') && !isStatut(commande, 'LIVREE')) {
                                <button (click)="annulerCommande(commande)" class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-danger-600">
                                  Annuler
                                </button>
                              }
                            </div>
                          }
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Affichage {{ (currentPage() - 1) * pageSize() + 1 }} - {{ Math.min(currentPage() * pageSize(), totalItems()) }} sur {{ totalItems() }}
              </div>
              <div class="flex items-center gap-2">
                <select [ngModel]="pageSize()" (ngModelChange)="onPageSizeChange($event)" class="form-input py-1.5 text-sm">
                  <option [value]="10">10 / page</option>
                  <option [value]="20">20 / page</option>
                  <option [value]="50">50 / page</option>
                </select>
                <div class="flex items-center gap-1">
                  <button type="button" (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 1" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <span class="px-3 py-1 text-sm">Page {{ currentPage() }} / {{ totalPages() }}</span>
                  <button type="button" (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() === totalPages()" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .table-header { @apply px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider; }
    .table-cell { @apply px-6 py-4 whitespace-nowrap text-sm; }
  `],
})
export class CommandesListComponent implements OnInit {
  private readonly commandesService = inject(CommandesService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Exposer l'enum pour le template
  readonly StatutCommande = StatutCommande;
  Math = Math;

  commandes = signal<Commande[]>([]);
  stats = signal<any>(null);
  isLoading = signal(false);
  activeMenuId = signal<string | null>(null);

  currentPage = signal(1);
  pageSize = signal(20);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  filters: CommandeFilters = {};
  private searchTimeout: any;

  isPremium = computed(() => this.authService.isPremium());

  statutOptions = [
    { value: 'BROUILLON', label: 'Brouillon' },
    { value: 'CONFIRMEE', label: 'Confirmée' },
    { value: 'EN_PREPARATION', label: 'En préparation' },
    { value: 'EXPEDIEE', label: 'Expédiée' },
    { value: 'LIVREE', label: 'Livrée' },
    { value: 'ANNULEE', label: 'Annulée' },
  ];

  // Helper pour comparaison de statut
  isStatut(commande: Commande, statut: string): boolean {
    return commande.statut === statut as StatutCommande;
  }

  ngOnInit(): void {
    // Check for clientId filter from query params
    const clientId = this.route.snapshot.queryParams['clientId'];
    if (clientId) {
      this.filters.clientId = clientId;
    }
    
    this.loadCommandes();
    this.loadStats();

    // Close menu on click outside
    document.addEventListener('click', () => this.activeMenuId.set(null));
  }

  loadCommandes(): void {
    this.isLoading.set(true);
    this.commandesService.getAll(this.currentPage(), this.pageSize(), this.filters).subscribe({
      next: (response) => {
        this.commandes.set(response.data);
        this.totalItems.set(response.meta.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notificationService.error('Erreur lors du chargement');
      },
    });
  }

  loadStats(): void {
    this.commandesService.getStats('jour').subscribe({
      next: (stats) => this.stats.set(stats),
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadCommandes();
    }, 300);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadCommandes();
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadCommandes();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.search || this.filters.statut || this.filters.dateDebut || this.filters.dateFin || this.filters.paye !== undefined);
  }

  resetFilters(): void {
    this.filters = {};
    this.currentPage.set(1);
    this.loadCommandes();
  }

  getClientInitials(commande: Commande): string {
    if (!commande.client) return '?';
    if (commande.client.prenom) {
      return commande.client.prenom.charAt(0) + commande.client.nom.charAt(0);
    }
    return commande.client.nom.substring(0, 2).toUpperCase();
  }

  getStatutLabel(statut: StatutCommande): string {
    return StatutCommandeLabels[statut] || statut;
  }

  getStatutColor(statut: StatutCommande): string {
    return StatutCommandeColors[statut] || '#6b7280';
  }

  toggleActionMenu(id: string): void {
    event?.stopPropagation();
    this.activeMenuId.set(this.activeMenuId() === id ? null : id);
  }

  confirmerCommande(commande: Commande): void {
    this.commandesService.confirmer(commande.id).subscribe({
      next: () => {
        this.notificationService.success('Commande confirmée');
        this.loadCommandes();
        this.loadStats();
      },
      error: () => this.notificationService.error('Erreur'),
    });
    this.activeMenuId.set(null);
  }

  preparerCommande(commande: Commande): void {
    this.commandesService.changeStatut(commande.id, StatutCommande.EN_PREPARATION).subscribe({
      next: () => {
        this.notificationService.success('Commande en préparation');
        this.loadCommandes();
      },
      error: () => this.notificationService.error('Erreur'),
    });
    this.activeMenuId.set(null);
  }

  expedierCommande(commande: Commande): void {
    this.commandesService.changeStatut(commande.id, StatutCommande.EXPEDIEE).subscribe({
      next: () => {
        this.notificationService.success('Commande expédiée');
        this.loadCommandes();
      },
      error: () => this.notificationService.error('Erreur'),
    });
    this.activeMenuId.set(null);
  }

  livrerCommande(commande: Commande): void {
    this.commandesService.marquerLivree(commande.id).subscribe({
      next: () => {
        this.notificationService.success('Commande livrée');
        this.loadCommandes();
        this.loadStats();
      },
      error: () => this.notificationService.error('Erreur'),
    });
    this.activeMenuId.set(null);
  }

  marquerPayee(commande: Commande): void {
    this.commandesService.marquerPayee(commande.id, 'ESPECES').subscribe({
      next: () => {
        this.notificationService.success('Commande marquée comme payée');
        this.loadCommandes();
      },
      error: () => this.notificationService.error('Erreur'),
    });
    this.activeMenuId.set(null);
  }

  annulerCommande(commande: Commande): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      this.commandesService.annuler(commande.id, 'Annulation manuelle').subscribe({
        next: () => {
          this.notificationService.success('Commande annulée');
          this.loadCommandes();
          this.loadStats();
        },
        error: () => this.notificationService.error('Erreur'),
      });
    }
    this.activeMenuId.set(null);
  }

  dupliquerCommande(commande: Commande): void {
    this.commandesService.dupliquer(commande.id).subscribe({
      next: (newCommande) => {
        this.notificationService.success('Commande dupliquée');
        this.router.navigate(['/commandes', newCommande.id]);
      },
      error: () => this.notificationService.error('Erreur'),
    });
    this.activeMenuId.set(null);
  }

  downloadPdf(commande: Commande): void {
    this.commandesService.genererPdf(commande.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `commande-${commande.numero}.pdf`;
        a.click();
      },
      error: () => this.notificationService.error('Erreur lors de la génération du PDF'),
    });
  }

  exportCommandes(): void {
    this.commandesService.export('excel', this.filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'commandes.xlsx';
        a.click();
        this.notificationService.success('Export réussi');
      },
      error: () => this.notificationService.error('Erreur'),
    });
  }

  showPremiumPrompt(feature: string): void {
    this.router.navigate(['/premium-requis'], { queryParams: { feature } });
  }
}
