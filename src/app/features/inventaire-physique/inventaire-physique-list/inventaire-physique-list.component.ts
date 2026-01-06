import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InventairePhysiqueService } from '@core/services/inventaire-physique.service';
import { ToastService } from '@core/services/notifications.service';

@Component({
  selector: 'app-inventaire-physique-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <div class="inv-physique-page">
      <div class="page-header">
        <div><h1>Inventaire Physique</h1><p class="text-muted">Sessions de comptage et réconciliation</p></div>
        <a routerLink="/inventaire-physique/new" class="btn btn--primary"><i class="ph ph-plus"></i> Nouvelle session</a>
      </div>

      <div class="card">
        @if (isLoading()) {
          <div class="loading-container"><span class="spinner spinner--lg"></span></div>
        } @else if (sessions().length === 0) {
          <div class="empty-state">
            <i class="ph-duotone ph-clipboard-text"></i>
            <h3>Aucune session</h3>
            <p>Démarrez votre premier inventaire physique</p>
            <a routerLink="/inventaire-physique/new" class="btn btn--primary"><i class="ph ph-plus"></i> Créer une session</a>
          </div>
        } @else {
          <div class="table-container">
            <table class="table">
              <thead><tr><th>Référence</th><th>Entrepôt</th><th>Date début</th><th>Date fin</th><th>Produits</th><th>Statut</th><th class="text-right">Actions</th></tr></thead>
              <tbody>
                @for (s of sessions(); track s.id) {
                  <tr>
                    <td><a [routerLink]="['/inventaire-physique', s.id]" class="font-medium">{{ s.reference }}</a></td>
                    <td>{{ s.entrepot?.nom || '-' }}</td>
                    <td>{{ s.dateDebut | date:'dd/MM/yyyy' }}</td>
                    <td>{{ s.dateFin | date:'dd/MM/yyyy' }}</td>
                    <td><span class="badge badge--secondary">{{ s._count?.lignes || 0 }}</span></td>
                    <td><span class="badge" [class]="getStatutBadge(s.statut)">{{ s.statut }}</span></td>
                    <td class="text-right">
                      <a [routerLink]="['/inventaire-physique', s.id]" class="btn btn--ghost btn--sm btn--icon"><i class="ph ph-eye"></i></a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
    .loading-container, .empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--space-12); gap: var(--space-4); }
    .empty-state i { font-size: 4rem; color: var(--neutral-300); }
  `]
})
export class InventairePhysiqueListComponent implements OnInit {
  private service = inject(InventairePhysiqueService);
  private toast = inject(ToastService);

  sessions = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() { this.loadSessions(); }

  loadSessions() {
    this.isLoading.set(true);
    this.service.getAll({ limit: 50 }).subscribe({
      next: (res) => { this.sessions.set(res.data); this.isLoading.set(false); },
      error: () => { this.toast.error('Erreur', 'Impossible de charger les sessions'); this.isLoading.set(false); }
    });
  }

  getStatutBadge(statut: string): string {
    return { EN_COURS: 'badge--info', TERMINE: 'badge--success', ANNULE: 'badge--error', BROUILLON: 'badge--secondary' }[statut] || 'badge--secondary';
  }
}
