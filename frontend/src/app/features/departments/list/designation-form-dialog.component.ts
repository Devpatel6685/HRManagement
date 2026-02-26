import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DepartmentService } from '../../../core/services/department.service';
import { Department, DesignationListItem } from '../../../models/department.model';

export interface DesignationFormDialogData {
  designation: DesignationListItem | null;
  preselectedDepartmentId?: string;
}

const LEVEL_OPTIONS = [
  { value: 1, label: 'Level 1 — Junior'  },
  { value: 2, label: 'Level 2 — Mid'     },
  { value: 3, label: 'Level 3 — Senior'  },
  { value: 4, label: 'Level 4 — Lead'    },
  { value: 5, label: 'Level 5 — Manager' },
];

@Component({
  selector: 'app-designation-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div mat-dialog-title class="flex items-center gap-3 pb-2">
      <div class="flex items-center justify-center w-9 h-9 rounded-full bg-purple-100">
        <mat-icon class="text-purple-600" style="font-size:1.25rem;width:1.25rem;height:1.25rem;line-height:1.25rem;">
          badge
        </mat-icon>
      </div>
      <span class="text-lg font-semibold text-gray-900">
        {{ data.designation ? 'Edit Designation' : 'Add Designation' }}
      </span>
    </div>

    <mat-dialog-content class="py-4">
      <form [formGroup]="form" class="space-y-4" style="min-width:360px">

        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <mat-icon class="field-icon">badge</mat-icon>
            </span>
            <input formControlName="title" placeholder="e.g. Software Engineer"
              class="field-input"
              [class.field-input--error]="form.get('title')?.invalid && form.get('title')?.touched" />
          </div>
          <p *ngIf="form.get('title')?.invalid && form.get('title')?.touched"
             class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <mat-icon style="font-size:0.85rem;width:0.85rem;height:0.85rem;">error_outline</mat-icon>
            Title is required
          </p>
        </div>

        <!-- Department -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <mat-icon class="field-icon">business</mat-icon>
            </span>
            <select formControlName="departmentId" class="field-input"
              [class.field-input--error]="form.get('departmentId')?.invalid && form.get('departmentId')?.touched">
              <option value="">— Select Department —</option>
              <option *ngFor="let d of departments" [value]="d.id">{{ d.name }}</option>
            </select>
          </div>
          <p *ngIf="form.get('departmentId')?.invalid && form.get('departmentId')?.touched"
             class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <mat-icon style="font-size:0.85rem;width:0.85rem;height:0.85rem;">error_outline</mat-icon>
            Department is required
          </p>
        </div>

        <!-- Level -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Level</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <mat-icon class="field-icon">stairs</mat-icon>
            </span>
            <select formControlName="level" class="field-input"
              [class.field-input--error]="form.get('level')?.invalid && form.get('level')?.touched">
              <option value="">— Select Level —</option>
              <option *ngFor="let l of levelOptions" [value]="l.value">{{ l.label }}</option>
            </select>
          </div>
          <p *ngIf="form.get('level')?.invalid && form.get('level')?.touched"
             class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <mat-icon style="font-size:0.85rem;width:0.85rem;height:0.85rem;">error_outline</mat-icon>
            Level is required
          </p>
        </div>

        <!-- Error -->
        <p *ngIf="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {{ errorMessage }}
        </p>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="gap-2 pt-2">
      <button mat-stroked-button [mat-dialog-close]="null" class="rounded-lg" [disabled]="isSaving">
        Cancel
      </button>
      <button mat-raised-button color="primary" class="rounded-lg" (click)="save()" [disabled]="isSaving || form.invalid">
        <mat-spinner *ngIf="isSaving" diameter="18" class="mr-1"></mat-spinner>
        <mat-icon *ngIf="!isSaving">save</mat-icon>
        {{ data.designation ? 'Save Changes' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`:host { display: block; }`],
})
export class DesignationFormDialogComponent implements OnInit {
  form!: FormGroup;
  departments: Department[] = [];
  readonly levelOptions = LEVEL_OPTIONS;
  isSaving = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private deptService: DepartmentService,
    public dialogRef: MatDialogRef<DesignationFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DesignationFormDialogData,
  ) {}

  ngOnInit(): void {
    const desig = this.data.designation;
    this.form = this.fb.group({
      title:        [desig?.title ?? '',           Validators.required],
      departmentId: [desig?.departmentId ?? this.data.preselectedDepartmentId ?? '', Validators.required],
      level:        [desig?.level ?? '',           Validators.required],
    });

    this.deptService.getAll().subscribe({ next: d => this.departments = d });
  }

  save(): void {
    if (this.form.invalid) return;
    this.isSaving = true;
    this.errorMessage = '';
    const { title, departmentId, level } = this.form.getRawValue();

    if (this.data.designation) {
      this.deptService.updateDesignation(this.data.designation.id, {
        title, departmentId, level: Number(level),
      }).subscribe({
        next: result => this.dialogRef.close(result),
        error: err => {
          this.isSaving = false;
          this.errorMessage = err?.error?.error || 'An error occurred. Please try again.';
        },
      });
    } else {
      this.deptService.createDesignation({
        title, departmentId, level: Number(level),
      }).subscribe({
        next: result => this.dialogRef.close(result),
        error: err => {
          this.isSaving = false;
          this.errorMessage = err?.error?.error || 'An error occurred. Please try again.';
        },
      });
    }
  }
}
