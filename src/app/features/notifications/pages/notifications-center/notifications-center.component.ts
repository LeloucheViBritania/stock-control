/**
 * Centre de notifications
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

interface Notification {
  id: string;
  type: 'stock' | 'commande' | 'systeme' | 'alerte';
  titre: string;
  message: string;
  lue: boolean;
  date: Date;
  lien?: string;
  importance: 'haute' | 'normale' | 'basse';
}

@Component({
  selector: 'app-notifications-center',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            {{ nonLues() }} non lue{{ nonLues() > 1 ? 's' : '' }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button 
            type="button" 
            class="btn-secondary"
            (click)="marquerToutesLues()"
            [disabled]="nonLues() === 0"
          >
            Tout marquer comme lu
          </button>
        </div>
      </div>

      <!-- Filtres -->
      <div class="flex flex-wrap items-center gap-3">
        <select [(ngModel)]="filterType" (ngModelChange)="applyFilters()" class="form-input w-auto">
          <option value="">Tous les types</option>
          <option value="stock">Stock</option>
          <option value="commande">Commandes</option>
          <option value="alerte">Alertes</option>
          <option value="systeme">Système</option>
        </select>
        
        <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()" class="form-input w-auto">
          <option value="">Toutes</option>
          <option value="non_lues">Non lues</option>
          <option value="lues">Lues</option>
        </select>

        @if (filterType || filterStatus) {
          <button type="button" class="text-sm text-primary-600 hover:underline" (click)="resetFilters()">
            Réinitialiser
          </button>
        }
      </div>

      @if (isLoading()) {
        <div class="card p-12">
          <app-loading-spinner size="lg" text="Chargement..." />
        </div>
      } @else if (filteredNotifications().length === 0) {
        <div class="card p-12 text-center">
          <div class="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Aucune notification</h3>
          <p class="text-gray-500 mt-1">Vous êtes à jour !</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (notification of filteredNotifications(); track notification.id) {
            <div 
              class="card p-4 transition-colors cursor-pointer"
              [ngClass]="{'bg-primary-50 border-l-4 border-l-primary-500': !notification.lue}"
              (click)="marquerLue(notification)"
            >
              <div class="flex items-start gap-4">
                <!-- Icône type -->
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  [ngClass]="{
                    'bg-warning-100 text-warning-600': notification.type === 'stock',
                    'bg-primary-100 text-primary-600': notification.type === 'commande',
                    'bg-danger-100 text-danger-600': notification.type === 'alerte',
                    'bg-gray-100 text-gray-600': notification.type === 'systeme'
                  }"
                >
                  @switch (notification.type) {
                    @case ('stock') {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                      </svg>
                    }
                    @case ('commande') {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                    }
                    @case ('alerte') {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                      </svg>
                    }
                    @default {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    }
                  }
                </div>

                <!-- Contenu -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white" [class.font-semibold]="!notification.lue">
                        {{ notification.titre }}
                      </p>
                      <p class="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        {{ notification.message }}
                      </p>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                      @if (notification.importance === 'haute') {
                        <span class="badge-danger">Urgent</span>
                      }
                      @if (!notification.lue) {
                        <span class="w-2 h-2 bg-primary-500 rounded-full"></span>
                      }
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-4 mt-2">
                    <span class="text-xs text-gray-500">{{ formatDate(notification.date) }}</span>
                    @if (notification.lien) {
                      <a 
                        [routerLink]="notification.lien" 
                        class="text-xs text-primary-600 hover:underline"
                        (click)="$event.stopPropagation()"
                      >
                        Voir les détails →
                      </a>
                    }
                  </div>
                </div>

                <!-- Actions -->
                <button 
                  type="button"
                  class="p-2 text-gray-400 hover:text-danger-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  (click)="supprimer(notification.id); $event.stopPropagation()"
                  title="Supprimer"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex justify-center gap-2 mt-6">
            <button 
              type="button"
              class="btn-secondary btn-sm"
              [disabled]="currentPage() === 1"
              (click)="currentPage.set(currentPage() - 1)"
            >
              Précédent
            </button>
            <span class="px-4 py-2 text-sm text-gray-600">
              Page {{ currentPage() }} sur {{ totalPages() }}
            </span>
            <button 
              type="button"
              class="btn-secondary btn-sm"
              [disabled]="currentPage() === totalPages()"
              (click)="currentPage.set(currentPage() + 1)"
            >
              Suivant
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class NotificationsCenterComponent implements OnInit {
  isLoading = signal(false);
  notifications = signal<Notification[]>([]);
  currentPage = signal(1);
  pageSize = 10;
  
  filterType = '';
  filterStatus = '';

  filteredNotifications = computed(() => {
    let result = this.notifications();
    
    if (this.filterType) {
      result = result.filter(n => n.type === this.filterType);
    }
    
    if (this.filterStatus === 'non_lues') {
      result = result.filter(n => !n.lue);
    } else if (this.filterStatus === 'lues') {
      result = result.filter(n => n.lue);
    }
    
    const start = (this.currentPage() - 1) * this.pageSize;
    return result.slice(start, start + this.pageSize);
  });

  nonLues = computed(() => this.notifications().filter(n => !n.lue).length);
  
  totalPages = computed(() => {
    const filtered = this.filterType || this.filterStatus 
      ? this.notifications().filter(n => {
          if (this.filterType && n.type !== this.filterType) return false;
          if (this.filterStatus === 'non_lues' && n.lue) return false;
          if (this.filterStatus === 'lues' && !n.lue) return false;
          return true;
        })
      : this.notifications();
    return Math.ceil(filtered.length / this.pageSize);
  });

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    
    // Données de démo
    setTimeout(() => {
      this.notifications.set([
        {
          id: '1',
          type: 'stock',
          titre: 'Stock critique',
          message: 'Le produit "Clavier mécanique RGB" a atteint le seuil critique (5 unités)',
          lue: false,
          date: new Date(),
          lien: '/produits/1',
          importance: 'haute',
        },
        {
          id: '2',
          type: 'commande',
          titre: 'Nouvelle commande',
          message: 'Commande #CMD-2024-0125 reçue de Client Martin',
          lue: false,
          date: new Date(Date.now() - 3600000),
          lien: '/commandes/2',
          importance: 'normale',
        },
        {
          id: '3',
          type: 'stock',
          titre: 'Rupture de stock',
          message: 'Le produit "Souris gaming" est en rupture de stock',
          lue: false,
          date: new Date(Date.now() - 7200000),
          lien: '/produits/3',
          importance: 'haute',
        },
        {
          id: '4',
          type: 'commande',
          titre: 'Commande expédiée',
          message: 'La commande #CMD-2024-0120 a été expédiée',
          lue: true,
          date: new Date(Date.now() - 86400000),
          lien: '/commandes/4',
          importance: 'normale',
        },
        {
          id: '5',
          type: 'systeme',
          titre: 'Mise à jour disponible',
          message: 'Une nouvelle version de l\'application est disponible',
          lue: true,
          date: new Date(Date.now() - 172800000),
          importance: 'basse',
        },
        {
          id: '6',
          type: 'alerte',
          titre: 'Connexion inhabituelle',
          message: 'Une connexion a été détectée depuis un nouvel appareil',
          lue: true,
          date: new Date(Date.now() - 259200000),
          importance: 'haute',
        },
      ]);
      this.isLoading.set(false);
    }, 500);
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    return date.toLocaleDateString('fr-FR');
  }

  marquerLue(notification: Notification): void {
    if (!notification.lue) {
      this.notifications.update(notifications =>
        notifications.map(n => n.id === notification.id ? { ...n, lue: true } : n)
      );
    }
  }

  marquerToutesLues(): void {
    this.notifications.update(notifications =>
      notifications.map(n => ({ ...n, lue: true }))
    );
  }

  supprimer(id: string): void {
    this.notifications.update(notifications =>
      notifications.filter(n => n.id !== id)
    );
  }

  applyFilters(): void {
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.filterType = '';
    this.filterStatus = '';
    this.currentPage.set(1);
  }
}
