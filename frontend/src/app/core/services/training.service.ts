import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TrainingDto,
  CreateTrainingDto,
  EmployeeTrainingDto,
  AssignEmployeesDto,
  MarkCompletedDto,
} from '../../models/training.model';

@Injectable({ providedIn: 'root' })
export class TrainingService {
  private readonly base = `${environment.apiBaseUrl}/trainings`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<TrainingDto[]> {
    return this.http.get<TrainingDto[]>(this.base);
  }

  getUpcoming(): Observable<TrainingDto[]> {
    return this.http.get<TrainingDto[]>(`${this.base}/upcoming`);
  }

  create(dto: CreateTrainingDto): Observable<TrainingDto> {
    return this.http.post<TrainingDto>(this.base, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  assignEmployees(trainingId: string, dto: AssignEmployeesDto): Observable<EmployeeTrainingDto[]> {
    return this.http.post<EmployeeTrainingDto[]>(`${this.base}/${trainingId}/assign`, dto);
  }

  markCompleted(etId: string, dto: MarkCompletedDto): Observable<EmployeeTrainingDto> {
    return this.http.post<EmployeeTrainingDto>(`${this.base}/employee-trainings/${etId}/complete`, dto);
  }

  getMyTrainings(employeeId: string): Observable<EmployeeTrainingDto[]> {
    return this.http.get<EmployeeTrainingDto[]>(`${this.base}/my/${employeeId}`);
  }
}
