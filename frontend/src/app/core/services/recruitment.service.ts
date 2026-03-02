import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  JobPostingDto, CreateJobPostingDto, UpdateJobPostingDto,
  ApplicantDto, KanbanBoardDto, UpdateApplicantStatusDto,
} from '../../models/recruitment.model';

@Injectable({ providedIn: 'root' })
export class RecruitmentService {
  private readonly jobs = `${environment.apiBaseUrl}/job-postings`;
  private readonly apps = `${environment.apiBaseUrl}/applicants`;

  constructor(private http: HttpClient) {}

  // ── Job Postings ─────────────────────────────────────────────────────

  getJobs(status?: string, departmentId?: string): Observable<JobPostingDto[]> {
    let params = new HttpParams();
    if (status)       params = params.set('status', status);
    if (departmentId) params = params.set('departmentId', departmentId);
    return this.http.get<JobPostingDto[]>(this.jobs, { params });
  }

  getJob(id: string): Observable<JobPostingDto> {
    return this.http.get<JobPostingDto>(`${this.jobs}/${id}`);
  }

  createJob(dto: CreateJobPostingDto): Observable<JobPostingDto> {
    return this.http.post<JobPostingDto>(this.jobs, dto);
  }

  updateJob(id: string, dto: UpdateJobPostingDto): Observable<JobPostingDto> {
    return this.http.put<JobPostingDto>(`${this.jobs}/${id}`, dto);
  }

  closeJob(id: string): Observable<void> {
    return this.http.put<void>(`${this.jobs}/${id}/close`, {});
  }

  deleteJob(id: string): Observable<void> {
    return this.http.delete<void>(`${this.jobs}/${id}`);
  }

  // ── Applicants ───────────────────────────────────────────────────────

  addApplicant(jobId: string, formData: FormData): Observable<ApplicantDto> {
    return this.http.post<ApplicantDto>(`${this.apps}/job/${jobId}`, formData);
  }

  getKanban(jobId: string): Observable<KanbanBoardDto> {
    return this.http.get<KanbanBoardDto>(`${this.apps}/job/${jobId}/kanban`);
  }

  getApplicantsByJob(jobId: string): Observable<ApplicantDto[]> {
    return this.http.get<ApplicantDto[]>(`${this.apps}/job/${jobId}`);
  }

  getApplicant(id: string): Observable<ApplicantDto> {
    return this.http.get<ApplicantDto>(`${this.apps}/${id}`);
  }

  updateStatus(id: string, dto: UpdateApplicantStatusDto): Observable<ApplicantDto> {
    return this.http.put<ApplicantDto>(`${this.apps}/${id}/status`, dto);
  }

  getResumeUrl(id: string): string {
    return `${environment.apiBaseUrl}/applicants/${id}/resume`;
  }
}
