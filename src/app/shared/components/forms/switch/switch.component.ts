import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-switch',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SwitchComponent),
      multi: true,
    },
  ],
  template: `
    <label class="inline-flex items-center cursor-pointer" [class.opacity-50]="disabled" [class.cursor-not-allowed]="disabled">
      <button
        type="button"
        role="switch"
        [attr.aria-checked]="checked"
        (click)="toggle()"
        [disabled]="disabled"
        class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        [class.bg-primary-600]="checked"
        [class.bg-gray-200]="!checked"
      >
        <span
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          [class.translate-x-5]="checked"
          [class.translate-x-0]="!checked"
        ></span>
      </button>
      @if (label) {
        <span class="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">{{ label }}</span>
      }
    </label>
  `,
})
export class SwitchComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() disabled = false;

  @Output() changed = new EventEmitter<boolean>();

  checked = false;

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  toggle(): void {
    if (!this.disabled) {
      this.checked = !this.checked;
      this.onChange(this.checked);
      this.changed.emit(this.checked);
      this.onTouched();
    }
  }

  writeValue(value: boolean): void {
    this.checked = !!value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
