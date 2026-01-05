/**
 * Création d'un inventaire physique (PREMIUM)
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventaireService, CreateInventaireDto } from '../../services/inventaire.service';
import { EntrepotsService, Entrepot } from '@features/entrepots/services/entrepots.service';
import { NotificationService } from '@services/notification.service';

@Component({
  selector: 'app-inventaire-physique',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="flex items-center gap-4">
        <a routerLink="/inventaire" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Nouvel Inventaire</h1>
            <span class="badge-premium">Premium</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Planifiez un inventaire physique</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="card p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations générales</h2>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="form-label required">Entrepôt</label>
              <select formControlName="entrepotId" class="form-input">
                <option value="">Sélectionner...</option>
                @for (e of entrepots(); track e.id) {
                  <option [value]="e.id">{{ e.nom }}</option>
                }
              </select>
            </div>
            <div>
              <label class="form-label required">Type d'inventaire</label>
              <select formControlName="type" class="form-input">
                <option value="COMPLET">Complet (tous les produits)</option>
                <option value="PARTIEL">Partiel (zones sélectionnées)</option>
                <option value="TOURNANT">Tournant (échantillon)</option>
              </select>
            </div>
            <div>
              <label class="form-label required">Date de début</label>
              <input type="date" formControlName="dateDebut" class="form-input" />
            </div>
            <div>
              <label class="form-label required">Responsable</label>
              <input type="text" formControlName="responsable" class="form-input" placeholder="Nom du responsable" />
            </div>
          </div>
        </div>

        <div class="card p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Options</h2>
          <div class="space-y-4">
            <label class="flex items-center gap-3">
              <input type="checkbox" formControlName="bloquerMouvements" class="rounded" />
              <span>Bloquer les mouvements de stock pendant l'inventaire</span>
            </label>
            <label class="flex items-center gap-3">
              <input type="checkbox" formControlName="doubleComptage" class="rounded" />
              <span>Activer le double comptage (vérification)</span>
            </label>
          </div>
          <div class="mt-4">
            <label class="form-label">Notes</label>
            <textarea formControlName="notes" class="form-input" rows="3" placeholder="Instructions particulières..."></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3">
          <a routerLink="/inventaire" class="btn-secondary">Annuler</a>
          <button type="submit" class="btn-primary" [disabled]="isSaving() || form.invalid">
            @if (isSaving()) {
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            }
            Planifier l'inventaire
          </button>
        </div>
      </form>
    </div>
  `,
})
export class InventairePhysiqueComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inventaireService = inject(InventaireService);
  private readonly entrepotsService = inject(EntrepotsService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  form!: FormGroup;
  entrepots = signal<Entrepot[]>([]);
  isSaving = signal(false);

  ngOnInit(): void {
    this.initForm();
    this.loadEntrepots();
  }

  initForm(): void {
    this.form = this.fb.group({
      entrepotId: ['', Validators.required],
      type: ['COMPLET', Validators.required],
      dateDebut: [this.formatDate(new Date()), Validators.required],
      responsable: ['', Validators.required],
      bloquerMouvements: [true],
      doubleComptage: [false],
      notes: ['']
    });
  }

  loadEntrepots(): void {
    this.entrepotsService.getAll(1, 100).subscribe({
      next: (r) => this.entrepots.set(r.data),
      error: () => this.entrepots.set([
        { id: '1', nom: 'Paris', code: 'ENT-001' } as Entrepot,
        { id: '2', nom: 'Lyon', code: 'ENT-002' } as Entrepot,
      ])
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isSaving.set(true);
    
    const data: CreateInventaireDto = {
      entrepotId: this.form.value.entrepotId,
      type: this.form.value.type,
      dateDebut: new Date(this.form.value.dateDebut),
      responsable: this.form.value.responsable,
      notes: this.form.value.notes
    };

    this.inventaireService.create(data).subscribe({
      next: (inv) => {
        this.notificationService.success('Inventaire planifié');
        this.router.navigate(['/inventaire', inv.id]);
      },
      error: () => {
        this.isSaving.set(false);
        this.notificationService.error('Erreur');
      }
    });
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
