import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LeaveService } from '../../../core/services/leave.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { LeaveRequestDto } from '../../../models/leave.model';

// ── Reject dialog ─────────────────────────────────────────────────────────────

@Component({
  selector: 'app-reject-leave-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="p-2">
      <h2 mat-dialog-title class="flex items-center gap-2">
        <mat-icon class="text-red-500">cancel</mat-icon>
        Reject Leave Request
      </h2>

      <mat-dialog-content class="!px-0 !pt-2 !pb-4">
        <div class="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600">
          <p><strong>Employee:</strong> {{ data.employeeName }}</p>
          <p><strong>Leave Type:</strong> {{ data.leaveType }}</p>
          <p>
            <strong>Period:</strong>
            {{ data.fromDate + 'T00:00:00' | date:'MMM d' }} –
            {{ data.toDate + 'T00:00:00' | date:'MMM d, y' }}
            ({{ data.totalDays }} day{{ data.totalDays !== 1 ? 's' : '' }})
          </p>
        </div>

        <label class="block text-sm font-medium text-gray-700 mb-1.5">
          Rejection Reason <span class="text-red-500">*</span>
        </label>
        <textarea
          [formControl]="reason"
          rows="3"
          maxlength="500"
          placeholder="Provide a reason for rejection…"
          class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
          [class.border-red-400]="reason.invalid && reason.touched">
        </textarea>
        <p *ngIf="reason.invalid && reason.touched" class="mt-1 text-xs text-red-500">
          Please provide a rejection reason.
        </p>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="!px-0">
        <button mat-stroked-button [mat-dialog-close]="null">Cancel</button>
        <button mat-raised-button color="warn"
                [disabled]="reason.invalid"
                [mat-dialog-close]="reason.value">
          <mat-icon>block</mat-icon>
          Reject Request
        </button>
      </mat-dialog-actions>
    </div>
  `,
})
export class RejectLeaveDialogComponent {
  reason = new FormControl('', [Validators.required, Validators.minLength(3)]);

  constructor(
    public dialogRef: MatDialogRef<RejectLeaveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LeaveRequestDto,
  ) {}
}

// ── Leave Approval Component ──────────────────────────────────────────────────

@Component({
  selector: 'app-leave-approval',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule,
    MatTableModule, MatTooltipModule, MatDialogModule,
  ],
  template: `
    <div class="p-6">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Leave Approvals</h1>
          <p class="text-sm text-gray-500 mt-0.5">
            {{ requests.length }} pending request{{ requests.length !== 1 ? 's' : '' }} awaiting action
          </p>
        </div>
        <div class="flex gap-2 items-center">
          <a routerLink="/leave" mat-stroked-button>
            <mat-icon>arrow_back</mat-icon>My Leave
          </a>
          <button mat-icon-button (click)="loadRequests()" matTooltip="Refresh" [disabled]="loading">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-20">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && requests.length === 0">
        <mat-card>
          <mat-card-content>
            <div class="flex flex-col items-center py-20 text-gray-400">
              <div class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <mat-icon class="text-green-500" style="font-size:2.5rem;width:2.5rem;height:2.5rem;">
                  check_circle
                </mat-icon>
              </div>
              <p class="text-lg font-semibold text-gray-700">All caught up!</p>
              <p class="text-sm mt-1">No pending leave requests at this time.</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Requests Table -->
      <mat-card *ngIf="!loading && requests.length > 0">
        <mat-card-content class="p-0">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Leave Type</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">From</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">To</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Days</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Reason</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Applied On</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of requests"
                    class="border-b last:border-b-0 hover:bg-gray-50 transition-colors">

                  <!-- Employee -->
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {{ getInitials(r.employeeName) }}
                      </div>
                      <span class="font-medium text-gray-900 whitespace-nowrap">{{ r.employeeName }}</span>
                    </div>
                  </td>

                  <!-- Leave Type -->
                  <td class="px-4 py-3">
                    <span class="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {{ r.leaveType }}
                    </span>
                  </td>

                  <!-- From / To -->
                  <td class="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {{ r.fromDate + 'T00:00:00' | date:'MMM d, y' }}
                  </td>
                  <td class="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {{ r.toDate + 'T00:00:00' | date:'MMM d, y' }}
                  </td>

                  <!-- Days -->
                  <td class="px-4 py-3 text-center">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-800 font-semibold text-xs">
                      {{ r.totalDays }}
                    </span>
                  </td>

                  <!-- Reason -->
                  <td class="px-4 py-3 text-gray-600 max-w-[14rem]">
                    <p class="truncate" [matTooltip]="r.reason">{{ r.reason || '—' }}</p>
                  </td>

                  <!-- Applied On -->
                  <td class="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {{ r.createdAt | date:'MMM d, y' }}
                  </td>

                  <!-- Actions -->
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-center gap-2">
                      <button mat-mini-fab color="primary"
                              [disabled]="processingId === r.id"
                              (click)="confirmApprove(r)"
                              matTooltip="Approve"
                              class="!shadow-none !bg-green-600 hover:!bg-green-700">
                        <mat-spinner *ngIf="processingId === r.id" diameter="18"></mat-spinner>
                        <mat-icon *ngIf="processingId !== r.id" class="text-white text-sm">check</mat-icon>
                      </button>
                      <button mat-mini-fab color="warn"
                              [disabled]="processingId === r.id"
                              (click)="openRejectDialog(r)"
                              matTooltip="Reject"
                              class="!shadow-none">
                        <mat-icon class="text-white text-sm">close</mat-icon>
                      </button>
                    </div>
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
export class LeaveApprovalComponent implements OnInit {
  requests: LeaveRequestDto[] = [];
  approverId = '';
  loading = false;
  processingId: string | null = null;

  constructor(
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.employeeService.getMyProfile().subscribe({
      next: profile => {
        this.approverId = profile.id;
        this.loadRequests();
      },
      error: () => this.snackBar.open('Failed to load profile.', 'Close', { duration: 3000 }),
    });
  }

  loadRequests(): void {
    if (!this.approverId) return;
    this.loading = true;
    this.leaveService.getPendingRequests(this.approverId).subscribe({
      next: r  => { this.requests = r; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  confirmApprove(r: LeaveRequestDto): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Approve Leave Request',
        message:
          `Approve ${r.totalDays}-day ${r.leaveType} request for ` +
          `${r.employeeName}?\n\n` +
          `${r.fromDate.replace(/-/g, '/')} → ${r.toDate.replace(/-/g, '/')}`,
        icon: 'check_circle',
        confirmLabel: 'Approve',
        confirmColor: 'primary',
      } as ConfirmDialogData,
      width: '420px',
    });
    ref.afterClosed().subscribe((ok: boolean) => { if (ok) this.approve(r); });
  }

  openRejectDialog(r: LeaveRequestDto): void {
    const ref = this.dialog.open(RejectLeaveDialogComponent, {
      data: r,
      width: '480px',
    });
    ref.afterClosed().subscribe((reason: string | null) => {
      if (reason) this.reject(r, reason);
    });
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ').filter(p => p.length > 0);
    if (!parts.length) return '?';
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private approve(r: LeaveRequestDto): void {
    this.processingId = r.id;
    this.leaveService.approveLeave(r.id, this.approverId).subscribe({
      next: () => {
        this.processingId = null;
        this.snackBar.open(
          `Leave approved for ${r.employeeName}.`, 'OK', { duration: 3000 }
        );
        this.requests = this.requests.filter(x => x.id !== r.id);
      },
      error: err => {
        this.processingId = null;
        this.snackBar.open(
          err?.error?.error || 'Approval failed.',
          'Close', { duration: 4000, panelClass: ['snack-error'] }
        );
      },
    });
  }

  private reject(r: LeaveRequestDto, reason: string): void {
    this.processingId = r.id;
    this.leaveService.rejectLeave(r.id, this.approverId, reason).subscribe({
      next: () => {
        this.processingId = null;
        this.snackBar.open(
          `Leave rejected for ${r.employeeName}.`, 'OK', { duration: 3000 }
        );
        this.requests = this.requests.filter(x => x.id !== r.id);
      },
      error: err => {
        this.processingId = null;
        this.snackBar.open(
          err?.error?.error || 'Rejection failed.',
          'Close', { duration: 4000, panelClass: ['snack-error'] }
        );
      },
    });
  }
}
