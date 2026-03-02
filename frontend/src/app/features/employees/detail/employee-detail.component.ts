import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { AssetService } from '../../../core/services/asset.service';
import { LeaveService } from '../../../core/services/leave.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { PayrollService } from '../../../core/services/payroll.service';
import { EmployeeDetail } from '../../../models/employee.model';
import { AssetDto } from '../../../models/asset.model';
import { LeaveRequestDto, LeaveBalanceDto } from '../../../models/leave.model';
import { MonthlyReportDto } from '../../../models/attendance.model';
import { PayrollDto } from '../../../models/payroll.model';
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
          <div class="py-4">

            <!-- Month Navigator -->
            <div class="flex items-center justify-center gap-4 mb-5">
              <button mat-icon-button (click)="prevMonth()">
                <mat-icon>chevron_left</mat-icon>
              </button>
              <span class="text-base font-semibold text-gray-700 min-w-[120px] text-center">
                {{ monthNames[attMonth - 1] }} {{ attYear }}
              </span>
              <button mat-icon-button (click)="nextMonth()" [disabled]="isCurrentMonth()">
                <mat-icon>chevron_right</mat-icon>
              </button>
            </div>

            <!-- Loading -->
            <div *ngIf="attendanceLoading" class="flex justify-center py-10">
              <mat-spinner diameter="36"></mat-spinner>
            </div>

            <ng-container *ngIf="!attendanceLoading && attendanceReport">
              <!-- Summary stats -->
              <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
                <div class="bg-green-50 rounded-xl p-3 text-center">
                  <p class="text-2xl font-bold text-green-700">{{ attendanceReport.totalPresent }}</p>
                  <p class="text-xs text-green-600 mt-0.5">Present</p>
                </div>
                <div class="bg-yellow-50 rounded-xl p-3 text-center">
                  <p class="text-2xl font-bold text-yellow-700">{{ attendanceReport.totalLate }}</p>
                  <p class="text-xs text-yellow-600 mt-0.5">Late</p>
                </div>
                <div class="bg-orange-50 rounded-xl p-3 text-center">
                  <p class="text-2xl font-bold text-orange-700">{{ attendanceReport.totalHalfDay }}</p>
                  <p class="text-xs text-orange-600 mt-0.5">Half Day</p>
                </div>
                <div class="bg-red-50 rounded-xl p-3 text-center">
                  <p class="text-2xl font-bold text-red-700">{{ attendanceReport.totalAbsent }}</p>
                  <p class="text-xs text-red-600 mt-0.5">Absent</p>
                </div>
                <div class="bg-indigo-50 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
                  <p class="text-2xl font-bold text-indigo-700">{{ attendanceReport.totalWorkHours | number:'1.1-1' }}</p>
                  <p class="text-xs text-indigo-600 mt-0.5">Work Hrs</p>
                </div>
              </div>

              <!-- Empty records -->
              <div *ngIf="attendanceReport.records.length === 0"
                   class="flex flex-col items-center py-8 text-gray-400">
                <mat-icon style="font-size:3rem;width:3rem;height:3rem;" class="mb-2">access_time</mat-icon>
                <p class="font-medium">No records for this month</p>
              </div>

              <!-- Records table -->
              <div *ngIf="attendanceReport.records.length > 0"
                   class="bg-white rounded-xl border overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <tr>
                      <th class="px-4 py-3 text-left">Date</th>
                      <th class="px-4 py-3 text-left">Check In</th>
                      <th class="px-4 py-3 text-left">Check Out</th>
                      <th class="px-4 py-3 text-center">Work Hrs</th>
                      <th class="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr *ngFor="let r of attendanceReport.records" class="hover:bg-gray-50">
                      <td class="px-4 py-3 text-gray-700">{{ r.date + 'T00:00:00' | date:'EEE, MMM d' }}</td>
                      <td class="px-4 py-3 font-mono text-gray-600">{{ r.checkIn?.slice(0,5) || '—' }}</td>
                      <td class="px-4 py-3 font-mono text-gray-600">{{ r.checkOut?.slice(0,5) || '—' }}</td>
                      <td class="px-4 py-3 text-center font-medium text-gray-700">
                        {{ r.workHours != null ? (r.workHours | number:'1.1-1') : '—' }}
                      </td>
                      <td class="px-4 py-3">
                        <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                              [ngClass]="attendanceStatusClass(r.status)">
                          {{ r.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </ng-container>

            <!-- No data fallback -->
            <div *ngIf="!attendanceLoading && !attendanceReport"
                 class="flex flex-col items-center py-10 text-gray-400">
              <mat-icon style="font-size:3rem;width:3rem;height:3rem;" class="mb-2">access_time</mat-icon>
              <p class="font-medium">No attendance data available</p>
            </div>

          </div>
        </mat-tab>

        <!-- ── Leave History Tab ──────────────────────────────── -->
        <mat-tab label="Leave History">
          <div class="py-4">

            <!-- Loading -->
            <div *ngIf="leaveLoading" class="flex justify-center py-10">
              <mat-spinner diameter="36"></mat-spinner>
            </div>

            <ng-container *ngIf="!leaveLoading">

              <!-- Balance cards -->
              <div *ngIf="leaveBalances.length > 0"
                   class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div *ngFor="let b of leaveBalances"
                     class="bg-white rounded-xl border p-4 flex flex-col gap-1">
                  <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide">{{ b.leaveType }}</p>
                  <div class="flex items-end gap-2 mt-1">
                    <span class="text-2xl font-bold text-indigo-600">{{ b.remainingDays }}</span>
                    <span class="text-sm text-gray-400 mb-0.5">/ {{ b.totalDays }} days</span>
                  </div>
                  <!-- Progress bar -->
                  <div class="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div class="bg-indigo-500 h-1.5 rounded-full transition-all"
                         [style.width.%]="b.totalDays > 0 ? (b.remainingDays / b.totalDays * 100) : 0">
                    </div>
                  </div>
                  <p class="text-xs text-gray-400 mt-0.5">{{ b.usedDays }} used · {{ b.remainingDays }} remaining</p>
                </div>
              </div>

              <!-- Leave requests empty -->
              <div *ngIf="leaveRequests.length === 0"
                   class="flex flex-col items-center py-10 text-gray-400">
                <mat-icon style="font-size:3rem;width:3rem;height:3rem;" class="mb-2">event_busy</mat-icon>
                <p class="font-medium">No leave requests</p>
              </div>

              <!-- Leave requests table -->
              <div *ngIf="leaveRequests.length > 0"
                   class="bg-white rounded-xl border overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <tr>
                      <th class="px-4 py-3 text-left">Type</th>
                      <th class="px-4 py-3 text-left">From</th>
                      <th class="px-4 py-3 text-left">To</th>
                      <th class="px-4 py-3 text-center">Days</th>
                      <th class="px-4 py-3 text-left">Status</th>
                      <th class="px-4 py-3 text-left">Approved By</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr *ngFor="let r of leaveRequests" class="hover:bg-gray-50">
                      <td class="px-4 py-3 font-medium text-gray-900">{{ r.leaveType }}</td>
                      <td class="px-4 py-3 text-gray-600">{{ r.fromDate + 'T00:00:00' | date:'MMM d, y' }}</td>
                      <td class="px-4 py-3 text-gray-600">{{ r.toDate + 'T00:00:00' | date:'MMM d, y' }}</td>
                      <td class="px-4 py-3 text-center font-semibold text-gray-700">{{ r.totalDays }}</td>
                      <td class="px-4 py-3">
                        <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                              [ngClass]="leaveStatusClass(r.status)">
                          {{ r.status }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-gray-500 text-xs">{{ r.approvedByName || '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </ng-container>
          </div>
        </mat-tab>

        <!-- ── Payroll Tab ────────────────────────────────────── -->
        <mat-tab label="Payroll">
          <div class="py-4">

            <!-- Loading -->
            <div *ngIf="payrollLoading" class="flex justify-center py-10">
              <mat-spinner diameter="36"></mat-spinner>
            </div>

            <!-- Empty -->
            <div *ngIf="!payrollLoading && payrollHistory.length === 0"
                 class="flex flex-col items-center py-10 text-gray-400">
              <mat-icon style="font-size:3rem;width:3rem;height:3rem;" class="mb-2">payments</mat-icon>
              <p class="font-medium">No payroll records</p>
            </div>

            <!-- Payroll table -->
            <div *ngIf="!payrollLoading && payrollHistory.length > 0"
                 class="bg-white rounded-xl border overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th class="px-4 py-3 text-left">Month</th>
                    <th class="px-4 py-3 text-right">Basic</th>
                    <th class="px-4 py-3 text-right">HRA</th>
                    <th class="px-4 py-3 text-right">Allowances</th>
                    <th class="px-4 py-3 text-right">Deductions</th>
                    <th class="px-4 py-3 text-right">Net Salary</th>
                    <th class="px-4 py-3 text-center">Status</th>
                    <th class="px-4 py-3 text-center">Payslip</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr *ngFor="let p of payrollHistory" class="hover:bg-gray-50">
                    <td class="px-4 py-3 font-semibold text-gray-900">
                      {{ monthNames[p.month - 1] }} {{ p.year }}
                    </td>
                    <td class="px-4 py-3 text-right text-gray-700">{{ p.basicSalary | number:'1.0-0' }}</td>
                    <td class="px-4 py-3 text-right text-gray-700">{{ p.hra | number:'1.0-0' }}</td>
                    <td class="px-4 py-3 text-right text-gray-700">{{ p.allowances | number:'1.0-0' }}</td>
                    <td class="px-4 py-3 text-right text-red-600">{{ p.deductions | number:'1.0-0' }}</td>
                    <td class="px-4 py-3 text-right font-bold text-gray-900">
                      {{ p.netSalary | number:'1.0-0' }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                            [ngClass]="payrollStatusClass(p.status)">
                        {{ p.status }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <button mat-icon-button (click)="downloadPayslip(p.id)"
                              title="Download Payslip" class="!w-7 !h-7">
                        <mat-icon class="text-indigo-600"
                                  style="font-size:1.1rem;width:1.1rem;height:1.1rem;line-height:1.1rem;">
                          download
                        </mat-icon>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </mat-tab>

        <!-- ── Documents Tab ─────────────────────────────────── -->
        <mat-tab label="Documents">
          <div class="py-8 text-center text-gray-400">
            <mat-icon style="font-size:3rem;width:3rem;height:3rem;" class="mb-3">folder</mat-icon>
            <p class="font-medium">Documents coming soon</p>
          </div>
        </mat-tab>

        <!-- ── Assets Tab ─────────────────────────────────────── -->
        <mat-tab label="Assets">
          <div class="py-4">

            <!-- Loading -->
            <div *ngIf="assetsLoading" class="flex justify-center py-10">
              <mat-spinner diameter="36"></mat-spinner>
            </div>

            <!-- Empty -->
            <div *ngIf="!assetsLoading && employeeAssets.length === 0"
                 class="flex flex-col items-center py-10 text-gray-400">
              <mat-icon style="font-size:3rem;width:3rem;height:3rem;" class="mb-2">inventory_2</mat-icon>
              <p class="font-medium">No assets assigned</p>
              <p class="text-sm">This employee has no assets currently assigned.</p>
            </div>

            <!-- Assets grid -->
            <div *ngIf="!assetsLoading && employeeAssets.length > 0"
                 class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div *ngFor="let asset of employeeAssets"
                   class="bg-white rounded-xl border shadow-sm p-4 flex flex-col gap-2">

                <div class="flex items-start justify-between">
                  <div>
                    <p class="font-semibold text-gray-900 text-sm">{{ asset.assetName }}</p>
                    <p class="font-mono text-xs text-gray-400 mt-0.5">{{ asset.assetCode }}</p>
                  </div>
                  <span class="shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ml-2"
                        [ngClass]="assetStatusClass(asset.status)">
                    {{ assetStatusLabel(asset.status) }}
                  </span>
                </div>

                <div class="flex items-center gap-1.5 text-xs text-gray-500">
                  <mat-icon style="font-size:0.875rem;width:0.875rem;height:0.875rem;line-height:0.875rem;"
                            class="text-gray-400">category</mat-icon>
                  {{ asset.category }}
                </div>

                <div *ngIf="asset.assignedDate" class="text-xs text-gray-400 flex items-center gap-1.5">
                  <mat-icon style="font-size:0.875rem;width:0.875rem;height:0.875rem;line-height:0.875rem;"
                            class="text-gray-400">calendar_today</mat-icon>
                  Assigned {{ asset.assignedDate | date:'MMM d, y' }}
                </div>

              </div>
            </div>

          </div>
        </mat-tab>

      </mat-tab-group>
    </div>
  `,
})
export class EmployeeDetailComponent implements OnInit {
  employee: EmployeeDetail | null = null;
  loading = true;

  // Assets
  employeeAssets: AssetDto[] = [];
  assetsLoading = false;

  // Leave
  leaveBalances: LeaveBalanceDto[] = [];
  leaveRequests: LeaveRequestDto[] = [];
  leaveLoading = false;

  // Attendance
  attendanceReport: MonthlyReportDto | null = null;
  attendanceLoading = false;
  attMonth = new Date().getMonth() + 1;
  attYear  = new Date().getFullYear();

  // Payroll
  payrollHistory: PayrollDto[] = [];
  payrollLoading = false;

  canEdit   = false;
  canDelete = false;

  readonly monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private assetService: AssetService,
    private leaveService: LeaveService,
    private attendanceService: AttendanceService,
    private payrollService: PayrollService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.canEdit   = this.authService.hasAnyRole(['Admin', 'HR']);
    this.canDelete = this.authService.hasRole('Admin');

    const id = this.route.snapshot.params['id'];
    this.employeeService.getById(id).subscribe({
      next: emp => {
        this.employee = emp;
        this.loading  = false;
        this.loadAssets(emp.id);
        this.loadLeave(emp.id);
        this.loadAttendance(emp.id);
        this.loadPayroll(emp.id);
        this.cdr.detectChanges();
      },
      error: () => this.router.navigate(['/employees']),
    });
  }

  // ── Loaders ─────────────────────────────────────────────────

  loadAssets(employeeId: string): void {
    this.assetsLoading = true;
    this.assetService.getEmployeeAssets(employeeId).subscribe({
      next: data => { this.employeeAssets = data; this.assetsLoading = false; this.cdr.detectChanges(); },
      error: ()   => { this.assetsLoading = false; this.cdr.detectChanges(); },
    });
  }

  loadLeave(employeeId: string): void {
    this.leaveLoading = true;
    let resolved = 0;
    const done = () => { if (++resolved === 2) { this.leaveLoading = false; } this.cdr.detectChanges(); };

    this.leaveService.getBalance(employeeId, new Date().getFullYear()).subscribe({
      next: data => { this.leaveBalances = data; done(); },
      error: ()  => done(),
    });
    this.leaveService.getRequests(employeeId).subscribe({
      next: data => {
        this.leaveRequests = [...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        done();
      },
      error: () => done(),
    });
  }

  loadAttendance(employeeId: string): void {
    this.attendanceLoading = true;
    this.attendanceService.getMonthlyReport(employeeId, this.attMonth, this.attYear).subscribe({
      next: data => { this.attendanceReport = data; this.attendanceLoading = false; this.cdr.detectChanges(); },
      error: ()  => { this.attendanceLoading = false; this.cdr.detectChanges(); },
    });
  }

  loadPayroll(employeeId: string): void {
    this.payrollLoading = true;
    this.payrollService.getHistory(employeeId).subscribe({
      next: data => {
        this.payrollHistory = [...data].sort((a, b) =>
          b.year !== a.year ? b.year - a.year : b.month - a.month
        );
        this.payrollLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.payrollLoading = false; this.cdr.detectChanges(); },
    });
  }

  // ── Attendance month navigation ──────────────────────────────

  prevMonth(): void {
    if (this.attMonth === 1) { this.attMonth = 12; this.attYear--; }
    else this.attMonth--;
    if (this.employee) this.loadAttendance(this.employee.id);
  }

  nextMonth(): void {
    if (this.isCurrentMonth()) return;
    if (this.attMonth === 12) { this.attMonth = 1; this.attYear++; }
    else this.attMonth++;
    if (this.employee) this.loadAttendance(this.employee.id);
  }

  isCurrentMonth(): boolean {
    const now = new Date();
    return this.attYear === now.getFullYear() && this.attMonth === now.getMonth() + 1;
  }

  // ── Payslip download ─────────────────────────────────────────

  downloadPayslip(id: string): void {
    this.payrollService.downloadPayslip(id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = `payslip-${id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Failed to download payslip.', 'Close', { duration: 3000 }),
    });
  }

  // ── Status helpers ───────────────────────────────────────────

  leaveStatusClass(status: string): string {
    return ({
      Pending:   'bg-yellow-100 text-yellow-800',
      Approved:  'bg-green-100 text-green-800',
      Rejected:  'bg-red-100 text-red-800',
      Cancelled: 'bg-gray-100 text-gray-600',
    } as any)[status] ?? 'bg-gray-100 text-gray-600';
  }

  attendanceStatusClass(status: string): string {
    return ({
      Present: 'bg-green-100 text-green-800',
      Late:    'bg-yellow-100 text-yellow-800',
      HalfDay: 'bg-orange-100 text-orange-800',
      Absent:  'bg-red-100 text-red-800',
    } as any)[status] ?? 'bg-gray-100 text-gray-600';
  }

  payrollStatusClass(status: string): string {
    return status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  }

  assetStatusClass(status: string): string {
    return ({
      Available:        'bg-green-100 text-green-800',
      Assigned:         'bg-blue-100 text-blue-800',
      UnderMaintenance: 'bg-yellow-100 text-yellow-800',
      Retired:          'bg-gray-100 text-gray-500',
    } as any)[status] ?? 'bg-gray-100 text-gray-600';
  }

  assetStatusLabel(status: string): string {
    return status === 'UnderMaintenance' ? 'Maintenance' : status;
  }

  // ── Employee actions ─────────────────────────────────────────

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
