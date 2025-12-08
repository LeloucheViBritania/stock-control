import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';

// Composants du module Logistique
import { WarehouseListComponent } from './pages/warehouse-list/warehouse-list.component';
import { WarehouseFormComponent } from './pages/warehouse-form/warehouse-form.component';
import { TransferCreateComponent } from './pages/transfer-create/transfer-create.component';

const routes: Routes = [
  { path: '', redirectTo: 'warehouses', pathMatch: 'full' },
  // Routes Entrepôts
  { path: 'warehouses', component: WarehouseListComponent },
  { path: 'warehouses/new', component: WarehouseFormComponent },
  { path: 'warehouses/edit/:id', component: WarehouseFormComponent },
  // Routes Transferts
  { path: 'transfers', component: TransferCreateComponent }, // Utiliser la création comme liste par défaut
  // { path: 'transfers/list', component: TransferListComponent } // Si créé plus tard
];

@NgModule({
  declarations: [
    WarehouseListComponent,
    WarehouseFormComponent,
    TransferCreateComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class LogisticsModule { }