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
