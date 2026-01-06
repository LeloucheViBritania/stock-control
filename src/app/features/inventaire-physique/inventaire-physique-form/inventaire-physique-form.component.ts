import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventairePhysiqueService } from '@core/services/inventaire-physique.service';
import { EntrepotsService } from '@core/services/entrepots.service';
import { CategoriesService } from '@core/services/categories.service';
import { ToastService } from '@core/services/notifications.service';
import { Entrepot, Categorie } from '@core/models';

@Component({
  selector: 'app-inventaire-physique-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="form-page" style="max-width: 700px;">
      <div class="page-header">
        <a routerLink="/inventaire-physique" class="back-link"><i class="ph ph-arrow-left"></i></a>
        <div><h1>Nouvelle session d'inventaire</h1><p class="text-muted">Démarrez une session de comptage physique</p></div>
      </div>

      <form class="card" (ngSubmit)="onSubmit()">
        <div class="card__body">
          <div class="form-group">
            <label for="nom" class="form-label required">Nom de la session</label>
            <input type="text" id="nom" name="nom" [(ngModel)]="form.nom" class="form-control" 
                   placeholder="Ex: Inventaire fin de mois janvier 2026" required />
          </div>

          <div class="form-group">
            <label for="entrepotId" class="form-label required">Entrepôt</label>
            <select id="entrepotId" name="entrepotId" [(ngModel)]="form.entrepotId" class="form-control" required>
              <option [ngValue]="null">Sélectionner un entrepôt</option>
              @for (e of entrepots(); track e.id) {
                <option [ngValue]="e.id">{{ e.nom }} ({{ e.code }})</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label for="categorieId" class="form-label">Catégorie (optionnel)</label>
            <select id="categorieId" name="categorieId" [(ngModel)]="form.categorieId" class="form-control">
              <option [ngValue]="null">Toutes les catégories</option>
              @for (c of categories(); track c.id) {
                <option [ngValue]="c.id">{{ c.nom }}</option>
              }
            </select>
            <small class="text-muted">Laisser vide pour inventorier tous les produits de l'entrepôt</small>
          </div>

          <div class="form-group">
            <label for="notes" class="form-label">Notes</label>
            <textarea id="notes" name="notes" [(ngModel)]="form.notes" class="form-control" rows="3"
                      placeholder="Instructions ou remarques pour cette session..."></textarea>
          </div>
        </div>

        <div class="card__footer">
          <a routerLink="/inventaire-physique" class="btn btn--secondary">Annuler</a>
          <button type="submit" class="btn btn--primary" [disabled]="isSubmitting()">
            @if (isSubmitting()) {
              <span class="spinner spinner--sm"></span> Création...
            } @else {
              <i class="ph ph-plus"></i> Créer la session
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page-header { display: flex; gap: var(--space-4); margin-bottom: var(--space-6); }
    .back-link { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-lg); background: var(--neutral-100); &:hover { background: var(--neutral-200); } }
    .card__body { display: flex; flex-direction: column; gap: var(--space-5); }
    .card__footer { display: flex; justify-content: flex-end; gap: var(--space-3); padding: var(--space-4) var(--space-6); border-top: 1px solid var(--neutral-200); }
    .required::after { content: ' *'; color: var(--error-500); }
  `]
})
export class InventairePhysiqueFormComponent implements OnInit {
  private inventairePhysiqueService = inject(InventairePhysiqueService);
  private entrepotsService = inject(EntrepotsService);
  private categoriesService = inject(CategoriesService);
  private toast = inject(ToastService);
  private router = inject(Router);

  entrepots = signal<Entrepot[]>([]);
  categories = signal<Categorie[]>([]);
  isSubmitting = signal(false);

  form = {
    nom: '',
    entrepotId: null as number | null,
    categorieId: null as number | null,
    notes: ''
  };

  ngOnInit() {
    this.loadEntrepots();
    this.loadCategories();
  }

  loadEntrepots() {
    this.entrepotsService.getAll({ estActif: true }).subscribe({
      next: (res) => this.entrepots.set(res.data),
      error: () => this.toast.error('Erreur', 'Impossible de charger les entrepôts')
    });
  }

  loadCategories() {
    this.categoriesService.getAll().subscribe({
      next: (res) => this.categories.set(res.data),
      error: () => this.toast.error('Erreur', 'Impossible de charger les catégories')
    });
  }

  onSubmit() {
    if (!this.form.nom || !this.form.entrepotId) {
      this.toast.error('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isSubmitting.set(true);

    const payload: any = {
      nom: this.form.nom,
      entrepotId: this.form.entrepotId
    };
    if (this.form.categorieId) payload.categorieId = this.form.categorieId;
    if (this.form.notes) payload.notes = this.form.notes;

    this.inventairePhysiqueService.create(payload).subscribe({
      next: (session) => {
        this.toast.success('Session créée', 'La session d\'inventaire a été créée avec succès');
        this.router.navigate(['/inventaire-physique', session.id]);
      },
      error: (err) => {
        this.toast.error('Erreur', err.error?.message || 'Impossible de créer la session');
        this.isSubmitting.set(false);
      }
    });
  }
}
