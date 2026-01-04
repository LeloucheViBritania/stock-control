/**
 * Routes du module Journal d'Audit (PREMIUM)
 */
import { Routes } from '@angular/router';

export const JOURNAL_AUDIT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/audit-logs-list/audit-logs-list.component').then(m => m.AuditLogsListComponent),
  },
  {
    path: 'stats',
    loadComponent: () => import('./pages/audit-stats/audit-stats.component').then(m => m.AuditStatsComponent),
    data: { title: 'Statistiques audit' },
  },
];
