import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PerformanceReviewDto, AddReviewDto, AverageRatingDto } from '../../models/performance.model';

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private readonly base = `${environment.apiBaseUrl}/performance-reviews`;

  constructor(private http: HttpClient) {}

  addReview(dto: AddReviewDto): Observable<PerformanceReviewDto> {
    return this.http.post<PerformanceReviewDto>(this.base, dto);
  }

  getEmployeeReviews(employeeId: string): Observable<PerformanceReviewDto[]> {
    return this.http.get<PerformanceReviewDto[]>(`${this.base}/employee/${employeeId}`);
  }

  getAverageRating(employeeId: string): Observable<AverageRatingDto> {
    return this.http.get<AverageRatingDto>(`${this.base}/employee/${employeeId}/average`);
  }

  getAllReviews(): Observable<PerformanceReviewDto[]> {
    return this.http.get<PerformanceReviewDto[]>(this.base);
  }

  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
