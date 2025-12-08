import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { InventoryRoutingModule } from './inventory-routing.module'; // Ce fichier existe déjà

// Composants du module Inventaire
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductFormComponent } from './pages/product-form/product-form.component';

@NgModule({
  declarations: [
    ProductListComponent,
    ProductFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule, // Importe ReactiveFormsModule, IfPremiumDirective, etc.
    InventoryRoutingModule
  ]
})
export class InventoryModule { }