/**
 * Composant Dropdown réutilisable
 */
import { Component, Input, Output, EventEmitter, ElementRef, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block">
      <!-- Trigger -->
      <div (click)="toggle()">
        <ng-content select="[trigger]"></ng-content>
      </div>
      
      <!-- Menu -->
      @if (isOpen()) {
        <div 
          class="absolute z-50 min-w-48 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          [ngClass]="positionClasses"
        >
          <ng-content></ng-content>
        </div>
      }
    </div>
  `,
})
export class DropdownComponent {
  private readonly elementRef = inject(ElementRef);
  
  @Input() position: 'left' | 'right' = 'right';
  @Input() align: 'top' | 'bottom' = 'bottom';
  
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  isOpen = signal(false);

  get positionClasses(): string {
    const classes: string[] = [];
    
    if (this.position === 'right') {
      classes.push('right-0');
    } else {
      classes.push('left-0');
    }
    
    if (this.align === 'bottom') {
      classes.push('top-full mt-2');
    } else {
      classes.push('bottom-full mb-2');
    }
    
    return classes.join(' ');
  }

  toggle(): void {
    this.isOpen() ? this.close() : this.open();
  }

  open(): void {
    this.isOpen.set(true);
    this.opened.emit();
  }

  close(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }
}

// Composant DropdownItem
@Component({
  selector: 'app-dropdown-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2"
      [ngClass]="{
        'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700': !danger,
        'text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20': danger
      }"
      [disabled]="disabled"
      (click)="onClick()"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class DropdownItemComponent {
  @Input() disabled = false;
  @Input() danger = false;
  @Output() selected = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled) {
      this.selected.emit();
    }
  }
}

// Divider
@Component({
  selector: 'app-dropdown-divider',
  standalone: true,
  template: `<div class="my-1 border-t border-gray-200 dark:border-gray-700"></div>`,
})
export class DropdownDividerComponent {}
