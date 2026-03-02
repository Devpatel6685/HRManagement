import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RecruitmentService } from '../../../core/services/recruitment.service';
import { JobPostingDto } from '../../../models/recruitment.model';

@Component({
  selector: 'app-job-posting-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatDialogModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-5">
        {{ isEdit ? 'Edit Job Posting' : 'Create Job Posting' }}
      </h2>

      <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Job Title <span class="text-red-500">*</span></label>
          <input formControlName="title" class="field-input" placeholder="e.g. Senior Software Engineer" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Department <span class="text-red-500">*</span></label>
            <select formControlName="departmentId" class="field-input">
              <option value="">Select department…</option>
              <option *ngFor="let d of data.departments" [value]="d.id">{{ d.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Openings <span class="text-red-500">*</span></label>
            <input type="number" formControlName="openings" class="field-input" min="1" />
          </div>
        </div>

        <div *ngIf="isEdit">
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
          <select formControlName="status" class="field-input">
            <option value="Open">Open</option>
            <option value="OnHold">On Hold</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Description <span class="text-red-500">*</span></label>
          <textarea formControlName="description" class="field-input" rows="3"
                    placeholder="Role overview and responsibilities…"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Requirements</label>
          <textarea formControlName="requirements" class="field-input" rows="3"
                    placeholder="Skills, experience, qualifications…"></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button type="button" mat-stroked-button (click)="dialogRef.close(false)">Cancel</button>
          <button type="submit" mat-raised-button color="primary"
                  [disabled]="form.invalid || saving">
            <mat-spinner *ngIf="saving" diameter="18" class="inline-block mr-1"></mat-spinner>
            {{ isEdit ? 'Save Changes' : 'Create Posting' }}
          </button>
        </div>

      </form>
    </div>
  `,
})
export class JobPostingDialogComponent implements OnInit {
  form!: FormGroup;
  saving = false;
  isEdit = false;

  constructor(
    public dialogRef: MatDialogRef<JobPostingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { job?: JobPostingDto; departments: any[] },
    private fb: FormBuilder,
    private recruitmentService: RecruitmentService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data.job;
    this.form = this.fb.group({
      title:        [this.data.job?.title        ?? '', Validators.required],
      departmentId: [this.data.job?.departmentId ?? '', Validators.required],
      openings:     [this.data.job?.openings     ?? 1,  [Validators.required, Validators.min(1)]],
      status:       [this.data.job?.status       ?? 'Open'],
      description:  [this.data.job?.description  ?? '', Validators.required],
      requirements: [this.data.job?.requirements ?? ''],
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;

    const obs$ = this.isEdit
      ? this.recruitmentService.updateJob(this.data.job!.id, v)
      : this.recruitmentService.createJob(v);

    obs$.subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open(this.isEdit ? 'Job posting updated.' : 'Job posting created.', 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: err => {
        this.saving = false;
        this.snackBar.open(err?.error?.error || 'Failed.', 'Close', { duration: 3000 });
      },
    });
  }
}
