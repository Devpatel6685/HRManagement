import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RecruitmentService } from '../../../core/services/recruitment.service';
import { ApplicantDto, ApplicantStatus } from '../../../models/recruitment.model';

@Component({
  selector: 'app-applicant-detail-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="p-6">

      <!-- Header -->
      <div class="flex items-start justify-between mb-5">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">{{ app.name }}</h2>
          <p class="text-sm text-gray-500">{{ app.jobTitle }}</p>
        </div>
        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              [ngClass]="statusClass(app.status)">
          {{ app.status }}
        </span>
      </div>

      <!-- Info grid -->
      <div class="grid grid-cols-2 gap-3 mb-5 text-sm">
        <div class="bg-gray-50 rounded-xl p-3">
          <p class="text-xs text-gray-500 mb-0.5">Email</p>
          <p class="font-medium text-gray-900 break-all">{{ app.email }}</p>
        </div>
        <div class="bg-gray-50 rounded-xl p-3">
          <p class="text-xs text-gray-500 mb-0.5">Phone</p>
          <p class="font-medium text-gray-900">{{ app.phone || '—' }}</p>
        </div>
        <div class="bg-gray-50 rounded-xl p-3">
          <p class="text-xs text-gray-500 mb-0.5">Applied On</p>
          <p class="font-medium text-gray-900">{{ app.appliedOn + 'T00:00:00' | date:'MMM d, y' }}</p>
        </div>
        <div class="bg-gray-50 rounded-xl p-3">
          <p class="text-xs text-gray-500 mb-0.5">Resume</p>
          <button *ngIf="app.hasResume" mat-stroked-button class="text-xs px-2 py-0.5 h-auto min-h-0"
                  (click)="viewResume()">
            <mat-icon class="text-[14px]">open_in_new</mat-icon> View
          </button>
          <p *ngIf="!app.hasResume" class="font-medium text-gray-400">No resume</p>
        </div>
      </div>

      <!-- Notes -->
      <div class="mb-5">
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Interview Notes</label>
        <textarea [(ngModel)]="notes" class="field-input" rows="4"
                  placeholder="Add notes about this applicant…"></textarea>
      </div>

      <!-- Status change -->
      <div class="mb-5">
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Update Status</label>
        <select [(ngModel)]="selectedStatus" class="field-input">
          <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
        </select>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <button mat-stroked-button (click)="dialogRef.close(false)">Close</button>
        <button mat-raised-button color="primary" [disabled]="saving" (click)="save()">
          <mat-spinner *ngIf="saving" diameter="18" class="inline-block mr-1"></mat-spinner>
          Save
        </button>
      </div>

    </div>
  `,
})
export class ApplicantDetailDialogComponent implements OnInit {
  app: ApplicantDto;
  notes = '';
  selectedStatus: ApplicantStatus = 'Applied';
  saving = false;

  readonly statuses: ApplicantStatus[] = [
    'Applied', 'Shortlisted', 'Interviewed', 'Offered', 'Hired', 'Rejected',
  ];

  constructor(
    public dialogRef: MatDialogRef<ApplicantDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { applicant: ApplicantDto; jobId: string },
    private recruitmentService: RecruitmentService,
    private snackBar: MatSnackBar,
  ) {
    this.app = data.applicant;
  }

  ngOnInit(): void {
    this.notes          = this.app.notes ?? '';
    this.selectedStatus = this.app.status;
  }

  viewResume(): void {
    window.open(this.recruitmentService.getResumeUrl(this.app.id), '_blank');
  }

  save(): void {
    this.saving = true;
    const isHire = this.selectedStatus === 'Hired' && this.app.status !== 'Hired';
    if (isHire) {
      const ok = confirm(
        `Hiring "${this.app.name}" will automatically create an employee account and send a welcome email. Continue?`
      );
      if (!ok) { this.saving = false; return; }
    }

    this.recruitmentService.updateStatus(this.app.id, {
      status: this.selectedStatus,
      notes: this.notes,
    }).subscribe({
      next: () => {
        this.saving = false;
        if (isHire)
          this.snackBar.open('Applicant hired! Employee account created.', 'OK', { duration: 5000 });
        else
          this.snackBar.open('Updated.', 'OK', { duration: 2000 });
        this.dialogRef.close(true);
      },
      error: err => {
        this.saving = false;
        this.snackBar.open(err?.error?.error || 'Failed.', 'Close', { duration: 4000 });
      },
    });
  }

  statusClass(status: string): string {
    return ({
      Applied:     'bg-indigo-100 text-indigo-800',
      Shortlisted: 'bg-yellow-100 text-yellow-800',
      Interviewed: 'bg-pink-100 text-pink-800',
      Offered:     'bg-green-100 text-green-800',
      Hired:       'bg-emerald-100 text-emerald-800',
      Rejected:    'bg-red-100 text-red-800',
    } as Record<string, string>)[status] ?? 'bg-gray-100 text-gray-600';
  }
}
