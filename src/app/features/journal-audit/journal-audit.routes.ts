import { Routes } from '@angular/router';

export const JOURNAL_AUDIT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./journal-audit.component').then(m => m.JournalAuditComponent),
    title: 'Journal d\'Audit'
  }
];
