/**
 * Tableau de données avancé avec tri, filtres et pagination (PREMIUM)
 */
import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DataTableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'number' | 'currency' | 'date' | 'badge' | 'actions';
  width?: string;
  align?: 'left' | 'center' | 'right';
  badgeConfig?: { [key: string]: string };
}

export interface DataTableAction {
  icon: string;
  label: string;
  action: string;
  color?: 'primary' | 'danger' | 'warning';
  condition?: (row: any) => boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card overflow-hidden">
      <!-- Toolbar -->
      @if (showToolbar) {
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            @if (showSearch) {
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearch()"
                placeholder="Rechercher..."
                class="form-input w-64"
              />
            }
            @if (showColumnFilter) {
              <select [(ngModel)]="filterColumn" (ngModelChange)="onSearch()" class="form-input w-auto">
                <option value="">Toutes les colonnes</option>
                @for (col of filterableColumns; track col.field) {
                  <option [value]="col.field">{{ col.header }}</option>
                }
              </select>
            }
          </div>
          <div class="flex items-center gap-2">
            @if (showExport) {
              <button type="button" class="btn-secondary btn-sm" (click)="onExport.emit('xlsx')">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Excel
              </button>
              <button type="button" class="btn-secondary btn-sm" (click)="onExport.emit('pdf')">PDF</button>
            }
            <ng-content select="[toolbar]"></ng-content>
          </div>
        </div>
      }

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              @if (selectable) {
                <th class="table-header w-12">
                  <input 
                    type="checkbox" 
                    [checked]="allSelected()"
                    (change)="toggleSelectAll()"
                    class="rounded"
                  />
                </th>
              }
              @for (col of columns; track col.field) {
                <th 
                  class="table-header"
                  [style.width]="col.width"
                  [class.cursor-pointer]="col.sortable"
                  [class.text-center]="col.align === 'center'"
                  [class.text-right]="col.align === 'right'"
                  (click)="col.sortable && sort(col.field)"
                >
                  <div class="flex items-center gap-1" [class.justify-center]="col.align === 'center'" [class.justify-end]="col.align === 'right'">
                    {{ col.header }}
                    @if (col.sortable && sortField === col.field) {
                      <svg class="w-4 h-4" [class.rotate-180]="sortDirection === 'desc'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                      </svg>
                    }
                  </div>
                </th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            @for (row of paginatedData(); track trackByFn(row)) {
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                @if (selectable) {
                  <td class="table-cell">
                    <input 
                      type="checkbox" 
                      [checked]="isSelected(row)"
                      (change)="toggleSelect(row)"
                      class="rounded"
                    />
                  </td>
                }
                @for (col of columns; track col.field) {
                  <td 
                    class="table-cell"
                    [class.text-center]="col.align === 'center'"
                    [class.text-right]="col.align === 'right'"
                  >
                    @switch (col.type) {
                      @case ('currency') {
                        <span class="font-medium">{{ row[col.field] | number:'1.2-2' }} €</span>
                      }
                      @case ('number') {
                        {{ row[col.field] | number }}
                      }
                      @case ('date') {
                        {{ row[col.field] | date:'dd/MM/yyyy' }}
                      }
                      @case ('badge') {
                        <span 
                          class="px-2 py-1 text-xs font-medium rounded-full"
                          [ngClass]="col.badgeConfig?.[row[col.field]] || 'bg-gray-100 text-gray-700'"
                        >
                          {{ row[col.field] }}
                        </span>
                      }
                      @case ('actions') {
                        <div class="flex items-center justify-end gap-1">
                          @for (action of actions; track action.action) {
                            @if (!action.condition || action.condition(row)) {
                              <button 
                                type="button" 
                                class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                [class.text-primary-600]="action.color === 'primary' || !action.color"
                                [class.text-danger-600]="action.color === 'danger'"
                                [class.text-warning-600]="action.color === 'warning'"
                                [title]="action.label"
                                (click)="onAction.emit({ action: action.action, row: row })"
                              >
                                <span [innerHTML]="action.icon"></span>
                              </button>
                            }
                          }
                        </div>
                      }
                      @default {
                        {{ row[col.field] }}
                      }
                    }
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td [attr.colspan]="columns.length + (selectable ? 1 : 0)" class="table-cell text-center py-8 text-gray-500">
                  {{ emptyMessage }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      @if (showPagination && totalPages() > 1) {
        <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div class="text-sm text-gray-500">
            {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredData().length) }} sur {{ filteredData().length }}
          </div>
          <div class="flex items-center gap-2">
            <button 
              type="button" 
              class="btn-secondary btn-sm"
              [disabled]="currentPage === 1"
              (click)="goToPage(currentPage - 1)"
            >
              Précédent
            </button>
            <span class="px-3 text-sm">Page {{ currentPage }} / {{ totalPages() }}</span>
            <button 
              type="button" 
              class="btn-secondary btn-sm"
              [disabled]="currentPage === totalPages()"
              (click)="goToPage(currentPage + 1)"
            >
              Suivant
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class DataTableComponent {
  @Input() columns: DataTableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: DataTableAction[] = [];
  @Input() pageSize = 10;
  @Input() selectable = false;
  @Input() showToolbar = true;
  @Input() showSearch = true;
  @Input() showColumnFilter = false;
  @Input() showExport = false;
  @Input() showPagination = true;
  @Input() emptyMessage = 'Aucune donnée';
  @Input() trackByField = 'id';

  @Output() onAction = new EventEmitter<{ action: string; row: any }>();
  @Output() onExport = new EventEmitter<string>();
  @Output() onSelectionChange = new EventEmitter<any[]>();

  searchQuery = '';
  filterColumn = '';
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 1;
  selectedRows = new Set<any>();

  Math = Math;

  get filterableColumns(): DataTableColumn[] {
    return this.columns.filter(c => c.filterable);
  }

  filteredData = computed(() => {
    let result = [...this.data];

    // Recherche
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(row => {
        if (this.filterColumn) {
          return String(row[this.filterColumn]).toLowerCase().includes(query);
        }
        return this.columns.some(col => 
          String(row[col.field]).toLowerCase().includes(query)
        );
      });
    }

    // Tri
    if (this.sortField) {
      result.sort((a, b) => {
        const aVal = a[this.sortField];
        const bVal = b[this.sortField];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  });

  totalPages = computed(() => Math.ceil(this.filteredData().length / this.pageSize));

  paginatedData = computed(() => {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData().slice(start, start + this.pageSize);
  });

  allSelected = computed(() => {
    const current = this.paginatedData();
    return current.length > 0 && current.every(row => this.selectedRows.has(row[this.trackByField]));
  });

  onSearch(): void {
    this.currentPage = 1;
  }

  sort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  trackByFn(row: any): any {
    return row[this.trackByField];
  }

  isSelected(row: any): boolean {
    return this.selectedRows.has(row[this.trackByField]);
  }

  toggleSelect(row: any): void {
    const id = row[this.trackByField];
    if (this.selectedRows.has(id)) {
      this.selectedRows.delete(id);
    } else {
      this.selectedRows.add(id);
    }
    this.emitSelection();
  }

  toggleSelectAll(): void {
    const current = this.paginatedData();
    if (this.allSelected()) {
      current.forEach(row => this.selectedRows.delete(row[this.trackByField]));
    } else {
      current.forEach(row => this.selectedRows.add(row[this.trackByField]));
    }
    this.emitSelection();
  }

  private emitSelection(): void {
    const selected = this.data.filter(row => this.selectedRows.has(row[this.trackByField]));
    this.onSelectionChange.emit(selected);
  }
}
