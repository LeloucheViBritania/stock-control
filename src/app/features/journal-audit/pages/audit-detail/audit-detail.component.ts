/**
 * Détail d'un log d'audit (PREMIUM)
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { JournalAuditService } from '../../services/journal-audit.service';

interface AuditLog {
  id: string;
  action: string;
  entite: string;
  entiteId: string;
  utilisateur: { id: string; nom: string; email: string; role: string };
  dateHeure: Date;
  ipAdresse: string;
  userAgent: string;
  donneeAvant: any;
  donneeApres: any;
  metadata: Record<string, any>;
  statut: 'SUCCESS' | 'FAILURE' | 'WARNING';
  duree?: number;
}

@Component({
  selector: 'app-audit-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a routerLink="/journal-audit" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Détail de l'action</h1>
              <span class="badge-premium">Premium</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Log #{{ log()?.id }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button type="button" class="btn-secondary" (click)="navigatePrev()" [disabled]="!hasPrev()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button type="button" class="btn-secondary" (click)="navigateNext()" [disabled]="!hasNext()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      @if (log()) {
        <!-- Résumé -->
        <div class="card p-6">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-xl flex items-center justify-center"
                [class.bg-success-100]="log()!.statut === 'SUCCESS'"
                [class.bg-danger-100]="log()!.statut === 'FAILURE'"
                [class.bg-warning-100]="log()!.statut === 'WARNING'"
              >
                @if (log()!.statut === 'SUCCESS') {
                  <svg class="w-7 h-7 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                } @else if (log()!.statut === 'FAILURE') {
                  <svg class="w-7 h-7 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                } @else {
                  <svg class="w-7 h-7 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                }
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ getActionLabel(log()!.action) }}</h2>
                <p class="text-gray-500 mt-1">{{ log()!.entite }} #{{ log()!.entiteId }}</p>
              </div>
            </div>
            <span class="px-3 py-1.5 text-sm font-medium rounded-full"
              [class.bg-success-100]="log()!.statut === 'SUCCESS'"
              [class.text-success-700]="log()!.statut === 'SUCCESS'"
              [class.bg-danger-100]="log()!.statut === 'FAILURE'"
              [class.text-danger-700]="log()!.statut === 'FAILURE'"
              [class.bg-warning-100]="log()!.statut === 'WARNING'"
              [class.text-warning-700]="log()!.statut === 'WARNING'"
            >{{ log()!.statut }}</span>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Informations -->
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Informations</h3>
            <dl class="space-y-4">
              <div class="flex justify-between">
                <dt class="text-gray-500">Date & Heure</dt>
                <dd class="font-medium text-gray-900 dark:text-white">{{ log()!.dateHeure | date:'dd/MM/yyyy HH:mm:ss' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Durée</dt>
                <dd class="font-medium text-gray-900 dark:text-white">{{ log()!.duree || 0 }} ms</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Adresse IP</dt>
                <dd class="font-mono text-sm text-gray-900 dark:text-white">{{ log()!.ipAdresse }}</dd>
              </div>
              <div>
                <dt class="text-gray-500 mb-1">User Agent</dt>
                <dd class="text-sm text-gray-600 bg-gray-50 dark:bg-gray-800 p-2 rounded font-mono break-all">{{ log()!.userAgent }}</dd>
              </div>
            </dl>
          </div>

          <!-- Utilisateur -->
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Utilisateur</h3>
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <span class="text-lg font-bold text-primary-600">{{ log()!.utilisateur.nom.charAt(0) }}</span>
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ log()!.utilisateur.nom }}</p>
                <p class="text-sm text-gray-500">{{ log()!.utilisateur.email }}</p>
              </div>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Rôle</span>
                <span class="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded">{{ log()!.utilisateur.role }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Différences -->
        @if (log()!.donneeAvant || log()!.donneeApres) {
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Modifications</h3>
            <div class="grid gap-4 lg:grid-cols-2">
              <!-- Avant -->
              <div>
                <h4 class="text-sm font-medium text-danger-600 mb-2 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Avant
                </h4>
                <pre class="p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg text-sm overflow-x-auto font-mono text-danger-800">{{ log()!.donneeAvant | json }}</pre>
              </div>
              <!-- Après -->
              <div>
                <h4 class="text-sm font-medium text-success-600 mb-2 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Après
                </h4>
                <pre class="p-4 bg-success-50 dark:bg-success-900/20 rounded-lg text-sm overflow-x-auto font-mono text-success-800">{{ log()!.donneeApres | json }}</pre>
              </div>
            </div>
          </div>
        }

        <!-- Métadonnées -->
        @if (log()!.metadata && hasMetadata()) {
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Métadonnées</h3>
            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              @for (key of objectKeys(log()!.metadata); track key) {
                <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p class="text-xs text-gray-500 uppercase">{{ key }}</p>
                  <p class="font-medium text-gray-900 dark:text-white mt-1">{{ log()!.metadata[key] }}</p>
                </div>
              }
            </div>
          </div>
        }

        <!-- Actions connexes -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Actions connexes</h3>
          <div class="space-y-3">
            @for (action of actionsConnexes(); track action.id) {
              <a [routerLink]="['/journal-audit', action.id]" class="block p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center"
                      [class.bg-success-100]="action.statut === 'SUCCESS'"
                      [class.bg-danger-100]="action.statut === 'FAILURE'"
                    >
                      @if (action.statut === 'SUCCESS') {
                        <svg class="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      } @else {
                        <svg class="w-4 h-4 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      }
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">{{ getActionLabel(action.action) }}</p>
                      <p class="text-xs text-gray-500">{{ action.dateHeure | date:'dd/MM HH:mm' }}</p>
                    </div>
                  </div>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </a>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class AuditDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auditService = inject(JournalAuditService);

  log = signal<AuditLog | null>(null);
  actionsConnexes = signal<any[]>([]);

  objectKeys = Object.keys;

  hasMetadata(): boolean {
    const l = this.log();
    return l?.metadata ? Object.keys(l.metadata).length > 0 : false;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loadLog(params['id']);
    });
  }

  loadLog(id: string): void {
    // Mock data
    this.log.set({
      id,
      action: 'UPDATE',
      entite: 'Produit',
      entiteId: 'PROD-001',
      utilisateur: { id: 'USR-001', nom: 'Jean Dupont', email: 'jean.dupont@example.com', role: 'ADMIN' },
      dateHeure: new Date(),
      ipAdresse: '192.168.1.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      donneeAvant: { nom: 'Écran LCD 24"', prix: 180, stock: 45 },
      donneeApres: { nom: 'Écran LCD 24" Full HD', prix: 199.99, stock: 45 },
      metadata: { source: 'Interface web', module: 'Produits', version: '2.1.0' },
      statut: 'SUCCESS',
      duree: 124,
    });

    this.actionsConnexes.set([
      { id: '2', action: 'VIEW', entite: 'Produit', dateHeure: new Date(Date.now() - 60000), statut: 'SUCCESS' },
      { id: '3', action: 'CREATE', entite: 'MouvementStock', dateHeure: new Date(Date.now() - 120000), statut: 'SUCCESS' },
      { id: '4', action: 'UPDATE', entite: 'Produit', dateHeure: new Date(Date.now() - 86400000), statut: 'SUCCESS' },
    ]);
  }

  getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      'CREATE': 'Création',
      'UPDATE': 'Modification',
      'DELETE': 'Suppression',
      'VIEW': 'Consultation',
      'LOGIN': 'Connexion',
      'LOGOUT': 'Déconnexion',
      'EXPORT': 'Export',
    };
    return labels[action] || action;
  }

  hasPrev(): boolean { return true; }
  hasNext(): boolean { return true; }
  
  navigatePrev(): void {
    // TODO: Navigate to previous log
  }

  navigateNext(): void {
    // TODO: Navigate to next log
  }
}
