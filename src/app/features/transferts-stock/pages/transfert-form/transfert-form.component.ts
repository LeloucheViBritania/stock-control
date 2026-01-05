/**
 * Formulaire de transfert de stock (PREMIUM)
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransfertsStockService, CreateTransfertDto } from '../../services/transferts-stock.service';
import { EntrepotsService, Entrepot } from '@features/entrepots/services/entrepots.service';
import { ProduitsService, Produit } from '@features/produits/services/produits.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-transfert-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center gap-4">
        <a routerLink="/transferts-stock" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Nouveau transfert</h1>
            <span class="badge-premium">Premium</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Transférer des produits entre entrepôts</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Entrepôts -->
        <div class="card p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Entrepôts</h2>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="form-label required">Entrepôt source</label>
              <select formControlName="entrepotSourceId" class="form-input" (change)="onSourceChange()">
                <option value="">Sélectionner...</option>
                @for (e of entrepots(); track e.id) {
                  <option [value]="e.id">{{ e.nom }} ({{ e.code }})</option>
                }
              </select>
              @if (isFieldInvalid('entrepotSourceId')) {
                <p class="form-error">Sélectionnez l'entrepôt source</p>
              }
            </div>
            <div>
              <label class="form-label required">Entrepôt destination</label>
              <select formControlName="entrepotDestinationId" class="form-input">
                <option value="">Sélectionner...</option>
                @for (e of entrepots(); track e.id) {
                  @if (e.id !== form.get('entrepotSourceId')?.value) {
                    <option [value]="e.id">{{ e.nom }} ({{ e.code }})</option>
                  }
                }
              </select>
              @if (isFieldInvalid('entrepotDestinationId')) {
                <p class="form-error">Sélectionnez l'entrepôt destination</p>
              }
            </div>
          </div>
        </div>

        <!-- Produits -->
        <div class="card p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Produits à transférer</h2>
            <button type="button" class="btn-secondary btn-sm" (click)="addLigne()" [disabled]="!form.get('entrepotSourceId')?.value">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Ajouter
            </button>
          </div>

          <div formArrayName="lignes" class="space-y-3">
            @for (ligne of lignesArray.controls; track $index; let i = $index) {
              <div [formGroupName]="i" class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div class="flex-1">
                  <select formControlName="produitId" class="form-input">
                    <option value="">Sélectionner un produit...</option>
                    @for (p of produitsDisponibles(); track p.id) {
                      <option [value]="p.id">{{ p.nom }} (Stock: {{ p.quantiteStock }})</option>
                    }
                  </select>
                </div>
                <div class="w-32">
                  <input type="number" formControlName="quantite" placeholder="Qté" class="form-input text-center" min="1" />
                </div>
                <button type="button" class="p-2 text-danger-600 hover:bg-danger-50 rounded-lg" (click)="removeLigne(i)">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            }
            @if (!lignesArray.length) {
              <p class="text-center text-gray-500 py-4">Aucun produit ajouté</p>
            }
          </div>
        </div>

        <!-- Notes -->
        <div class="card p-6 mb-6">
          <label class="form-label">Notes</label>
          <textarea formControlName="notes" class="form-input" rows="3" placeholder="Notes ou instructions..."></textarea>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3">
          <a routerLink="/transferts-stock" class="btn-secondary">Annuler</a>
          <button type="submit" class="btn-primary" [disabled]="isSaving() || form.invalid || !lignesArray.length">
            @if (isSaving()) {
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            }
            Créer le transfert
          </button>
        </div>
      </form>
    </div>
  `,
})
export class TransfertFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly transfertsService = inject(TransfertsStockService);
  private readonly entrepotsService = inject(EntrepotsService);
  private readonly produitsService = inject(ProduitsService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  form!: FormGroup;
  entrepots = signal<Entrepot[]>([]);
  produitsDisponibles = signal<Produit[]>([]);
  isSaving = signal(false);

  get lignesArray(): FormArray {
    return this.form.get('lignes') as FormArray;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadEntrepots();
  }

  initForm(): void {
    this.form = this.fb.group({
      entrepotSourceId: ['', Validators.required],
      entrepotDestinationId: ['', Validators.required],
      lignes: this.fb.array([]),
      notes: ['']
    });
  }

  loadEntrepots(): void {
    this.entrepotsService.getAll(1, 100).subscribe({
      next: (r) => this.entrepots.set(r.data),
      error: () => this.entrepots.set([
        { id: '1', code: 'ENT-001', nom: 'Paris', type: 'PRINCIPAL', statut: 'ACTIF' } as Entrepot,
        { id: '2', code: 'ENT-002', nom: 'Lyon', type: 'SECONDAIRE', statut: 'ACTIF' } as Entrepot,
        { id: '3', code: 'ENT-003', nom: 'Marseille', type: 'TRANSIT', statut: 'ACTIF' } as Entrepot,
      ])
    });
  }

  onSourceChange(): void {
    const sourceId = this.form.get('entrepotSourceId')?.value;
    if (sourceId) {
      this.entrepotsService.getStock(sourceId).subscribe({
        next: (r) => this.produitsDisponibles.set(r.data.map(s => ({ id: s.produitId, nom: s.produitNom, reference: s.produitReference, quantiteStock: s.quantiteDisponible } as any))),
        error: () => this.produitsDisponibles.set([
          { id: '1', nom: 'Écran LCD 24"', reference: 'LCD-24-001', quantiteStock: 150 } as any,
          { id: '2', nom: 'Clavier mécanique', reference: 'KB-MECH-002', quantiteStock: 300 } as any,
        ])
      });
    }
    this.lignesArray.clear();
  }

  addLigne(): void {
    this.lignesArray.push(this.fb.group({
      produitId: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]]
    }));
  }

  removeLigne(index: number): void {
    this.lignesArray.removeAt(index);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit(): void {
    if (this.form.invalid || !this.lignesArray.length) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const data: CreateTransfertDto = this.form.value;

    this.transfertsService.create(data).subscribe({
      next: (t) => {
        this.notificationService.success('Transfert créé');
        this.router.navigate(['/transferts-stock', t.id]);
      },
      error: () => {
        this.isSaving.set(false);
        this.notificationService.error('Erreur lors de la création');
      }
    });
  }
}
