/**
 * Gestion des Clés API (PREMIUM)
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '@services/notification.service';

interface ApiKey {
  id: string;
  nom: string;
  cle: string;
  cleVisible: boolean;
  permissions: string[];
  createdAt: Date;
  dernierUsage?: Date;
  nombreRequetes: number;
  limite?: number;
  actif: boolean;
}

@Component({
  selector: 'app-api-keys',
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
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Clés API</h1>
              <span class="badge-premium">Premium</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Gérez vos clés d'accès à l'API</p>
          </div>
        </div>
        <button type="button" class="btn-primary" (click)="showForm = true">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nouvelle clé
        </button>
      </div>

      <!-- Alerte sécurité -->
      <div class="card p-4 bg-warning-50 border border-warning-200">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-warning-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <div>
            <p class="font-medium text-warning-800">Gardez vos clés secrètes</p>
            <p class="text-sm text-warning-700">Ne partagez jamais vos clés API. Elles donnent accès complet à votre compte.</p>
          </div>
        </div>
      </div>

      <!-- Formulaire nouvelle clé -->
      @if (showForm) {
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Nouvelle clé API</h3>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="form-label">Nom de la clé</label>
              <input type="text" [(ngModel)]="newKey.nom" class="form-input" placeholder="Ex: Application mobile" />
            </div>
            <div>
              <label class="form-label">Limite de requêtes (optionnel)</label>
              <input type="number" [(ngModel)]="newKey.limite" class="form-input" placeholder="Illimité" />
            </div>
          </div>
          <div class="mt-4">
            <label class="form-label">Permissions</label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              @for (perm of permissionsDisponibles; track perm.id) {
                <label class="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  [class.border-primary-500]="newKey.permissions.includes(perm.id)"
                  [class.bg-primary-50]="newKey.permissions.includes(perm.id)"
                >
                  <input type="checkbox" [checked]="newKey.permissions.includes(perm.id)" 
                    (change)="togglePermission(perm.id)" class="rounded border-gray-300" />
                  <span class="text-sm">{{ perm.label }}</span>
                </label>
              }
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <button type="button" class="btn-secondary" (click)="showForm = false">Annuler</button>
            <button type="button" class="btn-primary" (click)="genererCle()">Générer la clé</button>
          </div>
        </div>
      }

      <!-- Nouvelle clé générée -->
      @if (nouvelleCle()) {
        <div class="card p-6 bg-success-50 border border-success-200">
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div class="flex-1">
              <p class="font-medium text-success-800">Votre nouvelle clé API a été générée</p>
              <p class="text-sm text-success-700 mb-3">Copiez-la maintenant, elle ne sera plus affichée.</p>
              <div class="flex items-center gap-2">
                <code class="flex-1 p-3 bg-white rounded font-mono text-sm select-all">{{ nouvelleCle() }}</code>
                <button type="button" class="btn-secondary" (click)="copierCle(nouvelleCle()!)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                </button>
              </div>
            </div>
            <button type="button" class="text-success-600 hover:text-success-800" (click)="nouvelleCle.set(null)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      }

      <!-- Liste des clés -->
      <div class="card overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Nom</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Clé</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">Permissions</th>
              <th class="text-right py-3 px-4 font-medium text-gray-600">Requêtes</th>
              <th class="text-center py-3 px-4 font-medium text-gray-600">Statut</th>
              <th class="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            @for (key of apiKeys(); track key.id) {
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="py-3 px-4">
                  <p class="font-medium text-gray-900 dark:text-white">{{ key.nom }}</p>
                  <p class="text-xs text-gray-500">Créée le {{ key.createdAt | date:'dd/MM/yyyy' }}</p>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <code class="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {{ key.cleVisible ? key.cle : maskKey(key.cle) }}
                    </code>
                    <button type="button" class="text-gray-400 hover:text-gray-600" (click)="key.cleVisible = !key.cleVisible">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        @if (key.cleVisible) {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                        } @else {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        }
                      </svg>
                    </button>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="flex flex-wrap gap-1">
                    @for (perm of key.permissions.slice(0, 3); track perm) {
                      <span class="px-1.5 py-0.5 text-xs bg-gray-100 rounded">{{ perm }}</span>
                    }
                    @if (key.permissions.length > 3) {
                      <span class="px-1.5 py-0.5 text-xs bg-gray-100 rounded">+{{ key.permissions.length - 3 }}</span>
                    }
                  </div>
                </td>
                <td class="py-3 px-4 text-right">
                  <span class="font-mono">{{ key.nombreRequetes | number }}</span>
                  @if (key.limite) {
                    <span class="text-gray-400">/ {{ key.limite | number }}</span>
                  }
                </td>
                <td class="py-3 px-4 text-center">
                  <span class="px-2 py-1 text-xs rounded-full"
                    [class.bg-success-100]="key.actif"
                    [class.text-success-700]="key.actif"
                    [class.bg-gray-100]="!key.actif"
                    [class.text-gray-700]="!key.actif"
                  >{{ key.actif ? 'Active' : 'Inactive' }}</span>
                </td>
                <td class="py-3 px-4 text-center">
                  <div class="flex items-center justify-center gap-1">
                    <button type="button" class="p-1.5 hover:bg-gray-100 rounded" title="Copier" (click)="copierCle(key.cle)">
                      <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      </svg>
                    </button>
                    <button type="button" class="p-1.5 hover:bg-danger-100 rounded" title="Révoquer" (click)="revoquerCle(key)">
                      <svg class="w-4 h-4 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ApiKeysComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  apiKeys = signal<ApiKey[]>([]);
  showForm = false;
  nouvelleCle = signal<string | null>(null);
  newKey = { nom: '', limite: null as number | null, permissions: [] as string[] };

  permissionsDisponibles = [
    { id: 'read:produits', label: 'Lire produits' },
    { id: 'write:produits', label: 'Écrire produits' },
    { id: 'read:commandes', label: 'Lire commandes' },
    { id: 'write:commandes', label: 'Écrire commandes' },
    { id: 'read:stock', label: 'Lire stock' },
    { id: 'write:stock', label: 'Écrire stock' },
    { id: 'read:clients', label: 'Lire clients' },
    { id: 'admin', label: 'Admin complet' },
  ];

  ngOnInit(): void {
    this.loadApiKeys();
  }

  loadApiKeys(): void {
    this.apiKeys.set([
      { id: '1', nom: 'Application Mobile', cle: 'sk_live_abc123def456ghi789', cleVisible: false, permissions: ['read:produits', 'read:stock', 'read:commandes'], createdAt: new Date('2024-06-15'), dernierUsage: new Date(), nombreRequetes: 15420, actif: true },
      { id: '2', nom: 'Intégration ERP', cle: 'sk_live_xyz789uvw456rst123', cleVisible: false, permissions: ['read:produits', 'write:produits', 'read:stock', 'write:stock'], createdAt: new Date('2024-09-01'), dernierUsage: new Date(Date.now() - 3600000), nombreRequetes: 8934, limite: 50000, actif: true },
      { id: '3', nom: 'Test Development', cle: 'sk_test_dev123test456key789', cleVisible: false, permissions: ['admin'], createdAt: new Date('2024-11-20'), nombreRequetes: 234, actif: false },
    ]);
  }

  togglePermission(permId: string): void {
    const idx = this.newKey.permissions.indexOf(permId);
    if (idx >= 0) {
      this.newKey.permissions.splice(idx, 1);
    } else {
      this.newKey.permissions.push(permId);
    }
  }

  maskKey(key: string): string {
    return key.substring(0, 10) + '...' + key.substring(key.length - 4);
  }

  genererCle(): void {
    if (!this.newKey.nom || !this.newKey.permissions.length) {
      this.notificationService.error('Veuillez remplir tous les champs requis');
      return;
    }
    const cle = 'sk_live_' + Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('');
    const apiKey: ApiKey = {
      id: Date.now().toString(),
      nom: this.newKey.nom,
      cle,
      cleVisible: false,
      permissions: [...this.newKey.permissions],
      createdAt: new Date(),
      nombreRequetes: 0,
      limite: this.newKey.limite || undefined,
      actif: true
    };
    this.apiKeys.update(k => [apiKey, ...k]);
    this.nouvelleCle.set(cle);
    this.newKey = { nom: '', limite: null, permissions: [] };
    this.showForm = false;
  }

  copierCle(cle: string): void {
    navigator.clipboard.writeText(cle);
    this.notificationService.success('Clé copiée dans le presse-papier');
  }

  revoquerCle(key: ApiKey): void {
    this.apiKeys.update(k => k.filter(x => x.id !== key.id));
    this.notificationService.warning('Clé API révoquée');
  }
}
