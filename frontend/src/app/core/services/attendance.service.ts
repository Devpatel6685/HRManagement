import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AttendanceDto, EmployeeMonthlySummaryDto, MonthlyReportDto, TeamSummaryDto } from '../../models/attendance.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly base = `${environment.apiBaseUrl}/attendance`;

  constructor(private http: HttpClient) {}

  checkIn(employeeId: string): Observable<AttendanceDto> {
    return this.http.post<AttendanceDto>(`${this.base}/check-in/${employeeId}`, {});
  }

  checkOut(employeeId: string): Observable<AttendanceDto> {
    return this.http.post<AttendanceDto>(`${this.base}/check-out/${employeeId}`, {});
  }

  startBreak(employeeId: string): Observable<AttendanceDto> {
    return this.http.post<AttendanceDto>(`${this.base}/break-start/${employeeId}`, {});
  }

  endBreak(employeeId: string): Observable<AttendanceDto> {
    return this.http.post<AttendanceDto>(`${this.base}/break-end/${employeeId}`, {});
  }

  getMonthlyReport(employeeId: string, month: number, year: number): Observable<MonthlyReportDto> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<MonthlyReportDto>(`${this.base}/monthly/${employeeId}`, { params });
  }

  getTeamSummary(departmentId: string, date: string): Observable<TeamSummaryDto[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<TeamSummaryDto[]>(`${this.base}/team/${departmentId}`, { params });
  }

  getManagerTeamDaily(managerId: string, date: string): Observable<TeamSummaryDto[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<TeamSummaryDto[]>(`${this.base}/manager/${managerId}/daily`, { params });
  }

  getCompanyDaily(date: string): Observable<TeamSummaryDto[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<TeamSummaryDto[]>(`${this.base}/company/daily`, { params });
  }

  getManagerTeamMonthly(managerId: string, month: number, year: number): Observable<EmployeeMonthlySummaryDto[]> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<EmployeeMonthlySummaryDto[]>(`${this.base}/manager/${managerId}/monthly`, { params });
  }

  getCompanyMonthly(month: number, year: number): Observable<EmployeeMonthlySummaryDto[]> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<EmployeeMonthlySummaryDto[]>(`${this.base}/company/monthly`, { params });
  }
}
