import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ClientsService } from '@core/services/clients.service';
import { ToastService } from '@core/services/notifications.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-page" style="max-width: 800px;">
      <div class="page-header">
        <a routerLink="/clients" class="back-link"><i class="ph ph-arrow-left"></i></a>
        <div><h1>{{ isEditMode() ? 'Modifier le client' : 'Nouveau client' }}</h1></div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="card mb-6">
          <div class="card__header"><h3 class="card__title"><i class="ph ph-user"></i> Informations générales</h3></div>
          <div class="card__body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-group__label">Nom *</label>
                <input type="text" formControlName="nom" class="form-control" [class.form-control--error]="isFieldInvalid('nom')" placeholder="Nom du client" />
              </div>
              <div class="form-group">
                <label class="form-group__label">Entreprise</label>
                <input type="text" formControlName="entreprise" class="form-control" placeholder="Nom de l'entreprise" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-group__label">Email</label>
                <input type="email" formControlName="email" class="form-control" placeholder="email@exemple.com" />
              </div>
              <div class="form-group">
                <label class="form-group__label">Téléphone</label>
                <input type="text" formControlName="telephone" class="form-control" placeholder="+225 XX XX XX XX" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-group__label">Adresse</label>
              <textarea formControlName="adresse" class="form-control" rows="2" placeholder="Adresse complète"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-group__label">Segment</label>
                <select formControlName="segment" class="form-control">
                  <option value="PARTICULIER">Particulier</option>
                  <option value="PROFESSIONNEL">Professionnel</option>
                  <option value="ENTREPRISE">Entreprise</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-group__label">Limite de crédit (XOF)</label>
                <input type="number" formControlName="limiteCredit" class="form-control" min="0" placeholder="0" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-group__label">Notes</label>
              <textarea formControlName="notes" class="form-control" rows="2" placeholder="Notes internes..."></textarea>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <a routerLink="/clients" class="btn btn--secondary">Annuler</a>
          <button type="submit" class="btn btn--primary" [disabled]="form.invalid || isSubmitting()">
            @if (isSubmitting()) { <span class="spinner spinner--sm"></span> }
            {{ isEditMode() ? 'Enregistrer' : 'Créer' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page-header { display: flex; gap: var(--space-4); margin-bottom: var(--space-6); }
    .back-link { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-lg); background: var(--neutral-100); &:hover { background: var(--neutral-200); } }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .form-actions { display: flex; justify-content: flex-end; gap: var(--space-3); }
    @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; } }
  `]
})
export class ClientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private clientsService = inject(ClientsService);
  private toast = inject(ToastService);

  form!: FormGroup;
  isEditMode = signal(false);
  isSubmitting = signal(false);

  ngOnInit() {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      entreprise: [''],
      email: ['', Validators.email],
      telephone: [''],
      adresse: [''],
      segment: ['PARTICULIER'],
      limiteCredit: [0],
      notes: ['']
    });

    const id = this.route.snapshot.params['id'];
    if (id) { this.isEditMode.set(true); this.loadClient(+id); }
  }

  loadClient(id: number) {
    this.clientsService.getById(id).subscribe({
      next: (client) => this.form.patchValue(client),
      error: () => { this.toast.error('Erreur', 'Client introuvable'); this.router.navigate(['/clients']); }
    });
  }

  isFieldInvalid(field: string): boolean { const c = this.form.get(field); return c ? c.invalid && c.touched : false; }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSubmitting.set(true);
    const data = this.form.value;
    const id = this.route.snapshot.params['id'];

    const request$ = this.isEditMode() ? this.clientsService.update(+id, data) : this.clientsService.create(data);
    request$.subscribe({
      next: (client) => { this.toast.success(this.isEditMode() ? 'Client modifié' : 'Client créé'); this.router.navigate(['/clients', client.id]); },
      error: (err) => { this.isSubmitting.set(false); this.toast.error('Erreur', err.error?.message); }
    });
  }
}
