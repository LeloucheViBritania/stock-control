import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CommandeStatut = 
  | 'BROUILLON' 
  | 'EN_ATTENTE' 
  | 'CONFIRMEE' 
  | 'EN_PREPARATION' 
  | 'EXPEDIEE' 
  | 'LIVREE' 
  | 'ANNULEE' 
  | 'REMBOURSEE';

@Component({
  selector: 'app-commande-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full"
      [class.bg-gray-100]="statut === 'BROUILLON'"
      [class.text-gray-800]="statut === 'BROUILLON'"
      [class.bg-yellow-100]="statut === 'EN_ATTENTE'"
      [class.text-yellow-800]="statut === 'EN_ATTENTE'"
      [class.bg-blue-100]="statut === 'CONFIRMEE'"
      [class.text-blue-800]="statut === 'CONFIRMEE'"
      [class.bg-purple-100]="statut === 'EN_PREPARATION'"
      [class.text-purple-800]="statut === 'EN_PREPARATION'"
      [class.bg-indigo-100]="statut === 'EXPEDIEE'"
      [class.text-indigo-800]="statut === 'EXPEDIEE'"
      [class.bg-green-100]="statut === 'LIVREE'"
      [class.text-green-800]="statut === 'LIVREE'"
      [class.bg-red-100]="statut === 'ANNULEE' || statut === 'REMBOURSEE'"
      [class.text-red-800]="statut === 'ANNULEE' || statut === 'REMBOURSEE'"
    >
      @if (showIcon) {
        <span 
          class="w-1.5 h-1.5 rounded-full"
          [class.bg-gray-500]="statut === 'BROUILLON'"
          [class.bg-yellow-500]="statut === 'EN_ATTENTE'"
          [class.bg-blue-500]="statut === 'CONFIRMEE'"
          [class.bg-purple-500]="statut === 'EN_PREPARATION'"
          [class.bg-indigo-500]="statut === 'EXPEDIEE'"
          [class.bg-green-500]="statut === 'LIVREE'"
          [class.bg-red-500]="statut === 'ANNULEE' || statut === 'REMBOURSEE'"
        ></span>
      }
      {{ label }}
    </span>
  `,
})
export class CommandeStatusBadgeComponent {
  @Input() statut: CommandeStatut = 'BROUILLON';
  @Input() showIcon = true;

  get label(): string {
    const labels: Record<CommandeStatut, string> = {
      BROUILLON: 'Brouillon',
      EN_ATTENTE: 'En attente',
      CONFIRMEE: 'Confirmée',
      EN_PREPARATION: 'En préparation',
      EXPEDIEE: 'Expédiée',
      LIVREE: 'Livrée',
      ANNULEE: 'Annulée',
      REMBOURSEE: 'Remboursée',
    };
    return labels[this.statut] || this.statut;
  }
}
