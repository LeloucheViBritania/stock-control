import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommandesService } from '@core/services/commandes.service';
import { ToastService } from '@core/services/notifications.service';
import { Commande, StatutCommande } from '@core/models';
import { ConfirmModalComponent } from '@shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-commande-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe, ConfirmModalComponent],
  template: `
    <div class="detail-page">
      @if (isLoading()) {
        <div class="card"><div class="loading-container"><span class="spinner spinner--lg"></span></div></div>
      } @else if (commande()) {
        <!-- Header -->
        <div class="page-header">
          <div class="page-header__left">
            <a routerLink="/commandes" class="back-link"><i class="ph ph-arrow-left"></i></a>
            <div>
              <div class="header-meta">
                <code class="ref-code">{{ commande()?.numeroCommande }}</code>
                <span class="badge" [class]="getStatutClass(commande()!.statut)">{{ getStatutLabel(commande()!.statut) }}</span>
              </div>
              <h1>Commande {{ commande()?.numeroCommande }}</h1>
              <p class="text-muted">{{ commande()?.client?.nom || 'Client anonyme' }}</p>
            </div>
          </div>
          <div class="page-header__right">
            @if (commande()?.statut === 'EN_ATTENTE') {
              <a [routerLink]="['/commandes', commande()?.id, 'edit']" class="btn btn--secondary">
                <i class="ph ph-pencil"></i> Modifier
              </a>
            }
            <div class="dropdown">
              <button class="btn btn--primary"><i class="ph ph-arrows-clockwise"></i> Changer statut</button>
            </div>
          </div>
        </div>

        <div class="detail-grid">
          <!-- Infos principales -->
          <div class="card">
            <h3 class="card__title mb-4">Informations</h3>
            <div class="info-list">
              <div class="info-item"><span class="info-item__label">Client</span><span class="info-item__value">{{ commande()?.client?.nom || '-' }}</span></div>
              <div class="info-item"><span class="info-item__label">Email</span><span class="info-item__value">{{ commande()?.client?.email || '-' }}</span></div>
              <div class="info-item"><span class="info-item__label">Téléphone</span><span class="info-item__value">{{ commande()?.client?.telephone || '-' }}</span></div>
              <div class="info-item"><span class="info-item__label">Date commande</span><span class="info-item__value">{{ commande()?.dateCommande | date:'dd/MM/yyyy' }}</span></div>
              <div class="info-item"><span class="info-item__label">Livraison prévue</span><span class="info-item__value">{{ commande()?.dateLivraisonPrevue | date:'dd/MM/yyyy' }}</span></div>
            </div>
          </div>

          <!-- Totaux -->
          <div class="card totaux-card">
            <h3 class="card__title mb-4">Montants</h3>
            <div class="totaux">
              <div class="totaux__row"><span>Sous-total</span><span>{{ commande()?.sousTotal | currency:'XOF':'symbol':'1.0-0' }}</span></div>
              <div class="totaux__row"><span>Remise</span><span>-{{ commande()?.remise | currency:'XOF':'symbol':'1.0-0' }}</span></div>
              <div class="totaux__row"><span>Taxe</span><span>{{ commande()?.taxe | currency:'XOF':'symbol':'1.0-0' }}</span></div>
              <div class="totaux__row totaux__row--total"><span>Total</span><span>{{ commande()?.montantTotal | currency:'XOF':'symbol':'1.0-0' }}</span></div>
            </div>
          </div>

          <!-- Lignes -->
          <div class="card full-width">
            <h3 class="card__title mb-4"><i class="ph ph-package"></i> Produits ({{ commande()?.lignes?.length || 0 }})</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th class="text-right">Qté</th>
                  <th class="text-right">Prix unit.</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                @for (ligne of commande()?.lignes; track ligne.id) {
                  <tr>
                    <td><strong>{{ ligne.produit?.nom }}</strong><br><small class="text-muted">{{ ligne.produit?.reference }}</small></td>
                    <td class="text-right">{{ ligne.quantite }}</td>
                    <td class="text-right">{{ ligne.prixUnitaire | currency:'XOF':'symbol':'1.0-0' }}</td>
                    <td class="text-right"><strong>{{ ligne.sousTotal | currency:'XOF':'symbol':'1.0-0' }}</strong></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Timeline -->
          <div class="card full-width">
            <h3 class="card__title mb-4"><i class="ph ph-clock-clockwise"></i> Historique</h3>
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <span class="timeline-date">{{ commande()?.dateCreation | date:'dd/MM/yyyy HH:mm' }}</span>
                  <span class="timeline-text">Commande créée</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions rapides -->
          <div class="card actions-card">
            <h3 class="card__title mb-4">Actions</h3>
            <div class="quick-actions">
              @if (commande()?.statut === StatutCommande.EN_ATTENTE) {
                <button class="btn btn--success w-full" (click)="changerStatut(StatutCommande.EN_TRAITEMENT)"><i class="ph ph-play"></i> Traiter</button>
              }
              @if (commande()?.statut === StatutCommande.EN_TRAITEMENT) {
                <button class="btn btn--primary w-full" (click)="changerStatut(StatutCommande.EXPEDIE)"><i class="ph ph-truck"></i> Expédier</button>
              }
              @if (commande()?.statut === StatutCommande.EXPEDIE) {
                <button class="btn btn--success w-full" (click)="changerStatut(StatutCommande.LIVRE)"><i class="ph ph-check-circle"></i> Livré</button>
              }
              @if (commande()?.statut !== StatutCommande.ANNULE && commande()?.statut !== StatutCommande.LIVRE) {
                <button class="btn btn--danger btn--outline w-full" (click)="showAnnulerModal.set(true)"><i class="ph ph-x-circle"></i> Annuler</button>
              }
              <button class="btn btn--secondary w-full" (click)="genererFacture()"><i class="ph ph-file-pdf"></i> Facture PDF</button>
            </div>
          </div>
        </div>

        <app-confirm-modal [show]="showAnnulerModal()" title="Annuler la commande" message="Êtes-vous sûr de vouloir annuler cette commande ?" confirmLabel="Annuler la commande" confirmClass="btn--danger" (confirm)="annulerCommande()" (cancel)="showAnnulerModal.set(false)" />
      }
    </div>
  `,
  styles: [`
    .detail-page { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; margin-bottom: var(--space-6); gap: var(--space-4); }
    .page-header__left { display: flex; gap: var(--space-4); }
    .page-header__right { display: flex; gap: var(--space-3); }
    .back-link { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-lg); background: var(--neutral-100); color: var(--neutral-600); &:hover { background: var(--neutral-200); } }
    .header-meta { display: flex; gap: var(--space-3); margin-bottom: var(--space-2); }
    .ref-code { font-family: var(--font-mono); background: var(--neutral-100); padding: var(--space-1) var(--space-3); border-radius: var(--radius-md); }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); }
    .full-width { grid-column: span 2; }
    .info-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .info-item { display: flex; justify-content: space-between; padding-bottom: var(--space-3); border-bottom: 1px solid var(--neutral-100); }
    .info-item__label { color: var(--neutral-500); }
    .info-item__value { font-weight: 500; }
    .totaux { display: flex; flex-direction: column; gap: var(--space-3); }
    .totaux__row { display: flex; justify-content: space-between; padding: var(--space-2) 0; }
    .totaux__row--total { border-top: 2px solid var(--neutral-300); padding-top: var(--space-4); font-size: var(--text-xl); font-weight: 700; color: var(--primary-600); }
    .timeline { display: flex; flex-direction: column; gap: var(--space-4); }
    .timeline-item { display: flex; gap: var(--space-4); }
    .timeline-dot { width: 12px; height: 12px; background: var(--primary-500); border-radius: 50%; margin-top: 4px; }
    .timeline-content { display: flex; flex-direction: column; }
    .timeline-date { font-size: var(--text-sm); color: var(--neutral-500); }
    .quick-actions { display: flex; flex-direction: column; gap: var(--space-3); }
    .loading-container { display: flex; justify-content: center; padding: var(--space-12); }
    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } .full-width { grid-column: span 1; } }
  `]
})
export class CommandeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private commandesService = inject(CommandesService);
  private toast = inject(ToastService);

  commande = signal<Commande | null>(null);
  isLoading = signal(true);
  showAnnulerModal = signal(false);
  
  // Expose enum to template
  StatutCommande = StatutCommande;

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) this.loadCommande(+id);
  }

  loadCommande(id: number) {
    this.isLoading.set(true);
    this.commandesService.getById(id).subscribe({
      next: (c) => { this.commande.set(c); this.isLoading.set(false); },
      error: () => { this.toast.error('Erreur', 'Commande introuvable'); this.router.navigate(['/commandes']); }
    });
  }

  getStatutClass(statut: StatutCommande): string {
    switch (statut) {
      case StatutCommande.EN_ATTENTE: return 'badge--warning';
      case StatutCommande.EN_TRAITEMENT: return 'badge--info';
      case StatutCommande.EXPEDIE: return 'badge--primary';
      case StatutCommande.LIVRE: return 'badge--success';
      case StatutCommande.ANNULE: return 'badge--error';
      default: return 'badge--secondary';
    }
  }

  getStatutLabel(statut: StatutCommande): string {
    const labels: Record<string, string> = {
      EN_ATTENTE: 'En attente', EN_TRAITEMENT: 'En traitement',
      EXPEDIE: 'Expédié', LIVRE: 'Livré', ANNULE: 'Annulé'
    };
    return labels[statut] || statut;
  }

  changerStatut(statut: StatutCommande) {
    const c = this.commande();
    if (!c) return;
    this.commandesService.changerStatut(c.id, statut).subscribe({
      next: () => { this.toast.success('Statut modifié', `Commande ${this.getStatutLabel(statut).toLowerCase()}`); this.loadCommande(c.id); },
      error: (err) => this.toast.error('Erreur', err.error?.message || 'Impossible de changer le statut')
    });
  }

  annulerCommande() {
    const c = this.commande();
    if (!c) return;
    this.commandesService.annuler(c.id).subscribe({
      next: () => { this.toast.info('Commande annulée'); this.showAnnulerModal.set(false); this.loadCommande(c.id); },
      error: (err) => this.toast.error('Erreur', err.error?.message)
    });
  }

  genererFacture() {
    const c = this.commande();
    if (!c) return;
    this.commandesService.genererFacture(c.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture_${c.numeroCommande}.pdf`;
        a.click();
      },
      error: () => this.toast.error('Erreur', 'Impossible de générer la facture')
    });
  }
}
