import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module'; // Important pour les directives (*appIfPremium)

import { DashboardComponent } from './dashboard.component';
import { DashboardHomeComponent } from './pages/dashboard-home/dashboard-home.component';

// Configuration de la route par défaut du module
const routes: Routes = [
  {
    path: '',
    component: DashboardHomeComponent // Affiche la page "Home" quand on arrive sur /dashboard
  }
];

@NgModule({
  declarations: [
   // DashboardComponent,
    DashboardHomeComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class DashboardModule { }