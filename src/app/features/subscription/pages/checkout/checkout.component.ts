/**
 * Page de checkout pour l'abonnement Premium
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '@services/notification.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center gap-4 mb-8">
        <a routerLink="/abonnement" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Finaliser votre abonnement</h1>
      </div>

      <div class="grid gap-8 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-6">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="card p-6 mb-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations de facturation</h2>
              <div class="grid gap-4 md:grid-cols-2">
                <div class="md:col-span-2">
                  <label class="form-label required">Nom de l'entreprise</label>
                  <input type="text" formControlName="company" class="form-input" placeholder="Ma Société SARL" />
                </div>
                <div>
                  <label class="form-label required">Prénom</label>
                  <input type="text" formControlName="firstName" class="form-input" />
                </div>
                <div>
                  <label class="form-label required">Nom</label>
                  <input type="text" formControlName="lastName" class="form-input" />
                </div>
                <div class="md:col-span-2">
                  <label class="form-label required">Email</label>
                  <input type="email" formControlName="email" class="form-input" />
                </div>
                <div class="md:col-span-2">
                  <label class="form-label required">Adresse</label>
                  <input type="text" formControlName="address" class="form-input" />
                </div>
                <div>
                  <label class="form-label required">Code postal</label>
                  <input type="text" formControlName="postalCode" class="form-input" />
                </div>
                <div>
                  <label class="form-label required">Ville</label>
                  <input type="text" formControlName="city" class="form-input" />
                </div>
              </div>
            </div>

            <div class="card p-6 mb-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Méthode de paiement</h2>
              <div class="space-y-4">
                <div>
                  <label class="form-label required">Numéro de carte</label>
                  <input type="text" formControlName="cardNumber" class="form-input" placeholder="4242 4242 4242 4242" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="form-label required">Expiration</label>
                    <input type="text" formControlName="cardExpiry" class="form-input" placeholder="MM/AA" />
                  </div>
                  <div>
                    <label class="form-label required">CVC</label>
                    <input type="text" formControlName="cardCvc" class="form-input" placeholder="123" />
                  </div>
                </div>
              </div>
              <div class="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <svg class="w-4 h-4 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <span>Paiement sécurisé par Stripe</span>
              </div>
            </div>

            <div class="card p-6 mb-6">
              <label class="flex items-start gap-3">
                <input type="checkbox" formControlName="acceptTerms" class="mt-1 rounded" />
                <span class="text-sm text-gray-600">J'accepte les CGV et la Politique de Confidentialité.</span>
              </label>
            </div>

            <button type="submit" class="btn bg-gradient-to-r from-warning-500 to-warning-600 text-white w-full py-4 text-lg" [disabled]="isProcessing() || form.invalid">
              @if (isProcessing()) {
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 inline" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Traitement...
              } @else {
                Payer {{ billing() === 'annual' ? '276,00' : '29,00' }} €
              }
            </button>
          </form>
        </div>

        <div class="lg:col-span-1">
          <div class="card p-6 sticky top-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Récapitulatif</h2>
            <div class="space-y-3 pb-4 border-b">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">Plan Premium</p>
                  <p class="text-sm text-gray-500">{{ billing() === 'annual' ? 'Annuel' : 'Mensuel' }}</p>
                </div>
                <span class="badge-premium">Premium</span>
              </div>
            </div>
            <div class="flex justify-between py-4 text-lg font-bold">
              <span>Total</span>
              <span class="text-primary-600">{{ billing() === 'annual' ? '331,20' : '34,80' }} € TTC</span>
            </div>
            <div class="mt-4 p-3 bg-success-50 rounded-lg">
              <p class="text-sm text-success-700 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                14 jours d'essai gratuit
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);

  form!: FormGroup;
  billing = signal<'monthly' | 'annual'>('monthly');
  isProcessing = signal(false);

  ngOnInit(): void {
    const billingParam = this.route.snapshot.queryParams['billing'];
    if (billingParam === 'annual') this.billing.set('annual');

    this.form = this.fb.group({
      company: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      postalCode: ['', Validators.required],
      city: ['', Validators.required],
      cardNumber: ['', Validators.required],
      cardExpiry: ['', Validators.required],
      cardCvc: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isProcessing.set(true);
    setTimeout(() => {
      this.isProcessing.set(false);
      this.notificationService.success('Bienvenue dans Premium!');
      this.router.navigate(['/abonnement/statut'], { queryParams: { success: true } });
    }, 2000);
  }
}
