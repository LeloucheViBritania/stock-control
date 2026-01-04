/**
 * Détail d'un client avec historique commandes
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ClientsService, Client } from '../../services/clients.service';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      @if (isLoading()) {
        <div class="card p-12">
          <app-loading-spinner size="lg" text="Chargement du client..." />
        </div>
      } @else if (client()) {
        <!-- Header -->
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div class="flex items-start gap-4">
            <a routerLink="/clients" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors mt-1">
              <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </a>
            
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 rounded-full flex items-center justify-center"
                   [class.bg-primary-100]="client()?.type === 'PARTICULIER'"
                   [class.bg-info-100]="client()?.type === 'ENTREPRISE'">
                <span class="text-xl font-bold"
                      [class.text-primary-600]="client()?.type === 'PARTICULIER'"
                      [class.text-info-600]="client()?.type === 'ENTREPRISE'">
                  {{ getInitials() }}
                </span>
              </div>
              
              <div>
                <div class="flex items-center gap-3">
                  <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ client()?.type === 'PARTICULIER' ? client()?.prenom + ' ' + client()?.nom : client()?.nom }}
                  </h1>
                  @switch (client()?.segment) {
                    @case ('VIP') {
                      <span class="badge bg-gradient-to-r from-warning-500 to-warning-600 text-white">VIP</span>
                    }
                    @case ('REGULIER') {
                      <span class="badge-success">Régulier</span>
                    }
                    @case ('NOUVEAU') {
                      <span class="badge-primary">Nouveau</span>
                    }
                  }
                </div>
                <p class="text-gray-600 dark:text-gray-400 mt-1">
                  {{ client()?.code }} • 
                  @if (client()?.type === 'PARTICULIER') {
                    <span class="badge-primary">Particulier</span>
                  } @else {
                    <span class="badge-info">Entreprise</span>
                  }
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <a [routerLink]="['/commandes/nouveau']" [queryParams]="{ clientId: client()?.id }" class="btn-secondary flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Nouvelle commande
            </a>
            <a [routerLink]="['modifier']" class="btn-primary flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Modifier
            </a>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card p-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">Total achats</p>
            <p class="text-2xl font-bold text-primary-600">{{ client()?.totalAchats | number:'1.2-2' }} €</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">Commandes</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ client()?.nombreCommandes }}</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">Panier moyen</p>
            <p class="text-2xl font-bold text-success-600">{{ panierMoyen() | number:'1.2-2' }} €</p>
          </div>
          <div class="card p-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">Solde compte</p>
            <p class="text-2xl font-bold" [class.text-danger-600]="(client()?.soldeCompte || 0) > 0" [class.text-gray-900]="(client()?.soldeCompte || 0) <= 0">
              {{ client()?.soldeCompte | number:'1.2-2' }} €
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Informations -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Coordonnées -->
            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Coordonnées</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @if (client()?.email) {
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Email</p>
                      <a [href]="'mailto:' + client()?.email" class="text-primary-600 hover:underline">{{ client()?.email }}</a>
                    </div>
                  </div>
                }
                
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Téléphone</p>
                    <a [href]="'tel:' + client()?.telephone" class="text-gray-900 dark:text-white">{{ client()?.telephone }}</a>
                  </div>
                </div>

                @if (client()?.adresse) {
                  <div class="flex items-start gap-3 md:col-span-2">
                    <div class="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Adresse</p>
                      <p class="text-gray-900 dark:text-white">
                        {{ client()?.adresse }}<br>
                        {{ client()?.codePostal }} {{ client()?.ville }}<br>
                        {{ client()?.pays }}
                      </p>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Historique commandes -->
            <div class="card p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-900 dark:text-white">Dernières commandes</h3>
                <a [routerLink]="['/commandes']" [queryParams]="{ clientId: client()?.id }" class="text-sm text-primary-600 hover:underline">
                  Voir tout
                </a>
              </div>

              @if (commandes().length === 0) {
                <p class="text-gray-500 text-center py-8">Aucune commande</p>
              } @else {
                <div class="space-y-3">
                  @for (commande of commandes(); track commande.id) {
                    <a [routerLink]="['/commandes', commande.id]" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div>
                        <p class="font-medium text-gray-900 dark:text-white">{{ commande.numero }}</p>
                        <p class="text-sm text-gray-500">{{ commande.date | date:'dd/MM/yyyy' }}</p>
                      </div>
                      <div class="text-right">
                        <p class="font-semibold text-gray-900 dark:text-white">{{ commande.montant | number:'1.2-2' }} €</p>
                        <span class="badge-{{ getStatutClass(commande.statut) }} text-xs">{{ commande.statut }}</span>
                      </div>
                    </a>
                  }
                </div>
              }
            </div>

            <!-- Analyse comportement (PREMIUM teaser) -->
            <div class="card p-6 relative overflow-hidden">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Analyse comportement</h3>
              
              @if (!isPremium()) {
                <div class="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-800 via-white/80 dark:via-gray-800/80 to-transparent flex items-end justify-center pb-6 z-10">
                  <div class="text-center">
                    <span class="badge-premium mb-2">Premium</span>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Analyses détaillées et prédictions
                    </p>
                    <a routerLink="/abonnement" class="btn-sm bg-gradient-to-r from-warning-500 to-warning-600 text-white">
                      Débloquer
                    </a>
                  </div>
                </div>
              }
              
              <div class="h-40 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Infos complémentaires -->
            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Informations</h3>
              <dl class="space-y-3">
                <div class="flex justify-between">
                  <dt class="text-gray-600 dark:text-gray-400">Plafond crédit</dt>
                  <dd class="font-medium text-gray-900 dark:text-white">{{ client()?.plafondCredit | number:'1.0-0' }} €</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600 dark:text-gray-400">Statut</dt>
                  <dd>
                    @if (client()?.actif) {
                      <span class="badge-success">Actif</span>
                    } @else {
                      <span class="badge-secondary">Inactif</span>
                    }
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600 dark:text-gray-400">Client depuis</dt>
                  <dd class="font-medium text-gray-900 dark:text-white">{{ client()?.createdAt | date:'dd/MM/yyyy' }}</dd>
                </div>
                @if (client()?.type === 'ENTREPRISE' && client()?.siren) {
                  <div class="flex justify-between">
                    <dt class="text-gray-600 dark:text-gray-400">SIREN</dt>
                    <dd class="font-mono text-gray-900 dark:text-white">{{ client()?.siren }}</dd>
                  </div>
                }
              </dl>
            </div>

            <!-- Contact entreprise -->
            @if (client()?.type === 'ENTREPRISE' && client()?.contactNom) {
              <div class="card p-6">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Contact principal</h3>
                <div class="space-y-2">
                  <p class="font-medium text-gray-900 dark:text-white">{{ client()?.contactNom }}</p>
                  @if (client()?.contactEmail) {
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ client()?.contactEmail }}</p>
                  }
                  @if (client()?.contactTelephone) {
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ client()?.contactTelephone }}</p>
                  }
                </div>
              </div>
            }

            <!-- Notes -->
            @if (client()?.notes) {
              <div class="card p-6">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Notes</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">{{ client()?.notes }}</p>
              </div>
            }

            <!-- Actions -->
            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
              <div class="space-y-2">
                <button type="button" class="w-full btn-secondary justify-start text-danger-600 hover:bg-danger-50" (click)="confirmDelete()">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Supprimer le client
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ClientDetailComponent implements OnInit {
  private readonly clientsService = inject(ClientsService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  client = signal<Client | null>(null);
  commandes = signal<any[]>([]);
  isLoading = signal(true);

  isPremium = computed(() => this.authService.isPremium());
  
  panierMoyen = computed(() => {
    const c = this.client();
    if (!c || c.nombreCommandes === 0) return 0;
    return c.totalAchats / c.nombreCommandes;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadClient(id);
      this.loadCommandes(id);
    }
  }

  loadClient(id: string): void {
    this.clientsService.getById(id).subscribe({
      next: (client) => {
        this.client.set(client);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.error('Client non trouvé');
        this.router.navigate(['/clients']);
      },
    });
  }

  loadCommandes(clientId: string): void {
    this.clientsService.getCommandes(clientId, 1, 5).subscribe({
      next: (response) => this.commandes.set(response.data),
    });
  }

  getInitials(): string {
    const c = this.client();
    if (!c) return '';
    if (c.type === 'PARTICULIER') {
      return (c.prenom?.charAt(0) || '') + (c.nom?.charAt(0) || '');
    }
    return c.nom?.substring(0, 2).toUpperCase() || '';
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      'BROUILLON': 'secondary',
      'CONFIRMEE': 'primary',
      'EN_PREPARATION': 'info',
      'EXPEDIEE': 'warning',
      'LIVREE': 'success',
      'ANNULEE': 'danger',
    };
    return map[statut] || 'secondary';
  }

  confirmDelete(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      this.clientsService.delete(this.client()!.id).subscribe({
        next: () => {
          this.notificationService.success('Client supprimé');
          this.router.navigate(['/clients']);
        },
        error: () => this.notificationService.error('Erreur lors de la suppression'),
      });
    }
  }
}
