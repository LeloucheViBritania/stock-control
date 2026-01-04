import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audit-stats',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="card p-6"><h1 class="text-2xl font-bold">Statistiques Audit</h1></div>`,
})
export class AuditStatsComponent {}
