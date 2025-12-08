import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';

// Composants du module Achats
import { PurchaseOrderCreateComponent } from './pages/purchase-order-create/purchase-order-create.component';
// Un composant pour la gestion des Fournisseurs est également nécessaire

const routes: Routes = [
  { path: '', redirectTo: 'orders', pathMatch: 'full' },
  // Routes Bons de Commande
  { path: 'orders/new', component: PurchaseOrderCreateComponent },
  // Routes Fournisseurs (à créer)
  // { path: 'suppliers', component: SupplierListComponent },
];

@NgModule({
  declarations: [
    PurchaseOrderCreateComponent
    // Déclarer ici les composants Fournisseurs si créés
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class PurchasesModule { }