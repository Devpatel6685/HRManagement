import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GeneratePayrollDto, GeneratePayrollResultDto, PayrollDto } from '../../models/payroll.model';

@Injectable({ providedIn: 'root' })
export class PayrollService {
  private readonly base = `${environment.apiBaseUrl}/payroll`;

  constructor(private http: HttpClient) {}

  generate(dto: GeneratePayrollDto): Observable<GeneratePayrollResultDto> {
    return this.http.post<GeneratePayrollResultDto>(`${this.base}/generate`, dto);
  }

  getAll(): Observable<PayrollDto[]> {
    return this.http.get<PayrollDto[]>(`${this.base}/all`);
  }

  getHistory(employeeId: string): Observable<PayrollDto[]> {
    return this.http.get<PayrollDto[]>(`${this.base}/employee/${employeeId}`);
  }

  markPaid(id: string): Observable<PayrollDto> {
    return this.http.put<PayrollDto>(`${this.base}/${id}/mark-paid`, {});
  }

  downloadPayslip(id: string): Observable<Blob> {
    return this.http.get(`${this.base}/${id}/download`, { responseType: 'blob' });
  }
}
