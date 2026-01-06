import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop" (click)="onCancel()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal__header">
            <h3 class="modal__title">{{ title }}</h3>
            <button class="modal__close" (click)="onCancel()">
              <i class="ph ph-x"></i>
            </button>
          </div>
          <div class="modal__body">
            <div class="confirm-content">
              @if (type === 'danger') {
                <div class="confirm-icon confirm-icon--danger">
                  <i class="ph ph-warning-circle"></i>
                </div>
              } @else if (type === 'warning') {
                <div class="confirm-icon confirm-icon--warning">
                  <i class="ph ph-warning"></i>
                </div>
              } @else {
                <div class="confirm-icon confirm-icon--info">
                  <i class="ph ph-question"></i>
                </div>
              }
              <p class="confirm-message">{{ message }}</p>
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--secondary" (click)="onCancel()">
              {{ cancelText }}
            </button>
            <button 
              class="btn" 
              [class.btn--danger]="type === 'danger'"
              [class.btn--warning]="type === 'warning'"
              [class.btn--primary]="type === 'info'"
              (click)="onConfirm()"
              [disabled]="loading"
            >
              @if (loading) {
                <span class="spinner spinner--sm"></span>
              }
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .confirm-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: var(--space-4) 0;
    }

    .confirm-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin-bottom: var(--space-4);

      &--danger {
        background: var(--error-100);
        color: var(--error-600);
      }

      &--warning {
        background: var(--warning-100);
        color: var(--warning-600);
      }

      &--info {
        background: var(--info-100);
        color: var(--info-600);
      }
    }

    .confirm-message {
      font-size: var(--text-base);
      color: var(--neutral-700);
      margin: 0;
      max-width: 300px;
    }
  `]
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() set show(value: boolean) { this.isOpen = value; }
  @Input() title = 'Confirmation';
  @Input() message = 'Êtes-vous sûr de vouloir continuer ?';
  @Input() confirmText = 'Confirmer';
  @Input() set confirmLabel(value: string) { this.confirmText = value; }
  @Input() cancelText = 'Annuler';
  @Input() type: 'danger' | 'warning' | 'info' = 'info';
  @Input() set confirmClass(value: string) { 
    if (value.includes('danger')) this.type = 'danger';
    else if (value.includes('warning')) this.type = 'warning';
  }
  @Input() loading = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
