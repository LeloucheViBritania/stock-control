/**
 * Dashboard principal avec KPIs et graphiques
 */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '@services/auth.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Bonjour{{ userName() ? ', ' + userName() : '' }} 👋
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Voici un aperçu de votre activité
          </p>
        </div>
        <div class="flex items-center gap-3">
          <select [(ngModel)]="selectedPeriode" (ngModelChange)="loadStats()" class="form-input" style="width: auto;">
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="trimestre">Ce trimestre</option>
            <option value="annee">Cette année</option>
          </select>
        </div>
      </div>

      @if (isLoading()) {
        <div class="card p-12">
          <app-loading-spinner size="lg" text="Chargement du tableau de bord..." />
        </div>
      } @else {
        <!-- KPIs principaux -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Chiffre d'affaires</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {{ stats()?.chiffreAffaires || 0 | number:'1.0-0' }} €
                </p>
                @if (stats()?.evolutionCA) {
                  <p class="text-sm mt-1" [class.text-success-600]="stats()?.evolutionCA >= 0" [class.text-danger-600]="stats()?.evolutionCA < 0">
                    {{ stats()?.evolutionCA >= 0 ? '+' : '' }}{{ stats()?.evolutionCA | number:'1.1-1' }}%
                    <span class="text-gray-500">vs période précédente</span>
                  </p>
                }
              </div>
              <div class="w-14 h-14 bg-success-100 dark:bg-success-900/30 rounded-xl flex items-center justify-center">
                <svg class="w-7 h-7 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="card p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Commandes en cours</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {{ stats()?.commandesEnCours || 0 }}
                </p>
                <p class="text-sm text-gray-500 mt-1">
                  {{ stats()?.commandesAujourdhui || 0 }} aujourd'hui
                </p>
              </div>
              <div class="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
            </div>
          </div>

          <a routerLink="/produits" [queryParams]="{ stock: 'faible' }" class="card p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Stock faible</p>
                <p class="text-3xl font-bold mt-1" [class.text-warning-600]="stats()?.stockFaible > 0" [class.text-gray-900]="stats()?.stockFaible === 0">
                  {{ stats()?.stockFaible || 0 }}
                </p>
                <p class="text-sm text-gray-500 mt-1">produits à surveiller</p>
              </div>
              <div class="w-14 h-14 bg-warning-100 dark:bg-warning-900/30 rounded-xl flex items-center justify-center">
                <svg class="w-7 h-7 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
            </div>
          </a>

          <div class="card p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Total produits</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {{ stats()?.totalProduits || 0 }}
                </p>
                <p class="text-sm text-gray-500 mt-1">
                  {{ stats()?.valeurStock || 0 | number:'1.0-0' }} € en stock
                </p>
              </div>
              <div class="w-14 h-14 bg-info-100 dark:bg-info-900/30 rounded-xl flex items-center justify-center">
                <svg class="w-7 h-7 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Graphique évolution CA -->
          <div class="lg:col-span-2 card p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-semibold text-gray-900 dark:text-white">Évolution du chiffre d'affaires</h3>
            </div>

            @if (evolutionCA().length > 0) {
              <div class="h-64">
                <div class="flex items-end justify-between h-full gap-2">
                  @for (item of evolutionCA(); track item.date) {
                    <div class="flex-1 flex flex-col items-center">
                      <div 
                        class="w-full bg-primary-500 rounded-t transition-all duration-300 hover:bg-primary-600 cursor-pointer"
                        [style.height.%]="getBarHeight(item.montant)"
                        [title]="(item.montant | number:'1.0-0') + ' €'"
                      ></div>
                      <span class="text-xs text-gray-500 mt-2 truncate w-full text-center">
                        {{ formatDate(item.date) }}
                      </span>
                    </div>
                  }
                </div>
              </div>
            } @else {
              <div class="h-64 flex items-center justify-center text-gray-500">
                Aucune donnée disponible
              </div>
            }
          </div>

          <!-- Alertes stock -->
          <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900 dark:text-white">Alertes stock</h3>
              <a routerLink="/produits" [queryParams]="{ stock: 'critique' }" class="text-sm text-primary-600 hover:underline">
                Voir tout
              </a>
            </div>

            @if (alertes().length === 0) {
              <div class="text-center py-8">
                <div class="w-12 h-12 mx-auto bg-success-100 rounded-full flex items-center justify-center mb-3">
                  <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <p class="text-gray-500">Tout est en ordre !</p>
              </div>
            } @else {
              <div class="space-y-3 max-h-64 overflow-y-auto">
                @for (alerte of alertes(); track alerte.produitId) {
                  <a 
                    [routerLink]="['/produits', alerte.produitId]"
                    class="flex items-center justify-between p-3 rounded-lg transition-colors"
                    [class.bg-danger-50]="alerte.niveau === 'CRITIQUE' || alerte.niveau === 'RUPTURE'"
                    [class.bg-warning-50]="alerte.niveau === 'FAIBLE'"
                  >
                    <div class="flex items-center gap-3">
                      <div 
                        class="w-2 h-2 rounded-full"
                        [class.bg-danger-500]="alerte.niveau === 'CRITIQUE' || alerte.niveau === 'RUPTURE'"
                        [class.bg-warning-500]="alerte.niveau === 'FAIBLE'"
                      ></div>
                      <div>
                        <p class="font-medium text-gray-900 text-sm">{{ alerte.produit?.nom }}</p>
                        <p class="text-xs text-gray-500">{{ alerte.produit?.reference }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p 
                        class="font-bold"
                        [class.text-danger-600]="alerte.niveau === 'CRITIQUE' || alerte.niveau === 'RUPTURE'"
                        [class.text-warning-600]="alerte.niveau === 'FAIBLE'"
                      >
                        {{ alerte.quantiteActuelle }}
                      </p>
                    </div>
                  </a>
                }
              </div>
            }
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Commandes récentes -->
          <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900 dark:text-white">Commandes récentes</h3>
              <a routerLink="/commandes" class="text-sm text-primary-600 hover:underline">Voir tout</a>
            </div>

            @if (commandesRecentes().length === 0) {
              <p class="text-gray-500 text-center py-8">Aucune commande récente</p>
            } @else {
              <div class="space-y-3">
                @for (commande of commandesRecentes(); track commande.id) {
                  <a 
                    [routerLink]="['/commandes', commande.id]"
                    class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">{{ commande.numero }}</p>
                      <p class="text-sm text-gray-500">{{ commande.client?.nom }} • {{ commande.date | date:'dd/MM HH:mm' }}</p>
                    </div>
                    <div class="text-right">
                      <p class="font-semibold text-gray-900 dark:text-white">{{ commande.montant | number:'1.2-2' }} €</p>
                      <span 
                        class="inline-block px-2 py-0.5 rounded text-xs font-medium"
                        [class.bg-warning-100]="commande.statut === 'EN_ATTENTE' || commande.statut === 'CONFIRMEE'"
                        [class.text-warning-700]="commande.statut === 'EN_ATTENTE' || commande.statut === 'CONFIRMEE'"
                        [class.bg-success-100]="commande.statut === 'LIVREE'"
                        [class.text-success-700]="commande.statut === 'LIVREE'"
                      >
                        {{ getStatutLabel(commande.statut) }}
                      </span>
                    </div>
                  </a>
                }
              </div>
            }
          </div>

          <!-- Top produits -->
          <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900 dark:text-white">Top produits vendus</h3>
              <a routerLink="/produits" class="text-sm text-primary-600 hover:underline">Voir tout</a>
            </div>

            @if (topProduits().length === 0) {
              <p class="text-gray-500 text-center py-8">Aucune vente</p>
            } @else {
              <div class="space-y-3">
                @for (produit of topProduits(); track produit.id; let i = $index) {
                  <div class="flex items-center gap-4">
                    <span class="w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold"
                          [class.bg-warning-100]="i === 0"
                          [class.text-warning-700]="i === 0"
                          [class.bg-gray-100]="i > 0"
                          [class.text-gray-600]="i > 0">
                      {{ i + 1 }}
                    </span>
                    <div class="flex-1 min-w-0">
                      <a [routerLink]="['/produits', produit.id]" class="font-medium text-gray-900 dark:text-white hover:text-primary-600 truncate block">
                        {{ produit.nom }}
                      </a>
                      <p class="text-sm text-gray-500">{{ produit.quantiteVendue }} vendus</p>
                    </div>
                    <span class="font-semibold text-gray-900 dark:text-white">
                      {{ produit.chiffreAffaires | number:'1.0-0' }} €
                    </span>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Actions rapides -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a routerLink="/commandes/nouveau" class="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-3">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">Nouvelle commande</span>
            </a>

            <a routerLink="/produits/nouveau" class="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div class="w-12 h-12 bg-success-100 dark:bg-success-900/30 rounded-xl flex items-center justify-center mb-3">
                <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">Ajouter produit</span>
            </a>

            <a routerLink="/mouvements-stock" class="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div class="w-12 h-12 bg-info-100 dark:bg-info-900/30 rounded-xl flex items-center justify-center mb-3">
                <svg class="w-6 h-6 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">Mouvement stock</span>
            </a>

            <a routerLink="/clients/nouveau" class="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div class="w-12 h-12 bg-warning-100 dark:bg-warning-900/30 rounded-xl flex items-center justify-center mb-3">
                <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">Nouveau client</span>
            </a>
          </div>
        </div>

        <!-- Section PREMIUM -->
        @if (isPremium()) {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Widget Entrepôts -->
            <div class="card p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-gray-900 dark:text-white">Mes entrepôts</h3>
                  <span class="badge-premium text-xs">Premium</span>
                </div>
                <a routerLink="/entrepots" class="text-sm text-primary-600 hover:underline">Gérer</a>
              </div>
              <div class="space-y-3">
                @for (entrepot of entrepotsStats(); track entrepot.id) {
                  <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div class="flex items-center justify-between mb-2">
                      <span class="font-medium text-gray-900 dark:text-white">{{ entrepot.nom }}</span>
                      <span class="text-sm text-gray-500">{{ entrepot.tauxRemplissage | number:'1.0-0' }}%</span>
                    </div>
                    <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div 
                        class="h-full rounded-full transition-all"
                        [class.bg-success-500]="entrepot.tauxRemplissage < 70"
                        [class.bg-warning-500]="entrepot.tauxRemplissage >= 70 && entrepot.tauxRemplissage < 90"
                        [class.bg-danger-500]="entrepot.tauxRemplissage >= 90"
                        [style.width.%]="entrepot.tauxRemplissage"
                      ></div>
                    </div>
                    <div class="flex justify-between mt-1 text-xs text-gray-500">
                      <span>{{ entrepot.stockActuel | number }} produits</span>
                      <span>{{ entrepot.valeur | number:'1.0-0' }} €</span>
                    </div>
                  </div>
                } @empty {
                  <a routerLink="/entrepots/nouveau" class="block p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-primary-500 transition-colors">
                    <svg class="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    <span class="text-sm text-gray-500">Ajouter un entrepôt</span>
                  </a>
                }
              </div>
            </div>

            <!-- Widget Prévisions IA -->
            <div class="card p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-gray-900 dark:text-white">Prévisions IA</h3>
                  <span class="badge-premium text-xs">Premium</span>
                </div>
                <a routerLink="/previsions" class="text-sm text-primary-600 hover:underline">Voir plus</a>
              </div>
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="p-3 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg">
                  <p class="text-xs text-primary-600 dark:text-primary-400">Tendance ventes</p>
                  <div class="flex items-center gap-2 mt-1">
                    <svg class="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                    </svg>
                    <span class="text-lg font-bold text-gray-900 dark:text-white">+15%</span>
                  </div>
                </div>
                <div class="p-3 bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 rounded-lg">
                  <p class="text-xs text-warning-600 dark:text-warning-400">Alertes stock</p>
                  <div class="flex items-center gap-2 mt-1">
                    <svg class="w-5 h-5 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    <span class="text-lg font-bold text-gray-900 dark:text-white">{{ previsionAlertes() }}</span>
                  </div>
                </div>
              </div>
              <div class="space-y-2">
                <p class="text-sm text-gray-600 dark:text-gray-400">Recommandations urgentes :</p>
                @for (reco of recommandationsUrgentes(); track reco.produit) {
                  <div class="flex items-center justify-between p-2 bg-danger-50 dark:bg-danger-900/20 rounded text-sm">
                    <span class="text-danger-700 dark:text-danger-400">{{ reco.produit }}</span>
                    <span class="font-medium text-danger-600">Commander {{ reco.quantite }} u.</span>
                  </div>
                } @empty {
                  <p class="text-sm text-success-600 py-2">✓ Aucune action urgente</p>
                }
              </div>
            </div>
          </div>

          <!-- Transferts en cours -->
          <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <h3 class="font-semibold text-gray-900 dark:text-white">Transferts en cours</h3>
                <span class="badge-premium text-xs">Premium</span>
              </div>
              <a routerLink="/transferts-stock" class="text-sm text-primary-600 hover:underline">Voir tous</a>
            </div>
            @if (transfertsEnCours().length > 0) {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="text-left text-sm text-gray-500">
                      <th class="pb-3 font-medium">N° Transfert</th>
                      <th class="pb-3 font-medium">De → Vers</th>
                      <th class="pb-3 font-medium text-center">Articles</th>
                      <th class="pb-3 font-medium text-center">Statut</th>
                      <th class="pb-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                    @for (t of transfertsEnCours(); track t.id) {
                      <tr>
                        <td class="py-3 font-medium text-gray-900 dark:text-white">{{ t.numero }}</td>
                        <td class="py-3 text-gray-600">{{ t.source }} → {{ t.destination }}</td>
                        <td class="py-3 text-center">{{ t.articles }}</td>
                        <td class="py-3 text-center">
                          <span class="px-2 py-1 text-xs font-medium rounded-full"
                            [class.bg-warning-100]="t.statut === 'EN_ATTENTE'"
                            [class.text-warning-700]="t.statut === 'EN_ATTENTE'"
                            [class.bg-primary-100]="t.statut === 'EN_COURS'"
                            [class.text-primary-700]="t.statut === 'EN_COURS'"
                          >
                            {{ t.statut === 'EN_ATTENTE' ? 'En attente' : 'En transit' }}
                          </span>
                        </td>
                        <td class="py-3 text-right">
                          <a [routerLink]="['/transferts-stock', t.id]" class="text-primary-600 hover:underline text-sm">Voir</a>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="text-center py-6 text-gray-500">
                <p>Aucun transfert en cours</p>
                <a routerLink="/transferts-stock/nouveau" class="text-primary-600 hover:underline text-sm">Créer un transfert</a>
              </div>
            }
          </div>
        }

        <!-- Teaser Premium -->
        @if (!isPremium()) {
          <div class="card p-6 bg-gradient-to-r from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 border-warning-200 dark:border-warning-800">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 bg-gradient-to-br from-warning-400 to-warning-600 rounded-xl flex items-center justify-center">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">Passez à Premium</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Multi-entrepôts, rapports avancés, export Excel, et plus encore !
                  </p>
                </div>
              </div>
              <a routerLink="/abonnement" class="btn bg-gradient-to-r from-warning-500 to-warning-600 text-white hover:from-warning-600 hover:to-warning-700 whitespace-nowrap">
                Découvrir Premium
              </a>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class DashboardHomeComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);

  stats = signal<any>(null);
  evolutionCA = signal<any[]>([]);
  alertes = signal<any[]>([]);
  commandesRecentes = signal<any[]>([]);
  topProduits = signal<any[]>([]);
  isLoading = signal(true);
  selectedPeriode: 'semaine' | 'mois' | 'trimestre' | 'annee' = 'mois';

  // Signaux PREMIUM
  entrepotsStats = signal<any[]>([]);
  transfertsEnCours = signal<any[]>([]);
  previsionAlertes = signal(0);
  recommandationsUrgentes = signal<any[]>([]);

  isPremium = computed(() => this.authService.isPremium());
  userName = computed(() => this.authService.user()?.prenom);

  ngOnInit(): void {
    this.loadStats();
    if (this.isPremium()) {
      this.loadPremiumData();
    }
  }

  loadPremiumData(): void {
    // Mock data pour entrepôts
    this.entrepotsStats.set([
      { id: '1', nom: 'Paris Central', tauxRemplissage: 78, stockActuel: 1250, valeur: 185000 },
      { id: '2', nom: 'Lyon Sud', tauxRemplissage: 45, stockActuel: 680, valeur: 95000 },
      { id: '3', nom: 'Marseille', tauxRemplissage: 92, stockActuel: 890, valeur: 125000 },
    ]);

    // Mock data pour transferts en cours
    this.transfertsEnCours.set([
      { id: '1', numero: 'TR-2024-042', source: 'Paris', destination: 'Lyon', articles: 25, statut: 'EN_COURS' },
      { id: '2', numero: 'TR-2024-043', source: 'Lyon', destination: 'Marseille', articles: 12, statut: 'EN_ATTENTE' },
    ]);

    // Mock data pour prévisions
    this.previsionAlertes.set(5);
    this.recommandationsUrgentes.set([
      { produit: 'Écran LCD 24"', quantite: 50 },
      { produit: 'Clavier sans fil', quantite: 100 },
    ]);
  }

  loadStats(): void {
    this.isLoading.set(true);

    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.isLoading.set(false);
      },
      error: () => {
        this.stats.set({
          chiffreAffaires: 45230,
          evolutionCA: 12.5,
          commandesEnCours: 23,
          commandesAujourdhui: 8,
          stockFaible: 12,
          totalProduits: 245,
          valeurStock: 125000,
        });
        this.isLoading.set(false);
      },
    });

    this.dashboardService.getChiffreAffairesEvolution(this.selectedPeriode).subscribe({
      next: (data) => this.evolutionCA.set(data),
      error: () => {
        const now = new Date();
        this.evolutionCA.set(
          Array.from({ length: 7 }, (_, i) => ({
            date: new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000),
            montant: Math.floor(Math.random() * 5000) + 2000,
          }))
        );
      },
    });

    this.dashboardService.getAlertesStock().subscribe({
      next: (alertes) => this.alertes.set(alertes.slice(0, 5)),
      error: () => this.alertes.set([]),
    });

    this.dashboardService.getCommandesRecentes(5).subscribe({
      next: (commandes) => this.commandesRecentes.set(commandes),
      error: () => this.commandesRecentes.set([]),
    });

    this.dashboardService.getTopProduits(5, this.selectedPeriode).subscribe({
      next: (produits) => this.topProduits.set(produits),
      error: () => this.topProduits.set([]),
    });
  }

  getBarHeight(value: number): number {
    const max = Math.max(...this.evolutionCA().map(item => item.montant), 1);
    return (value / max) * 100;
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'CONFIRMEE': 'Confirmée',
      'EN_PREPARATION': 'En préparation',
      'EXPEDIEE': 'Expédiée',
      'LIVREE': 'Livrée',
      'ANNULEE': 'Annulée',
    };
    return labels[statut] || statut;
  }
}
