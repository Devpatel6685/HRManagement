import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeDetail } from '../../../models/employee.model';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatTabsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatDividerModule,
    MatProgressSpinnerModule, MatDialogModule, MatSnackBarModule,
  ],
  template: `
    <!-- Loading -->
    <div *ngIf="loading" class="flex justify-center items-center py-24">
      <mat-spinner diameter="48"></mat-spinner>
    </div>

    <div *ngIf="!loading && employee" class="p-6">
      <!-- Back + Actions -->
      <div class="flex items-center justify-between mb-6">
        <button mat-stroked-button routerLink="/employees">
          <mat-icon>arrow_back</mat-icon>Back to List
        </button>
        <div class="flex gap-2">
          <button *ngIf="canEdit" mat-stroked-button
                  [routerLink]="['/employees/edit', employee.id]">
            <mat-icon>edit</mat-icon>Edit
          </button>
          <button *ngIf="canDelete" mat-raised-button color="warn" (click)="confirmDelete()">
            <mat-icon>delete</mat-icon>Delete
          </button>
        </div>
      </div>

      <!-- Profile header card -->
      <mat-card class="mb-4">
        <mat-card-content class="p-6">
          <div class="flex items-center gap-5">
            <!-- Avatar -->
            <div class="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center
                        text-white text-xl font-bold shrink-0">
              {{ getInitials(employee.fullName) }}
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <h2 class="text-xl font-bold text-gray-900 truncate">{{ employee.fullName }}</h2>
              <p class="text-sm text-gray-500">{{ employee.designationTitle || 'No designation' }}
                <span *ngIf="employee.departmentName"> · {{ employee.departmentName }}</span>
              </p>
              <div class="flex items-center gap-3 mt-2">
                <span class="font-mono text-sm font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {{ employee.employeeCode }}
                </span>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                      [ngClass]="getStatusClass(employee.status)">
                  {{ getStatusLabel(employee.status) }}
                </span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Tab group -->
      <mat-tab-group animationDuration="200ms">

        <!-- ── Profile Tab ──────────────────────────────────────── -->
        <mat-tab label="Profile">
          <div class="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Personal Info -->
            <mat-card>
              <mat-card-header>
                <mat-icon mat-card-avatar class="text-indigo-600">person</mat-icon>
                <mat-card-title class="text-base font-semibold">Personal Information</mat-card-title>
              </mat-card-header>
              <mat-card-content class="px-4 pb-4">
                <dl class="space-y-3 mt-3">
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">Email</dt>
                    <dd class="text-sm font-medium text-gray-900">{{ employee.email || '—' }}</dd>
                  </div>
                  <mat-divider></mat-divider>
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">Phone</dt>
                    <dd class="text-sm font-medium text-gray-900">{{ employee.phone || '—' }}</dd>
                  </div>
                  <mat-divider></mat-divider>
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">Date of Birth</dt>
                    <dd class="text-sm font-medium text-gray-900">{{ fmtDate(employee.dob) }}</dd>
                  </div>
                  <mat-divider></mat-divider>
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">Gender</dt>
                    <dd class="text-sm font-medium text-gray-900">{{ employee.gender }}</dd>
                  </div>
                </dl>
              </mat-card-content>
            </mat-card>

            <!-- Employment Info -->
            <mat-card>
              <mat-card-header>
                <mat-icon mat-card-avatar class="text-indigo-600">work</mat-icon>
                <mat-card-title class="text-base font-semibold">Employment Details</mat-card-title>
              </mat-card-header>
              <mat-card-content class="px-4 pb-4">
                <dl class="space-y-3 mt-3">
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">Department</dt>
                    <dd class="text-sm font-medium text-gray-900">{{ employee.departmentName || '—' }}</dd>
                  </div>
                  <mat-divider></mat-divider>
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">Designation</dt>
                    <dd class="text-sm font-medium text-gray-900">{{ employee.designationTitle || '—' }}</dd>
                  </div>
                  <mat-divider></mat-divider>
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">Manager</dt>
                    <dd class="text-sm font-medium text-gray-900">{{ employee.managerName || '—' }}</dd>
                  </div>
                  <mat-divider></mat-divider>
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">Join Date</dt>
                    <dd class="text-sm font-medium text-gray-900">{{ fmtDate(employee.joinDate) }}</dd>
                  </div>
                </dl>
              </mat-card-content>
            </mat-card>

          </div>
        </mat-tab>

        <!-- ── Attendance Tab ──────────────────────────────────── -->
        <mat-tab label="Attendance">
          <div class="py-8 text-center text-gray-400">
            <mat-icon style="font-size:3rem;width:3rem;height:3rem;" class="mb-3">access_time</mat-icon>
            <p class="font-medium">Attendance history coming soon</p>
          </div>
        </mat-tab>

        <!-- ── Leave History Tab ──────────────────────────────── -->
        <mat-tab label="Leave History">
          <div class="py-8 text-center text-gray-400">
            <mat-icon style="font-size:3rem;width:3rem;height:3rem;" class="mb-3">event_busy</mat-icon>
            <p class="font-medium">Leave history coming soon</p>
          </div>
        </mat-tab>

        <!-- ── Payroll Tab ────────────────────────────────────── -->
        <mat-tab label="Payroll">
          <div class="py-8 text-center text-gray-400">
            <mat-icon style="font-size:3rem;width:3rem;height:3rem;" class="mb-3">payments</mat-icon>
            <p class="font-medium">Payroll records coming soon</p>
          </div>
        </mat-tab>

        <!-- ── Documents Tab ─────────────────────────────────── -->
        <mat-tab label="Documents">
          <div class="py-8 text-center text-gray-400">
            <mat-icon style="font-size:3rem;width:3rem;height:3rem;" class="mb-3">folder</mat-icon>
            <p class="font-medium">Documents coming soon</p>
          </div>
        </mat-tab>

      </mat-tab-group>
    </div>
  `,
})
export class EmployeeDetailComponent implements OnInit {
  employee: EmployeeDetail | null = null;
  loading = true;

  canEdit   = false;
  canDelete = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.canEdit   = this.authService.hasAnyRole(['Admin', 'HR']);
    this.canDelete = this.authService.hasRole('Admin');

    const id = this.route.snapshot.params['id'];
    this.employeeService.getById(id).subscribe({
      next: emp => { this.employee = emp; this.loading = false; },
      error: () => this.router.navigate(['/employees']),
    });
  }

  confirmDelete(): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Employee',
        message: `Delete ${this.employee!.fullName}? Their account will be deactivated.`,
        icon: 'person_remove',
        confirmLabel: 'Delete',
        confirmColor: 'warn',
      } as ConfirmDialogData,
    });
    ref.afterClosed().subscribe((ok: boolean) => { if (ok) this.doDelete(); });
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

  fmtDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
  }

  private doDelete(): void {
    this.employeeService.delete(this.employee!.id).subscribe({
      next: () => {
        this.snackBar.open('Employee deleted successfully.', 'OK', { duration: 3000 });
        this.router.navigate(['/employees']);
      },
      error: () => {
        this.snackBar.open('Failed to delete employee.', 'Close', { duration: 4000 });
      },
    });
  }
}
