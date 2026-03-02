import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { AttendanceService } from '../../../core/services/attendance.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  AttendanceDto,
  EmployeeMonthlySummaryDto,
  MonthlyReportDto,
} from '../../../models/attendance.model';

@Component({
  selector: 'app-attendance-monthly-report',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule,
    MatTableModule,
  ],
  template: `
    <div class="p-6">

      <!-- Header + Month navigation -->
      <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Monthly Attendance Report</h1>
          <p class="text-sm text-gray-500 mt-0.5">
            {{ isHrOrAdmin ? 'Company-wide' : isManager ? 'Your team' : 'Your personal report' }}
            — {{ monthLabel }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button mat-icon-button (click)="prevMonth()"><mat-icon>chevron_left</mat-icon></button>
          <span class="font-semibold text-gray-800 min-w-[130px] text-center">{{ monthLabel }}</span>
          <button mat-icon-button (click)="nextMonth()"><mat-icon>chevron_right</mat-icon></button>
        </div>
      </div>

      <div *ngIf="loading" class="flex justify-center items-center py-24">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- ───────────── EMPLOYEE VIEW ───────────── -->
      <ng-container *ngIf="!loading && isEmployee && personalReport">

        <!-- Monthly stat cards -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p class="text-3xl font-bold text-green-700">{{ personalReport.totalPresent }}</p>
            <p class="text-xs font-medium text-green-600 mt-1">Present</p>
          </div>
          <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <p class="text-3xl font-bold text-yellow-700">{{ personalReport.totalLate }}</p>
            <p class="text-xs font-medium text-yellow-600 mt-1">Late</p>
          </div>
          <div class="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
            <p class="text-3xl font-bold text-orange-700">{{ personalReport.totalHalfDay }}</p>
            <p class="text-xs font-medium text-orange-600 mt-1">Half Day</p>
          </div>
          <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p class="text-3xl font-bold text-red-700">{{ personalReport.totalAbsent }}</p>
            <p class="text-xs font-medium text-red-600 mt-1">Absent</p>
          </div>
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
            <p class="text-3xl font-bold text-blue-700">{{ personalReport.totalWorkHours.toFixed(0) }}</p>
            <p class="text-xs font-medium text-blue-600 mt-1">Work Hrs</p>
          </div>
        </div>

        <!-- Daily records table -->
        <mat-card>
          <mat-card-content class="p-0">
            <div *ngIf="personalReport.records.length === 0" class="py-12 text-center text-gray-400 text-sm">
              No attendance records for this month.
            </div>
            <div *ngIf="personalReport.records.length > 0" class="overflow-x-auto">
              <table mat-table [dataSource]="personalReport.records" class="w-full">

                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">Date</th>
                  <td mat-cell *matCellDef="let r" class="text-sm">
                    {{ r.date + 'T00:00:00' | date:'EEE, MMM d' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">Status</th>
                  <td mat-cell *matCellDef="let r">
                    <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                          [ngClass]="statusBadge(r.status)">{{ r.status }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="checkIn">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">Check In</th>
                  <td mat-cell *matCellDef="let r" class="text-sm">{{ fmtTime(r.checkIn) }}</td>
                </ng-container>

                <ng-container matColumnDef="break">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">Break</th>
                  <td mat-cell *matCellDef="let r" class="text-sm text-amber-700">
                    <ng-container *ngIf="r.breakStart">
                      {{ fmtTime(r.breakStart) }}
                      <ng-container *ngIf="r.breakEnd"> – {{ fmtTime(r.breakEnd) }}</ng-container>
                    </ng-container>
                    <span *ngIf="!r.breakStart" class="text-gray-400">—</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="checkOut">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">Check Out</th>
                  <td mat-cell *matCellDef="let r" class="text-sm">{{ fmtTime(r.checkOut) }}</td>
                </ng-container>

                <ng-container matColumnDef="workHours">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700 text-right">Work Hrs</th>
                  <td mat-cell *matCellDef="let r" class="text-sm text-right"
                      [class.text-blue-700]="r.workHours !== null"
                      [class.text-gray-400]="r.workHours === null">
                    {{ r.workHours !== null ? r.workHours.toFixed(1) + 'h' : '—' }}
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="personalCols" class="bg-gray-50"></tr>
                <tr mat-row *matRowDef="let r; columns: personalCols;" class="hover:bg-gray-50"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
      </ng-container>

      <!-- ───────────── MANAGER / HR VIEW ───────────── -->
      <ng-container *ngIf="!loading && !isEmployee">

        <!-- Monthly aggregate stat cards -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6" *ngIf="teamReport.length">
          <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p class="text-2xl font-bold text-green-700">{{ sum('totalPresent') }}</p>
            <p class="text-xs font-medium text-green-600 mt-1">Present Days</p>
          </div>
          <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <p class="text-2xl font-bold text-yellow-700">{{ sum('totalLate') }}</p>
            <p class="text-xs font-medium text-yellow-600 mt-1">Late Days</p>
          </div>
          <div class="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
            <p class="text-2xl font-bold text-orange-700">{{ sum('totalHalfDay') }}</p>
            <p class="text-xs font-medium text-orange-600 mt-1">Half Days</p>
          </div>
          <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p class="text-2xl font-bold text-red-700">{{ sum('totalAbsent') }}</p>
            <p class="text-xs font-medium text-red-600 mt-1">Absent Days</p>
          </div>
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
            <p class="text-2xl font-bold text-blue-700">{{ sumHours() }}</p>
            <p class="text-xs font-medium text-blue-600 mt-1">Total Work Hrs</p>
          </div>
        </div>

        <!-- Per-employee table -->
        <mat-card>
          <mat-card-content class="p-0">

            <div *ngIf="teamReport.length === 0" class="py-16 text-center text-gray-400">
              <mat-icon style="font-size:3rem;width:3rem;height:3rem;">people</mat-icon>
              <p class="text-sm mt-2">No employees found.</p>
            </div>

            <div *ngIf="teamReport.length > 0" class="overflow-x-auto">
              <table mat-table [dataSource]="teamReport" class="w-full">

                <ng-container matColumnDef="employee">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">Employee</th>
                  <td mat-cell *matCellDef="let r">
                    <p class="font-medium text-gray-900">{{ r.employeeName }}</p>
                    <p class="text-xs text-gray-500">{{ r.department }}</p>
                  </td>
                </ng-container>

                <ng-container matColumnDef="present">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700 text-center">Present</th>
                  <td mat-cell *matCellDef="let r" class="text-center">
                    <span class="font-semibold text-green-700">{{ r.totalPresent }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="late">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700 text-center">Late</th>
                  <td mat-cell *matCellDef="let r" class="text-center">
                    <span class="font-semibold text-yellow-700">{{ r.totalLate }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="halfDay">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700 text-center">Half Day</th>
                  <td mat-cell *matCellDef="let r" class="text-center">
                    <span class="font-semibold text-orange-700">{{ r.totalHalfDay }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="absent">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700 text-center">Absent</th>
                  <td mat-cell *matCellDef="let r" class="text-center">
                    <span class="font-semibold text-red-700">{{ r.totalAbsent }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="workHours">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700 text-right">Work Hrs</th>
                  <td mat-cell *matCellDef="let r" class="text-right font-medium text-blue-700">
                    {{ r.totalWorkHours.toFixed(1) }}h
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="teamCols" class="bg-gray-50"></tr>
                <tr mat-row *matRowDef="let r; columns: teamCols;" class="hover:bg-gray-50"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
      </ng-container>

    </div>
  `,
})
export class AttendanceMonthlyReportComponent implements OnInit {
  readonly personalCols = ['date', 'status', 'checkIn', 'break', 'checkOut', 'workHours'];
  readonly teamCols = ['employee', 'present', 'late', 'halfDay', 'absent', 'workHours'];

  employeeId  = '';
  isHrOrAdmin = false;
  isManager   = false;
  isEmployee  = false;

  currentYear  = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;

  loading        = false;
  personalReport: MonthlyReportDto | null = null;
  teamReport:     EmployeeMonthlySummaryDto[] = [];

  get monthLabel(): string {
    return new Date(this.currentYear, this.currentMonth - 1, 1)
      .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.isHrOrAdmin = this.authService.hasAnyRole(['Admin', 'HR']);
    this.isManager   = this.authService.hasRole('Manager');
    this.isEmployee  = !this.isHrOrAdmin && !this.isManager;

    this.employeeService.getMyProfile().subscribe({
      next: p => { this.employeeId = p.id; this.load(); },
      error: () => this.snackBar.open('Failed to load profile.', 'Close', { duration: 3000 }),
    });
  }

  prevMonth(): void {
    if (this.currentMonth === 1) { this.currentMonth = 12; this.currentYear--; }
    else this.currentMonth--;
    this.load();
  }

  nextMonth(): void {
    if (this.currentMonth === 12) { this.currentMonth = 1; this.currentYear++; }
    else this.currentMonth++;
    this.load();
  }

  load(): void {
    if (!this.employeeId) return;
    this.loading = true;

    if (this.isEmployee) {
      this.attendanceService.getMonthlyReport(this.employeeId, this.currentMonth, this.currentYear)
        .subscribe({
          next: r  => { this.personalReport = r; this.loading = false; },
          error: () => { this.loading = false; this.snackBar.open('Failed to load report.', 'Close', { duration: 3000 }); },
        });
    } else {
      const obs = this.isHrOrAdmin
        ? this.attendanceService.getCompanyMonthly(this.currentMonth, this.currentYear)
        : this.attendanceService.getManagerTeamMonthly(this.employeeId, this.currentMonth, this.currentYear);

      obs.subscribe({
        next: data => { this.teamReport = data; this.loading = false; },
        error: () => { this.loading = false; this.snackBar.open('Failed to load report.', 'Close', { duration: 3000 }); },
      });
    }
  }

  sum(field: keyof EmployeeMonthlySummaryDto): number {
    return this.teamReport.reduce((acc, r) => acc + (r[field] as number), 0);
  }

  sumHours(): string {
    return this.teamReport.reduce((acc, r) => acc + r.totalWorkHours, 0).toFixed(0);
  }

  statusBadge(status: string): Record<string, boolean> {
    return {
      'bg-green-100 text-green-800':   status === 'Present',
      'bg-yellow-100 text-yellow-800': status === 'Late',
      'bg-orange-100 text-orange-800': status === 'HalfDay',
      'bg-red-100 text-red-800':       status === 'Absent',
    };
  }

  fmtTime(t: string | null): string {
    if (!t) return '—';
    const [hStr, mStr] = t.split(':');
    const h = parseInt(hStr, 10);
    return `${h % 12 || 12}:${mStr} ${h >= 12 ? 'PM' : 'AM'}`;
  }
}
