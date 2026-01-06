import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalAuditService } from '@core/services/journal-audit.service';
import { ToastService } from '@core/services/notifications.service';
import { JournalAudit } from '@core/models';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

@Component({
  selector: 'app-journal-audit',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, PaginationComponent],
  template: `
    <div class="audit-page">
      <div class="page-header">
        <div>
          <h1>Journal d'Audit</h1>
          <p class="text-muted">Historique de toutes les actions effectuées</p>
        </div>
        <button class="btn btn--secondary" (click)="exportJournal()">
          <i class="ph ph-download-simple"></i>
          Exporter
        </button>
      </div>

      <!-- Filters -->
      <div class="filters card">
        <div class="filters__row">
          <div class="search-box">
            <i class="ph ph-magnifying-glass"></i>
            <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()" placeholder="Rechercher..." class="form-control" />
          </div>
          <select [(ngModel)]="selectedAction" (ngModelChange)="onFilterChange()" class="form-control" style="width: 180px;">
            <option [ngValue]="null">Toutes les actions</option>
            <option value="CREATE">Création</option>
            <option value="UPDATE">Modification</option>
            <option value="DELETE">Suppression</option>
            <option value="LOGIN">Connexion</option>
            <option value="LOGOUT">Déconnexion</option>
          </select>
          <input type="date" [(ngModel)]="dateDebut" (ngModelChange)="onFilterChange()" class="form-control" style="width: 150px;" />
          <input type="date" [(ngModel)]="dateFin" (ngModelChange)="onFilterChange()" class="form-control" style="width: 150px;" />
        </div>
      </div>

      <div class="card">
        @if (isLoading()) {
          <div class="loading-container"><span class="spinner spinner--lg"></span></div>
        } @else if (entries().length === 0) {
          <div class="empty-state">
            <i class="ph-duotone ph-clipboard-text"></i>
            <h3>Aucune entrée</h3>
            <p>Le journal d'audit est vide</p>
          </div>
        } @else {
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Date & Heure</th>
                  <th>Utilisateur</th>
                  <th>Action</th>
                  <th>Entité</th>
                  <th>Détails</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                @for (entry of entries(); track entry.id) {
                  <tr>
                    <td>{{ entry.dateAction | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                    <td>
                      <div class="user-cell">
                        <span class="user-name">{{ entry.utilisateur?.nomComplet || entry.utilisateur?.nomUtilisateur }}</span>
                        <span class="user-role text-muted">{{ entry.utilisateur?.role }}</span>
                      </div>
                    </td>
                    <td><span class="badge" [class]="getActionBadge(entry.action)">{{ entry.action }}</span></td>
                    <td>
                      <span class="entity-type">{{ entry.entite }}</span>
                      @if (entry.entiteId) {
                        <span class="entity-id text-muted">#{{ entry.entiteId }}</span>
                      }
                    </td>
                    <td>
                      @if (entry.details) {
                        <button class="btn btn--ghost btn--sm" (click)="showDetails(entry)">
                          <i class="ph ph-eye"></i>
                        </button>
                      } @else {
                        <span class="text-muted">-</span>
                      }
                    </td>
                    <td><code class="ip-address">{{ entry.adresseIp || '-' }}</code></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="table-footer">
            <span class="text-muted text-sm">{{ meta().total }} entrée(s)</span>
            <app-pagination [currentPage]="currentPage()" [totalPages]="meta().totalPages" (pageChange)="onPageChange($event)" />
          </div>
        }
      </div>

      <!-- Details Modal -->
      @if (showDetailsModal()) {
        <div class="modal-backdrop" (click)="showDetailsModal.set(false)">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal__header">
              <h3 class="modal__title">Détails de l'action</h3>
              <button class="modal__close" (click)="showDetailsModal.set(false)"><i class="ph ph-x"></i></button>
            </div>
            <div class="modal__body">
              <pre class="details-json">{{ selectedEntry()?.details | json }}</pre>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
    .filters { margin-bottom: var(--space-6); }
    .filters__row { display: flex; gap: var(--space-4); flex-wrap: wrap; }
    .search-box { position: relative; flex: 1; min-width: 200px;
      i { position: absolute; left: var(--space-3); top: 50%; transform: translateY(-50%); color: var(--neutral-400); }
      input { padding-left: var(--space-10); }
    }
    .user-cell { display: flex; flex-direction: column; }
    .user-name { font-weight: 500; }
    .user-role { font-size: var(--text-xs); }
    .entity-type { font-weight: 500; }
    .entity-id { font-size: var(--text-sm); margin-left: var(--space-1); }
    .ip-address { font-family: var(--font-mono); font-size: var(--text-sm); background: var(--neutral-100); padding: 2px 6px; border-radius: var(--radius-sm); }
    .loading-container, .empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--space-12); gap: var(--space-4); }
    .empty-state i { font-size: 4rem; color: var(--neutral-300); }
    .table-footer { display: flex; justify-content: space-between; align-items: center; padding: var(--space-4) var(--space-6); border-top: 1px solid var(--neutral-200); }
    .details-json { background: var(--neutral-900); color: var(--neutral-100); padding: var(--space-4); border-radius: var(--radius-lg); overflow-x: auto; font-size: var(--text-sm); max-height: 400px; }
  `]
})
export class JournalAuditComponent implements OnInit {
  private journalService = inject(JournalAuditService);
  private toast = inject(ToastService);

  entries = signal<JournalAudit[]>([]);
  isLoading = signal(true);
  meta = signal({ total: 0, page: 1, limit: 20, totalPages: 0 });
  currentPage = signal(1);

  searchTerm = '';
  selectedAction: string | null = null;
  dateDebut = '';
  dateFin = '';

  showDetailsModal = signal(false);
  selectedEntry = signal<JournalAudit | null>(null);

  private searchTimeout: any;

  ngOnInit() { this.loadEntries(); }

  loadEntries() {
    this.isLoading.set(true);
    const params: any = { page: this.currentPage(), limit: this.meta().limit };
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.selectedAction) params.action = this.selectedAction;
    if (this.dateDebut) params.dateDebut = this.dateDebut;
    if (this.dateFin) params.dateFin = this.dateFin;

    this.journalService.getAll(params).subscribe({
      next: (res) => { this.entries.set(res.data); this.meta.set(res.meta); this.isLoading.set(false); },
      error: () => { this.toast.error('Erreur', 'Impossible de charger le journal'); this.isLoading.set(false); }
    });
  }

  onSearchChange() { clearTimeout(this.searchTimeout); this.searchTimeout = setTimeout(() => { this.currentPage.set(1); this.loadEntries(); }, 300); }
  onFilterChange() { this.currentPage.set(1); this.loadEntries(); }
  onPageChange(page: number) { this.currentPage.set(page); this.loadEntries(); }

  getActionBadge(action: string): string {
    const map: Record<string, string> = { CREATE: 'badge--success', UPDATE: 'badge--info', DELETE: 'badge--error', LOGIN: 'badge--primary', LOGOUT: 'badge--secondary' };
    return map[action] || 'badge--secondary';
  }

  showDetails(entry: JournalAudit) {
    this.selectedEntry.set(entry);
    this.showDetailsModal.set(true);
  }

  exportJournal() {
    this.journalService.export('excel').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `journal_audit_${new Date().toISOString().split('T')[0]}.xlsx`; a.click();
      },
      error: () => this.toast.error('Erreur', 'Export impossible')
    });
  }
}
