import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div class="text-sm text-gray-700 dark:text-gray-300">
        Affichage {{ startItem }}-{{ endItem }} sur {{ total }}
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          class="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
          [disabled]="currentPage === 1"
          (click)="onPageChange(currentPage - 1)"
        >
          Précédent
        </button>
        <button
          type="button"
          class="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
          [disabled]="currentPage === totalPages"
          (click)="onPageChange(currentPage + 1)"
        >
          Suivant
        </button>
      </div>
    </div>
  `,
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() pageSize = 20;
  @Input() total = 0;
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.total);
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }
}
