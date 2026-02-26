import { Component, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { EmployeeListItem, EmployeeFilterParams } from '../../../models/employee.model';
import { Department } from '../../../models/department.model';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatProgressSpinnerModule, MatTooltipModule,
    MatDialogModule, MatSnackBarModule,
  ],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Employees</h1>
          <p class="text-sm text-gray-500 mt-0.5">{{ totalCount }} total records</p>
        </div>
        <button *ngIf="canEdit" mat-raised-button color="primary" routerLink="/employees/add">
          <mat-icon>add</mat-icon>Add Employee
        </button>
      </div>

      <!-- Filters -->
      <mat-card class="mb-4">
        <mat-card-content class="p-4">
          <div class="flex flex-wrap gap-4 items-end">

            <!-- Search -->
            <div class="flex-1 min-w-52">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Search</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <mat-icon class="field-icon">search</mat-icon>
                </span>
                <input
                  type="text"
                  [formControl]="searchCtrl"
                  placeholder="Name, code or email…"
                  class="field-input"
                />
              </div>
            </div>

            <!-- Department -->
            <div class="w-52">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <mat-icon class="field-icon">business</mat-icon>
                </span>
                <select [formControl]="deptCtrl" class="field-input">
                  <option value="">All Departments</option>
                  <option *ngFor="let d of departments" [value]="d.id">{{ d.name }}</option>
                </select>
              </div>
            </div>

            <!-- Status -->
            <div class="w-44">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <mat-icon class="field-icon">badge</mat-icon>
                </span>
                <select [formControl]="statusCtrl" class="field-input">
                  <option value="">All</option>
                  <option *ngFor="let s of statuses" [value]="s.value">{{ s.label }}</option>
                </select>
              </div>
            </div>

            <!-- Clear -->
            <div>
              <button mat-stroked-button (click)="clearFilters()">
                <mat-icon>clear</mat-icon>Clear
              </button>
            </div>

          </div>
        </mat-card-content>
      </mat-card>

      <!-- Table card -->
      <mat-card>
        <div class="relative">
          <div *ngIf="loading" class="absolute inset-0 flex items-center justify-center bg-white/70 z-10 rounded">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <div class="overflow-x-auto">
            <table mat-table [dataSource]="dataSource" matSort class="w-full">

              <!-- Code -->
              <ng-container matColumnDef="employeeCode">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Code</th>
                <td mat-cell *matCellDef="let row">
                  <span class="font-mono text-sm font-semibold text-indigo-700">{{ row.employeeCode }}</span>
                </td>
              </ng-container>

              <!-- Name + Email -->
              <ng-container matColumnDef="fullName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                <td mat-cell *matCellDef="let row">
                  <div class="flex items-center gap-3 py-2">
                    <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {{ getInitials(row.fullName) }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 text-sm leading-tight">{{ row.fullName }}</p>
                      <p class="text-xs text-gray-400">{{ row.email || '—' }}</p>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Department + Designation -->
              <ng-container matColumnDef="departmentName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Department</th>
                <td mat-cell *matCellDef="let row">
                  <p class="text-sm text-gray-700">{{ row.departmentName || '—' }}</p>
                  <p *ngIf="row.designationTitle" class="text-xs text-gray-400">{{ row.designationTitle }}</p>
                </td>
              </ng-container>

              <!-- Status -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let row">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                        [ngClass]="getStatusClass(row.status)">
                    {{ getStatusLabel(row.status) }}
                  </span>
                </td>
              </ng-container>

              <!-- Join Date -->
              <ng-container matColumnDef="joinDate">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Join Date</th>
                <td mat-cell *matCellDef="let row">
                  <span class="text-sm text-gray-600">{{ row.joinDate + 'T00:00:00' | date:'MMM d, y' }}</span>
                </td>
              </ng-container>

              <!-- Actions -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="text-right pr-4">Actions</th>
                <td mat-cell *matCellDef="let row" class="text-right">
                  <button mat-icon-button [routerLink]="['/employees', row.id]" matTooltip="View">
                    <mat-icon class="text-gray-500">visibility</mat-icon>
                  </button>
                  <button *ngIf="canEdit" mat-icon-button
                          [routerLink]="['/employees/edit', row.id]" matTooltip="Edit">
                    <mat-icon class="text-blue-500">edit</mat-icon>
                  </button>
                  <button *ngIf="canDelete" mat-icon-button
                          (click)="confirmDelete(row)" matTooltip="Delete">
                    <mat-icon class="text-red-500">delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns;"
                  class="hover:bg-gray-50 transition-colors cursor-pointer"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" [attr.colspan]="columns.length">
                  <div class="flex flex-col items-center py-16 text-gray-400">
                    <mat-icon style="font-size:3rem;width:3rem;height:3rem;" class="mb-3">people_outline</mat-icon>
                    <p class="font-medium">No employees found</p>
                    <p class="text-sm">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <mat-paginator
            [length]="totalCount"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 25, 50]"
            (page)="onPageChange($event)"
          ></mat-paginator>
        </div>
      </mat-card>
    </div>
  `,
})
export class EmployeeListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly columns = ['employeeCode', 'fullName', 'departmentName', 'status', 'joinDate', 'actions'];
  readonly statuses = [
    { value: 'Active',     label: 'Active'     },
    { value: 'Inactive',   label: 'Inactive'   },
    { value: 'OnLeave',    label: 'On Leave'   },
    { value: 'Terminated', label: 'Terminated' },
  ];

  dataSource = new MatTableDataSource<EmployeeListItem>([]);
  departments: Department[] = [];
  totalCount = 0;
  pageSize = 10;
  loading = false;

  searchCtrl = new FormControl('');
  deptCtrl   = new FormControl('');
  statusCtrl = new FormControl('');

  canEdit   = false;
  canDelete = false;

  private currentPage = 1;
  private destroy$ = new Subject<void>();

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.canEdit   = this.authService.hasAnyRole(['Admin', 'HR']);
    this.canDelete = this.authService.hasRole('Admin');

    this.departmentService.getAll().subscribe({ next: d => this.departments = d });

    this.searchCtrl.valueChanges.pipe(
      debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$),
    ).subscribe(() => this.resetAndLoad());

    this.deptCtrl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.resetAndLoad());

    this.statusCtrl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.resetAndLoad());

    this.loadEmployees();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadEmployees();
  }

  clearFilters(): void {
    this.searchCtrl.setValue('', { emitEvent: false });
    this.deptCtrl.setValue('', { emitEvent: false });
    this.statusCtrl.setValue('', { emitEvent: false });
    this.resetAndLoad();
  }

  confirmDelete(employee: EmployeeListItem): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Employee',
        message: `Delete ${employee.fullName}? Their account will be deactivated.`,
        icon: 'person_remove',
        confirmLabel: 'Delete',
        confirmColor: 'warn',
      } as ConfirmDialogData,
    });
    ref.afterClosed().subscribe((ok: boolean) => { if (ok) this.deleteEmployee(employee); });
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ').filter(p => p.length > 0);
    if (!parts.length) return '?';
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getStatusLabel(status: string): string {
    return status === 'OnLeave' ? 'On Leave' : status;
  }

  getStatusClass(status: string): Record<string, boolean> {
    return {
      'bg-green-100 text-green-800':   status === 'Active',
      'bg-gray-100 text-gray-700':     status === 'Inactive',
      'bg-yellow-100 text-yellow-800': status === 'OnLeave',
      'bg-red-100 text-red-800':       status === 'Terminated',
    };
  }

  private resetAndLoad(): void {
    this.currentPage = 1;
    if (this.paginator) this.paginator.pageIndex = 0;
    this.loadEmployees();
  }

  private loadEmployees(): void {
    this.loading = true;
    this.employeeService.getAll(this.buildFilter()).subscribe({
      next: result => {
        this.dataSource.data = result.items;
        this.totalCount = result.totalCount;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  private buildFilter(): EmployeeFilterParams {
    return {
      search:       this.searchCtrl.value?.trim() || undefined,
      departmentId: this.deptCtrl.value || undefined,
      status:       this.statusCtrl.value || undefined,
      page:         this.currentPage,
      pageSize:     this.pageSize,
    };
  }

  private deleteEmployee(employee: EmployeeListItem): void {
    this.employeeService.delete(employee.id).subscribe({
      next: () => {
        this.snackBar.open(`${employee.fullName} removed.`, 'OK', { duration: 3000 });
        this.loadEmployees();
      },
      error: () => {
        this.snackBar.open('Failed to delete employee.', 'Close', {
          duration: 4000, panelClass: ['snack-error'],
        });
      },
    });
  }
}
