/**
 * Service API générique
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    const httpParams = this.buildParams(params);
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params: httpParams });
  }

  /**
   * GET request avec pagination
   */
  getPaginated<T>(endpoint: string, pagination?: PaginationParams, filters?: Record<string, any>): Observable<PaginatedResponse<T>> {
    const params = {
      ...filters,
      page: pagination?.page || 1,
      limit: pagination?.limit || 20,
      ...(pagination?.sortBy && { sortBy: pagination.sortBy }),
      ...(pagination?.sortOrder && { sortOrder: pagination.sortOrder }),
    };
    return this.get<PaginatedResponse<T>>(endpoint, params);
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`);
  }

  /**
   * Upload de fichier
   */
  upload<T>(endpoint: string, file: File, fieldName: string = 'file'): Observable<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, formData);
  }

  /**
   * Upload multiple files
   */
  uploadMultiple<T>(endpoint: string, files: File[], fieldName: string = 'files'): Observable<T> {
    const formData = new FormData();
    files.forEach(file => formData.append(fieldName, file));
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, formData);
  }

  /**
   * Download file
   */
  download(endpoint: string, filename: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${endpoint}`, {
      responseType: 'blob',
    });
  }

  /**
   * Construit les HttpParams
   */
  private buildParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => {
              httpParams = httpParams.append(key, v.toString());
            });
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }

    return httpParams;
  }
}
