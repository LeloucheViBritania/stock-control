import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (totalPagesComputed() > 1) {
      <div class="pagination-wrapper">
        <div class="pagination-info">
          Affichage {{ startItem() }}-{{ endItem() }} sur {{ total }} résultats
        </div>
        
        <div class="pagination">
          <button 
            class="pagination__btn" 
            [disabled]="page === 1"
            (click)="goToPage(1)"
            title="Première page"
          >
            <i class="ph ph-caret-double-left"></i>
          </button>
          
          <button 
            class="pagination__btn" 
            [disabled]="page === 1"
            (click)="goToPage(page - 1)"
            title="Page précédente"
          >
            <i class="ph ph-caret-left"></i>
          </button>

          @for (p of visiblePages(); track p) {
            @if (p === '...') {
              <span class="pagination__ellipsis">...</span>
            } @else {
              <button 
                class="pagination__btn"
                [class.active]="p === page"
                (click)="goToPage(+p)"
              >
                {{ p }}
              </button>
            }
          }

          <button 
            class="pagination__btn" 
            [disabled]="page === totalPagesComputed()"
            (click)="goToPage(page + 1)"
            title="Page suivante"
          >
            <i class="ph ph-caret-right"></i>
          </button>
          
          <button 
            class="pagination__btn" 
            [disabled]="page === totalPagesComputed()"
            (click)="goToPage(totalPagesComputed())"
            title="Dernière page"
          >
            <i class="ph ph-caret-double-right"></i>
          </button>
        </div>

        <div class="pagination-size">
          <label>Par page:</label>
          <select [value]="limit" (change)="onLimitChange($event)">
            @for (size of pageSizes; track size) {
              <option [value]="size">{{ size }}</option>
            }
          </select>
        </div>
      </div>
    }
  `,
  styles: [`
    .pagination-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--space-4);
      padding: var(--space-4) 0;
    }

    .pagination-info {
      font-size: var(--text-sm);
      color: var(--neutral-500);
    }

    .pagination {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }

    .pagination__btn {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      height: 36px;
      padding: 0 var(--space-3);
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--neutral-600);
      background: var(--neutral-0);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover:not(:disabled):not(.active) {
        border-color: var(--primary-300);
        color: var(--primary-600);
      }

      &.active {
        background: var(--primary-500);
        border-color: var(--primary-500);
        color: var(--neutral-0);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .pagination__ellipsis {
      padding: 0 var(--space-2);
      color: var(--neutral-400);
    }

    .pagination-size {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
      color: var(--neutral-600);

      select {
        padding: var(--space-2) var(--space-3);
        border: 1px solid var(--neutral-300);
        border-radius: var(--radius-md);
        background: var(--neutral-0);
        font-size: var(--text-sm);
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: var(--primary-500);
        }
      }
    }

    @media (max-width: 768px) {
      .pagination-wrapper {
        justify-content: center;
      }

      .pagination-info {
        width: 100%;
        text-align: center;
      }
    }
  `]
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() set currentPage(value: number) { this.page = value; }
  @Input() limit = 10;
  @Input() total = 0;
  @Input() set totalPages(value: number) { this.total = value * this.limit; }
  @Input() pageSizes = [10, 25, 50, 100];

  @Output() pageChange = new EventEmitter<number>();
  @Output() limitChange = new EventEmitter<number>();

  totalPagesComputed = computed(() => Math.ceil(this.total / this.limit) || 1);
  
  startItem = computed(() => {
    if (this.total === 0) return 0;
    return (this.page - 1) * this.limit + 1;
  });
  
  endItem = computed(() => {
    return Math.min(this.page * this.limit, this.total);
  });

  visiblePages = computed(() => {
    const total = this.totalPagesComputed();
    const current = this.page;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      // Show all pages
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current > 3) {
        pages.push('...');
      }

      // Show pages around current
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(total);
    }

    return pages;
  });

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPagesComputed() && page !== this.page) {
      this.pageChange.emit(page);
    }
  }

  onLimitChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.limitChange.emit(parseInt(select.value, 10));
  }
}
