#!/bin/bash
cd /home/claude/gestion-stock-frontend

# Function to create simple component
create_simple_component() {
  local filepath=$1
  local name=$2
  local selector=$3
  local template=$4
  
  cat > "$filepath" << EOF
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: '${selector}',
  standalone: true,
  imports: [CommonModule],
  template: \`${template}\`,
})
export class ${name} {
  @Input() data: any;
}
EOF
}

# Empty State Component
cat > src/app/shared/components/data-display/empty-state/empty-state.component.ts << 'EOF'
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center py-12">
      @if (icon) {
        <div [innerHTML]="icon" class="mx-auto w-12 h-12 text-gray-400"></div>
      }
      <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">{{ title }}</h3>
      @if (description) {
        <p class="mt-2 text-gray-500 dark:text-gray-400">{{ description }}</p>
      }
      <ng-content></ng-content>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon?: string;
  @Input() title = 'Aucune donnée';
  @Input() description?: string;
}
EOF

# Stats Card Component
cat > src/app/shared/components/data-display/stats-card/stats-card.component.ts << 'EOF'
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card card-body">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ label }}</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ value }}</p>
        </div>
        @if (icon) {
          <div class="w-12 h-12 rounded-lg flex items-center justify-center" [class]="iconBgClass">
            <span [innerHTML]="icon" class="w-6 h-6" [class]="iconClass"></span>
          </div>
        }
      </div>
      @if (change !== undefined) {
        <p class="mt-2 text-sm" [class.text-success-600]="change >= 0" [class.text-danger-600]="change < 0">
          {{ change >= 0 ? '+' : '' }}{{ change }}%
        </p>
      }
    </div>
  `,
})
export class StatsCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() icon?: string;
  @Input() iconBgClass = 'bg-primary-100 dark:bg-primary-900/30';
  @Input() iconClass = 'text-primary-600';
  @Input() change?: number;
}
EOF

# Pagination Component
cat > src/app/shared/components/data-display/pagination/pagination.component.ts << 'EOF'
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
EOF

# Search Bar Component
cat > src/app/shared/components/data-display/search-bar/search-bar.component.ts << 'EOF'
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <input
        type="text"
        [placeholder]="placeholder"
        [(ngModel)]="value"
        (input)="onSearch()"
        class="form-input pl-10"
      />
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
    </div>
  `,
})
export class SearchBarComponent {
  @Input() placeholder = 'Rechercher...';
  @Input() value = '';
  @Output() search = new EventEmitter<string>();

  onSearch(): void {
    this.search.emit(this.value);
  }
}
EOF

# Data Table Component
cat > src/app/shared/components/data-display/data-table/data-table.component.ts << 'EOF'
import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            @for (col of columns; track col.key) {
              <th [class]="col.headerClass">{{ col.label }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of data; track trackByFn(row)) {
            <tr (click)="rowClick.emit(row)" [class.cursor-pointer]="clickable">
              @for (col of columns; track col.key) {
                <td [class]="col.cellClass">
                  {{ row[col.key] }}
                </td>
              }
            </tr>
          } @empty {
            <tr>
              <td [attr.colspan]="columns.length" class="text-center py-8 text-gray-500">
                Aucune donnée disponible
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DataTableComponent {
  @Input() data: any[] = [];
  @Input() columns: { key: string; label: string; headerClass?: string; cellClass?: string }[] = [];
  @Input() clickable = false;
  @Input() trackBy: string = 'id';
  @Output() rowClick = new EventEmitter<any>();

  trackByFn(item: any): any {
    return item[this.trackBy];
  }
}
EOF

# Filter Panel Component
cat > src/app/shared/components/data-display/filter-panel/filter-panel.component.ts << 'EOF'
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between mb-4">
        <h4 class="font-medium text-gray-900 dark:text-white">Filtres</h4>
        <button type="button" class="text-sm text-primary-600" (click)="reset.emit()">
          Réinitialiser
        </button>
      </div>
      <ng-content></ng-content>
    </div>
  `,
})
export class FilterPanelComponent {
  @Output() reset = new EventEmitter<void>();
}
EOF

# Tree View Component
cat > src/app/shared/components/data-display/tree-view/tree-view.component.ts << 'EOF'
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tree-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ul class="space-y-1">
      @for (item of items; track item.id) {
        <li>
          <div 
            class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            (click)="select.emit(item)"
          >
            @if (item.children?.length) {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            }
            <span>{{ item.label }}</span>
          </div>
        </li>
      }
    </ul>
  `,
})
export class TreeViewComponent {
  @Input() items: { id: string; label: string; children?: any[] }[] = [];
  @Output() select = new EventEmitter<any>();
}
EOF

# Alert Component
cat > src/app/shared/components/ui/alert/alert.component.ts << 'EOF'
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="alertClass" role="alert">
      <ng-content></ng-content>
    </div>
  `,
})
export class AlertComponent {
  @Input() type: 'success' | 'warning' | 'danger' | 'info' = 'info';

  get alertClass(): string {
    const base = 'p-4 rounded-lg border';
    const types = {
      success: 'bg-success-50 border-success-200 text-success-800 dark:bg-success-900/20 dark:border-success-800 dark:text-success-400',
      warning: 'bg-warning-50 border-warning-200 text-warning-800 dark:bg-warning-900/20 dark:border-warning-800 dark:text-warning-400',
      danger: 'bg-danger-50 border-danger-200 text-danger-800 dark:bg-danger-900/20 dark:border-danger-800 dark:text-danger-400',
      info: 'bg-info-50 border-info-200 text-info-800 dark:bg-info-900/20 dark:border-info-800 dark:text-info-400',
    };
    return `${base} ${types[this.type]}`;
  }
}
EOF

# Button Component
cat > src/app/shared/components/ui/button/button.component.ts << 'EOF'
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClass"
    >
      @if (loading) {
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      }
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() loading = false;

  get buttonClass(): string {
    const variants = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      success: 'btn-success',
      danger: 'btn-danger',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
    };
    const sizes = {
      sm: 'btn-sm',
      md: '',
      lg: 'btn-lg',
    };
    return `btn ${variants[this.variant]} ${sizes[this.size]}`;
  }
}
EOF

# Tooltip Component
cat > src/app/shared/components/ui/tooltip/tooltip.component.ts << 'EOF'
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative group inline-block">
      <ng-content></ng-content>
      <div class="absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
           [class.bottom-full]="position === 'top'"
           [class.top-full]="position === 'bottom'"
           [class.mb-1]="position === 'top'"
           [class.mt-1]="position === 'bottom'">
        {{ text }}
      </div>
    </div>
  `,
})
export class TooltipComponent {
  @Input() text = '';
  @Input() position: 'top' | 'bottom' = 'top';
}
EOF

# Premium Badge Component
cat > src/app/shared/components/premium/premium-badge/premium-badge.component.ts << 'EOF'
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-premium-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-warning-500 to-warning-600 text-white rounded-full">
      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
      Premium
    </span>
  `,
})
export class PremiumBadgeComponent {}
EOF

# Premium Lock Component
cat > src/app/shared/components/premium/premium-lock/premium-lock.component.ts << 'EOF'
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-premium-lock',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="relative">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
        <div class="text-center text-white p-6">
          <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <p class="font-medium mb-2">{{ message }}</p>
          <a routerLink="/abonnement" class="btn bg-gradient-to-r from-warning-500 to-warning-600 text-white text-sm">
            Passer à Premium
          </a>
        </div>
      </div>
      <ng-content></ng-content>
    </div>
  `,
})
export class PremiumLockComponent {
  @Input() message = 'Fonctionnalité Premium';
}
EOF

# Upgrade Prompt Component
cat > src/app/shared/components/premium/upgrade-prompt/upgrade-prompt.component.ts << 'EOF'
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-upgrade-prompt',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 bg-gradient-to-r from-warning-500 to-warning-600 rounded-xl text-white">
      <h3 class="text-lg font-bold mb-2">{{ title }}</h3>
      <p class="text-warning-100 mb-4">{{ description }}</p>
      <a routerLink="/abonnement" class="inline-block px-4 py-2 bg-white text-warning-600 font-medium rounded-lg hover:bg-warning-50 transition-colors">
        Voir les plans
      </a>
    </div>
  `,
})
export class UpgradePromptComponent {
  @Input() title = 'Passez à Premium';
  @Input() description = 'Débloquez toutes les fonctionnalités avancées';
}
EOF

# Footer Component
cat > src/app/shared/components/layout/footer/footer.component.ts << 'EOF'
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
      © {{ currentYear }} Gestion de Stock. Tous droits réservés.
    </footer>
  `,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
EOF

echo "Shared components créés"
