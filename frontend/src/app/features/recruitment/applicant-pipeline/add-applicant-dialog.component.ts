import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RecruitmentService } from '../../../core/services/recruitment.service';

@Component({
  selector: 'app-add-applicant-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatDialogModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-5">Add Applicant</h2>

      <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span class="text-red-500">*</span></label>
          <input formControlName="name" class="field-input" placeholder="John Doe" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Email <span class="text-red-500">*</span></label>
          <input type="email" formControlName="email" class="field-input" placeholder="john@example.com" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
          <input type="tel" formControlName="phone" class="field-input" placeholder="+91 98765 43210" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Resume (PDF)</label>
          <input type="file" accept=".pdf,.doc,.docx" (change)="onFileChange($event)"
                 class="block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          <p *ngIf="selectedFile" class="text-xs text-green-600 mt-1">{{ selectedFile.name }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
          <textarea formControlName="notes" class="field-input" rows="2" placeholder="Initial observations…"></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button type="button" mat-stroked-button (click)="dialogRef.close(false)">Cancel</button>
          <button type="submit" mat-raised-button color="primary" [disabled]="form.invalid || saving">
            <mat-spinner *ngIf="saving" diameter="18" class="inline-block mr-1"></mat-spinner>
            Add Applicant
          </button>
        </div>

      </form>
    </div>
  `,
})
export class AddApplicantDialogComponent {
  form: FormGroup;
  saving = false;
  selectedFile: File | null = null;

  constructor(
    public dialogRef: MatDialogRef<AddApplicantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { jobId: string },
    private fb: FormBuilder,
    private recruitmentService: RecruitmentService,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      name:  ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      notes: [''],
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;

    const fd = new FormData();
    fd.append('name',  this.form.value.name);
    fd.append('email', this.form.value.email);
    if (this.form.value.phone) fd.append('phone', this.form.value.phone);
    if (this.form.value.notes) fd.append('notes', this.form.value.notes);
    if (this.selectedFile)     fd.append('resume', this.selectedFile);

    this.recruitmentService.addApplicant(this.data.jobId, fd).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Applicant added.', 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: err => {
        this.saving = false;
        this.snackBar.open(err?.error?.error || 'Failed.', 'Close', { duration: 3000 });
      },
    });
  }
}
