/**
 * Service d'import de données (PREMIUM)
 */
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, Subject, map } from 'rxjs';
import { environment } from '@env/environment';
import { NotificationService } from './notification.service';

export interface ImportMapping {
  sourceColumn: string;
  targetField: string;
  transform?: 'text' | 'number' | 'date' | 'boolean';
  required?: boolean;
}

export interface ImportConfig {
  type: 'produits' | 'clients' | 'fournisseurs' | 'stock';
  mappings: ImportMapping[];
  skipFirstRow: boolean;
  updateExisting: boolean;
  dryRun: boolean;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  importedRows: number;
  updatedRows: number;
  skippedRows: number;
  errors: { row: number; field: string; message: string }[];
  warnings: { row: number; message: string }[];
}

export interface ImportProgress {
  phase: 'upload' | 'validation' | 'import' | 'complete';
  progress: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ImportService {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);
  private readonly apiUrl = `${environment.apiUrl}/import`;

  readonly progress = signal<ImportProgress | null>(null);

  /**
   * Parse un fichier CSV/Excel côté client
   */
  async parseFile(file: File): Promise<{ headers: string[]; rows: any[]; preview: any[] }> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      return this.parseCSV(file);
    } else if (extension === 'xlsx' || extension === 'xls') {
      return this.parseExcel(file);
    }

    throw new Error('Format de fichier non supporté');
  }

  private async parseCSV(file: File): Promise<{ headers: string[]; rows: any[]; preview: any[] }> {
    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((h, i) => row[h] = values[i] || '');
      return row;
    });

    return { headers, rows, preview: rows.slice(0, 5) };
  }

  private async parseExcel(file: File): Promise<{ headers: string[]; rows: any[]; preview: any[] }> {
    // Excel requiert une bibliothèque externe - suggérer CSV
    this.notificationService.warning('Format Excel non supporté nativement. Veuillez convertir en CSV.');
    throw new Error('Format Excel non supporté. Utilisez le format CSV.');
  }

  /**
   * Valider les données avant import
   */
  validateData(rows: any[], mappings: ImportMapping[]): { valid: boolean; errors: any[] } {
    const errors: any[] = [];
    const requiredFields = mappings.filter(m => m.required);

    rows.forEach((row, index) => {
      requiredFields.forEach(field => {
        const value = row[field.sourceColumn];
        if (!value && value !== 0) {
          errors.push({
            row: index + 2, // +2 pour header + index 0
            field: field.targetField,
            message: `Champ requis "${field.targetField}" manquant`
          });
        }
      });
    });

    return { valid: errors.length === 0, errors };
  }

  /**
   * Exécuter l'import
   */
  import(file: File, config: ImportConfig): Observable<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('config', JSON.stringify(config));

    this.progress.set({ phase: 'upload', progress: 0, message: 'Upload du fichier...' });

    const req = new HttpRequest('POST', `${this.apiUrl}/${config.type}`, formData, {
      reportProgress: true
    });

    return this.http.request(req).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const uploadProgress = event.total ? Math.round(100 * event.loaded / event.total) : 0;
            this.progress.set({ phase: 'upload', progress: uploadProgress, message: 'Upload en cours...' });
            return null;
          case HttpEventType.Response:
            this.progress.set({ phase: 'complete', progress: 100, message: 'Import terminé' });
            return event.body as ImportResult;
          default:
            return null;
        }
      })
    ) as Observable<ImportResult>;
  }

  /**
   * Télécharger un modèle d'import
   */
  downloadTemplate(type: 'produits' | 'clients' | 'fournisseurs' | 'stock'): void {
    const templates: Record<string, { headers: string[]; example: any[] }> = {
      produits: {
        headers: ['reference', 'nom', 'description', 'categorie', 'prix_achat', 'prix_vente', 'quantite_stock', 'seuil_alerte'],
        example: [
          { reference: 'PROD-001', nom: 'Produit exemple', description: 'Description du produit', categorie: 'Catégorie 1', prix_achat: 10.00, prix_vente: 15.00, quantite_stock: 100, seuil_alerte: 10 }
        ]
      },
      clients: {
        headers: ['nom', 'email', 'telephone', 'adresse', 'ville', 'code_postal', 'pays', 'type'],
        example: [
          { nom: 'Client exemple', email: 'client@example.com', telephone: '0123456789', adresse: '123 Rue Example', ville: 'Paris', code_postal: '75001', pays: 'France', type: 'PARTICULIER' }
        ]
      },
      fournisseurs: {
        headers: ['nom', 'email', 'telephone', 'adresse', 'ville', 'pays', 'siret', 'contact_nom'],
        example: [
          { nom: 'Fournisseur exemple', email: 'fournisseur@example.com', telephone: '0123456789', adresse: '456 Avenue Example', ville: 'Lyon', pays: 'France', siret: '12345678900001', contact_nom: 'Jean Dupont' }
        ]
      },
      stock: {
        headers: ['reference_produit', 'quantite', 'entrepot', 'zone', 'emplacement'],
        example: [
          { reference_produit: 'PROD-001', quantite: 50, entrepot: 'Paris', zone: 'A1', emplacement: 'R1-E1' }
        ]
      }
    };

    const template = templates[type];
    if (!template) return;

    // Générer CSV
    const csv = [
      template.headers.join(','),
      template.example.map(row => template.headers.map(h => row[h] ?? '').join(',')).join('\n')
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modele_import_${type}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    this.notificationService.success('Modèle téléchargé');
  }
}
