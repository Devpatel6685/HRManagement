import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AttendanceService } from '../../../core/services/attendance.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { TeamSummaryDto } from '../../../models/attendance.model';

@Component({
  selector: 'app-attendance-team-summary',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule,
    MatTableModule, MatTooltipModule,
  ],
  template: `
    <div class="p-6">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Team Attendance</h1>
          <p class="text-sm text-gray-500 mt-0.5">
            {{ isHrOrAdmin ? "Company-wide daily summary" : "Your team's attendance for the selected date" }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <input type="date" [(ngModel)]="selectedDate"
                 class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                 (change)="load()" />
          <button mat-raised-button color="primary" (click)="load()" [disabled]="loading">
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
        </div>
      </div>

      <!-- Summary chips -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6" *ngIf="rows.length">
        <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-green-700">{{ count('Present') }}</p>
          <p class="text-xs font-medium text-green-600 mt-1">Present</p>
        </div>
        <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-yellow-700">{{ count('Late') }}</p>
          <p class="text-xs font-medium text-yellow-600 mt-1">Late</p>
        </div>
        <div class="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-orange-700">{{ count('HalfDay') }}</p>
          <p class="text-xs font-medium text-orange-600 mt-1">Half Day</p>
        </div>
        <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-red-700">{{ count('Absent') }}</p>
          <p class="text-xs font-medium text-red-600 mt-1">Absent</p>
        </div>
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
          <p class="text-2xl font-bold text-blue-700">{{ rows.length }}</p>
          <p class="text-xs font-medium text-blue-600 mt-1">Total</p>
        </div>
      </div>

      <!-- Table -->
      <mat-card>
        <mat-card-content class="p-0">

          <div *ngIf="loading" class="flex justify-center items-center py-16">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <div *ngIf="!loading && rows.length === 0" class="py-16 text-center text-gray-400">
            <mat-icon class="text-5xl mb-2" style="font-size:3rem;width:3rem;height:3rem;">groups</mat-icon>
            <p class="text-sm mt-2">No team members found.</p>
          </div>

          <div *ngIf="!loading && rows.length > 0" class="overflow-x-auto">
            <table mat-table [dataSource]="rows" class="w-full">

              <!-- Employee -->
              <ng-container matColumnDef="employee">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">Employee</th>
                <td mat-cell *matCellDef="let r">
                  <p class="font-medium text-gray-900">{{ r.employeeName }}</p>
                  <p class="text-xs text-gray-500">{{ r.department }}</p>
                </td>
              </ng-container>

              <!-- Status -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">Status</th>
                <td mat-cell *matCellDef="let r">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                        [ngClass]="statusBadge(r.status)">
                    {{ r.status }}
                  </span>
                </td>
              </ng-container>

              <!-- Check In -->
              <ng-container matColumnDef="checkIn">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">Check In</th>
                <td mat-cell *matCellDef="let r" class="text-sm text-gray-700">
                  {{ fmtTime(r.checkIn) }}
                </td>
              </ng-container>

              <!-- Break -->
              <ng-container matColumnDef="break">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">Breaks</th>
                <td mat-cell *matCellDef="let r" class="text-sm text-amber-700">
                  <ng-container *ngIf="r.breaks?.length; else noBreak">
                    <div *ngFor="let b of r.breaks; let i = index" class="leading-snug">
                      <span *ngIf="r.breaks.length > 1" class="text-xs text-gray-400 mr-1">{{ i + 1 }}.</span>
                      {{ fmtTime(b.breakStart) }}
                      <ng-container *ngIf="b.breakEnd"> – {{ fmtTime(b.breakEnd) }}</ng-container>
                      <span *ngIf="!b.breakEnd" class="text-xs text-amber-500 ml-1">(ongoing)</span>
                    </div>
                  </ng-container>
                  <ng-template #noBreak><span class="text-gray-400">—</span></ng-template>
                </td>
              </ng-container>

              <!-- Check Out -->
              <ng-container matColumnDef="checkOut">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">Check Out</th>
                <td mat-cell *matCellDef="let r" class="text-sm text-gray-700">
                  {{ fmtTime(r.checkOut) }}
                </td>
              </ng-container>

              <!-- Work Hours -->
              <ng-container matColumnDef="workHours">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700 text-right">Work Hrs</th>
                <td mat-cell *matCellDef="let r" class="text-sm font-medium text-right"
                    [class.text-blue-700]="r.workHours !== null"
                    [class.text-gray-400]="r.workHours === null">
                  {{ r.workHours !== null ? r.workHours.toFixed(1) + 'h' : '—' }}
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50"></tr>
              <tr mat-row *matRowDef="let r; columns: cols;"
                  class="hover:bg-gray-50 transition-colors"></tr>
            </table>
          </div>

        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class AttendanceTeamSummaryComponent implements OnInit {
  readonly cols = ['employee', 'status', 'checkIn', 'break', 'checkOut', 'workHours'];

  employeeId = '';
  rows: TeamSummaryDto[] = [];
  loading = false;
  isHrOrAdmin = false;
  isManager = false;

  selectedDate = this.toDateStr(new Date());

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.isHrOrAdmin = this.authService.hasAnyRole(['Admin', 'HR']);
    this.isManager   = this.authService.hasRole('Manager');

    this.employeeService.getMyProfile().subscribe({
      next: p => { this.employeeId = p.id; this.load(); },
      error: () => this.snackBar.open('Failed to load profile.', 'Close', { duration: 3000 }),
    });
  }

  load(): void {
    if (!this.employeeId) return;
    this.loading = true;

    const obs = this.isHrOrAdmin
      ? this.attendanceService.getCompanyDaily(this.selectedDate)
      : this.attendanceService.getManagerTeamDaily(this.employeeId, this.selectedDate);

    obs.subscribe({
      next: data => { this.rows = data; this.loading = false; },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load attendance data.', 'Close', { duration: 3000 });
      },
    });
  }

  count(status: string): number {
    return this.rows.filter(r => r.status === status).length;
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
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${mStr} ${ampm}`;
  }

  private toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
