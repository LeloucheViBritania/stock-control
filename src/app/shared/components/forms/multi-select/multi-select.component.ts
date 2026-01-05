import { Component, Input, Output, EventEmitter, forwardRef, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative">
      <div
        (click)="toggleDropdown()"
        class="form-input cursor-pointer flex items-center justify-between min-h-[42px]"
        [class.ring-2]="isOpen"
        [class.ring-primary-500]="isOpen"
      >
        <div class="flex flex-wrap gap-1 flex-1">
          @if (selectedOptions.length === 0) {
            <span class="text-gray-400">{{ placeholder }}</span>
          } @else if (selectedOptions.length <= maxDisplay) {
            @for (opt of selectedOptions; track opt.value) {
              <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-800 text-sm rounded">
                {{ opt.label }}
                <button type="button" (click)="removeOption($event, opt)" class="hover:text-primary-600">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </span>
            }
          } @else {
            <span class="text-gray-700">{{ selectedOptions.length }} sélectionnés</span>
          }
        </div>
        <svg class="w-5 h-5 text-gray-400 transition-transform" [class.rotate-180]="isOpen" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>

      @if (isOpen) {
        <div class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          @if (searchable) {
            <div class="p-2 border-b">
              <input
                type="text"
                [(ngModel)]="searchTerm"
                placeholder="Rechercher..."
                class="form-input w-full text-sm"
                (click)="$event.stopPropagation()"
              />
            </div>
          }
          <div class="py-1">
            @for (option of filteredOptions; track option.value) {
              <div
                (click)="toggleOption($event, option)"
                class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50"
                [class.opacity-50]="option.disabled"
                [class.pointer-events-none]="option.disabled"
              >
                <input
                  type="checkbox"
                  [checked]="isSelected(option)"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  (click)="$event.stopPropagation()"
                  (change)="toggleOption($event, option)"
                />
                <span class="text-sm text-gray-700">{{ option.label }}</span>
              </div>
            }
            @if (filteredOptions.length === 0) {
              <div class="px-3 py-2 text-sm text-gray-500">Aucun résultat</div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class MultiSelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Sélectionner...';
  @Input() searchable = true;
  @Input() maxDisplay = 3;
  @Input() disabled = false;

  @Output() selectionChange = new EventEmitter<any[]>();

  isOpen = false;
  searchTerm = '';
  selectedValues: any[] = [];

  private onChange: (value: any[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  get selectedOptions(): SelectOption[] {
    return this.options.filter(opt => this.selectedValues.includes(opt.value));
  }

  get filteredOptions(): SelectOption[] {
    if (!this.searchTerm) return this.options;
    const term = this.searchTerm.toLowerCase();
    return this.options.filter(opt => opt.label.toLowerCase().includes(term));
  }

  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      if (!this.isOpen) this.searchTerm = '';
    }
  }

  isSelected(option: SelectOption): boolean {
    return this.selectedValues.includes(option.value);
  }

  toggleOption(event: Event, option: SelectOption): void {
    event.stopPropagation();
    if (option.disabled) return;

    if (this.isSelected(option)) {
      this.selectedValues = this.selectedValues.filter(v => v !== option.value);
    } else {
      this.selectedValues = [...this.selectedValues, option.value];
    }

    this.onChange(this.selectedValues);
    this.selectionChange.emit(this.selectedValues);
  }

  removeOption(event: Event, option: SelectOption): void {
    event.stopPropagation();
    this.selectedValues = this.selectedValues.filter(v => v !== option.value);
    this.onChange(this.selectedValues);
    this.selectionChange.emit(this.selectedValues);
  }

  writeValue(value: any[]): void {
    this.selectedValues = value || [];
  }

  registerOnChange(fn: (value: any[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
