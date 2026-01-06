import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TransfertsStockService } from '@core/services/transferts-stock.service';
import { EntrepotsService } from '@core/services/entrepots.service';
import { ProduitsService } from '@core/services/produits.service';
import { ToastService } from '@core/services/notifications.service';
import { Entrepot, Produit } from '@core/models';

@Component({
  selector: 'app-transfert-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-page" style="max-width: 900px;">
      <div class="page-header">
        <a routerLink="/transferts" class="back-link"><i class="ph ph-arrow-left"></i></a>
        <div><h1>Nouveau transfert</h1><p class="text-muted">Transférez du stock entre entrepôts</p></div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="card mb-6">
          <div class="card__header"><h3 class="card__title"><i class="ph ph-arrows-left-right"></i> Entrepôts</h3></div>
          <div class="card__body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-group__label">Entrepôt d'origine *</label>
                <select formControlName="entrepotOrigineId" class="form-control">
                  <option [ngValue]="null">Sélectionner...</option>
                  @for (e of entrepots(); track e.id) { <option [ngValue]="e.id">{{ e.nom }}</option> }
                </select>
              </div>
              <div class="form-group">
                <label class="form-group__label">Entrepôt destination *</label>
                <select formControlName="entrepotDestinationId" class="form-control">
                  <option [ngValue]="null">Sélectionner...</option>
                  @for (e of entrepots(); track e.id) { <option [ngValue]="e.id">{{ e.nom }}</option> }
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-group__label">Notes</label>
              <textarea formControlName="notes" class="form-control" rows="2" placeholder="Notes..."></textarea>
            </div>
          </div>
        </div>

        <div class="card mb-6">
          <div class="card__header">
            <h3 class="card__title"><i class="ph ph-package"></i> Produits</h3>
            <button type="button" class="btn btn--primary btn--sm" (click)="ajouterLigne()"><i class="ph ph-plus"></i> Ajouter</button>
          </div>
          <div class="card__body p-0">
            @if (lignes.length === 0) {
              <div class="empty-lines"><i class="ph ph-package"></i><p>Ajoutez des produits à transférer</p></div>
            } @else {
              <table class="table">
                <thead><tr><th>Produit</th><th class="text-right" style="width: 120px;">Quantité</th><th style="width: 60px;"></th></tr></thead>
                <tbody formArrayName="lignes">
                  @for (l of lignes.controls; track $index; let i = $index) {
                    <tr [formGroupName]="i">
                      <td>
                        <select formControlName="produitId" class="form-control form-control--sm">
                          <option [ngValue]="null">Sélectionner...</option>
                          @for (p of produits(); track p.id) { <option [ngValue]="p.id">{{ p.reference }} - {{ p.nom }}</option> }
                        </select>
                      </td>
                      <td><input type="number" formControlName="quantite" class="form-control form-control--sm text-right" min="1" /></td>
                      <td><button type="button" class="btn btn--ghost btn--sm btn--icon text-error" (click)="supprimerLigne(i)"><i class="ph ph-trash"></i></button></td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </div>

        <div class="form-actions">
          <a routerLink="/transferts" class="btn btn--secondary">Annuler</a>
          <button type="submit" class="btn btn--primary" [disabled]="form.invalid || lignes.length === 0 || isSubmitting()">
            @if (isSubmitting()) { <span class="spinner spinner--sm"></span> }
            Créer le transfert
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page-header { display: flex; gap: var(--space-4); margin-bottom: var(--space-6); }
    .back-link { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-lg); background: var(--neutral-100); &:hover { background: var(--neutral-200); } }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .empty-lines { padding: var(--space-8); text-align: center; color: var(--neutral-400); i { font-size: 2rem; margin-bottom: var(--space-2); display: block; } }
    .form-actions { display: flex; justify-content: flex-end; gap: var(--space-3); }
  `]
})
export class TransfertFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private transfertsService = inject(TransfertsStockService);
  private entrepotsService = inject(EntrepotsService);
  private produitsService = inject(ProduitsService);
  private toast = inject(ToastService);

  form!: FormGroup;
  entrepots = signal<Entrepot[]>([]);
  produits = signal<Produit[]>([]);
  isSubmitting = signal(false);

  get lignes(): FormArray { return this.form.get('lignes') as FormArray; }

  ngOnInit() {
    this.form = this.fb.group({
      entrepotOrigineId: [null, Validators.required],
      entrepotDestinationId: [null, Validators.required],
      notes: [''],
      lignes: this.fb.array([])
    });

    this.loadEntrepots();
    this.loadProduits();

    const fromId = this.route.snapshot.queryParams['from'];
    if (fromId) this.form.patchValue({ entrepotOrigineId: +fromId });
  }

  loadEntrepots() { this.entrepotsService.getAllActive().subscribe({ next: (entrepots) => this.entrepots.set(entrepots) }); }
  loadProduits() { this.produitsService.getAll({ limit: 500, estActif: true }).subscribe({ next: (res) => this.produits.set(res.data) }); }

  ajouterLigne() { this.lignes.push(this.fb.group({ produitId: [null, Validators.required], quantite: [1, [Validators.required, Validators.min(1)]] })); }
  supprimerLigne(i: number) { this.lignes.removeAt(i); }

  onSubmit() {
    if (this.form.invalid || this.lignes.length === 0) { this.form.markAllAsTouched(); return; }
    this.isSubmitting.set(true);

    this.transfertsService.create({ ...this.form.value, lignes: this.lignes.value }).subscribe({
      next: (t) => { this.toast.success('Transfert créé', `Référence: ${t.reference}`); this.router.navigate(['/transferts', t.id]); },
      error: (err) => { this.isSubmitting.set(false); this.toast.error('Erreur', err.error?.message); }
    });
  }
}
