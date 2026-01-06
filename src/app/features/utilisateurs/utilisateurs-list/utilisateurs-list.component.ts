import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UtilisateursService } from '@core/services/utilisateurs.service';
import { ToastService } from '@core/services/notifications.service';
import { Utilisateur, Role, TierAbonnement } from '@core/models';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ConfirmModalComponent } from '@shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-utilisateurs-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe, PaginationComponent, ConfirmModalComponent],
  template: `
    <div class="utilisateurs-page">
      <div class="page-header">
        <div><h1>Utilisateurs</h1><p class="text-muted">Gestion des comptes utilisateurs</p></div>
        <a routerLink="/utilisateurs/new" class="btn btn--primary"><i class="ph ph-plus"></i> Nouvel utilisateur</a>
      </div>

      <div class="filters card mb-6">
        <div class="filters__row">
          <div class="search-box">
            <i class="ph ph-magnifying-glass"></i>
            <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()" placeholder="Rechercher..." class="form-control" />
          </div>
          <select [(ngModel)]="selectedRole" (ngModelChange)="onFilterChange()" class="form-control" style="width: 160px;">
            <option [ngValue]="null">Tous les rôles</option>
            <option value="ADMIN">Admin</option>
            <option value="GESTIONNAIRE">Gestionnaire</option>
            <option value="EMPLOYE">Employé</option>
          </select>
        </div>
      </div>

      <div class="card">
        @if (isLoading()) {
          <div class="loading-container"><span class="spinner spinner--lg"></span></div>
        } @else if (utilisateurs().length === 0) {
          <div class="empty-state">
            <i class="ph-duotone ph-users"></i>
            <h3>Aucun utilisateur</h3>
          </div>
        } @else {
          <div class="table-container">
            <table class="table">
              <thead><tr><th>Utilisateur</th><th>Email</th><th>Rôle</th><th>Abonnement</th><th>Statut</th><th>Création</th><th class="text-right">Actions</th></tr></thead>
              <tbody>
                @for (u of utilisateurs(); track u.id) {
                  <tr [class.row-inactive]="!u.estActif">
                    <td>
                      <div class="user-cell">
                        <div class="user-avatar">{{ getInitials(u) }}</div>
                        <div>
                          <a [routerLink]="['/utilisateurs', u.id]" class="user-name">{{ u.nomComplet || u.nomUtilisateur }}</a>
                          <span class="user-username text-muted">&#64;{{ u.nomUtilisateur }}</span>
                        </div>
                      </div>
                    </td>
                    <td>{{ u.email }}</td>
                    <td><span class="badge" [class]="getRoleBadge(u.role)">{{ u.role }}</span></td>
                    <td>
                      <span class="badge" [class]="u.tierAbonnement === 'PREMIUM' ? 'badge--primary' : 'badge--secondary'">
                        @if (u.tierAbonnement === 'PREMIUM') { <i class="ph ph-crown"></i> }
                        {{ u.tierAbonnement }}
                      </span>
                    </td>
                    <td><span class="badge" [class]="u.estActif ? 'badge--success' : 'badge--secondary'">{{ u.estActif ? 'Actif' : 'Inactif' }}</span></td>
                    <td>{{ u.dateCreation | date:'dd/MM/yyyy' }}</td>
                    <td class="text-right">
                      <a [routerLink]="['/utilisateurs', u.id]" class="btn btn--ghost btn--sm btn--icon"><i class="ph ph-eye"></i></a>
                      <a [routerLink]="['/utilisateurs', u.id, 'edit']" class="btn btn--ghost btn--sm btn--icon"><i class="ph ph-pencil"></i></a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="table-footer">
            <span class="text-muted text-sm">{{ meta().total }} utilisateur(s)</span>
            <app-pagination [currentPage]="currentPage()" [totalPages]="meta().totalPages" (pageChange)="onPageChange($event)" />
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
    .filters__row { display: flex; gap: var(--space-4); flex-wrap: wrap; }
    .search-box { position: relative; flex: 1; min-width: 200px;
      i { position: absolute; left: var(--space-3); top: 50%; transform: translateY(-50%); color: var(--neutral-400); }
      input { padding-left: var(--space-10); }
    }
    .user-cell { display: flex; align-items: center; gap: var(--space-3); }
    .user-avatar { width: 36px; height: 36px; border-radius: var(--radius-full); background: var(--primary-100); color: var(--primary-600); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: var(--text-sm); }
    .user-name { font-weight: 500; display: block; &:hover { color: var(--primary-600); } }
    .user-username { font-size: var(--text-sm); display: block; }
    .row-inactive { opacity: 0.6; }
    .loading-container, .empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--space-12); gap: var(--space-4); }
    .empty-state i { font-size: 4rem; color: var(--neutral-300); }
    .table-footer { display: flex; justify-content: space-between; align-items: center; padding: var(--space-4) var(--space-6); border-top: 1px solid var(--neutral-200); }
  `]
})
export class UtilisateursListComponent implements OnInit {
  private utilisateursService = inject(UtilisateursService);
  private toast = inject(ToastService);

  utilisateurs = signal<Utilisateur[]>([]);
  isLoading = signal(true);
  meta = signal({ total: 0, page: 1, limit: 20, totalPages: 0 });
  currentPage = signal(1);
  searchTerm = '';
  selectedRole: string | null = null;
  private searchTimeout: any;

  ngOnInit() { this.loadUtilisateurs(); }

  loadUtilisateurs() {
    this.isLoading.set(true);
    const params: any = { page: this.currentPage(), limit: this.meta().limit };
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.selectedRole) params.role = this.selectedRole;

    this.utilisateursService.getAll(params).subscribe({
      next: (res) => { this.utilisateurs.set(res.data); this.meta.set(res.meta); this.isLoading.set(false); },
      error: () => { this.toast.error('Erreur', 'Impossible de charger les utilisateurs'); this.isLoading.set(false); }
    });
  }

  onSearchChange() { clearTimeout(this.searchTimeout); this.searchTimeout = setTimeout(() => { this.currentPage.set(1); this.loadUtilisateurs(); }, 300); }
  onFilterChange() { this.currentPage.set(1); this.loadUtilisateurs(); }
  onPageChange(page: number) { this.currentPage.set(page); this.loadUtilisateurs(); }

  getInitials(u: Utilisateur): string {
    const name = u.nomComplet || u.nomUtilisateur;
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getRoleBadge(role: Role): string {
    return { ADMIN: 'badge--error', GESTIONNAIRE: 'badge--info', EMPLOYE: 'badge--secondary' }[role] || 'badge--secondary';
  }
}
