import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { TrainingService } from '../../../core/services/training.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { EmployeeListItem } from '../../../models/employee.model';

@Component({
  selector: 'app-assign-employees-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule,
    MatListModule, MatCheckboxModule,
  ],
  template: `
    <div class="p-2">
      <h2 mat-dialog-title class="flex items-center gap-2 mb-0">
        <mat-icon class="text-indigo-600">group_add</mat-icon>
        Assign Employees to Training
      </h2>

      <mat-dialog-content class="!px-0 !pt-3 !pb-2" style="min-width:380px;max-height:480px">

        <!-- Loading -->
        <div *ngIf="loadingEmployees" class="flex justify-center py-8">
          <mat-spinner diameter="32"></mat-spinner>
        </div>

        <!-- Search -->
        <div *ngIf="!loadingEmployees" class="mb-3">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <mat-icon class="field-icon">search</mat-icon>
            </span>
            <input [(ngModel)]="search" type="text"
                   placeholder="Search by name or department…"
                   class="field-input" />
          </div>
        </div>

        <!-- Employee list -->
        <div *ngIf="!loadingEmployees" class="overflow-y-auto" style="max-height:300px">
          <div
            *ngFor="let emp of filteredEmployees"
            class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
            (click)="toggle(emp.id)"
          >
            <mat-checkbox
              [checked]="selected.has(emp.id)"
              (change)="toggle(emp.id)"
              (click)="$event.stopPropagation()"
              color="primary"
            ></mat-checkbox>
            <div>
              <p class="text-sm font-medium text-gray-900">{{ emp.firstName }} {{ emp.lastName }}</p>
              <p class="text-xs text-gray-500">{{ emp.departmentName || '—' }} · {{ emp.designationTitle || '—' }}</p>
            </div>
          </div>
          <div *ngIf="filteredEmployees.length === 0" class="text-center py-6 text-sm text-gray-400">
            No employees found
          </div>
        </div>

        <p *ngIf="!loadingEmployees" class="text-xs text-gray-500 mt-2 px-1">
          {{ selected.size }} employee{{ selected.size !== 1 ? 's' : '' }} selected
        </p>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="!pb-2">
        <button mat-stroked-button mat-dialog-close [disabled]="saving">Cancel</button>
        <button
          mat-flat-button color="primary"
          [disabled]="selected.size === 0 || saving"
          (click)="assign()"
        >
          <mat-spinner *ngIf="saving" diameter="18" class="mr-2"></mat-spinner>
          Assign ({{ selected.size }})
        </button>
      </mat-dialog-actions>
    </div>
  `,
})
export class AssignEmployeesDialogComponent implements OnInit {
  employees: EmployeeListItem[] = [];
  selected = new Set<string>();
  search = '';
  loadingEmployees = false;
  saving = false;

  get filteredEmployees(): EmployeeListItem[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.employees;
    return this.employees.filter(e =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      (e.departmentName ?? '').toLowerCase().includes(q)
    );
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { trainingId: string },
    private dialogRef: MatDialogRef<AssignEmployeesDialogComponent>,
    private trainingService: TrainingService,
    private employeeService: EmployeeService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadingEmployees = true;
    this.employeeService.getAll({ page: 1, pageSize: 9999, status: 'Active' }).subscribe({
      next: result => {
        this.employees = result.items;
        this.loadingEmployees = false;
      },
      error: () => {
        this.snack.open('Failed to load employees', 'Close', { duration: 3000 });
        this.loadingEmployees = false;
      },
    });
  }

  toggle(id: string): void {
    if (this.selected.has(id)) this.selected.delete(id);
    else this.selected.add(id);
  }

  assign(): void {
    this.saving = true;
    this.trainingService.assignEmployees(this.data.trainingId, { employeeIds: [...this.selected] })
      .subscribe({
        next: result => {
          this.snack.open(`${result.length} employee(s) assigned successfully`, 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: err => {
          this.snack.open(err?.error?.error ?? 'Failed to assign employees', 'Close', { duration: 4000 });
          this.saving = false;
        },
      });
  }
}
