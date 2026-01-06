import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientsService } from '@core/services/clients.service';
import { ToastService } from '@core/services/notifications.service';
import { Client } from '@core/models';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="detail-page" style="max-width: 1000px;">
      @if (isLoading()) {
        <div class="card"><div class="loading-container"><span class="spinner spinner--lg"></span></div></div>
      } @else if (client()) {
        <div class="page-header">
          <div class="page-header__left">
            <a routerLink="/clients" class="back-link"><i class="ph ph-arrow-left"></i></a>
            <div>
              <div class="header-badges">
                <span class="badge" [class]="getSegmentBadge(client()!.segment)">{{ client()?.segment }}</span>
                <span class="badge" [class]="getStatutBadge(client()!.statut)">{{ client()?.statut }}</span>
              </div>
              <h1>{{ client()?.nom }}</h1>
              @if (client()?.entreprise) { <p class="text-muted">{{ client()?.entreprise }}</p> }
            </div>
          </div>
          <div class="page-header__right">
            <a [routerLink]="['/clients', client()?.id, 'edit']" class="btn btn--secondary"><i class="ph ph-pencil"></i> Modifier</a>
            <a routerLink="/commandes/new" [queryParams]="{clientId: client()?.id}" class="btn btn--primary"><i class="ph ph-plus"></i> Nouvelle commande</a>
          </div>
        </div>

        <div class="detail-grid">
          <div class="card">
            <h3 class="card__title mb-4"><i class="ph ph-identification-card"></i> Coordonnées</h3>
            <div class="info-list">
              <div class="info-item"><span class="info-item__label">Email</span><span class="info-item__value">{{ client()?.email || '-' }}</span></div>
              <div class="info-item"><span class="info-item__label">Téléphone</span><span class="info-item__value">{{ client()?.telephone || '-' }}</span></div>
              <div class="info-item"><span class="info-item__label">Adresse</span><span class="info-item__value">{{ client()?.adresse || '-' }}</span></div>
              <div class="info-item"><span class="info-item__label">Client depuis</span><span class="info-item__value">{{ client()?.dateCreation | date:'dd/MM/yyyy' }}</span></div>
            </div>
          </div>

          <div class="card">
            <h3 class="card__title mb-4"><i class="ph ph-chart-bar"></i> Statistiques</h3>
            <div class="stats-grid">
              <div class="stat"><span class="stat-value">{{ client()?._count?.commandes || 0 }}</span><span class="stat-label">Commandes</span></div>
              <div class="stat"><span class="stat-value">{{ client()?.chiffreAffaires | currency:'XOF':'symbol':'1.0-0' }}</span><span class="stat-label">CA Total</span></div>
              <div class="stat"><span class="stat-value">{{ client()?.encours | currency:'XOF':'symbol':'1.0-0' }}</span><span class="stat-label">Encours</span></div>
              <div class="stat"><span class="stat-value">{{ client()?.limiteCredit | currency:'XOF':'symbol':'1.0-0' }}</span><span class="stat-label">Limite crédit</span></div>
            </div>
          </div>

          <div class="card full-width">
            <div class="card__header">
              <h3 class="card__title"><i class="ph ph-shopping-cart"></i> Dernières commandes</h3>
              <a [routerLink]="['/commandes']" [queryParams]="{clientId: client()?.id}" class="btn btn--ghost btn--sm">Voir tout</a>
            </div>
            @if (!client()?.commandes?.length) {
              <div class="empty-mini"><p>Aucune commande</p></div>
            } @else {
              <table class="table">
                <thead><tr><th>N°</th><th>Date</th><th class="text-right">Montant</th><th>Statut</th></tr></thead>
                <tbody>
                  @for (cmd of client()?.commandes?.slice(0, 5); track cmd.id) {
                    <tr>
                      <td><a [routerLink]="['/commandes', cmd.id]">{{ cmd.numeroCommande }}</a></td>
                      <td>{{ cmd.dateCommande | date:'dd/MM/yyyy' }}</td>
                      <td class="text-right">{{ cmd.montantTotal | currency:'XOF':'symbol':'1.0-0' }}</td>
                      <td><span class="badge badge--sm">{{ cmd.statut }}</span></td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; margin-bottom: var(--space-6); gap: var(--space-4); }
    .page-header__left { display: flex; gap: var(--space-4); }
    .page-header__right { display: flex; gap: var(--space-3); }
    .back-link { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-lg); background: var(--neutral-100); &:hover { background: var(--neutral-200); } }
    .header-badges { display: flex; gap: var(--space-2); margin-bottom: var(--space-2); }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); }
    .full-width { grid-column: span 2; }
    .info-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .info-item { display: flex; justify-content: space-between; padding-bottom: var(--space-3); border-bottom: 1px solid var(--neutral-100); }
    .info-item__label { color: var(--neutral-500); }
    .info-item__value { font-weight: 500; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); }
    .stat { text-align: center; padding: var(--space-4); background: var(--neutral-50); border-radius: var(--radius-lg); }
    .stat-value { display: block; font-family: var(--font-display); font-size: var(--text-xl); font-weight: 600; }
    .stat-label { font-size: var(--text-sm); color: var(--neutral-500); }
    .loading-container { display: flex; justify-content: center; padding: var(--space-12); }
    .empty-mini { padding: var(--space-6); text-align: center; color: var(--neutral-500); }
    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } .full-width { grid-column: span 1; } }
  `]
})
export class ClientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientsService = inject(ClientsService);
  private toast = inject(ToastService);

  client = signal<Client | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) this.loadClient(+id);
  }

  loadClient(id: number) {
    this.isLoading.set(true);
    this.clientsService.getById(id).subscribe({
      next: (c) => { this.client.set(c); this.isLoading.set(false); },
      error: () => { this.toast.error('Erreur', 'Client introuvable'); this.router.navigate(['/clients']); }
    });
  }

  getStatutBadge(statut: string): string { return { ACTIF: 'badge--success', INACTIF: 'badge--secondary', BLOQUE: 'badge--error' }[statut] || 'badge--secondary'; }
  getSegmentBadge(segment: string): string { return { VIP: 'badge--primary', ENTREPRISE: 'badge--info', PROFESSIONNEL: 'badge--warning', PARTICULIER: 'badge--secondary' }[segment] || 'badge--secondary'; }
}
