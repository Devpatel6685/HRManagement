import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { RecruitmentService } from '../../../core/services/recruitment.service';
import { DepartmentService } from '../../../core/services/department.service';
import { JobPostingDto } from '../../../models/recruitment.model';
import { JobPostingDialogComponent } from './job-posting-dialog.component';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule, MatDialogModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule, MatChipsModule,
  ],
  template: `
    <div class="p-6">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Job Postings</h1>
          <p class="text-sm text-gray-500 mt-0.5">Manage open positions and applicants</p>
        </div>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon> New Job Posting
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 mb-6">
        <select [(ngModel)]="filterStatus" (ngModelChange)="load()" class="field-input w-40 text-sm py-1.5">
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="OnHold">On Hold</option>
          <option value="Closed">Closed</option>
        </select>
        <select [(ngModel)]="filterDept" (ngModelChange)="load()" class="field-input w-52 text-sm py-1.5">
          <option value="">All Departments</option>
          <option *ngFor="let d of departments" [value]="d.id">{{ d.name }}</option>
        </select>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-16"><mat-spinner diameter="36"></mat-spinner></div>

      <!-- Empty -->
      <div *ngIf="!loading && jobs.length === 0"
           class="flex flex-col items-center py-20 text-gray-400">
        <mat-icon style="font-size:3rem;width:3rem;height:3rem;" class="mb-3">work_outline</mat-icon>
        <p class="font-medium">No job postings found</p>
        <button mat-stroked-button color="primary" class="mt-4" (click)="openDialog()">Create First Posting</button>
      </div>

      <!-- Cards grid -->
      <div *ngIf="!loading && jobs.length > 0"
           class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <mat-card *ngFor="let job of jobs"
                  class="hover:shadow-md transition-shadow cursor-pointer"
                  (click)="openKanban(job)">
          <mat-card-content class="p-5">

            <!-- Status badge -->
            <div class="flex items-start justify-between mb-3">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    [ngClass]="statusClass(job.status)">
                {{ job.status }}
              </span>
              <div class="flex gap-1" (click)="$event.stopPropagation()">
                <button mat-icon-button matTooltip="Edit" (click)="openDialog(job)">
                  <mat-icon class="text-gray-400 text-[18px]">edit</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Close posting" *ngIf="job.status === 'Open'"
                        (click)="closeJob(job)">
                  <mat-icon class="text-gray-400 text-[18px]">lock</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Delete" (click)="deleteJob(job)">
                  <mat-icon class="text-red-400 text-[18px]">delete</mat-icon>
                </button>
              </div>
            </div>

            <h3 class="font-semibold text-gray-900 text-base leading-tight mb-1">{{ job.title }}</h3>
            <p class="text-sm text-gray-500 mb-3">{{ job.department }}</p>

            <p class="text-sm text-gray-600 line-clamp-2 mb-4">{{ job.description }}</p>

            <!-- Stats row -->
            <div class="flex items-center justify-between pt-3 border-t border-gray-100">
              <div class="flex items-center gap-1 text-sm text-gray-600">
                <mat-icon class="text-[16px] text-gray-400">people</mat-icon>
                <span>{{ job.applicantCount }} applicant{{ job.applicantCount !== 1 ? 's' : '' }}</span>
              </div>
              <div class="flex items-center gap-1 text-sm"
                   [ngClass]="job.openings > 0 ? 'text-green-600' : 'text-red-500'">
                <mat-icon class="text-[16px]">{{ job.openings > 0 ? 'check_circle' : 'cancel' }}</mat-icon>
                <span>{{ job.openings }} opening{{ job.openings !== 1 ? 's' : '' }}</span>
              </div>
            </div>

            <p class="text-xs text-gray-400 mt-2">
              Posted {{ job.postedOn + 'T00:00:00' | date:'MMM d, y' }}
              <ng-container *ngIf="job.closedOn">
                · Closed {{ job.closedOn + 'T00:00:00' | date:'MMM d, y' }}
              </ng-container>
            </p>

          </mat-card-content>
        </mat-card>
      </div>

    </div>
  `,
  styles: [`.line-clamp-2 { display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden; }`],
})
export class JobListComponent implements OnInit {
  jobs: JobPostingDto[] = [];
  departments: any[] = [];
  loading = false;
  filterStatus = '';
  filterDept = '';

  constructor(
    private recruitmentService: RecruitmentService,
    private departmentService: DepartmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.departmentService.getAll().subscribe({
      next: list => { this.departments = list; this.cdr.detectChanges(); },
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.recruitmentService.getJobs(
      this.filterStatus || undefined,
      this.filterDept || undefined,
    ).subscribe({
      next: list => { this.jobs = list; this.loading = false; this.cdr.detectChanges(); },
      error: ()  => { this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openDialog(job?: JobPostingDto): void {
    const ref = this.dialog.open(JobPostingDialogComponent, {
      width: '640px',
      data: { job, departments: this.departments },
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.load();
    });
  }

  openKanban(job: JobPostingDto): void {
    this.router.navigate(['/recruitment/pipeline', job.id]);
  }

  closeJob(job: JobPostingDto): void {
    if (!confirm(`Close "${job.title}"? No more applications will be accepted.`)) return;
    this.recruitmentService.closeJob(job.id).subscribe({
      next: () => { this.snackBar.open('Job posting closed.', 'OK', { duration: 3000 }); this.load(); },
      error: err => this.snackBar.open(err?.error?.error || 'Failed.', 'Close', { duration: 3000 }),
    });
  }

  deleteJob(job: JobPostingDto): void {
    if (!confirm(`Delete "${job.title}"? This will also delete all applicants.`)) return;
    this.recruitmentService.deleteJob(job.id).subscribe({
      next: () => { this.snackBar.open('Deleted.', 'OK', { duration: 3000 }); this.load(); },
      error: err => this.snackBar.open(err?.error?.error || 'Failed.', 'Close', { duration: 3000 }),
    });
  }

  statusClass(status: string): string {
    return {
      Open:   'bg-green-100 text-green-800',
      Closed: 'bg-gray-100 text-gray-600',
      OnHold: 'bg-yellow-100 text-yellow-800',
    }[status] ?? 'bg-gray-100 text-gray-600';
  }
}
