import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateDepartment,
  CreateDesignation,
  Department,
  DepartmentDetail,
  DepartmentListItem,
  Designation,
  DesignationListItem,
  UpdateDepartment,
  UpdateDesignation,
} from '../../models/department.model';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly base     = `${environment.apiBaseUrl}/departments`;
  private readonly desigBase = `${environment.apiBaseUrl}/designations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>(this.base);
  }

  getDesignations(departmentId: string): Observable<Designation[]> {
    return this.http.get<Designation[]>(`${this.base}/${departmentId}/designations`);
  }

  getAllWithCount(): Observable<DepartmentListItem[]> {
    return this.http.get<DepartmentListItem[]>(`${this.base}/list`);
  }

  getById(id: string): Observable<DepartmentDetail> {
    return this.http.get<DepartmentDetail>(`${this.base}/${id}`);
  }

  create(dto: CreateDepartment): Observable<DepartmentDetail> {
    return this.http.post<DepartmentDetail>(this.base, dto);
  }

  update(id: string, dto: UpdateDepartment): Observable<DepartmentDetail> {
    return this.http.put<DepartmentDetail>(`${this.base}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getAllDesignations(departmentId?: string): Observable<DesignationListItem[]> {
    let params = new HttpParams();
    if (departmentId) params = params.set('departmentId', departmentId);
    return this.http.get<DesignationListItem[]>(this.desigBase, { params });
  }

  createDesignation(dto: CreateDesignation): Observable<DesignationListItem> {
    return this.http.post<DesignationListItem>(this.desigBase, dto);
  }

  updateDesignation(id: string, dto: UpdateDesignation): Observable<DesignationListItem> {
    return this.http.put<DesignationListItem>(`${this.desigBase}/${id}`, dto);
  }

  deleteDesignation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.desigBase}/${id}`);
  }
}
