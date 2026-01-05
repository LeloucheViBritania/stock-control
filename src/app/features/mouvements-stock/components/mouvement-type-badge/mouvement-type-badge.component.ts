import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TypeMouvement = 
  | 'ENTREE' 
  | 'SORTIE' 
  | 'AJUSTEMENT_POSITIF' 
  | 'AJUSTEMENT_NEGATIF' 
  | 'TRANSFERT_ENTRANT' 
  | 'TRANSFERT_SORTANT'
  | 'INVENTAIRE'
  | 'RETOUR';

@Component({
  selector: 'app-mouvement-type-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full"
      [class.bg-green-100]="isPositive"
      [class.text-green-800]="isPositive"
      [class.bg-red-100]="isNegative"
      [class.text-red-800]="isNegative"
      [class.bg-blue-100]="isNeutral"
      [class.text-blue-800]="isNeutral"
    >
      @if (showIcon) {
        @if (isPositive) {
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/>
          </svg>
        } @else if (isNegative) {
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/>
          </svg>
        } @else {
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
          </svg>
        }
      }
      {{ label }}
    </span>
  `,
})
export class MouvementTypeBadgeComponent {
  @Input() type: TypeMouvement = 'ENTREE';
  @Input() showIcon = true;

  get isPositive(): boolean {
    return ['ENTREE', 'AJUSTEMENT_POSITIF', 'TRANSFERT_ENTRANT', 'RETOUR'].includes(this.type);
  }

  get isNegative(): boolean {
    return ['SORTIE', 'AJUSTEMENT_NEGATIF', 'TRANSFERT_SORTANT'].includes(this.type);
  }

  get isNeutral(): boolean {
    return ['INVENTAIRE'].includes(this.type);
  }

  get label(): string {
    const labels: Record<TypeMouvement, string> = {
      ENTREE: 'Entrée',
      SORTIE: 'Sortie',
      AJUSTEMENT_POSITIF: 'Ajustement +',
      AJUSTEMENT_NEGATIF: 'Ajustement -',
      TRANSFERT_ENTRANT: 'Transfert entrant',
      TRANSFERT_SORTANT: 'Transfert sortant',
      INVENTAIRE: 'Inventaire',
      RETOUR: 'Retour',
    };
    return labels[this.type] || this.type;
  }
}
