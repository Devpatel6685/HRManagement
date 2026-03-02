import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { AttendanceService } from '../../../core/services/attendance.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AttendanceDto, BreakRecord, MonthlyReportDto } from '../../../models/attendance.model';

interface CalendarDay {
  date: Date;
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  isFuture: boolean;
  isToday: boolean;
  attendance: AttendanceDto | null;
}

@Component({
  selector: 'app-attendance-calendar',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule, MatSnackBarModule,
  ],
  template: `
    <div class="p-6">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">My Attendance</h1>
          <p class="text-sm text-gray-500 mt-0.5">Track your daily attendance</p>
        </div>
      </div>

      <!-- Check-In / Break / Check-Out card -->
      <mat-card class="mb-6">
        <mat-card-content class="p-4">
          <div class="flex items-center justify-between flex-wrap gap-4">

            <!-- Time info -->
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full flex items-center justify-center"
                   [ngClass]="onBreak ? 'bg-amber-100' : 'bg-blue-100'">
                <mat-icon [class]="onBreak ? 'text-amber-600' : 'text-blue-600'">
                  {{ onBreak ? 'free_breakfast' : 'access_time' }}
                </mat-icon>
              </div>
              <div>
                <p class="font-semibold text-gray-900">
                  Today — {{ todayLabel }}
                  <span *ngIf="onBreak"
                        class="ml-2 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    On Break
                  </span>
                </p>
                <p class="text-sm text-gray-500" *ngIf="!todayRecord">Not checked in yet</p>
                <p class="text-sm text-gray-600" *ngIf="todayRecord">
                  <span *ngIf="todayRecord.checkIn">
                    In: <strong>{{ fmtTime(todayRecord.checkIn) }}</strong>
                  </span>
                  <ng-container *ngFor="let b of todayRecord.breaks; let i = index">
                    <span class="ml-3 text-amber-700">
                      Break {{ todayRecord.breaks.length > 1 ? (i + 1) : '' }}:
                      <strong>{{ fmtTime(b.breakStart) }}</strong>
                      <ng-container *ngIf="b.breakEnd"> &ndash; <strong>{{ fmtTime(b.breakEnd) }}</strong></ng-container>
                      <span *ngIf="!b.breakEnd" class="text-xs text-amber-500 ml-1">(ongoing)</span>
                    </span>
                  </ng-container>
                  <span *ngIf="todayRecord.checkOut" class="ml-3">
                    Out: <strong>{{ fmtTime(todayRecord.checkOut) }}</strong>
                  </span>
                  <span *ngIf="todayRecord.workHours !== null" class="ml-3 text-blue-600 font-medium">
                    {{ todayRecord.workHours.toFixed(1) }}h
                  </span>
                  <span class="ml-2">
                    <span class="px-1.5 py-0.5 rounded-full text-xs font-semibold"
                          [ngClass]="getStatusBadge(todayRecord.status)">
                      {{ todayRecord.status }}
                    </span>
                  </span>
                </p>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex gap-3 flex-wrap">

              <!-- Check In -->
              <button mat-raised-button color="primary"
                      [disabled]="!canCheckIn || checkInLoading"
                      (click)="checkIn()">
                <mat-spinner *ngIf="checkInLoading" diameter="18" class="inline-block mr-1"></mat-spinner>
                <mat-icon *ngIf="!checkInLoading">login</mat-icon>
                Check In
              </button>

              <!-- Start Break -->
              <button mat-raised-button
                      style="background-color:#f59e0b;color:#fff"
                      [disabled]="!canBreakStart || breakLoading"
                      (click)="startBreak()">
                <mat-spinner *ngIf="breakLoading && !onBreak" diameter="18" class="inline-block mr-1"></mat-spinner>
                <mat-icon *ngIf="!(breakLoading && !onBreak)">free_breakfast</mat-icon>
                Start Break
              </button>

              <!-- End Break -->
              <button mat-raised-button
                      style="background-color:#10b981;color:#fff"
                      [disabled]="!canBreakEnd || breakLoading"
                      (click)="endBreak()">
                <mat-spinner *ngIf="breakLoading && onBreak" diameter="18" class="inline-block mr-1"></mat-spinner>
                <mat-icon *ngIf="!(breakLoading && onBreak)">play_arrow</mat-icon>
                End Break
              </button>

              <!-- Check Out -->
              <button mat-raised-button color="accent"
                      [disabled]="!canCheckOut || checkOutLoading"
                      (click)="checkOut()">
                <mat-spinner *ngIf="checkOutLoading" diameter="18" class="inline-block mr-1"></mat-spinner>
                <mat-icon *ngIf="!checkOutLoading">logout</mat-icon>
                Check Out
              </button>

            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Summary stats -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6" *ngIf="report">
        <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p class="text-3xl font-bold text-green-700">{{ report.totalPresent }}</p>
          <p class="text-xs font-medium text-green-600 mt-1">Present</p>
        </div>
        <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p class="text-3xl font-bold text-yellow-700">{{ report.totalLate }}</p>
          <p class="text-xs font-medium text-yellow-600 mt-1">Late</p>
        </div>
        <div class="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          <p class="text-3xl font-bold text-orange-700">{{ report.totalHalfDay }}</p>
          <p class="text-xs font-medium text-orange-600 mt-1">Half Day</p>
        </div>
        <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p class="text-3xl font-bold text-red-700">{{ report.totalAbsent }}</p>
          <p class="text-xs font-medium text-red-600 mt-1">Absent</p>
        </div>
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
          <p class="text-3xl font-bold text-blue-700">{{ report.totalWorkHours.toFixed(0) }}</p>
          <p class="text-xs font-medium text-blue-600 mt-1">Work Hours</p>
        </div>
      </div>

      <!-- Calendar -->
      <mat-card>
        <mat-card-content class="p-0">

          <!-- Month navigation -->
          <div class="flex items-center justify-between px-6 py-4 border-b">
            <button mat-icon-button (click)="prevMonth()" matTooltip="Previous month">
              <mat-icon>chevron_left</mat-icon>
            </button>
            <h2 class="text-lg font-semibold text-gray-900">{{ monthLabel }}</h2>
            <button mat-icon-button (click)="nextMonth()" matTooltip="Next month">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>

          <!-- Loading overlay -->
          <div *ngIf="loading" class="flex justify-center items-center py-24">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <div *ngIf="!loading">
            <!-- Day-of-week headers -->
            <div class="grid grid-cols-7 border-b bg-gray-50">
              <div *ngFor="let d of weekDays"
                   class="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
                   [class.text-red-400]="d === 'Sat' || d === 'Sun'">
                {{ d }}
              </div>
            </div>

            <!-- Calendar grid -->
            <div *ngFor="let week of calendarWeeks" class="grid grid-cols-7 border-b last:border-b-0">
              <div *ngFor="let day of week"
                   class="min-h-[5.5rem] p-2 border-r last:border-r-0 cursor-default relative transition-colors"
                   [ngClass]="getDayClass(day)"
                   [matTooltip]="getDayTooltip(day)"
                   matTooltipClass="whitespace-pre-line"
                   [matTooltipShowDelay]="150">

                <!-- Day number -->
                <span class="text-sm font-semibold leading-none"
                      [class.opacity-30]="!day.isCurrentMonth">
                  {{ day.dayNumber }}
                </span>

                <!-- Today ring indicator -->
                <span *ngIf="day.isToday"
                      class="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500"></span>

                <!-- Status label -->
                <div *ngIf="day.isCurrentMonth && !day.isWeekend && day.attendance" class="mt-2">
                  <span class="text-xs font-medium leading-tight block">
                    {{ day.attendance.status }}
                  </span>
                  <span *ngIf="day.attendance.checkIn" class="text-xs opacity-75 block">
                    {{ fmtTime(day.attendance.checkIn) }}
                  </span>
                  <span *ngIf="day.attendance.breaks?.length"
                        class="text-xs text-amber-600 block">
                    {{ day.attendance.breaks.length }} break{{ day.attendance.breaks.length > 1 ? 's' : '' }}
                  </span>
                </div>

                <!-- Future placeholder -->
                <div *ngIf="day.isCurrentMonth && !day.isWeekend && !day.attendance && !day.isFuture && !day.isToday"
                     class="mt-2">
                  <span class="text-xs font-medium text-red-400">Absent</span>
                </div>
              </div>
            </div>
          </div>

        </mat-card-content>
      </mat-card>

      <!-- Legend -->
      <div class="flex flex-wrap gap-4 mt-4 px-1">
        <div class="flex items-center gap-1.5">
          <div class="w-3.5 h-3.5 rounded-sm bg-green-100 border border-green-300"></div>
          <span class="text-xs text-gray-500">Present</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-3.5 h-3.5 rounded-sm bg-yellow-100 border border-yellow-300"></div>
          <span class="text-xs text-gray-500">Late</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-3.5 h-3.5 rounded-sm bg-orange-100 border border-orange-300"></div>
          <span class="text-xs text-gray-500">Half Day</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-3.5 h-3.5 rounded-sm bg-red-100 border border-red-300"></div>
          <span class="text-xs text-gray-500">Absent</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-3.5 h-3.5 rounded-sm bg-gray-100 border border-gray-200"></div>
          <span class="text-xs text-gray-500">Weekend</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 rounded-full bg-blue-500"></div>
          <span class="text-xs text-gray-500">Today</span>
        </div>
      </div>

    </div>
  `,
})
export class AttendanceCalendarComponent implements OnInit {
  readonly weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  employeeId = '';
  report: MonthlyReportDto | null = null;
  calendarWeeks: CalendarDay[][] = [];
  todayRecord: AttendanceDto | null = null;

  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;

  loading       = false;
  checkInLoading  = false;
  checkOutLoading = false;
  breakLoading    = false;

  get todayLabel(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });
  }

  get monthLabel(): string {
    return new Date(this.currentYear, this.currentMonth - 1, 1)
      .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  /** True when there is an ongoing (not yet ended) break */
  get onBreak(): boolean {
    return this.todayRecord?.breaks.some(b => !b.breakEnd) ?? false;
  }

  get canCheckIn(): boolean {
    return !!this.employeeId && !this.checkInLoading && !this.checkOutLoading && !this.breakLoading
      && !this.todayRecord?.checkIn;
  }

  get canBreakStart(): boolean {
    return !!this.employeeId && !this.checkInLoading && !this.checkOutLoading && !this.breakLoading
      && !!this.todayRecord?.checkIn
      && !this.todayRecord?.checkOut
      && !this.onBreak;   // can't start a new break while one is ongoing
  }

  get canBreakEnd(): boolean {
    return !!this.employeeId && !this.checkInLoading && !this.checkOutLoading && !this.breakLoading
      && this.onBreak;
  }

  get canCheckOut(): boolean {
    return !!this.employeeId && !this.checkInLoading && !this.checkOutLoading && !this.breakLoading
      && !!this.todayRecord?.checkIn && !this.todayRecord?.checkOut;
  }

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.employeeService.getMyProfile().subscribe({
      next: profile => {
        this.employeeId = profile.id;
        this.loadCalendar();
      },
      error: () => this.snackBar.open('Failed to load profile.', 'Close', { duration: 3000 }),
    });
  }

  prevMonth(): void {
    if (this.currentMonth === 1) { this.currentMonth = 12; this.currentYear--; }
    else this.currentMonth--;
    this.loadCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 12) { this.currentMonth = 1; this.currentYear++; }
    else this.currentMonth++;
    this.loadCalendar();
  }

  checkIn(): void {
    this.checkInLoading = true;
    this.attendanceService.checkIn(this.employeeId).subscribe({
      next: () => {
        this.checkInLoading = false;
        this.snackBar.open('Checked in successfully!', 'OK', { duration: 3000 });
        this.loadCalendar();
      },
      error: err => {
        this.checkInLoading = false;
        this.snackBar.open(err?.error?.error || 'Check-in failed.', 'Close', { duration: 4000 });
      },
    });
  }

  startBreak(): void {
    this.breakLoading = true;
    this.attendanceService.startBreak(this.employeeId).subscribe({
      next: record => {
        this.breakLoading = false;
        this.todayRecord = record;
        this.snackBar.open('Break started. Enjoy your break!', 'OK', { duration: 3000 });
      },
      error: err => {
        this.breakLoading = false;
        this.snackBar.open(err?.error?.error || 'Failed to start break.', 'Close', { duration: 4000 });
      },
    });
  }

  endBreak(): void {
    this.breakLoading = true;
    this.attendanceService.endBreak(this.employeeId).subscribe({
      next: record => {
        this.breakLoading = false;
        this.todayRecord = record;
        this.snackBar.open('Break ended. Welcome back!', 'OK', { duration: 3000 });
      },
      error: err => {
        this.breakLoading = false;
        this.snackBar.open(err?.error?.error || 'Failed to end break.', 'Close', { duration: 4000 });
      },
    });
  }

  checkOut(): void {
    this.checkOutLoading = true;
    this.attendanceService.checkOut(this.employeeId).subscribe({
      next: () => {
        this.checkOutLoading = false;
        this.snackBar.open('Checked out successfully!', 'OK', { duration: 3000 });
        this.loadCalendar();
      },
      error: err => {
        this.checkOutLoading = false;
        this.snackBar.open(err?.error?.error || 'Check-out failed.', 'Close', { duration: 4000 });
      },
    });
  }

  getDayClass(day: CalendarDay): Record<string, boolean> {
    if (!day.isCurrentMonth) {
      return { 'bg-gray-50 opacity-40': true };
    }
    if (day.isWeekend) {
      return { 'bg-gray-100 text-gray-400': true };
    }

    const today = { 'ring-2 ring-inset ring-blue-500': day.isToday };

    if (day.attendance) {
      const s = day.attendance.status;
      return {
        ...today,
        'bg-green-100 text-green-800':   s === 'Present',
        'bg-yellow-100 text-yellow-800': s === 'Late',
        'bg-orange-100 text-orange-800': s === 'HalfDay',
        'bg-red-100 text-red-800':       s === 'Absent',
      };
    }

    if (day.isFuture || day.isToday) {
      return { ...today, 'bg-white text-gray-700': true };
    }

    return { 'bg-red-50 text-red-300': true };
  }

  getDayTooltip(day: CalendarDay): string {
    if (!day.isCurrentMonth || day.isWeekend || !day.attendance) return '';
    const a = day.attendance;
    const parts: string[] = [`Status: ${a.status}`];
    if (a.checkIn) parts.push(`Check-in:  ${this.fmtTime(a.checkIn)}`);
    a.breaks?.forEach((b, i) => {
      const label = a.breaks.length > 1 ? `Break ${i + 1}:  ` : `Break:     `;
      parts.push(label + this.fmtTime(b.breakStart) + (b.breakEnd ? ' – ' + this.fmtTime(b.breakEnd) : ' (ongoing)'));
    });
    if (a.checkOut) parts.push(`Check-out: ${this.fmtTime(a.checkOut)}`);
    if (a.workHours !== null) parts.push(`Work hrs:  ${a.workHours.toFixed(2)}h`);
    return parts.join('\n');
  }

  getStatusBadge(status: string): Record<string, boolean> {
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
    const h12 = h % 12 || 12;
    return `${h12}:${mStr} ${ampm}`;
  }

  // ── Private ───────────────────────────────────────────────────────────

  private loadCalendar(): void {
    if (!this.employeeId) return;
    this.loading = true;
    this.attendanceService
      .getMonthlyReport(this.employeeId, this.currentMonth, this.currentYear)
      .subscribe({
        next: report => {
          this.report = report;
          this.calendarWeeks = this.buildCalendarGrid(report.records);
          this.todayRecord =
            report.records.find(r => r.date === this.getTodayStr()) ?? null;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Failed to load attendance data.', 'Close', { duration: 3000 });
        },
      });
  }

  private buildCalendarGrid(records: AttendanceDto[]): CalendarDay[][] {
    const map = new Map<string, AttendanceDto>(records.map(r => [r.date, r]));

    const year  = this.currentYear;
    const month = this.currentMonth;

    const firstDay  = new Date(year, month - 1, 1);
    const lastDay   = new Date(year, month, 0);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const days: CalendarDay[] = [];

    const startDow = (firstDay.getDay() + 6) % 7;
    for (let i = startDow - 1; i >= 0; i--) {
      days.push(this.makeDay(new Date(year, month - 1, -i), false, map, todayDate));
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(this.makeDay(new Date(year, month - 1, d), true, map, todayDate));
    }

    const endDow = (lastDay.getDay() + 6) % 7;
    const tail = endDow === 6 ? 0 : 6 - endDow;
    for (let i = 1; i <= tail; i++) {
      days.push(this.makeDay(new Date(year, month, i), false, map, todayDate));
    }

    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  }

  private makeDay(
    date: Date, isCurrentMonth: boolean,
    map: Map<string, AttendanceDto>, today: Date
  ): CalendarDay {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const dow = date.getDay();
    date.setHours(0, 0, 0, 0);
    return {
      date,
      dateStr,
      dayNumber:       date.getDate(),
      isCurrentMonth,
      isWeekend:       dow === 0 || dow === 6,
      isFuture:        date > today,
      isToday:         date.getTime() === today.getTime(),
      attendance:      map.get(dateStr) ?? null,
    };
  }

  private getTodayStr(): string {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, '0');
    const d = String(t.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
