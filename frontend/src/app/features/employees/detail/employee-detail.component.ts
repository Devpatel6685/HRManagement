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
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { AssetService } from '../../../core/services/asset.service';
import { LeaveService } from '../../../core/services/leave.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { PayrollService } from '../../../core/services/payroll.service';
import { TrainingService } from '../../../core/services/training.service';
import { DocumentService } from '../../../core/services/document.service';
import { EmployeeDetail } from '../../../models/employee.model';
import { AssetDto } from '../../../models/asset.model';
import { LeaveRequestDto, LeaveBalanceDto } from '../../../models/leave.model';
import { MonthlyReportDto } from '../../../models/attendance.model';
import { PayrollDto } from '../../../models/payroll.model';
import { EmployeeTrainingDto } from '../../../models/training.model';
import { DocumentDto } from '../../../models/document.model';
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
    MatTooltipModule, FormsModule,
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
        <mat-tab *ngIf="showHiddenModules" label="Documents">
          <div class="py-4">

            <!-- Upload panel (Admin/HR only) -->
            <div *ngIf="canEdit" class="bg-white rounded-xl border p-4 mb-5">
              <p class="text-sm font-semibold text-gray-700 mb-3">Upload Document</p>

              <!-- Drag-drop zone -->
              <div class="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors"
                   [class.border-indigo-400]="isDragOver"
                   [class.bg-indigo-50]="isDragOver"
                   [class.border-gray-200]="!isDragOver"
                   (click)="fileInput.click()"
                   (dragover)="onDragOver($event)"
                   (dragleave)="isDragOver = false"
                   (drop)="onDrop($event)">
                <mat-icon class="text-gray-300 mb-2"
                          style="font-size:2.5rem;width:2.5rem;height:2.5rem;">upload_file</mat-icon>
                <p *ngIf="!selectedFile" class="text-sm text-gray-500">
                  Drag &amp; drop a file here, or <span class="text-indigo-600 font-medium">click to browse</span>
                </p>
                <p *ngIf="selectedFile" class="text-sm font-medium text-indigo-700">
                  {{ selectedFile.name }}
                  <span class="text-gray-400 font-normal ml-1">({{ formatFileSize(selectedFile.size) }})</span>
                </p>
                <p class="text-xs text-gray-400 mt-1">PDF, JPG, PNG — max 5 MB</p>
                <input #fileInput type="file" class="hidden"
                       accept=".pdf,.jpg,.jpeg,.png"
                       (change)="onFileSelected($event)" />
              </div>

              <!-- Doc type + Upload button -->
              <div class="flex items-center gap-3 mt-3">
                <select [(ngModel)]="selectedDocType"
                        class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700
                               focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="Offer">Offer Letter</option>
                  <option value="Payslip">Payslip</option>
                  <option value="ID">ID Document</option>
                  <option value="Contract">Contract</option>
                  <option value="Other">Other</option>
                </select>
                <button mat-raised-button color="primary"
                        [disabled]="!selectedFile || uploading"
                        (click)="uploadDocument()">
                  <mat-spinner *ngIf="uploading" diameter="18" class="mr-1"></mat-spinner>
                  <mat-icon *ngIf="!uploading">upload</mat-icon>
                  {{ uploading ? 'Uploading...' : 'Upload' }}
                </button>
              </div>
            </div>

            <!-- Loading -->
            <div *ngIf="docsLoading" class="flex justify-center py-10">
              <mat-spinner diameter="36"></mat-spinner>
            </div>

            <!-- Empty -->
            <div *ngIf="!docsLoading && documents.length === 0"
                 class="flex flex-col items-center py-10 text-gray-400">
              <mat-icon style="font-size:3rem;width:3rem;height:3rem;" class="mb-2">folder_open</mat-icon>
              <p class="font-medium">No documents uploaded</p>
            </div>

            <!-- Document list -->
            <div *ngIf="!docsLoading && documents.length > 0"
                 class="bg-white rounded-xl border overflow-hidden">
              <div *ngFor="let doc of documents; let last = last"
                   class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                   [class.border-b]="!last">

                <!-- Type badge -->
                <span class="shrink-0 px-2 py-0.5 rounded text-xs font-semibold"
                      [ngClass]="docTypeBadgeClass(doc.docType)">
                  {{ doc.docType }}
                </span>

                <!-- File info -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ doc.fileName }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">
                    {{ formatFileSize(doc.fileSize) }}
                    <span class="mx-1">·</span>
                    {{ doc.uploadedOn | date:'MMM d, y' }}
                    <span *ngIf="doc.uploadedByName" class="mx-1">·</span>
                    <span *ngIf="doc.uploadedByName">{{ doc.uploadedByName }}</span>
                  </p>
                </div>

                <!-- Actions -->
                <button mat-icon-button (click)="downloadDocument(doc)"
                        matTooltip="Download" class="!w-8 !h-8 shrink-0">
                  <mat-icon class="text-indigo-600"
                            style="font-size:1.1rem;width:1.1rem;height:1.1rem;line-height:1.1rem;">
                    download
                  </mat-icon>
                </button>
                <button *ngIf="canEdit" mat-icon-button (click)="deleteDocument(doc)"
                        matTooltip="Delete" class="!w-8 !h-8 shrink-0">
                  <mat-icon class="text-red-400"
                            style="font-size:1.1rem;width:1.1rem;height:1.1rem;line-height:1.1rem;">
                    delete
                  </mat-icon>
                </button>
              </div>
            </div>

          </div>
        </mat-tab>

        <!-- ── Assets Tab ─────────────────────────────────────── -->
        <mat-tab *ngIf="showHiddenModules" label="Assets">
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

        <!-- ── Training Tab ───────────────────────────────────── -->
        <mat-tab *ngIf="showHiddenModules" label="Training">
          <div class="py-4">

            <!-- Loading -->
            <div *ngIf="trainingLoading" class="flex justify-center py-10">
              <mat-spinner diameter="36"></mat-spinner>
            </div>

            <!-- Empty -->
            <div *ngIf="!trainingLoading && employeeTrainings.length === 0"
                 class="flex flex-col items-center py-10 text-gray-400">
              <mat-icon style="font-size:3rem;width:3rem;height:3rem;" class="mb-2">school</mat-icon>
              <p class="font-medium">No training records</p>
              <p class="text-sm">This employee has not been enrolled in any training programs.</p>
            </div>

            <!-- Training table -->
            <div *ngIf="!trainingLoading && employeeTrainings.length > 0"
                 class="bg-white rounded-xl border overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th class="px-4 py-3 text-left">Training</th>
                    <th class="px-4 py-3 text-left">Trainer</th>
                    <th class="px-4 py-3 text-left">Start</th>
                    <th class="px-4 py-3 text-left">End</th>
                    <th class="px-4 py-3 text-left">Status</th>
                    <th class="px-4 py-3 text-center">Score</th>
                    <th class="px-4 py-3 text-left">Completed On</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr *ngFor="let t of employeeTrainings" class="hover:bg-gray-50">
                    <td class="px-4 py-3 font-medium text-gray-900">{{ t.trainingTitle }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ t.trainer }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ t.startDate + 'T00:00:00' | date:'MMM d, y' }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ t.endDate + 'T00:00:00' | date:'MMM d, y' }}</td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                            [ngClass]="trainingStatusClass(t.status)">
                        {{ t.status }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center font-semibold text-gray-700">
                      {{ t.score != null ? t.score : '—' }}
                    </td>
                    <td class="px-4 py-3 text-gray-500">
                      {{ t.completionDate ? (t.completionDate | date:'MMM d, y') : '—' }}
                    </td>
                  </tr>
                </tbody>
              </table>
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

  // Training
  employeeTrainings: EmployeeTrainingDto[] = [];
  trainingLoading = false;

  // Documents
  documents: DocumentDto[] = [];
  docsLoading = false;
  isDragOver = false;
  selectedFile: File | null = null;
  selectedDocType = 'Offer';
  uploading = false;

  canEdit   = false;
  canDelete = false;

  // TEMP HIDDEN — set true to show to client tomorrow
  readonly showHiddenModules = true;

  readonly monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private assetService: AssetService,
    private leaveService: LeaveService,
    private attendanceService: AttendanceService,
    private payrollService: PayrollService,
    private trainingService: TrainingService,
    private documentService: DocumentService,
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
        this.loadTrainings(emp.id);
        this.loadDocuments(emp.id);
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

  loadTrainings(employeeId: string): void {
    this.trainingLoading = true;
    this.trainingService.getMyTrainings(employeeId).subscribe({
      next: data => { this.employeeTrainings = data; this.trainingLoading = false; this.cdr.detectChanges(); },
      error: ()   => { this.trainingLoading = false; this.cdr.detectChanges(); },
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

  trainingStatusClass(status: string): string {
    return ({
      Enrolled:   'bg-blue-100 text-blue-800',
      InProgress: 'bg-yellow-100 text-yellow-800',
      Completed:  'bg-green-100 text-green-800',
      Dropped:    'bg-gray-100 text-gray-600',
    } as any)[status] ?? 'bg-gray-100 text-gray-600';
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

  // ── Documents ────────────────────────────────────────────────

  loadDocuments(employeeId: string): void {
    this.docsLoading = true;
    this.documentService.getEmployeeDocuments(employeeId).subscribe({
      next: data => { this.documents = data; this.docsLoading = false; this.cdr.detectChanges(); },
      error: ()   => { this.docsLoading = false; this.cdr.detectChanges(); },
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.selectedFile = file;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.selectedFile = input.files[0];
  }

  uploadDocument(): void {
    if (!this.selectedFile || !this.employee) return;
    this.uploading = true;
    this.documentService.uploadDocument(this.employee.id, this.selectedFile, this.selectedDocType).subscribe({
      next: doc => {
        this.documents = [doc, ...this.documents];
        this.selectedFile = null;
        this.uploading = false;
        this.snackBar.open('Document uploaded.', 'OK', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.uploading = false;
        this.snackBar.open(err?.error?.error ?? 'Upload failed.', 'Close', { duration: 4000 });
        this.cdr.detectChanges();
      },
    });
  }

  downloadDocument(doc: DocumentDto): void {
    this.documentService.downloadDocument(doc.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = doc.fileName;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Download failed.', 'Close', { duration: 3000 }),
    });
  }

  deleteDocument(doc: DocumentDto): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Document',
        message: `Delete "${doc.fileName}"? This action cannot be undone.`,
        icon: 'delete',
        confirmLabel: 'Delete',
        confirmColor: 'warn',
      } as ConfirmDialogData,
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (!ok) return;
      this.documentService.deleteDocument(doc.id).subscribe({
        next: () => {
          this.documents = this.documents.filter(d => d.id !== doc.id);
          this.snackBar.open('Document deleted.', 'OK', { duration: 3000 });
          this.cdr.detectChanges();
        },
        error: () => this.snackBar.open('Delete failed.', 'Close', { duration: 3000 }),
      });
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  docTypeBadgeClass(docType: string): string {
    return ({
      Offer:    'bg-blue-100 text-blue-800',
      Payslip:  'bg-green-100 text-green-800',
      ID:       'bg-yellow-100 text-yellow-800',
      Contract: 'bg-purple-100 text-purple-800',
      Other:    'bg-gray-100 text-gray-600',
    } as any)[docType] ?? 'bg-gray-100 text-gray-600';
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
