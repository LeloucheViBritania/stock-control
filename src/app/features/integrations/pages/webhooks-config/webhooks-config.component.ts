/**
 * Configuration des Webhooks (PREMIUM)
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '@services/notification.service';

interface Webhook {
  id: string;
  nom: string;
  url: string;
  evenements: string[];
  actif: boolean;
  secret?: string;
  dernierAppel?: Date;
  dernierStatut?: 'SUCCESS' | 'ERREUR';
  nombreAppels: number;
}

@Component({
  selector: 'app-webhooks-config',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a routerLink="/integrations" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Webhooks</h1>
              <span class="badge-premium">Premium</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Configurez les notifications HTTP automatiques</p>
          </div>
        </div>
        <button type="button" class="btn-primary" (click)="showForm = true">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nouveau webhook
        </button>
      </div>

      <!-- Formulaire nouveau webhook -->
      @if (showForm) {
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Nouveau webhook</h3>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="form-label">Nom</label>
              <input type="text" [(ngModel)]="newWebhook.nom" class="form-input" placeholder="Mon webhook" />
            </div>
            <div>
              <label class="form-label">URL de callback</label>
              <input type="url" [(ngModel)]="newWebhook.url" class="form-input" placeholder="https://example.com/webhook" />
            </div>
          </div>
          <div class="mt-4">
            <label class="form-label">Événements à écouter</label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              @for (event of evenementsDisponibles; track event.id) {
                <label class="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  [class.border-primary-500]="newWebhook.evenements.includes(event.id)"
                  [class.bg-primary-50]="newWebhook.evenements.includes(event.id)"
                >
                  <input type="checkbox" [checked]="newWebhook.evenements.includes(event.id)" 
                    (change)="toggleEvent(event.id)" class="rounded border-gray-300" />
                  <span class="text-sm">{{ event.label }}</span>
                </label>
              }
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <button type="button" class="btn-secondary" (click)="showForm = false">Annuler</button>
            <button type="button" class="btn-primary" (click)="creerWebhook()">Créer</button>
          </div>
        </div>
      }

      <!-- Liste des webhooks -->
      <div class="space-y-4">
        @for (webhook of webhooks(); track webhook.id) {
          <div class="card p-6">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" [(ngModel)]="webhook.actif" class="sr-only peer" (change)="toggleWebhook(webhook)">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-white">{{ webhook.nom }}</h4>
                  <p class="text-sm text-gray-500 font-mono">{{ webhook.url }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                @if (webhook.dernierStatut) {
                  <span class="px-2 py-1 text-xs rounded-full"
                    [class.bg-success-100]="webhook.dernierStatut === 'SUCCESS'"
                    [class.text-success-700]="webhook.dernierStatut === 'SUCCESS'"
                    [class.bg-danger-100]="webhook.dernierStatut === 'ERREUR'"
                    [class.text-danger-700]="webhook.dernierStatut === 'ERREUR'"
                  >{{ webhook.dernierStatut }}</span>
                }
                <button type="button" class="p-1.5 hover:bg-gray-100 rounded" title="Tester" (click)="testerWebhook(webhook)">
                  <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </button>
                <button type="button" class="p-1.5 hover:bg-danger-100 rounded" title="Supprimer" (click)="supprimerWebhook(webhook)">
                  <svg class="w-4 h-4 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="mt-4 flex flex-wrap gap-2">
              @for (event of webhook.evenements; track event) {
                <span class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">{{ getEventLabel(event) }}</span>
              }
            </div>

            <div class="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
              <span>{{ webhook.nombreAppels }} appels</span>
              @if (webhook.dernierAppel) {
                <span>Dernier appel: {{ webhook.dernierAppel | date:'dd/MM/yyyy HH:mm' }}</span>
              }
            </div>
          </div>
        } @empty {
          <div class="card p-12 text-center">
            <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Aucun webhook configuré</h3>
            <p class="text-gray-500 mt-1">Créez votre premier webhook pour recevoir des notifications</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class WebhooksConfigComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  webhooks = signal<Webhook[]>([]);
  showForm = false;
  newWebhook = { nom: '', url: '', evenements: [] as string[] };

  evenementsDisponibles = [
    { id: 'commande.creee', label: 'Commande créée' },
    { id: 'commande.expediee', label: 'Commande expédiée' },
    { id: 'stock.bas', label: 'Stock bas' },
    { id: 'stock.rupture', label: 'Rupture stock' },
    { id: 'produit.cree', label: 'Produit créé' },
    { id: 'produit.modifie', label: 'Produit modifié' },
    { id: 'transfert.complete', label: 'Transfert complété' },
    { id: 'inventaire.valide', label: 'Inventaire validé' },
  ];

  ngOnInit(): void {
    this.loadWebhooks();
  }

  loadWebhooks(): void {
    this.webhooks.set([
      { id: '1', nom: 'Notification Slack', url: 'https://hooks.slack.com/services/xxx', evenements: ['commande.creee', 'stock.rupture'], actif: true, dernierAppel: new Date(), dernierStatut: 'SUCCESS', nombreAppels: 156 },
      { id: '2', nom: 'ERP Sync', url: 'https://erp.example.com/api/webhook', evenements: ['commande.creee', 'commande.expediee', 'produit.cree'], actif: true, dernierAppel: new Date(Date.now() - 3600000), dernierStatut: 'SUCCESS', nombreAppels: 423 },
    ]);
  }

  toggleEvent(eventId: string): void {
    const idx = this.newWebhook.evenements.indexOf(eventId);
    if (idx >= 0) {
      this.newWebhook.evenements.splice(idx, 1);
    } else {
      this.newWebhook.evenements.push(eventId);
    }
  }

  getEventLabel(eventId: string): string {
    return this.evenementsDisponibles.find(e => e.id === eventId)?.label || eventId;
  }

  creerWebhook(): void {
    if (!this.newWebhook.nom || !this.newWebhook.url || !this.newWebhook.evenements.length) {
      this.notificationService.error('Veuillez remplir tous les champs');
      return;
    }
    const webhook: Webhook = {
      id: Date.now().toString(),
      nom: this.newWebhook.nom,
      url: this.newWebhook.url,
      evenements: [...this.newWebhook.evenements],
      actif: true,
      nombreAppels: 0
    };
    this.webhooks.update(w => [...w, webhook]);
    this.newWebhook = { nom: '', url: '', evenements: [] };
    this.showForm = false;
    this.notificationService.success('Webhook créé avec succès');
  }

  toggleWebhook(webhook: Webhook): void {
    this.notificationService.info(`Webhook ${webhook.actif ? 'activé' : 'désactivé'}`);
  }

  testerWebhook(webhook: Webhook): void {
    this.notificationService.info('Test du webhook en cours...');
    setTimeout(() => {
      webhook.dernierAppel = new Date();
      webhook.dernierStatut = 'SUCCESS';
      webhook.nombreAppels++;
      this.notificationService.success('Test réussi !');
    }, 1000);
  }

  supprimerWebhook(webhook: Webhook): void {
    this.webhooks.update(w => w.filter(x => x.id !== webhook.id));
    this.notificationService.warning('Webhook supprimé');
  }
}
