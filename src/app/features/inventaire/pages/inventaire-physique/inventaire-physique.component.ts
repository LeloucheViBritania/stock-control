import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventaire-physique',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="card p-6"><h1 class="text-2xl font-bold">Nouvel Inventaire</h1></div>`,
})
export class InventairePhysiqueComponent {}
