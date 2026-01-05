import { Routes } from '@angular/router';
import { premiumGuard } from '@guards/premium.guard';
import { roleGuard } from '@guards/role.guard';
import { Role } from '@enums/role.enum';

export const TABLEAU_BORD_EXECUTIF_ROUTES: Routes = [
  {
    path: '',
    canActivate: [premiumGuard, roleGuard],
    data: { roles: [Role.ADMIN, Role.GESTIONNAIRE] },
    children: [
      { path: '', loadComponent: () => import('./pages/kpis-direction/kpis-direction.component').then(m => m.KpisDirectionComponent) },
    ]
  }
];
