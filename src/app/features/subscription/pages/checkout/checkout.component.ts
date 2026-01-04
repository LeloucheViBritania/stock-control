import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="card p-6 max-w-lg mx-auto"><h1 class="text-2xl font-bold">Paiement</h1><p class="text-gray-500 mt-2">Intégration Stripe - En cours</p></div>`,
})
export class CheckoutComponent {}
