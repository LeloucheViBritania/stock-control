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
