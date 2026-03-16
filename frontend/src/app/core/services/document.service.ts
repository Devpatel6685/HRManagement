import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentDto } from '../../models/document.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly base = `${environment.apiBaseUrl}/documents`;

  constructor(private http: HttpClient) {}

  getAllDocuments(): Observable<DocumentDto[]> {
    return this.http.get<DocumentDto[]>(this.base);
  }

  getEmployeeDocuments(employeeId: string): Observable<DocumentDto[]> {
    return this.http.get<DocumentDto[]>(`${this.base}/employee/${employeeId}`);
  }

  uploadDocument(employeeId: string, file: File, docType: string): Observable<DocumentDto> {
    const form = new FormData();
    form.append('file', file);
    form.append('docType', docType);
    return this.http.post<DocumentDto>(`${this.base}/employee/${employeeId}`, form);
  }

  downloadDocument(id: string): Observable<Blob> {
    return this.http.get(`${this.base}/${id}/download`, { responseType: 'blob' });
  }

  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
