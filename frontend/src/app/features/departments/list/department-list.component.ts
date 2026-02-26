import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { DepartmentService } from '../../../core/services/department.service';
import { AuthService } from '../../../core/services/auth.service';
import { DepartmentListItem } from '../../../models/department.model';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  DepartmentFormDialogComponent,
  DepartmentFormDialogData,
} from './department-form-dialog.component';
import { DesignationListComponent } from './designation-list.component';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule,
    DesignationListComponent,
  ],
  template: `
    <div class="p-6">

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Departments</h1>
        <p class="text-sm text-gray-500 mt-0.5">Manage departments and designations</p>
      </div>

      <mat-tab-group>

        <!-- ── Tab 1: Departments ──────────────────────────────────────── -->
        <mat-tab label="Departments">
          <div class="pt-4">
            <mat-card>
              <!-- Toolbar -->
              <mat-card-content class="p-4">
                <div class="flex items-center justify-between mb-4">
                  <span class="text-sm text-gray-500">{{ departments.length }} department(s)</span>
                  <button *ngIf="canEdit" mat-raised-button color="primary" (click)="openAdd()">
                    <mat-icon>add</mat-icon>Add Department
                  </button>
                </div>

                <!-- Loading -->
                <div *ngIf="loading" class="flex justify-center py-10">
                  <mat-spinner diameter="40"></mat-spinner>
                </div>

                <!-- Table -->
                <div *ngIf="!loading" class="overflow-x-auto">
                  <table mat-table [dataSource]="departments" class="w-full">

                    <!-- Name -->
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>Department</th>
                      <td mat-cell *matCellDef="let row">
                        <span class="font-semibold text-gray-900">{{ row.name }}</span>
                      </td>
                    </ng-container>

                    <!-- Head -->
                    <ng-container matColumnDef="head">
                      <th mat-header-cell *matHeaderCellDef>Department Head</th>
                      <td mat-cell *matCellDef="let row">
                        <span class="text-sm text-gray-700">{{ row.headEmployeeName || '—' }}</span>
                      </td>
                    </ng-container>

                    <!-- Employee Count -->
                    <ng-container matColumnDef="count">
                      <th mat-header-cell *matHeaderCellDef>Employees</th>
                      <td mat-cell *matCellDef="let row">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                          <mat-icon style="font-size:0.75rem;width:0.75rem;height:0.75rem;">people</mat-icon>
                          {{ row.employeeCount }}
                        </span>
                      </td>
                    </ng-container>

                    <!-- Actions -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef class="text-right pr-4">Actions</th>
                      <td mat-cell *matCellDef="let row" class="text-right">
                        <button *ngIf="canEdit" mat-icon-button (click)="openEdit(row)" matTooltip="Edit">
                          <mat-icon class="text-blue-500">edit</mat-icon>
                        </button>
                        <button *ngIf="canDelete" mat-icon-button (click)="confirmDelete(row)" matTooltip="Delete">
                          <mat-icon class="text-red-500">delete</mat-icon>
                        </button>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="columns"></tr>
                    <tr mat-row *matRowDef="let row; columns: columns;"
                        class="hover:bg-gray-50 transition-colors"></tr>

                    <tr class="mat-row" *matNoDataRow>
                      <td class="mat-cell" [attr.colspan]="columns.length">
                        <div class="flex flex-col items-center py-16 text-gray-400">
                          <mat-icon style="font-size:3rem;width:3rem;height:3rem;" class="mb-3">people_outline</mat-icon>
                          <p class="font-medium">No departments yet</p>
                          <p class="text-sm">Add your first department to get started</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- ── Tab 2: Designations ─────────────────────────────────────── -->
        <mat-tab label="Designations">
          <div class="pt-4">
            <app-designation-list />
          </div>
        </mat-tab>

      </mat-tab-group>
    </div>
  `,
})
export class DepartmentListComponent implements OnInit {
  readonly columns = ['name', 'head', 'count', 'actions'];

  departments: DepartmentListItem[] = [];
  loading = false;
  canEdit   = false;
  canDelete = false;

  constructor(
    private deptService: DepartmentService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.canEdit   = this.authService.hasAnyRole(['Admin', 'HR']);
    this.canDelete = this.authService.hasRole('Admin');
    this.loadDepartments();
  }

  openAdd(): void {
    const ref = this.dialog.open(DepartmentFormDialogComponent, {
      data: { department: null } as DepartmentFormDialogData,
    });
    ref.afterClosed().subscribe(result => { if (result) this.loadDepartments(); });
  }

  openEdit(dept: DepartmentListItem): void {
    const ref = this.dialog.open(DepartmentFormDialogComponent, {
      data: { department: dept } as DepartmentFormDialogData,
    });
    ref.afterClosed().subscribe(result => { if (result) this.loadDepartments(); });
  }

  confirmDelete(dept: DepartmentListItem): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Department',
        message: `Delete '${dept.name}'? This cannot be undone.`,
        icon: 'business',
        confirmLabel: 'Delete',
        confirmColor: 'warn',
      } as ConfirmDialogData,
    });
    ref.afterClosed().subscribe((ok: boolean) => { if (ok) this.deleteDepartment(dept); });
  }

  private loadDepartments(): void {
    this.loading = true;
    this.deptService.getAllWithCount().subscribe({
      next: items => {
        this.departments = items;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  private deleteDepartment(dept: DepartmentListItem): void {
    this.deptService.delete(dept.id).subscribe({
      next: () => {
        this.snackBar.open(`'${dept.name}' deleted.`, 'OK', { duration: 3000 });
        this.loadDepartments();
      },
      error: err => {
        const msg = err?.error?.error || 'Failed to delete department.';
        this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: ['snack-error'] });
      },
    });
  }
}
