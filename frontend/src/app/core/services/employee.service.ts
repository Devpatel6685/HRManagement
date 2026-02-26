import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateEmployee,
  EmployeeDetail,
  EmployeeFilterParams,
  EmployeeListItem,
  PagedResult,
  UpdateEmployee,
} from '../../models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly base = `${environment.apiBaseUrl}/employees`;

  constructor(private http: HttpClient) {}

  getAll(filter: EmployeeFilterParams): Observable<PagedResult<EmployeeListItem>> {
    let params = new HttpParams()
      .set('page', filter.page)
      .set('pageSize', filter.pageSize);

    if (filter.search)       params = params.set('search', filter.search);
    if (filter.departmentId) params = params.set('departmentId', filter.departmentId);
    if (filter.status)       params = params.set('status', filter.status);

    return this.http.get<PagedResult<EmployeeListItem>>(this.base, { params });
  }

  getById(id: string): Observable<EmployeeDetail> {
    return this.http.get<EmployeeDetail>(`${this.base}/${id}`);
  }

  getMyProfile(): Observable<EmployeeDetail> {
    return this.http.get<EmployeeDetail>(`${this.base}/me`);
  }

  create(dto: CreateEmployee): Observable<EmployeeDetail> {
    return this.http.post<EmployeeDetail>(this.base, dto);
  }

  update(id: string, dto: UpdateEmployee): Observable<EmployeeDetail> {
    return this.http.put<EmployeeDetail>(`${this.base}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
