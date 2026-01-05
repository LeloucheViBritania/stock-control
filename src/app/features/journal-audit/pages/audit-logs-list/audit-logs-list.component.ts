/**
 * Liste des logs d'audit (PREMIUM + ADMIN)
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalAuditService, AuditLog, AuditFilters } from '../../services/journal-audit.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-audit-logs-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Journal d'Audit</h1>
            <span class="badge-premium">Premium</span>
            <span class="badge-secondary">Admin</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Historique de toutes les actions</p>
        </div>
        <button type="button" class="btn-secondary" (click)="exportLogs()">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Exporter
        </button>
      </div>

      <!-- Filtres -->
      <div class="card p-4">
        <div class="flex flex-wrap items-center gap-4">
          <input type="text" [(ngModel)]="filters.search" (ngModelChange)="onFilterChange()" placeholder="Rechercher..." class="form-input flex-1 min-w-[200px]" />
          <select [(ngModel)]="filters.action" (ngModelChange)="onFilterChange()" class="form-input w-auto">
            <option value="">Toutes les actions</option>
            <option value="CREATE">Création</option>
            <option value="UPDATE">Modification</option>
            <option value="DELETE">Suppression</option>
            <option value="LOGIN">Connexion</option>
            <option value="LOGOUT">Déconnexion</option>
            <option value="EXPORT">Export</option>
          </select>
          <select [(ngModel)]="filters.entite" (ngModelChange)="onFilterChange()" class="form-input w-auto">
            <option value="">Toutes les entités</option>
            <option value="PRODUIT">Produits</option>
            <option value="CLIENT">Clients</option>
            <option value="COMMANDE">Commandes</option>
            <option value="FOURNISSEUR">Fournisseurs</option>
            <option value="USER">Utilisateurs</option>
          </select>
        </div>
      </div>

      <!-- Liste -->
      @if (isLoading()) {
        <div class="card p-12"><app-loading-spinner size="lg" text="Chargement..." /></div>
      } @else {
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="table-header">Date/Heure</th>
                  <th class="table-header">Utilisateur</th>
                  <th class="table-header">Action</th>
                  <th class="table-header">Entité</th>
                  <th class="table-header">Détails</th>
                  <th class="table-header text-center">Statut</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                @for (log of logs(); track log.id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td class="table-cell text-sm">
                      <p class="font-medium">{{ log.timestamp | date:'dd/MM/yyyy' }}</p>
                      <p class="text-gray-500">{{ log.timestamp | date:'HH:mm:ss' }}</p>
                    </td>
                    <td class="table-cell">
                      <p class="font-medium text-gray-900 dark:text-white">{{ log.utilisateurNom }}</p>
                      <p class="text-sm text-gray-500">{{ log.utilisateurEmail }}</p>
                    </td>
                    <td class="table-cell">
                      <span class="px-2 py-1 text-xs font-medium rounded-full" [ngClass]="getActionClass(log.action)">
                        {{ getActionLabel(log.action) }}
                      </span>
                    </td>
                    <td class="table-cell">
                      <p class="text-gray-900 dark:text-white">{{ log.entite }}</p>
                      @if (log.entiteNom) {
                        <p class="text-sm text-gray-500">{{ log.entiteNom }}</p>
                      }
                    </td>
                    <td class="table-cell text-sm text-gray-600">
                      {{ log.message || '-' }}
                    </td>
                    <td class="table-cell text-center">
                      @if (log.statut === 'SUCCESS') {
                        <span class="w-2 h-2 bg-success-500 rounded-full inline-block"></span>
                      } @else if (log.statut === 'FAILURE') {
                        <span class="w-2 h-2 bg-danger-500 rounded-full inline-block"></span>
                      } @else {
                        <span class="w-2 h-2 bg-warning-500 rounded-full inline-block"></span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class AuditLogsListComponent implements OnInit {
  private readonly auditService = inject(JournalAuditService);

  logs = signal<AuditLog[]>([]);
  isLoading = signal(true);
  filters: AuditFilters = {};
  private searchTimeout: any;

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading.set(true);
    this.auditService.getLogs(1, 100, this.filters).subscribe({
      next: (r) => { this.logs.set(r.data); this.isLoading.set(false); },
      error: () => {
        this.logs.set([
          { id: '1', timestamp: new Date(), utilisateurId: '1', utilisateurNom: 'Admin', utilisateurEmail: 'admin@example.com', action: 'CREATE', entite: 'PRODUIT', entiteNom: 'Nouveau produit', statut: 'SUCCESS', message: 'Produit créé avec succès' },
          { id: '2', timestamp: new Date(Date.now() - 3600000), utilisateurId: '1', utilisateurNom: 'Admin', utilisateurEmail: 'admin@example.com', action: 'UPDATE', entite: 'CLIENT', entiteNom: 'Client ABC', statut: 'SUCCESS', message: 'Informations mises à jour' },
          { id: '3', timestamp: new Date(Date.now() - 7200000), utilisateurId: '2', utilisateurNom: 'User', utilisateurEmail: 'user@example.com', action: 'LOGIN', entite: 'SESSION', statut: 'SUCCESS', message: 'Connexion réussie' },
          { id: '4', timestamp: new Date(Date.now() - 86400000), utilisateurId: '1', utilisateurNom: 'Admin', utilisateurEmail: 'admin@example.com', action: 'DELETE', entite: 'COMMANDE', entiteNom: 'CMD-001', statut: 'SUCCESS', message: 'Commande annulée' },
        ] as AuditLog[]);
        this.isLoading.set(false);
      }
    });
  }

  onFilterChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadLogs(), 300);
  }

  exportLogs(): void {
    this.auditService.exportLogs(this.filters, 'xlsx').subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audit-logs.xlsx';
        a.click();
      }
    });
  }

  getActionClass(action: string): string {
    const classes: Record<string, string> = {
      'CREATE': 'bg-success-100 text-success-700',
      'UPDATE': 'bg-primary-100 text-primary-700',
      'DELETE': 'bg-danger-100 text-danger-700',
      'LOGIN': 'bg-info-100 text-info-700',
      'LOGOUT': 'bg-gray-100 text-gray-700',
      'EXPORT': 'bg-warning-100 text-warning-700',
      'IMPORT': 'bg-purple-100 text-purple-700',
      'VIEW': 'bg-gray-100 text-gray-700'
    };
    return classes[action] || 'bg-gray-100 text-gray-700';
  }

  getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      'CREATE': 'Création', 'UPDATE': 'Modification', 'DELETE': 'Suppression',
      'LOGIN': 'Connexion', 'LOGOUT': 'Déconnexion', 'EXPORT': 'Export', 'IMPORT': 'Import', 'VIEW': 'Consultation'
    };
    return labels[action] || action;
  }
}
