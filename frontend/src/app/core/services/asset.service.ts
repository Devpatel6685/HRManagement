import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AssetDto, CreateAssetDto, UpdateAssetDto, AssignAssetDto } from '../../models/asset.model';

@Injectable({ providedIn: 'root' })
export class AssetService {
  private readonly base = `${environment.apiBaseUrl}/assets`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AssetDto[]> {
    return this.http.get<AssetDto[]>(this.base);
  }

  getAvailable(): Observable<AssetDto[]> {
    return this.http.get<AssetDto[]>(`${this.base}/available`);
  }

  getEmployeeAssets(employeeId: string): Observable<AssetDto[]> {
    return this.http.get<AssetDto[]>(`${this.base}/employee/${employeeId}`);
  }

  create(dto: CreateAssetDto): Observable<AssetDto> {
    return this.http.post<AssetDto>(this.base, dto);
  }

  update(id: string, dto: UpdateAssetDto): Observable<AssetDto> {
    return this.http.put<AssetDto>(`${this.base}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  assign(id: string, dto: AssignAssetDto): Observable<AssetDto> {
    return this.http.put<AssetDto>(`${this.base}/${id}/assign`, dto);
  }

  return(id: string): Observable<AssetDto> {
    return this.http.put<AssetDto>(`${this.base}/${id}/return`, {});
  }

  changeStatus(id: string, status: string): Observable<AssetDto> {
    return this.http.put<AssetDto>(`${this.base}/${id}/status`, { status });
  }
}
