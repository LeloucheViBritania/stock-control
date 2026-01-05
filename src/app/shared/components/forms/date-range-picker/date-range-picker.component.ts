import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangePickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex items-center gap-2">
      <div class="relative flex-1">
        <input
          type="date"
          [value]="startFormatted"
          (change)="onStartChange($event)"
          [disabled]="disabled"
          [max]="endFormatted || maxDate"
          class="form-input w-full"
          [placeholder]="startPlaceholder"
        />
      </div>
      <span class="text-gray-400">→</span>
      <div class="relative flex-1">
        <input
          type="date"
          [value]="endFormatted"
          (change)="onEndChange($event)"
          [disabled]="disabled"
          [min]="startFormatted || minDate"
          class="form-input w-full"
          [placeholder]="endPlaceholder"
        />
      </div>
      @if (showClear && (value.start || value.end)) {
        <button type="button" (click)="clear()" class="p-2 text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      }
    </div>
  `,
})
export class DateRangePickerComponent implements ControlValueAccessor {
  @Input() minDate?: string;
  @Input() maxDate?: string;
  @Input() disabled = false;
  @Input() showClear = true;
  @Input() startPlaceholder = 'Date début';
  @Input() endPlaceholder = 'Date fin';
  @Output() rangeChange = new EventEmitter<DateRange>();

  value: DateRange = { start: null, end: null };

  private onChange: (value: DateRange) => void = () => {};
  private onTouched: () => void = () => {};

  get startFormatted(): string {
    return this.value.start ? this.value.start.toISOString().split('T')[0] : '';
  }

  get endFormatted(): string {
    return this.value.end ? this.value.end.toISOString().split('T')[0] : '';
  }

  onStartChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value.start = input.value ? new Date(input.value) : null;
    this.emitChange();
  }

  onEndChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value.end = input.value ? new Date(input.value) : null;
    this.emitChange();
  }

  clear(): void {
    this.value = { start: null, end: null };
    this.emitChange();
  }

  private emitChange(): void {
    this.onChange(this.value);
    this.rangeChange.emit(this.value);
    this.onTouched();
  }

  writeValue(value: DateRange | null): void {
    this.value = value || { start: null, end: null };
  }

  registerOnChange(fn: (value: DateRange) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
