import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../app/core/auth/auth.guard';
import { PremiumGuard } from '../app/core/auth/premium.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';

const routes: Routes = [
  // Routes Publiques (Login/Register)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  
  // Routes Protégées (Application)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard], // Vérifie si connecté
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      
      // Module Inventaire (Accessible à TOUS, mais le contenu changera)
      {
        path: 'inventory',
        loadChildren: () => import('./features/inventory/inventory.module').then(m => m.InventoryModule)
      },
      
      // Module Logistique (PREMIUM ONLY) - Multi-entrepôts, Transferts
      // Si un utilisateur Gratuit essaie d'accéder ici, il sera redirigé
      {
        path: 'logistics',
        canActivate: [PremiumGuard], 
        loadChildren: () => import('./features/logistics/logistics.module').then(m => m.LogisticsModule)
      },
      
      // Module Achats (Bons de commande = Premium, Fournisseurs = Tous)
      // On gère la finesse à l'intérieur du module ou on sépare
      {
        path: 'purchases',
        loadChildren: () => import('./features/purchases/purchases.module').then(m => m.PurchasesModule)
      }
    ]
  },
  
  // Catch-all
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }