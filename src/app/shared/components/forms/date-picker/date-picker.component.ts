import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative">
      <input
        type="date"
        [value]="formattedValue"
        (change)="onDateChange($event)"
        [disabled]="disabled"
        [min]="minDate"
        [max]="maxDate"
        [class]="inputClass"
        class="form-input w-full pr-10"
        [class.opacity-50]="disabled"
        [class.cursor-not-allowed]="disabled"
      />
      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>
    </div>
  `,
})
export class DatePickerComponent implements ControlValueAccessor {
  @Input() minDate?: string;
  @Input() maxDate?: string;
  @Input() disabled = false;
  @Input() inputClass = '';
  @Output() dateChange = new EventEmitter<Date | null>();

  value: Date | null = null;

  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  get formattedValue(): string {
    if (!this.value) return '';
    return this.value.toISOString().split('T')[0];
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const date = input.value ? new Date(input.value) : null;
    this.value = date;
    this.onChange(date);
    this.dateChange.emit(date);
    this.onTouched();
  }

  writeValue(value: Date | string | null): void {
    if (value instanceof Date) {
      this.value = value;
    } else if (typeof value === 'string' && value) {
      this.value = new Date(value);
    } else {
      this.value = null;
    }
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
