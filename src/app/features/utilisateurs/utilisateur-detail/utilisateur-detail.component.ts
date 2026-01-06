import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UtilisateursService } from '@core/services/utilisateurs.service';
import { ToastService } from '@core/services/notifications.service';
import { Utilisateur, Role, TierAbonnement } from '@core/models';

@Component({
  selector: 'app-utilisateur-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <div class="detail-page" style="max-width: 800px;">
      @if (isLoading()) {
        <div class="card"><div class="loading-container"><span class="spinner spinner--lg"></span></div></div>
      } @else if (utilisateur()) {
        <div class="page-header">
          <div class="page-header__left">
            <a routerLink="/utilisateurs" class="back-link"><i class="ph ph-arrow-left"></i></a>
            <div class="user-header">
              <div class="user-avatar-lg">{{ getInitials() }}</div>
              <div>
                <h1>{{ utilisateur()?.nomComplet || utilisateur()?.nomUtilisateur }}</h1>
                <p class="text-muted">&#64;{{ utilisateur()?.nomUtilisateur }}</p>
              </div>
            </div>
          </div>
          <div class="page-header__right">
            <a [routerLink]="['/utilisateurs', utilisateur()?.id, 'edit']" class="btn btn--secondary"><i class="ph ph-pencil"></i> Modifier</a>
          </div>
        </div>

        <div class="badges-row mb-6">
          <span class="badge badge--lg" [class]="getRoleBadge(utilisateur()!.role)">{{ utilisateur()?.role }}</span>
          <span class="badge badge--lg" [class]="utilisateur()?.tierAbonnement === 'PREMIUM' ? 'badge--primary' : 'badge--secondary'">
            @if (utilisateur()?.tierAbonnement === 'PREMIUM') { <i class="ph ph-crown"></i> }
            {{ utilisateur()?.tierAbonnement }}
          </span>
          <span class="badge badge--lg" [class]="utilisateur()?.estActif ? 'badge--success' : 'badge--error'">{{ utilisateur()?.estActif ? 'Actif' : 'Inactif' }}</span>
        </div>

        <div class="card">
          <h3 class="card__title mb-4"><i class="ph ph-identification-card"></i> Informations</h3>
          <div class="info-list">
            <div class="info-item"><span class="info-item__label">Email</span><span class="info-item__value">{{ utilisateur()?.email }}</span></div>
            <div class="info-item"><span class="info-item__label">Nom d'utilisateur</span><span class="info-item__value">{{ utilisateur()?.nomUtilisateur }}</span></div>
            <div class="info-item"><span class="info-item__label">Nom complet</span><span class="info-item__value">{{ utilisateur()?.nomComplet || '-' }}</span></div>
            <div class="info-item"><span class="info-item__label">Date de création</span><span class="info-item__value">{{ utilisateur()?.dateCreation | date:'dd/MM/yyyy à HH:mm' }}</span></div>
            @if (utilisateur()?.dateExpiration) {
              <div class="info-item"><span class="info-item__label">Expiration Premium</span><span class="info-item__value">{{ utilisateur()?.dateExpiration | date:'dd/MM/yyyy' }}</span></div>
            }
          </div>
        </div>

        <div class="actions-card card mt-6">
          <h3 class="card__title mb-4"><i class="ph ph-gear"></i> Actions</h3>
          <div class="actions-grid">
            @if (utilisateur()?.estActif) {
              <button class="btn btn--warning" (click)="toggleActif()"><i class="ph ph-pause"></i> Désactiver le compte</button>
            } @else {
              <button class="btn btn--success" (click)="toggleActif()"><i class="ph ph-play"></i> Activer le compte</button>
            }
            @if (utilisateur()?.tierAbonnement === 'GRATUIT') {
              <button class="btn btn--primary" (click)="togglePremium()"><i class="ph ph-crown"></i> Activer Premium</button>
            } @else {
              <button class="btn btn--secondary" (click)="togglePremium()"><i class="ph ph-crown"></i> Désactiver Premium</button>
            }
            <button class="btn btn--secondary" (click)="resetPassword()"><i class="ph ph-key"></i> Réinitialiser mot de passe</button>
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
    .user-header { display: flex; align-items: center; gap: var(--space-4); }
    .user-avatar-lg { width: 64px; height: 64px; border-radius: var(--radius-full); background: linear-gradient(135deg, var(--primary-500), var(--primary-600)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: var(--text-xl); }
    .badges-row { display: flex; gap: var(--space-3); }
    .badge--lg { padding: var(--space-2) var(--space-4); font-size: var(--text-sm); }
    .info-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .info-item { display: flex; justify-content: space-between; padding-bottom: var(--space-3); border-bottom: 1px solid var(--neutral-100); }
    .info-item__label { color: var(--neutral-500); }
    .info-item__value { font-weight: 500; }
    .actions-grid { display: flex; flex-wrap: wrap; gap: var(--space-3); }
    .loading-container { display: flex; justify-content: center; padding: var(--space-12); }
  `]
})
export class UtilisateurDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private utilisateursService = inject(UtilisateursService);
  private toast = inject(ToastService);

  utilisateur = signal<Utilisateur | null>(null);
  isLoading = signal(true);

  ngOnInit() { const id = this.route.snapshot.params['id']; if (id) this.loadUtilisateur(+id); }

  loadUtilisateur(id: number) {
    this.isLoading.set(true);
    this.utilisateursService.getById(id).subscribe({
      next: (u) => { this.utilisateur.set(u); this.isLoading.set(false); },
      error: () => { this.toast.error('Erreur', 'Utilisateur introuvable'); this.router.navigate(['/utilisateurs']); }
    });
  }

  getInitials(): string {
    const u = this.utilisateur();
    const name = u?.nomComplet || u?.nomUtilisateur || '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getRoleBadge(role: Role): string {
    return { ADMIN: 'badge--error', GESTIONNAIRE: 'badge--info', EMPLOYE: 'badge--secondary' }[role] || 'badge--secondary';
  }

  toggleActif() {
    const u = this.utilisateur(); if (!u) return;
    this.utilisateursService.update(u.id, { estActif: !u.estActif }).subscribe({
      next: () => { this.toast.success(u.estActif ? 'Compte désactivé' : 'Compte activé'); this.loadUtilisateur(u.id); },
      error: (err) => this.toast.error('Erreur', err.error?.message)
    });
  }

  togglePremium() {
    const u = this.utilisateur(); if (!u) return;
    const newTier = u.tierAbonnement === TierAbonnement.PREMIUM ? TierAbonnement.GRATUIT : TierAbonnement.PREMIUM;
    this.utilisateursService.updateTierAbonnement(u.id, newTier).subscribe({
      next: () => { this.toast.success(newTier === TierAbonnement.PREMIUM ? 'Premium activé' : 'Premium désactivé'); this.loadUtilisateur(u.id); },
      error: (err) => this.toast.error('Erreur', err.error?.message)
    });
  }

  resetPassword() {
    const u = this.utilisateur(); if (!u) return;
    this.toast.info('Fonctionnalité', 'Un email de réinitialisation sera envoyé à ' + u.email);
  }
}
