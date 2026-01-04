/**
 * Layout pour les pages d'authentification
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen flex">
      <!-- Left Panel - Branding -->
      <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 flex-col justify-between">
        <div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <span class="text-2xl font-bold text-white">GStock</span>
          </div>
        </div>
        
        <div class="text-white">
          <h1 class="text-4xl font-bold mb-4">
            Gérez votre stock<br>en toute simplicité
          </h1>
          <p class="text-primary-100 text-lg">
            Une solution complète pour la gestion de vos produits, commandes et inventaires.
          </p>
        </div>
        
        <div class="text-primary-200 text-sm">
          © {{ currentYear }} GStock. Tous droits réservés.
        </div>
      </div>
      
      <!-- Right Panel - Form -->
      <div class="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div class="w-full max-w-md">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class AuthLayoutComponent {
  currentYear = new Date().getFullYear();
}
