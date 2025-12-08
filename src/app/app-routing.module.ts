import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../app/core/auth/auth.guard';
import { PremiumGuard } from '../app/core/auth/premium.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import {LandingPageComponent} from './features/public/landing-page/landing-page.component'

const routes: Routes = [
  // 1. Route par défaut = Landing Page (Publique)
  {
    path: '',
    component: LandingPageComponent, // <--- Ajoutez ce composant ici
    pathMatch: 'full'
  },

  // 2. Routes d'Auth (Login/Register)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  // 3. Routes de l'Application (Protégées par AuthGuard)
  {
    path: '', // On garde le path vide ici pour les enfants, mais protégé par le Guard
    component: MainLayoutComponent,
    canActivate: [AuthGuard], // <--- Bloque l'accès si pas connecté
    children: [
      { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule) },
      { path: 'inventory', loadChildren: () => import('./features/inventory/inventory.module').then(m => m.InventoryModule) },
      { path: 'sales', loadChildren: () => import('./features/sales/sales.module').then(m => m.SalesModule) },
      { 
        path: 'logistics', 
        canActivate: [PremiumGuard],
        loadChildren: () => import('./features/logistics/logistics.module').then(m => m.LogisticsModule) 
      },
      { 
        path: 'purchases', 
        loadChildren: () => import('./features/purchases/purchases.module').then(m => m.PurchasesModule) 
      }
    ]
  },

  // Catch-all
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }