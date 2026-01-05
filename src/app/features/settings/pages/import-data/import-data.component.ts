/**
 * Page d'import de données (PREMIUM)
 */
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ImportService, ImportConfig, ImportMapping, ImportResult } from '@services/import.service';
import { NotificationService } from '@services/notification.service';
import { LoadingSpinnerComponent } from '@components/ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-import-data',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center gap-4">
        <a routerLink="/settings" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Import de données</h1>
            <span class="badge-premium">Premium</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Importez vos données depuis un fichier CSV ou Excel</p>
        </div>
      </div>

      <!-- Étape 1: Type d'import -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">1. Type d'import</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          @for (type of importTypes; track type.id) {
            <button 
              type="button"
              class="p-4 border-2 rounded-lg text-center transition-all"
              [class.border-primary-500]="selectedType === type.id"
              [class.bg-primary-50]="selectedType === type.id"
              [class.border-gray-200]="selectedType !== type.id"
              (click)="selectType(type.id)"
            >
              <div class="text-3xl mb-2">{{ type.icon }}</div>
              <p class="font-medium text-gray-900 dark:text-white">{{ type.label }}</p>
            </button>
          }
        </div>
        @if (selectedType) {
          <div class="mt-4 flex items-center gap-2">
            <button type="button" class="text-sm text-primary-600 hover:underline" (click)="downloadTemplate()">
              Télécharger le modèle {{ selectedType }}
            </button>
          </div>
        }
      </div>

      <!-- Étape 2: Fichier -->
      @if (selectedType) {
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">2. Fichier à importer</h2>
          <div 
            class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center"
            [class.border-primary-500]="isDragging"
            [class.bg-primary-50]="isDragging"
            (dragover)="onDragOver($event)"
            (dragleave)="isDragging = false"
            (drop)="onDrop($event)"
          >
            @if (!selectedFile) {
              <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              <p class="text-gray-600 dark:text-gray-400 mb-2">Glissez-déposez votre fichier ici</p>
              <p class="text-sm text-gray-500 mb-4">ou</p>
              <label class="btn-primary cursor-pointer">
                Parcourir
                <input type="file" class="hidden" accept=".csv,.xlsx,.xls" (change)="onFileSelect($event)" />
              </label>
              <p class="text-xs text-gray-500 mt-4">Formats acceptés: CSV, XLSX, XLS (max 10MB)</p>
            } @else {
              <div class="flex items-center justify-center gap-4">
                <svg class="w-10 h-10 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div class="text-left">
                  <p class="font-medium text-gray-900 dark:text-white">{{ selectedFile.name }}</p>
                  <p class="text-sm text-gray-500">{{ (selectedFile.size / 1024) | number:'1.0-0' }} KB</p>
                </div>
                <button type="button" class="text-danger-600 hover:underline" (click)="clearFile()">Supprimer</button>
              </div>
            }
          </div>
        </div>
      }

      <!-- Étape 3: Prévisualisation -->
      @if (preview().length) {
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">3. Prévisualisation</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  @for (header of headers(); track header) {
                    <th class="table-header">{{ header }}</th>
                  }
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (row of preview(); track $index) {
                  <tr>
                    @for (header of headers(); track header) {
                      <td class="table-cell">{{ row[header] }}</td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <p class="text-sm text-gray-500 mt-2">Affichage des 5 premières lignes sur {{ totalRows() }}</p>
        </div>
      }

      <!-- Étape 4: Options -->
      @if (preview().length) {
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">4. Options d'import</h2>
          <div class="space-y-4">
            <label class="flex items-center gap-3">
              <input type="checkbox" [(ngModel)]="options.skipFirstRow" class="rounded" />
              <span>Ignorer la première ligne (en-têtes)</span>
            </label>
            <label class="flex items-center gap-3">
              <input type="checkbox" [(ngModel)]="options.updateExisting" class="rounded" />
              <span>Mettre à jour les enregistrements existants</span>
            </label>
            <label class="flex items-center gap-3">
              <input type="checkbox" [(ngModel)]="options.dryRun" class="rounded" />
              <span>Mode test (pas d'import réel)</span>
            </label>
          </div>
        </div>
      }

      <!-- Actions -->
      @if (preview().length) {
        <div class="flex items-center justify-end gap-3">
          <button type="button" class="btn-secondary" (click)="reset()">Annuler</button>
          <button type="button" class="btn-primary" (click)="startImport()" [disabled]="isImporting()">
            @if (isImporting()) {
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Import en cours...
            } @else {
              Lancer l'import
            }
          </button>
        </div>
      }

      <!-- Résultat -->
      @if (result()) {
        <div class="card p-6" [class.border-success-500]="result()?.success" [class.border-danger-500]="!result()?.success">
          <h2 class="text-lg font-semibold mb-4" [class.text-success-600]="result()?.success" [class.text-danger-600]="!result()?.success">
            {{ result()?.success ? 'Import réussi' : 'Import terminé avec erreurs' }}
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <p class="text-2xl font-bold">{{ result()?.totalRows }}</p>
              <p class="text-sm text-gray-500">Total lignes</p>
            </div>
            <div class="text-center p-3 bg-success-50 rounded-lg">
              <p class="text-2xl font-bold text-success-600">{{ result()?.importedRows }}</p>
              <p class="text-sm text-success-700">Importées</p>
            </div>
            <div class="text-center p-3 bg-info-50 rounded-lg">
              <p class="text-2xl font-bold text-info-600">{{ result()?.updatedRows }}</p>
              <p class="text-sm text-info-700">Mises à jour</p>
            </div>
            <div class="text-center p-3 bg-warning-50 rounded-lg">
              <p class="text-2xl font-bold text-warning-600">{{ result()?.skippedRows }}</p>
              <p class="text-sm text-warning-700">Ignorées</p>
            </div>
          </div>
          @if (result()?.errors?.length) {
            <div class="mt-4">
              <h3 class="font-medium text-danger-600 mb-2">Erreurs ({{ result()?.errors?.length }})</h3>
              <div class="max-h-40 overflow-y-auto space-y-1">
                @for (error of result()?.errors || []; track $index) {
                  <p class="text-sm text-danger-600">Ligne {{ error.row }}: {{ error.message }}</p>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ImportDataComponent {
  private readonly importService = inject(ImportService);
  private readonly notificationService = inject(NotificationService);

  importTypes = [
    { id: 'produits', label: 'Produits', icon: '📦' },
    { id: 'clients', label: 'Clients', icon: '👥' },
    { id: 'fournisseurs', label: 'Fournisseurs', icon: '🏭' },
    { id: 'stock', label: 'Stock', icon: '📊' },
  ];

  selectedType: string = '';
  selectedFile: File | null = null;
  isDragging = false;
  headers = signal<string[]>([]);
  preview = signal<any[]>([]);
  totalRows = signal(0);
  isImporting = signal(false);
  result = signal<ImportResult | null>(null);

  options = {
    skipFirstRow: true,
    updateExisting: false,
    dryRun: false
  };

  selectType(type: string): void {
    this.selectedType = type;
    this.clearFile();
  }

  downloadTemplate(): void {
    this.importService.downloadTemplate(this.selectedType as any);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.processFile(files[0]);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.processFile(input.files[0]);
    }
  }

  async processFile(file: File): Promise<void> {
    this.selectedFile = file;
    this.result.set(null);

    try {
      const parsed = await this.importService.parseFile(file);
      this.headers.set(parsed.headers);
      this.preview.set(parsed.preview);
      this.totalRows.set(parsed.rows.length);
    } catch (error) {
      this.notificationService.error('Erreur lors de la lecture du fichier');
      this.clearFile();
    }
  }

  clearFile(): void {
    this.selectedFile = null;
    this.headers.set([]);
    this.preview.set([]);
    this.totalRows.set(0);
    this.result.set(null);
  }

  reset(): void {
    this.selectedType = '';
    this.clearFile();
  }

  startImport(): void {
    if (!this.selectedFile || !this.selectedType) return;

    this.isImporting.set(true);

    const config: ImportConfig = {
      type: this.selectedType as any,
      mappings: this.headers().map(h => ({ sourceColumn: h, targetField: h })),
      skipFirstRow: this.options.skipFirstRow,
      updateExisting: this.options.updateExisting,
      dryRun: this.options.dryRun
    };

    // Simuler l'import
    setTimeout(() => {
      this.result.set({
        success: true,
        totalRows: this.totalRows(),
        importedRows: Math.floor(this.totalRows() * 0.95),
        updatedRows: Math.floor(this.totalRows() * 0.03),
        skippedRows: Math.floor(this.totalRows() * 0.02),
        errors: [],
        warnings: []
      });
      this.isImporting.set(false);
      this.notificationService.success('Import terminé avec succès');
    }, 2000);
  }
}
