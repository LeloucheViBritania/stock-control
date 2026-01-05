/**
 * Service d'export avancé (PREMIUM)
 * Génération PDF, Excel, CSV côté client
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { NotificationService } from './notification.service';

export interface ExportColumn {
  field: string;
  header: string;
  width?: number;
  format?: 'text' | 'number' | 'currency' | 'date' | 'percent';
}

export interface ExportConfig {
  filename: string;
  title?: string;
  columns: ExportColumn[];
  data: any[];
  format: 'xlsx' | 'csv' | 'pdf';
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);

  /**
   * Export vers CSV (natif)
   */
  exportToCSV(config: ExportConfig): void {
    const headers = config.columns.map(c => c.header).join(',');
    const rows = config.data.map(row => 
      config.columns.map(col => {
        let value = row[col.field];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          value = `"${value}"`;
        }
        return value;
      }).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `${config.filename}.csv`);
    this.notificationService.success('Export CSV téléchargé');
  }

  /**
   * Export vers Excel (via SheetJS)
   */
  async exportToExcel(config: ExportConfig): Promise<void> {
    try {
      const XLSX = await import('xlsx').catch(() => null);
      if (!XLSX) {
        this.notificationService.warning('Module Excel non disponible, export CSV à la place');
        this.exportToCSV({ ...config, format: 'csv' });
        return;
      }
      
      // Préparer les données
      const wsData = [
        config.columns.map(c => c.header),
        ...config.data.map(row => 
          config.columns.map(col => this.formatValue(row[col.field], col.format))
        )
      ];

      // Créer le workbook
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Données');

      // Définir les largeurs de colonnes
      ws['!cols'] = config.columns.map(c => ({ wch: c.width || 15 }));

      // Télécharger
      XLSX.writeFile(wb, `${config.filename}.xlsx`);
      this.notificationService.success('Export Excel téléchargé');
    } catch (error) {
      console.error('Erreur export Excel:', error);
      this.notificationService.error('Erreur lors de l\'export Excel');
    }
  }

  /**
   * Export vers PDF (via jsPDF)
   */
  async exportToPDF(config: ExportConfig): Promise<void> {
    try {
      const jsPDFModule = await import('jspdf').catch(() => null);
      const autoTableModule = await import('jspdf-autotable').catch(() => null);
      
      if (!jsPDFModule || !autoTableModule) {
        this.notificationService.warning('Module PDF non disponible, export CSV à la place');
        this.exportToCSV({ ...config, format: 'csv' });
        return;
      }
      
      const jsPDF = jsPDFModule.default;
      const autoTable = autoTableModule.default;

      const doc = new jsPDF({
        orientation: config.columns.length > 5 ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Titre
      if (config.title) {
        doc.setFontSize(16);
        doc.text(config.title, 14, 20);
      }

      // Tableau
      autoTable(doc, {
        head: [config.columns.map(c => c.header)],
        body: config.data.map(row => 
          config.columns.map(col => this.formatValue(row[col.field], col.format))
        ),
        startY: config.title ? 30 : 20,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [99, 102, 241], textColor: 255 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
      });

      // Date de génération
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Généré le ${new Date().toLocaleDateString('fr-FR')} - Page ${i}/${pageCount}`,
          14, doc.internal.pageSize.height - 10
        );
      }

      doc.save(`${config.filename}.pdf`);
      this.notificationService.success('Export PDF téléchargé');
    } catch (error) {
      console.error('Erreur export PDF:', error);
      this.notificationService.error('Erreur lors de l\'export PDF');
    }
  }

  /**
   * Export automatique selon le format
   */
  export(config: ExportConfig): void {
    switch (config.format) {
      case 'csv':
        this.exportToCSV(config);
        break;
      case 'xlsx':
        this.exportToExcel(config);
        break;
      case 'pdf':
        this.exportToPDF(config);
        break;
    }
  }

  private formatValue(value: any, format?: string): string {
    if (value === null || value === undefined) return '';
    
    switch (format) {
      case 'currency':
        return typeof value === 'number' ? value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : value;
      case 'number':
        return typeof value === 'number' ? value.toLocaleString('fr-FR') : value;
      case 'percent':
        return typeof value === 'number' ? `${value.toFixed(1)}%` : value;
      case 'date':
        return value instanceof Date ? value.toLocaleDateString('fr-FR') : value;
      default:
        return String(value);
    }
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
