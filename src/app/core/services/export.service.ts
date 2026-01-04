/**
 * Service d'export (PDF, Excel, CSV)
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export type ExportFormat = 'pdf' | 'excel' | 'csv';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  private readonly http = inject(HttpClient);

  /**
   * Exporte des données
   */
  export(endpoint: string, format: ExportFormat, params?: Record<string, any>): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/${endpoint}/export`, {
      params: { format, ...params },
      responseType: 'blob',
    });
  }

  /**
   * Télécharge un fichier blob
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export et téléchargement combinés
   */
  exportAndDownload(endpoint: string, format: ExportFormat, filename: string, params?: Record<string, any>): void {
    this.export(endpoint, format, params).subscribe(blob => {
      const extension = format === 'excel' ? 'xlsx' : format;
      this.downloadBlob(blob, `${filename}.${extension}`);
    });
  }

  /**
   * Export CSV simple côté client
   */
  exportToCsv<T extends Record<string, any>>(data: T[], filename: string, columns?: { key: keyof T; label: string }[]): void {
    if (!data.length) return;

    const headers = columns 
      ? columns.map(c => c.label) 
      : Object.keys(data[0]);
    
    const keys = columns 
      ? columns.map(c => c.key as string) 
      : Object.keys(data[0]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        keys.map(key => {
          const value = row[key];
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value ?? '');
          return stringValue.includes(',') || stringValue.includes('"')
            ? `"${stringValue.replace(/"/g, '""')}"`
            : stringValue;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `${filename}.csv`);
  }
}
