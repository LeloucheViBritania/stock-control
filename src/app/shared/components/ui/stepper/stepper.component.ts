import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Step {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  optional?: boolean;
  completed?: boolean;
  error?: boolean;
}

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <!-- Horizontal Stepper -->
      @if (orientation === 'horizontal') {
        <nav aria-label="Progress" class="mb-8">
          <ol class="flex items-center justify-between">
            @for (step of steps; track step.id; let i = $index; let last = $last) {
              <li class="flex items-center" [class.flex-1]="!last">
                <div 
                  class="flex items-center cursor-pointer group"
                  (click)="goToStep(i)"
                >
                  <!-- Step Circle -->
                  <span 
                    class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors"
                    [class.bg-primary-600]="i < currentStep || step.completed"
                    [class.border-primary-600]="i < currentStep || step.completed || i === currentStep"
                    [class.text-white]="i < currentStep || step.completed"
                    [class.border-gray-300]="i > currentStep && !step.completed"
                    [class.text-gray-500]="i > currentStep && !step.completed"
                    [class.bg-red-600]="step.error"
                    [class.border-red-600]="step.error"
                  >
                    @if (step.completed && !step.error) {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    } @else if (step.error) {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    } @else {
                      <span class="font-semibold">{{ i + 1 }}</span>
                    }
                  </span>

                  <!-- Step Label -->
                  <div class="ml-3">
                    <span 
                      class="text-sm font-medium"
                      [class.text-primary-600]="i === currentStep"
                      [class.text-gray-900]="i < currentStep || step.completed"
                      [class.text-gray-500]="i > currentStep && !step.completed"
                    >
                      {{ step.label }}
                    </span>
                    @if (step.description) {
                      <p class="text-xs text-gray-500">{{ step.description }}</p>
                    }
                  </div>
                </div>

                <!-- Connector Line -->
                @if (!last) {
                  <div 
                    class="flex-1 h-0.5 mx-4"
                    [class.bg-primary-600]="i < currentStep"
                    [class.bg-gray-200]="i >= currentStep"
                  ></div>
                }
              </li>
            }
          </ol>
        </nav>
      }

      <!-- Vertical Stepper -->
      @if (orientation === 'vertical') {
        <nav aria-label="Progress">
          <ol class="space-y-4">
            @for (step of steps; track step.id; let i = $index; let last = $last) {
              <li class="relative">
                <div 
                  class="flex items-start cursor-pointer group"
                  (click)="goToStep(i)"
                >
                  <span 
                    class="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors"
                    [class.bg-primary-600]="i < currentStep || step.completed"
                    [class.border-primary-600]="i <= currentStep || step.completed"
                    [class.text-white]="i < currentStep || step.completed"
                    [class.border-gray-300]="i > currentStep && !step.completed"
                  >
                    @if (step.completed) {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    } @else {
                      <span class="text-sm font-medium">{{ i + 1 }}</span>
                    }
                  </span>
                  <div class="ml-3">
                    <span class="text-sm font-medium text-gray-900">{{ step.label }}</span>
                    @if (step.description) {
                      <p class="text-sm text-gray-500">{{ step.description }}</p>
                    }
                  </div>
                </div>
                @if (!last) {
                  <div class="absolute left-4 top-10 w-0.5 h-6 -translate-x-1/2" [class.bg-primary-600]="i < currentStep" [class.bg-gray-200]="i >= currentStep"></div>
                }
              </li>
            }
          </ol>
        </nav>
      }

      <!-- Content -->
      <div class="mt-6">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class StepperComponent {
  @Input() steps: Step[] = [];
  @Input() currentStep = 0;
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() linear = true;

  @Output() stepChange = new EventEmitter<number>();

  goToStep(index: number): void {
    if (this.linear && index > this.currentStep + 1) return;
    if (index !== this.currentStep) {
      this.currentStep = index;
      this.stepChange.emit(index);
    }
  }

  next(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.stepChange.emit(this.currentStep);
    }
  }

  previous(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.stepChange.emit(this.currentStep);
    }
  }

  markAsCompleted(index: number): void {
    if (this.steps[index]) {
      this.steps[index].completed = true;
    }
  }
}
