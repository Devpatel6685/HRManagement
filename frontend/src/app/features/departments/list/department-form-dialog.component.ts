import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DepartmentService } from '../../../core/services/department.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentListItem } from '../../../models/department.model';
import { EmployeeListItem } from '../../../models/employee.model';

export interface DepartmentFormDialogData {
  department: DepartmentListItem | null;
}

@Component({
  selector: 'app-department-form-dialog',
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
      <div class="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-100">
        <mat-icon class="text-indigo-600" style="font-size:1.25rem;width:1.25rem;height:1.25rem;line-height:1.25rem;">
          business
        </mat-icon>
      </div>
      <span class="text-lg font-semibold text-gray-900">
        {{ data.department ? 'Edit Department' : 'Add Department' }}
      </span>
    </div>

    <mat-dialog-content class="py-4">
      <form [formGroup]="form" class="space-y-4" style="min-width:360px">

        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Department Name</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <mat-icon class="field-icon">business</mat-icon>
            </span>
            <input formControlName="name" placeholder="e.g. Engineering"
              class="field-input"
              [class.field-input--error]="form.get('name')?.invalid && form.get('name')?.touched" />
          </div>
          <p *ngIf="form.get('name')?.invalid && form.get('name')?.touched"
             class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <mat-icon style="font-size:0.85rem;width:0.85rem;height:0.85rem;">error_outline</mat-icon>
            Department name is required
          </p>
        </div>

        <!-- Head Employee -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Department Head (optional)</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <mat-icon class="field-icon">person</mat-icon>
            </span>
            <select formControlName="headEmployeeId" class="field-input">
              <option [ngValue]="null">— None —</option>
              <option *ngFor="let e of employees" [ngValue]="e.id">
                {{ e.fullName }} ({{ e.employeeCode }})
              </option>
            </select>
          </div>
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
        {{ data.department ? 'Save Changes' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`:host { display: block; }`],
})
export class DepartmentFormDialogComponent implements OnInit {
  form!: FormGroup;
  employees: EmployeeListItem[] = [];
  isSaving = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private deptService: DepartmentService,
    private employeeService: EmployeeService,
    public dialogRef: MatDialogRef<DepartmentFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DepartmentFormDialogData,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:            [this.data.department?.name ?? '', Validators.required],
      headEmployeeId:  [null],
    });

    this.employeeService.getAll({ status: 'Active', page: 1, pageSize: 999 }).subscribe({
      next: r => {
        this.employees = r.items;
        if (this.data.department) {
          this.deptService.getById(this.data.department.id).subscribe({
            next: detail => this.form.patchValue({ headEmployeeId: detail.headEmployeeId }),
          });
        }
      },
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.isSaving = true;
    this.errorMessage = '';
    const { name, headEmployeeId } = this.form.getRawValue();

    if (this.data.department) {
      this.deptService.update(this.data.department.id, { name, headEmployeeId }).subscribe({
        next: result => this.dialogRef.close(result),
        error: err => {
          this.isSaving = false;
          this.errorMessage = err?.error?.error || 'An error occurred. Please try again.';
        },
      });
    } else {
      this.deptService.create({ name, headEmployeeId }).subscribe({
        next: result => this.dialogRef.close(result),
        error: err => {
          this.isSaving = false;
          this.errorMessage = err?.error?.error || 'An error occurred. Please try again.';
        },
      });
    }
  }
}
