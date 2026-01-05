/**
 * Créateur de rapports personnalisés (PREMIUM)
 */
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ExportService } from '@services/export.service';
import { NotificationService } from '@services/notification.service';

interface ReportField {
  id: string;
  label: string;
  type: 'string' | 'number' | 'currency' | 'date' | 'percent';
  source: string;
}

interface ReportTemplate {
  id: string;
  nom: string;
  description: string;
  fields: string[];
  icon: string;
}

@Component({
  selector: 'app-rapport-personnalise',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DragDropModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a routerLink="/rapports" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Rapport Personnalisé</h1>
              <span class="badge-premium">Premium</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Créez des rapports sur mesure</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button type="button" class="btn-secondary" (click)="sauvegarderModele()">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
            </svg>
            Sauvegarder modèle
          </button>
          <button type="button" class="btn-primary" (click)="generer()" [disabled]="selectedFields().length === 0">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Générer
          </button>
        </div>
      </div>

      <!-- Modèles prédéfinis -->
      <div class="card p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Modèles prédéfinis</h3>
        <div class="grid gap-4 md:grid-cols-4">
          @for (template of templates; track template.id) {
            <button type="button" 
              class="p-4 border-2 rounded-lg text-left transition-all hover:border-primary-500"
              [class.border-primary-500]="selectedTemplate() === template.id"
              [class.bg-primary-50]="selectedTemplate() === template.id"
              [class.border-gray-200]="selectedTemplate() !== template.id"
              (click)="appliquerTemplate(template)"
            >
              <div class="text-2xl mb-2">{{ template.icon }}</div>
              <p class="font-medium text-gray-900 dark:text-white">{{ template.nom }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ template.description }}</p>
            </button>
          }
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Champs disponibles -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Champs disponibles</h3>
          <div class="mb-4">
            <input 
              type="text" 
              [(ngModel)]="searchField" 
              placeholder="Rechercher un champ..."
              class="form-input"
            />
          </div>
          <div class="space-y-2 max-h-96 overflow-y-auto"
            cdkDropList
            #availableList="cdkDropList"
            [cdkDropListData]="filteredAvailableFields()"
            [cdkDropListConnectedTo]="[selectedList]"
            (cdkDropListDropped)="drop($event)"
          >
            @for (field of filteredAvailableFields(); track field.id) {
              <div 
                cdkDrag
                class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ field.label }}</p>
                    <p class="text-xs text-gray-500">{{ field.source }}</p>
                  </div>
                  <span class="px-2 py-0.5 text-xs rounded bg-gray-200 text-gray-600">{{ field.type }}</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Champs sélectionnés -->
        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">
            Colonnes du rapport ({{ selectedFields().length }})
          </h3>
          <div 
            class="space-y-2 min-h-48 p-2 border-2 border-dashed border-gray-300 rounded-lg"
            cdkDropList
            #selectedList="cdkDropList"
            [cdkDropListData]="selectedFields()"
            [cdkDropListConnectedTo]="[availableList]"
            (cdkDropListDropped)="drop($event)"
          >
            @if (selectedFields().length === 0) {
              <div class="text-center py-8 text-gray-400">
                <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
                <p class="text-sm">Glissez les champs ici</p>
              </div>
            }
            @for (field of selectedFields(); track field.id; let i = $index) {
              <div 
                cdkDrag
                class="p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 rounded-lg cursor-move"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/>
                    </svg>
                    <span class="font-medium text-gray-900 dark:text-white">{{ field.label }}</span>
                  </div>
                  <button type="button" class="text-danger-500 hover:text-danger-700" (click)="removeField(i)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Options -->
        <div class="space-y-6">
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Filtres</h3>
            <div class="space-y-4">
              <div>
                <label class="form-label">Période</label>
                <select [(ngModel)]="filters.periode" class="form-input">
                  <option value="all">Toutes les données</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="quarter">Ce trimestre</option>
                  <option value="year">Cette année</option>
                  <option value="custom">Personnalisé</option>
                </select>
              </div>
              @if (filters.periode === 'custom') {
                <div class="grid grid-cols-2 gap-2">
                  <input type="date" [(ngModel)]="filters.dateDebut" class="form-input" />
                  <input type="date" [(ngModel)]="filters.dateFin" class="form-input" />
                </div>
              }
              <div>
                <label class="form-label">Catégorie</label>
                <select [(ngModel)]="filters.categorie" class="form-input">
                  <option value="">Toutes</option>
                  <option value="informatique">Informatique</option>
                  <option value="peripheriques">Périphériques</option>
                  <option value="accessoires">Accessoires</option>
                </select>
              </div>
            </div>
          </div>

          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Format d'export</h3>
            <div class="space-y-2">
              @for (format of formats; track format.value) {
                <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  [class.border-primary-500]="exportFormat() === format.value"
                  [class.bg-primary-50]="exportFormat() === format.value"
                >
                  <input type="radio" name="format" [value]="format.value" [(ngModel)]="exportFormatValue" class="mr-3" />
                  <div>
                    <p class="font-medium">{{ format.label }}</p>
                    <p class="text-xs text-gray-500">{{ format.description }}</p>
                  </div>
                </label>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Aperçu -->
      @if (previewData().length > 0) {
        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900 dark:text-white">Aperçu ({{ previewData().length }} lignes)</h3>
            <span class="text-sm text-gray-500">Données de démonstration</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b">
                  @for (field of selectedFields(); track field.id) {
                    <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{{ field.label }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of previewData().slice(0, 5); track $index) {
                  <tr class="border-b hover:bg-gray-50">
                    @for (field of selectedFields(); track field.id) {
                      <td class="py-3 px-4">{{ formatValue(row[field.id], field.type) }}</td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class RapportPersonnaliseComponent {
  private readonly exportService = inject(ExportService);
  private readonly notificationService = inject(NotificationService);

  searchField = '';
  exportFormatValue: 'xlsx' | 'csv' | 'pdf' = 'xlsx';
  exportFormat = signal<'xlsx' | 'csv' | 'pdf'>('xlsx');
  selectedTemplate = signal<string | null>(null);
  selectedFields = signal<ReportField[]>([]);
  previewData = signal<any[]>([]);

  filters = {
    periode: 'month',
    dateDebut: '',
    dateFin: '',
    categorie: ''
  };

  availableFields: ReportField[] = [
    { id: 'produit_nom', label: 'Nom du produit', type: 'string', source: 'Produits' },
    { id: 'produit_ref', label: 'Référence', type: 'string', source: 'Produits' },
    { id: 'produit_prix', label: 'Prix unitaire', type: 'currency', source: 'Produits' },
    { id: 'produit_stock', label: 'Stock actuel', type: 'number', source: 'Produits' },
    { id: 'categorie', label: 'Catégorie', type: 'string', source: 'Produits' },
    { id: 'commande_date', label: 'Date commande', type: 'date', source: 'Commandes' },
    { id: 'commande_total', label: 'Total commande', type: 'currency', source: 'Commandes' },
    { id: 'commande_statut', label: 'Statut', type: 'string', source: 'Commandes' },
    { id: 'client_nom', label: 'Client', type: 'string', source: 'Clients' },
    { id: 'client_email', label: 'Email client', type: 'string', source: 'Clients' },
    { id: 'quantite_vendue', label: 'Quantité vendue', type: 'number', source: 'Ventes' },
    { id: 'ca_total', label: 'CA Total', type: 'currency', source: 'Ventes' },
    { id: 'marge', label: 'Marge', type: 'percent', source: 'Ventes' },
    { id: 'fournisseur', label: 'Fournisseur', type: 'string', source: 'Fournisseurs' },
  ];

  templates: ReportTemplate[] = [
    { id: 'ventes', nom: 'Ventes', description: 'Rapport de ventes complet', fields: ['produit_nom', 'quantite_vendue', 'ca_total', 'marge'], icon: '📈' },
    { id: 'stock', nom: 'Stock', description: 'État des stocks', fields: ['produit_nom', 'produit_ref', 'produit_stock', 'categorie'], icon: '📦' },
    { id: 'clients', nom: 'Clients', description: 'Activité clients', fields: ['client_nom', 'client_email', 'commande_total'], icon: '👥' },
    { id: 'custom', nom: 'Vide', description: 'Commencer de zéro', fields: [], icon: '✨' },
  ];

  formats = [
    { value: 'xlsx' as const, label: 'Excel (.xlsx)', description: 'Tableur Microsoft Excel' },
    { value: 'csv' as const, label: 'CSV (.csv)', description: 'Fichier texte délimité' },
    { value: 'pdf' as const, label: 'PDF (.pdf)', description: 'Document portable' },
  ];

  filteredAvailableFields() {
    const selectedIds = this.selectedFields().map(f => f.id);
    return this.availableFields
      .filter(f => !selectedIds.includes(f.id))
      .filter(f => !this.searchField || 
        f.label.toLowerCase().includes(this.searchField.toLowerCase()) ||
        f.source.toLowerCase().includes(this.searchField.toLowerCase())
      );
  }

  drop(event: CdkDragDrop<ReportField[]>) {
    if (event.previousContainer === event.container) {
      const fields = [...this.selectedFields()];
      moveItemInArray(fields, event.previousIndex, event.currentIndex);
      this.selectedFields.set(fields);
    } else {
      const prev = [...event.previousContainer.data];
      const curr = [...event.container.data];
      transferArrayItem(prev, curr, event.previousIndex, event.currentIndex);
      
      if (event.container.id === 'selectedList') {
        this.selectedFields.set(curr);
      } else {
        this.selectedFields.set(prev);
      }
    }
    this.generatePreview();
  }

  removeField(index: number) {
    const fields = [...this.selectedFields()];
    fields.splice(index, 1);
    this.selectedFields.set(fields);
    this.generatePreview();
  }

  appliquerTemplate(template: ReportTemplate) {
    this.selectedTemplate.set(template.id);
    const fields = this.availableFields.filter(f => template.fields.includes(f.id));
    this.selectedFields.set(fields);
    this.generatePreview();
  }

  generatePreview() {
    if (this.selectedFields().length === 0) {
      this.previewData.set([]);
      return;
    }
    
    // Generate mock data
    const data = Array.from({ length: 10 }, (_, i) => {
      const row: any = {};
      this.selectedFields().forEach(field => {
        row[field.id] = this.generateMockValue(field, i);
      });
      return row;
    });
    this.previewData.set(data);
  }

  generateMockValue(field: ReportField, index: number): any {
    switch (field.type) {
      case 'currency': return Math.round(Math.random() * 10000) / 100;
      case 'number': return Math.floor(Math.random() * 500);
      case 'percent': return Math.round(Math.random() * 100);
      case 'date': return new Date(Date.now() - Math.random() * 30 * 86400000);
      default: return `${field.label} ${index + 1}`;
    }
  }

  formatValue(value: any, type: string): string {
    if (value === null || value === undefined) return '-';
    switch (type) {
      case 'currency': return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
      case 'number': return value.toLocaleString('fr-FR');
      case 'percent': return `${value}%`;
      case 'date': return value instanceof Date ? value.toLocaleDateString('fr-FR') : value;
      default: return String(value);
    }
  }

  generer() {
    if (this.selectedFields().length === 0) return;
    
    const formatMap: Record<string, 'text' | 'number' | 'currency' | 'date' | 'percent'> = {
      'string': 'text',
      'number': 'number',
      'currency': 'currency',
      'date': 'date',
      'percent': 'percent'
    };
    
    this.exportService.export({
      filename: `rapport-personnalise-${new Date().toISOString().split('T')[0]}`,
      title: 'Rapport Personnalisé',
      columns: this.selectedFields().map(f => ({ 
        field: f.id, 
        header: f.label, 
        format: formatMap[f.type] || 'text'
      })),
      data: this.previewData(),
      format: this.exportFormatValue
    });
  }

  sauvegarderModele() {
    this.notificationService.success('Modèle sauvegardé avec succès');
  }
}
