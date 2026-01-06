import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TransfertsStockService } from '@core/services/transferts-stock.service';
import { ToastService } from '@core/services/notifications.service';
import { TransfertStock, StatutTransfert } from '@core/models';

@Component({
  selector: 'app-transfert-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <div class="detail-page" style="max-width: 900px;">
      @if (isLoading()) {
        <div class="card"><div class="loading-container"><span class="spinner spinner--lg"></span></div></div>
      } @else if (transfert()) {
        <div class="page-header">
          <div class="page-header__left">
            <a routerLink="/transferts" class="back-link"><i class="ph ph-arrow-left"></i></a>
            <div>
              <div class="header-badges">
                <code class="ref-code">{{ transfert()?.reference }}</code>
                <span class="badge" [class]="getStatutBadge(transfert()!.statut)">{{ getStatutLabel(transfert()!.statut) }}</span>
              </div>
              <h1>Transfert {{ transfert()?.reference }}</h1>
            </div>
          </div>
          <div class="page-header__right">
            @if (transfert()?.statut === 'EN_ATTENTE') {
              <button class="btn btn--primary" (click)="envoyer()"><i class="ph ph-paper-plane-tilt"></i> Envoyer</button>
            }
            @if (transfert()?.statut === 'EN_TRANSIT') {
              <button class="btn btn--success" (click)="recevoir()"><i class="ph ph-check-circle"></i> Réceptionner</button>
            }
            @if (transfert()?.statut !== 'ANNULE' && transfert()?.statut !== 'RECU') {
              <button class="btn btn--danger btn--outline" (click)="annuler()"><i class="ph ph-x-circle"></i> Annuler</button>
            }
          </div>
        </div>

        <div class="detail-grid">
          <div class="card">
            <h3 class="card__title mb-4"><i class="ph ph-warehouse"></i> Entrepôts</h3>
            <div class="transfer-flow">
              <div class="flow-item">
                <span class="flow-label">Origine</span>
                <span class="flow-value">{{ transfert()?.entrepotOrigine?.nom }}</span>
              </div>
              <i class="ph ph-arrow-right flow-arrow"></i>
              <div class="flow-item">
                <span class="flow-label">Destination</span>
                <span class="flow-value">{{ transfert()?.entrepotDestination?.nom }}</span>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 class="card__title mb-4"><i class="ph ph-info"></i> Informations</h3>
            <div class="info-list">
              <div class="info-item"><span class="info-item__label">Date</span><span class="info-item__value">{{ transfert()?.dateTransfert | date:'dd/MM/yyyy' }}</span></div>
              <div class="info-item"><span class="info-item__label">Créé par</span><span class="info-item__value">{{ transfert()?.utilisateur?.nomComplet || '-' }}</span></div>
              @if (transfert()?.notes) {
                <div class="info-item"><span class="info-item__label">Notes</span><span class="info-item__value">{{ transfert()?.notes }}</span></div>
              }
            </div>
          </div>

          <div class="card full-width">
            <h3 class="card__title mb-4"><i class="ph ph-package"></i> Produits ({{ transfert()?.lignes?.length || 0 }})</h3>
            <table class="table">
              <thead><tr><th>Produit</th><th class="text-right">Quantité</th></tr></thead>
              <tbody>
                @for (l of transfert()?.lignes; track l.id) {
                  <tr>
                    <td><strong>{{ l.produit?.nom }}</strong><br><small class="text-muted">{{ l.produit?.reference }}</small></td>
                    <td class="text-right"><strong>{{ l.quantite }}</strong></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; margin-bottom: var(--space-6); }
    .page-header__left { display: flex; gap: var(--space-4); }
    .page-header__right { display: flex; gap: var(--space-3); }
    .back-link { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-lg); background: var(--neutral-100); &:hover { background: var(--neutral-200); } }
    .header-badges { display: flex; gap: var(--space-3); margin-bottom: var(--space-2); }
    .ref-code { font-family: var(--font-mono); background: var(--neutral-100); padding: var(--space-1) var(--space-3); border-radius: var(--radius-md); }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); }
    .full-width { grid-column: span 2; }
    .transfer-flow { display: flex; align-items: center; justify-content: center; gap: var(--space-6); padding: var(--space-6); background: var(--neutral-50); border-radius: var(--radius-lg); }
    .flow-item { text-align: center; }
    .flow-label { display: block; font-size: var(--text-sm); color: var(--neutral-500); margin-bottom: var(--space-1); }
    .flow-value { font-weight: 600; font-size: var(--text-lg); }
    .flow-arrow { font-size: 1.5rem; color: var(--primary-500); }
    .info-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .info-item { display: flex; justify-content: space-between; padding-bottom: var(--space-3); border-bottom: 1px solid var(--neutral-100); }
    .info-item__label { color: var(--neutral-500); }
    .info-item__value { font-weight: 500; }
    .loading-container { display: flex; justify-content: center; padding: var(--space-12); }
    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } .full-width { grid-column: span 1; } }
  `]
})
export class TransfertDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private transfertsService = inject(TransfertsStockService);
  private toast = inject(ToastService);

  transfert = signal<TransfertStock | null>(null);
  isLoading = signal(true);

  ngOnInit() { const id = this.route.snapshot.params['id']; if (id) this.loadTransfert(+id); }

  loadTransfert(id: number) {
    this.isLoading.set(true);
    this.transfertsService.getById(id).subscribe({
      next: (t) => { this.transfert.set(t); this.isLoading.set(false); },
      error: () => { this.toast.error('Erreur', 'Transfert introuvable'); this.router.navigate(['/transferts']); }
    });
  }

  getStatutBadge(statut: StatutTransfert): string {
    const badges: Record<string, string> = { EN_ATTENTE: 'badge--warning', EN_TRANSIT: 'badge--info', RECU: 'badge--success', ANNULE: 'badge--error' };
    return badges[statut] || 'badge--secondary';
  }

  getStatutLabel(statut: StatutTransfert): string {
    const labels: Record<string, string> = { EN_ATTENTE: 'En attente', EN_TRANSIT: 'En transit', RECU: 'Reçu', ANNULE: 'Annulé' };
    return labels[statut] || statut;
  }

  envoyer() {
    const t = this.transfert(); if (!t) return;
    this.transfertsService.envoyer(t.id).subscribe({
      next: () => { this.toast.success('Transfert envoyé'); this.loadTransfert(t.id); },
      error: (err: any) => this.toast.error('Erreur', err.error?.message)
    });
  }

  recevoir() {
    const t = this.transfert(); if (!t) return;
    this.transfertsService.recevoir(t.id).subscribe({
      next: () => { this.toast.success('Transfert réceptionné'); this.loadTransfert(t.id); },
      error: (err: any) => this.toast.error('Erreur', err.error?.message)
    });
  }

  annuler() {
    const t = this.transfert(); if (!t || !confirm('Annuler ce transfert ?')) return;
    this.transfertsService.annuler(t.id).subscribe({
      next: () => { this.toast.info('Transfert annulé'); this.loadTransfert(t.id); },
      error: (err: any) => this.toast.error('Erreur', err.error?.message)
    });
  }
}
