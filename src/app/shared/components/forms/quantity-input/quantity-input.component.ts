import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-quantity-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QuantityInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex items-center" [class.opacity-50]="disabled">
      <button
        type="button"
        (click)="decrement()"
        [disabled]="disabled || value <= min"
        class="flex items-center justify-center w-10 h-10 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
        </svg>
      </button>
      <input
        type="number"
        [value]="value"
        (input)="onInputChange($event)"
        (blur)="onBlur()"
        [min]="min"
        [max]="max"
        [step]="step"
        [disabled]="disabled"
        class="w-16 h-10 text-center border-y border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        (click)="increment()"
        [disabled]="disabled || value >= max"
        class="flex items-center justify-center w-10 h-10 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
      </button>
    </div>
  `,
})
export class QuantityInputComponent implements ControlValueAccessor {
  @Input() min = 0;
  @Input() max = 999999;
  @Input() step = 1;
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<number>();

  value = 0;

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  increment(): void {
    if (this.value < this.max) {
      this.value = Math.min(this.value + this.step, this.max);
      this.emitChange();
    }
  }

  decrement(): void {
    if (this.value > this.min) {
      this.value = Math.max(this.value - this.step, this.min);
      this.emitChange();
    }
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let newValue = parseFloat(input.value) || 0;
    newValue = Math.max(this.min, Math.min(this.max, newValue));
    this.value = newValue;
    this.emitChange();
  }

  onBlur(): void {
    this.onTouched();
  }

  private emitChange(): void {
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  writeValue(value: number): void {
    this.value = value ?? 0;
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
