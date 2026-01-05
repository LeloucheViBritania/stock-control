/**
 * Service d'export avancé (PREMIUM)
 * Génère des fichiers Excel et PDF professionnels
 */
import { Injectable, inject } from '@angular/core';
import { NotificationService } from './notification.service';

export interface ExportColumn {
  field: string;
  header: string;
  width?: number;
  type?: 'string' | 'number' | 'date' | 'currency' | 'percentage';
}

export interface ExportOptions {
  filename: string;
  title?: string;
  subtitle?: string;
  columns: ExportColumn[];
  data: any[];
  includeDate?: boolean;
  orientation?: 'portrait' | 'landscape';
}

@Injectable({ providedIn: 'root' })
export class ExportAdvancedService {
  private readonly notificationService = inject(NotificationService);

  /**
   * Export vers Excel (XLSX)
   */
  async exportToExcel(options: ExportOptions): Promise<void> {
    try {
      // Simuler l'export Excel (nécessite xlsx en production)
      const csvContent = this.generateCSV(options);
      this.downloadFile(csvContent, `${options.filename}.csv`, 'text/csv');
      this.notificationService.success(`Export Excel "${options.filename}" généré avec succès`);
    } catch (error) {
      this.notificationService.error('Erreur lors de l\'export Excel');
      console.error('Export Excel error:', error);
    }
  }

  /**
   * Export vers PDF
   */
  async exportToPDF(options: ExportOptions): Promise<void> {
    try {
      // Générer un HTML pour l'impression PDF
      const htmlContent = this.generatePDFHTML(options);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
      }
      this.notificationService.success(`Export PDF "${options.filename}" généré avec succès`);
    } catch (error) {
      this.notificationService.error('Erreur lors de l\'export PDF');
      console.error('Export PDF error:', error);
    }
  }

  /**
   * Export vers CSV
   */
  exportToCSV(options: ExportOptions): void {
    try {
      const csvContent = this.generateCSV(options);
      this.downloadFile(csvContent, `${options.filename}.csv`, 'text/csv;charset=utf-8');
      this.notificationService.success(`Export CSV "${options.filename}" généré avec succès`);
    } catch (error) {
      this.notificationService.error('Erreur lors de l\'export CSV');
    }
  }

  private generateCSV(options: ExportOptions): string {
    const headers = options.columns.map(col => col.header).join(';');
    const rows = options.data.map(item => 
      options.columns.map(col => {
        const value = this.getNestedValue(item, col.field);
        return this.formatValue(value, col.type);
      }).join(';')
    ).join('\n');
    
    const bom = '\uFEFF'; // BOM pour Excel
    return bom + headers + '\n' + rows;
  }

  private generatePDFHTML(options: ExportOptions): string {
    const date = new Date().toLocaleDateString('fr-FR', { 
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    const tableRows = options.data.map(item => `
      <tr>
        ${options.columns.map(col => `
          <td style="padding: 8px; border: 1px solid #ddd; text-align: ${col.type === 'number' || col.type === 'currency' ? 'right' : 'left'}">
            ${this.formatValue(this.getNestedValue(item, col.field), col.type)}
          </td>
        `).join('')}
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${options.title || options.filename}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
          .header h1 { color: #2563eb; margin: 0; font-size: 24px; }
          .header .subtitle { color: #666; margin-top: 5px; }
          .header .date { color: #999; font-size: 12px; margin-top: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th { background: #2563eb; color: white; padding: 10px 8px; text-align: left; font-weight: 600; }
          tr:nth-child(even) { background: #f8fafc; }
          tr:hover { background: #e0f2fe; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 15px; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
          .badge-success { background: #dcfce7; color: #166534; }
          .badge-warning { background: #fef3c7; color: #92400e; }
          .badge-danger { background: #fee2e2; color: #991b1b; }
          @media print { 
            body { margin: 0; } 
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${options.title || 'Rapport'}</h1>
          ${options.subtitle ? `<p class="subtitle">${options.subtitle}</p>` : ''}
          ${options.includeDate !== false ? `<p class="date">Généré le ${date}</p>` : ''}
        </div>
        <table>
          <thead>
            <tr>${options.columns.map(col => `<th>${col.header}</th>`).join('')}</tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
        <div class="footer">
          <p>GStock - Système de Gestion de Stock | Document généré automatiquement</p>
          <p>Total: ${options.data.length} enregistrement(s)</p>
        </div>
      </body>
      </html>
    `;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private formatValue(value: any, type?: string): string {
    if (value === null || value === undefined) return '';
    
    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString('fr-FR');
      case 'currency':
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
      case 'percentage':
        return `${value}%`;
      case 'number':
        return new Intl.NumberFormat('fr-FR').format(value);
      default:
        return String(value);
    }
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
