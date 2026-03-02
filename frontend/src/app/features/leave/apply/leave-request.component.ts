import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LeaveService } from '../../../core/services/leave.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { LeaveBalanceDto, LeaveRequestDto } from '../../../models/leave.model';

@Component({
  selector: 'app-leave-request',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule,
    MatTableModule, MatTooltipModule,
  ],
  template: `
    <div class="p-6">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p class="text-sm text-gray-500 mt-0.5">Apply for leave and track your requests</p>
        </div>
        <a *ngIf="canApprove" routerLink="/leave/approvals"
           mat-stroked-button color="primary">
          <mat-icon>approval</mat-icon>
          Pending Approvals
        </a>
      </div>

      <!-- Balance Cards -->
      <div class="mb-6">
        <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Leave Balance — {{ currentYear }}
        </h2>

        <div *ngIf="balanceLoading" class="flex justify-center py-8">
          <mat-spinner diameter="36"></mat-spinner>
        </div>

        <div *ngIf="!balanceLoading && balances.length === 0"
             class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center text-sm text-yellow-700">
          <mat-icon class="align-middle mr-1 text-yellow-500" style="font-size:1.1rem">info</mat-icon>
          No leave balance found for this year. Please contact HR.
        </div>

        <div *ngIf="!balanceLoading && balances.length > 0"
             class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let b of balances"
               class="bg-white border rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shrink-0"
                 [ngClass]="getBalanceCircleClass(b)">
              {{ b.remainingDays }}
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-gray-900 truncate">{{ b.leaveType }}</p>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ b.usedDays }} used / {{ b.totalDays }} total
              </p>
              <div class="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div class="h-1.5 rounded-full"
                     [ngClass]="getBalanceBarClass(b)"
                     [style.width.%]="getBalancePct(b)">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Apply Form -->
      <mat-card class="mb-6">
        <mat-card-content class="p-6">
          <h2 class="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <mat-icon class="text-blue-600">event_available</mat-icon>
            Apply for Leave
          </h2>

          <form [formGroup]="applyForm" (ngSubmit)="onApply()" class="space-y-4">

            <!-- Leave Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Leave Type <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <mat-icon class="field-icon">category</mat-icon>
                </span>
                <select formControlName="leaveTypeId" class="field-input"
                        [class.field-input--error]="f['leaveTypeId'].invalid && f['leaveTypeId'].touched">
                  <option value="">Select leave type…</option>
                  <option *ngFor="let b of balances" [value]="b.leaveTypeId">
                    {{ b.leaveType }} ({{ b.remainingDays }} days remaining)
                  </option>
                </select>
              </div>
              <p *ngIf="f['leaveTypeId'].invalid && f['leaveTypeId'].touched"
                 class="mt-1 text-xs text-red-500">Leave type is required.</p>
            </div>

            <!-- Date Range -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  From Date <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <mat-icon class="field-icon">calendar_today</mat-icon>
                  </span>
                  <input type="date" formControlName="fromDate" class="field-input"
                         [class.field-input--error]="f['fromDate'].invalid && f['fromDate'].touched" />
                </div>
                <p *ngIf="f['fromDate'].invalid && f['fromDate'].touched"
                   class="mt-1 text-xs text-red-500">From date is required.</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  To Date <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <mat-icon class="field-icon">calendar_today</mat-icon>
                  </span>
                  <input type="date" formControlName="toDate" class="field-input"
                         [class.field-input--error]="f['toDate'].invalid && f['toDate'].touched" />
                </div>
                <p *ngIf="f['toDate'].invalid && f['toDate'].touched"
                   class="mt-1 text-xs text-red-500">To date is required.</p>
              </div>
            </div>

            <!-- Duration indicator -->
            <div *ngIf="leaveDays > 0" class="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
              <mat-icon style="font-size:1rem;width:1rem;height:1rem;">info</mat-icon>
              <span><strong>{{ leaveDays }}</strong> calendar day{{ leaveDays !== 1 ? 's' : '' }} selected</span>
            </div>

            <!-- Reason -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Reason <span class="text-red-500">*</span>
              </label>
              <textarea formControlName="reason" rows="3"
                        placeholder="Briefly describe the reason for your leave…"
                        maxlength="500"
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        [class.border-red-400]="f['reason'].invalid && f['reason'].touched"></textarea>
              <div class="flex justify-between mt-1">
                <p *ngIf="f['reason'].invalid && f['reason'].touched"
                   class="text-xs text-red-500">Reason is required.</p>
                <p class="text-xs text-gray-400 ml-auto">
                  {{ f['reason'].value?.length || 0 }}/500
                </p>
              </div>
            </div>

            <!-- Availability & Alternative Phone -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <!-- Availability on phone -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Available on Phone <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <mat-icon class="field-icon">phone_in_talk</mat-icon>
                  </span>
                  <select formControlName="availableOnPhone" class="field-input">
                    <option [ngValue]="true">Yes</option>
                    <option [ngValue]="false">No</option>
                  </select>
                </div>
              </div>

              <!-- Alternative phone number -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Alternative Phone Number
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <mat-icon class="field-icon">phone</mat-icon>
                  </span>
                  <input type="tel" formControlName="alternativePhone"
                         placeholder="e.g. +91 98765 43210"
                         class="field-input" />
                </div>
              </div>

            </div>

            <div class="flex justify-end pt-2">
              <button mat-raised-button color="primary" type="submit"
                      [disabled]="applyForm.invalid || submitting">
                <mat-spinner *ngIf="submitting" diameter="18" class="inline-block mr-1"></mat-spinner>
                <mat-icon *ngIf="!submitting">send</mat-icon>
                Submit Request
              </button>
            </div>

          </form>
        </mat-card-content>
      </mat-card>

      <!-- Request History -->
      <mat-card>
        <mat-card-content class="p-0">
          <div class="px-6 py-4 border-b flex items-center justify-between">
            <h2 class="text-base font-semibold text-gray-900 flex items-center gap-2">
              <mat-icon class="text-gray-500">history</mat-icon>
              Request History
            </h2>
            <button mat-icon-button (click)="loadData()" matTooltip="Refresh" [disabled]="requestsLoading">
              <mat-icon>refresh</mat-icon>
            </button>
          </div>

          <div *ngIf="requestsLoading" class="flex justify-center py-10">
            <mat-spinner diameter="36"></mat-spinner>
          </div>

          <div *ngIf="!requestsLoading && requests.length === 0"
               class="flex flex-col items-center py-14 text-gray-400">
            <mat-icon style="font-size:3rem;width:3rem;height:3rem;" class="mb-3">event_busy</mat-icon>
            <p class="font-medium">No leave requests yet</p>
            <p class="text-sm">Submit your first request above</p>
          </div>

          <div *ngIf="!requestsLoading && requests.length > 0" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">From</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">To</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Days</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Note</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of requests"
                    class="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                  <td class="px-4 py-3">
                    <span class="font-medium text-gray-900">{{ r.leaveType }}</span>
                  </td>
                  <td class="px-4 py-3 text-gray-600">{{ r.fromDate + 'T00:00:00' | date:'MMM d, y' }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ r.toDate + 'T00:00:00' | date:'MMM d, y' }}</td>
                  <td class="px-4 py-3 text-center">
                    <span class="font-semibold text-gray-900">{{ r.totalDays }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                          [ngClass]="getStatusBadge(r.status)">
                      {{ r.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-gray-500 max-w-xs truncate"
                      [matTooltip]="r.rejectionReason || r.reason">
                    <span *ngIf="r.rejectionReason" class="text-red-600">
                      {{ r.rejectionReason }}
                    </span>
                    <span *ngIf="!r.rejectionReason" class="text-gray-400 italic">
                      {{ r.reason }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </mat-card-content>
      </mat-card>

    </div>
  `,
})
export class LeaveRequestComponent implements OnInit {
  employeeId = '';
  balances: LeaveBalanceDto[] = [];
  requests: LeaveRequestDto[] = [];
  applyForm!: FormGroup;
  balanceLoading = false;
  requestsLoading = false;
  submitting = false;
  canApprove = false;
  currentYear = new Date().getFullYear();

  get f() { return this.applyForm.controls; }

  get leaveDays(): number {
    const from = this.f['fromDate'].value as string;
    const to   = this.f['toDate'].value as string;
    if (!from || !to) return 0;
    const diff = new Date(to).getTime() - new Date(from).getTime();
    return diff >= 0 ? Math.floor(diff / 86400000) + 1 : 0;
  }

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.canApprove = this.authService.hasAnyRole(['Admin', 'HR', 'Manager']);

    this.applyForm = this.fb.group({
      leaveTypeId:        ['', Validators.required],
      fromDate:           ['', Validators.required],
      toDate:             ['', Validators.required],
      reason:             ['', [Validators.required, Validators.maxLength(500)]],
      availableOnPhone:   [true],
      alternativePhone:   [''],
    });

    this.employeeService.getMyProfile().subscribe({
      next: profile => {
        this.employeeId = profile.id;
        this.loadData();
      },
      error: () => this.snackBar.open('Failed to load profile.', 'Close', { duration: 3000 }),
    });
  }

  loadData(): void {
    if (!this.employeeId) return;

    this.balanceLoading   = true;
    this.requestsLoading  = true;

    this.leaveService.getBalance(this.employeeId, this.currentYear).subscribe({
      next: b  => { this.balances = b; this.balanceLoading = false; },
      error: () => { this.balanceLoading = false; },
    });

    this.leaveService.getRequests(this.employeeId).subscribe({
      next: r  => { this.requests = r; this.requestsLoading = false; },
      error: () => { this.requestsLoading = false; },
    });
  }

  onApply(): void {
    if (this.applyForm.invalid || !this.employeeId) return;

    const from = this.f['fromDate'].value as string;
    const to   = this.f['toDate'].value as string;

    if (new Date(to) < new Date(from)) {
      this.snackBar.open('To date must be on or after From date.', 'Close', { duration: 4000 });
      return;
    }

    this.submitting = true;
    this.leaveService.applyLeave(this.employeeId, {
      leaveTypeId:       this.f['leaveTypeId'].value,
      fromDate:          from,
      toDate:            to,
      reason:            this.f['reason'].value,
      availableOnPhone:  this.f['availableOnPhone'].value,
      alternativePhone:  this.f['alternativePhone'].value || '',
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.snackBar.open('Leave request submitted!', 'OK', { duration: 3000 });
        this.applyForm.reset();
        this.loadData();
      },
      error: err => {
        this.submitting = false;
        this.snackBar.open(
          err?.error?.error || 'Failed to submit request.',
          'Close', { duration: 5000, panelClass: ['snack-error'] }
        );
      },
    });
  }

  getStatusBadge(status: string): Record<string, boolean> {
    return {
      'bg-yellow-100 text-yellow-800': status === 'Pending',
      'bg-green-100 text-green-800':   status === 'Approved',
      'bg-red-100 text-red-800':       status === 'Rejected',
      'bg-gray-100 text-gray-700':     status === 'Cancelled',
    };
  }

  getBalanceCircleClass(b: LeaveBalanceDto): Record<string, boolean> {
    const pct = b.totalDays > 0 ? b.remainingDays / b.totalDays : 0;
    return {
      'bg-green-100 text-green-700':  pct > 0.5,
      'bg-yellow-100 text-yellow-700': pct > 0.2 && pct <= 0.5,
      'bg-red-100 text-red-700':      pct <= 0.2,
    };
  }

  getBalanceBarClass(b: LeaveBalanceDto): Record<string, boolean> {
    const pct = b.totalDays > 0 ? b.remainingDays / b.totalDays : 0;
    return {
      'bg-green-500':  pct > 0.5,
      'bg-yellow-500': pct > 0.2 && pct <= 0.5,
      'bg-red-500':    pct <= 0.2,
    };
  }

  getBalancePct(b: LeaveBalanceDto): number {
    return b.totalDays > 0 ? (b.remainingDays / b.totalDays) * 100 : 0;
  }
}
