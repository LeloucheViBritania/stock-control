import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EntrepotsService } from '@core/services/entrepots.service';
import { ToastService } from '@core/services/notifications.service';
import { Entrepot } from '@core/models';
import { ConfirmModalComponent } from '@shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-entrepots-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmModalComponent],
  template: `
    <div class="entrepots-page">
      <div class="page-header">
        <div>
          <h1>Entrepôts</h1>
          <p class="text-muted">Gérez vos entrepôts et emplacements de stockage</p>
        </div>
        <a routerLink="/entrepots/new" class="btn btn--primary">
          <i class="ph ph-plus"></i>
          Nouvel entrepôt
        </a>
      </div>

      @if (isLoading()) {
        <div class="card"><div class="loading-container"><span class="spinner spinner--lg"></span></div></div>
      } @else if (entrepots().length === 0) {
        <div class="card empty-state">
          <i class="ph-duotone ph-warehouse"></i>
          <h3>Aucun entrepôt</h3>
          <p>Créez votre premier entrepôt pour gérer le stock multi-sites</p>
          <a routerLink="/entrepots/new" class="btn btn--primary"><i class="ph ph-plus"></i> Créer un entrepôt</a>
        </div>
      } @else {
        <div class="entrepots-grid">
          @for (entrepot of entrepots(); track entrepot.id) {
            <div class="entrepot-card card" [class.entrepot-card--inactive]="!entrepot.estActif">
              <div class="entrepot-card__header">
                <div class="entrepot-card__icon" [class.entrepot-card__icon--main]="entrepot.estPrincipal">
                  <i class="ph-duotone ph-warehouse"></i>
                </div>
                <div class="entrepot-card__badges">
                  @if (entrepot.estPrincipal) {
                    <span class="badge badge--primary">Principal</span>
                  }
                  @if (!entrepot.estActif) {
                    <span class="badge badge--secondary">Inactif</span>
                  }
                </div>
              </div>
              <div class="entrepot-card__body">
                <h3>{{ entrepot.nom }}</h3>
                @if (entrepot.adresse) {
                  <p class="entrepot-address"><i class="ph ph-map-pin"></i> {{ entrepot.adresse }}</p>
                }
                @if (entrepot.responsable) {
                  <p class="entrepot-manager"><i class="ph ph-user"></i> {{ entrepot.responsable.nomComplet }}</p>
                }
              </div>
              <div class="entrepot-card__stats">
                <div class="stat"><span class="stat-value">{{ entrepot.capacite || '-' }}</span><span class="stat-label">Capacité</span></div>
                <div class="stat"><span class="stat-value">{{ entrepot._count?.inventaires || 0 }}</span><span class="stat-label">Produits</span></div>
              </div>
              <div class="entrepot-card__actions">
                <a [routerLink]="['/entrepots', entrepot.id]" class="btn btn--ghost btn--sm"><i class="ph ph-eye"></i> Voir</a>
                <a [routerLink]="['/entrepots', entrepot.id, 'edit']" class="btn btn--ghost btn--sm"><i class="ph ph-pencil"></i> Modifier</a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
    .entrepots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-6); }
    .entrepot-card { display: flex; flex-direction: column; transition: all var(--transition-fast);
      &:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
      &--inactive { opacity: 0.6; }
    }
    .entrepot-card__header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-4); }
    .entrepot-card__icon { width: 48px; height: 48px; border-radius: var(--radius-lg); background: var(--neutral-100); display: flex; align-items: center; justify-content: center;
      i { font-size: 1.5rem; color: var(--neutral-500); }
      &--main { background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
        i { color: white; }
      }
    }
    .entrepot-card__badges { display: flex; gap: var(--space-2); }
    .entrepot-card__body { flex: 1; margin-bottom: var(--space-4);
      h3 { margin-bottom: var(--space-2); }
    }
    .entrepot-address, .entrepot-manager { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: var(--neutral-500); margin-bottom: var(--space-1); }
    .entrepot-card__stats { display: flex; gap: var(--space-6); padding: var(--space-4) 0; border-top: 1px solid var(--neutral-200); border-bottom: 1px solid var(--neutral-200); margin-bottom: var(--space-4); }
    .stat { display: flex; flex-direction: column; }
    .stat-value { font-family: var(--font-display); font-size: var(--text-xl); font-weight: 600; }
    .stat-label { font-size: var(--text-sm); color: var(--neutral-500); }
    .entrepot-card__actions { display: flex; gap: var(--space-2); }
    .loading-container, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: var(--space-12); gap: var(--space-4); text-align: center; }
    .empty-state i { font-size: 4rem; color: var(--neutral-300); }
  `]
})
export class EntrepotsListComponent implements OnInit {
  private entrepotsService = inject(EntrepotsService);
  private toast = inject(ToastService);

  entrepots = signal<Entrepot[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadEntrepots();
  }

  loadEntrepots() {
    this.isLoading.set(true);
    this.entrepotsService.getAll().subscribe({
      next: (res) => { this.entrepots.set(res.data); this.isLoading.set(false); },
      error: () => { this.toast.error('Erreur', 'Impossible de charger les entrepôts'); this.isLoading.set(false); }
    });
  }
}
