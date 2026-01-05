import { Routes } from '@angular/router';
import { premiumGuard } from '@guards/premium.guard';
import { roleGuard } from '@guards/role.guard';

export const JOURNAL_AUDIT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [premiumGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', loadComponent: () => import('./pages/audit-logs-list/audit-logs-list.component').then(m => m.AuditLogsListComponent) },
      { path: 'stats', loadComponent: () => import('./pages/audit-stats/audit-stats.component').then(m => m.AuditStatsComponent) },
      { path: ':id', loadComponent: () => import('./pages/audit-detail/audit-detail.component').then(m => m.AuditDetailComponent) },
    ]
  }
];
