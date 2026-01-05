import { Component, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="relative border-2 border-dashed rounded-lg p-6 transition-colors"
      [class.border-gray-300]="!isDragging && !hasError"
      [class.border-primary-500]="isDragging"
      [class.bg-primary-50]="isDragging"
      [class.border-red-500]="hasError"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
    >
      <input
        #fileInput
        type="file"
        class="hidden"
        [accept]="accept"
        [multiple]="multiple"
        (change)="onFileSelected($event)"
      />

      <div class="text-center">
        @if (!files.length) {
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
          <p class="mt-2 text-sm text-gray-600">
            <button type="button" (click)="fileInput.click()" class="font-medium text-primary-600 hover:text-primary-500">
              Cliquez pour sélectionner
            </button>
            ou glissez-déposez
          </p>
          <p class="mt-1 text-xs text-gray-500">{{ acceptLabel }}</p>
          @if (maxSize) {
            <p class="text-xs text-gray-500">Max: {{ formatSize(maxSize) }}</p>
          }
        } @else {
          <div class="space-y-2">
            @for (file of files; track file.name) {
              <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <span class="text-sm text-gray-700 truncate max-w-xs">{{ file.name }}</span>
                  <span class="text-xs text-gray-500">({{ formatSize(file.size) }})</span>
                </div>
                <button type="button" (click)="removeFile(file)" class="text-red-500 hover:text-red-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            }
            <button type="button" (click)="fileInput.click()" class="text-sm text-primary-600 hover:text-primary-500">
              + Ajouter d'autres fichiers
            </button>
          </div>
        }
      </div>

      @if (hasError) {
        <p class="mt-2 text-sm text-red-600 text-center">{{ errorMessage }}</p>
      }
    </div>
  `,
})
export class FileUploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @Input() accept = '*';
  @Input() acceptLabel = 'Tous types de fichiers';
  @Input() multiple = false;
  @Input() maxSize?: number; // in bytes
  @Input() maxFiles = 10;

  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() fileRemoved = new EventEmitter<File>();

  files: File[] = [];
  isDragging = false;
  hasError = false;
  errorMessage = '';

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles) {
      this.handleFiles(Array.from(droppedFiles));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  private handleFiles(newFiles: File[]): void {
    this.hasError = false;
    this.errorMessage = '';

    // Check max files
    if (this.files.length + newFiles.length > this.maxFiles) {
      this.hasError = true;
      this.errorMessage = `Maximum ${this.maxFiles} fichiers autorisés`;
      return;
    }

    // Check file sizes
    if (this.maxSize) {
      const oversized = newFiles.find(f => f.size > this.maxSize!);
      if (oversized) {
        this.hasError = true;
        this.errorMessage = `Le fichier "${oversized.name}" dépasse la taille maximale`;
        return;
      }
    }

    if (this.multiple) {
      this.files = [...this.files, ...newFiles];
    } else {
      this.files = [newFiles[0]];
    }

    this.filesSelected.emit(this.files);
  }

  removeFile(file: File): void {
    this.files = this.files.filter(f => f !== file);
    this.fileRemoved.emit(file);
    this.filesSelected.emit(this.files);
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
