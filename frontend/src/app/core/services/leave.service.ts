import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplyLeaveDto, LeaveBalanceDto, LeaveRequestDto } from '../../models/leave.model';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private readonly base = `${environment.apiBaseUrl}/leave`;

  constructor(private http: HttpClient) {}

  applyLeave(employeeId: string, dto: ApplyLeaveDto): Observable<LeaveRequestDto> {
    return this.http.post<LeaveRequestDto>(`${this.base}/apply/${employeeId}`, dto);
  }

  approveLeave(requestId: string, approverId: string): Observable<LeaveRequestDto> {
    const params = new HttpParams().set('approverId', approverId);
    return this.http.post<LeaveRequestDto>(`${this.base}/${requestId}/approve`, {}, { params });
  }

  rejectLeave(requestId: string, approverId: string, reason: string): Observable<LeaveRequestDto> {
    const params = new HttpParams().set('approverId', approverId);
    return this.http.post<LeaveRequestDto>(`${this.base}/${requestId}/reject`, { reason }, { params });
  }

  getRequests(employeeId: string): Observable<LeaveRequestDto[]> {
    return this.http.get<LeaveRequestDto[]>(`${this.base}/requests/${employeeId}`);
  }

  getPendingRequests(approverId: string): Observable<LeaveRequestDto[]> {
    const params = new HttpParams().set('approverId', approverId);
    return this.http.get<LeaveRequestDto[]>(`${this.base}/pending`, { params });
  }

  getBalance(employeeId: string, year: number): Observable<LeaveBalanceDto[]> {
    const params = new HttpParams().set('year', year);
    return this.http.get<LeaveBalanceDto[]>(`${this.base}/balance/${employeeId}`, { params });
  }
}
