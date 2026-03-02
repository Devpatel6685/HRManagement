import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PayrollService } from '../../core/services/payroll.service';
import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/services/auth.service';
import { PayrollDto } from '../../models/payroll.model';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule,
    MatTableModule, MatTooltipModule, MatCheckboxModule,
  ],
  template: `
    <div class="p-6">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Payroll</h1>
          <p class="text-sm text-gray-500 mt-0.5">
            {{ isHrOrAdmin ? 'Generate and manage payroll' : 'Your payslip history' }}
          </p>
        </div>
      </div>

      <!-- ── HR/Admin: Generate Payroll ── -->
      <ng-container *ngIf="isHrOrAdmin">
        <mat-card class="mb-6">
          <mat-card-content class="p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <mat-icon class="text-blue-600">payments</mat-icon>
              Generate Payroll
            </h2>

            <form [formGroup]="generateForm" (ngSubmit)="onGenerate()" class="space-y-4">

              <!-- Month / Year -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Month <span class="text-red-500">*</span></label>
                  <select formControlName="month" class="field-input">
                    <option *ngFor="let m of months; let i = index" [value]="i + 1">{{ m }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Year <span class="text-red-500">*</span></label>
                  <input type="number" formControlName="year" class="field-input" min="2020" max="2099" />
                </div>
              </div>

              <!-- Employee rows -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-sm font-medium text-gray-700">
                    Employees
                    <span *ngIf="employeeRows.length > 0" class="ml-2 text-xs text-gray-400 font-normal">({{ employeeRows.length }} added)</span>
                  </label>
                  <div class="flex gap-2">
                    <button type="button" mat-stroked-button color="accent"
                            [disabled]="loadingAll"
                            (click)="loadAllEmployees()">
                      <mat-spinner *ngIf="loadingAll" diameter="16" class="inline-block mr-1"></mat-spinner>
                      <mat-icon *ngIf="!loadingAll">group_add</mat-icon>
                      Generate for All
                    </button>
                    <button type="button" mat-stroked-button color="primary" (click)="addEmployee()">
                      <mat-icon>add</mat-icon> Add Employee
                    </button>
                  </div>
                </div>

                <div *ngIf="employeeRows.length === 0" class="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-300 rounded-xl">
                  Click "Generate for All" to add all employees, or "Add Employee" to add one at a time
                </div>

                <div class="space-y-3" formArrayName="employees">
                  <div *ngFor="let row of employeeRows.controls; let i = index"
                       [formGroupName]="i"
                       class="grid grid-cols-6 gap-2 items-end border border-gray-200 rounded-xl p-3 bg-gray-50">

                    <div class="col-span-6 sm:col-span-2">
                      <label class="block text-xs text-gray-500 mb-1">Employee</label>
                      <select formControlName="employeeId" class="field-input text-sm py-2">
                        <option value="">Select…</option>
                        <option *ngFor="let e of allEmployees" [value]="e.id">{{ e.firstName }} {{ e.lastName }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Basic (₹)</label>
                      <input type="number" formControlName="basicSalary" class="field-input text-sm py-2" min="0" />
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">HRA (₹)</label>
                      <input type="number" formControlName="hra" class="field-input text-sm py-2" min="0" />
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Allowances (₹)</label>
                      <input type="number" formControlName="allowances" class="field-input text-sm py-2" min="0" />
                    </div>
                    <div class="flex gap-1 items-end">
                      <div class="flex-1">
                        <label class="block text-xs text-gray-500 mb-1">Deductions (₹)</label>
                        <input type="number" formControlName="deductions" class="field-input text-sm py-2" min="0" />
                      </div>
                      <button type="button" mat-icon-button color="warn" (click)="removeEmployee(i)" class="mb-0.5">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>

                  </div>
                </div>
              </div>

              <!-- Result banner -->
              <div *ngIf="lastResult" class="flex items-center gap-3 rounded-xl p-3 text-sm"
                   [ngClass]="lastResult.errors.length ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'">
                <mat-icon [ngClass]="lastResult.errors.length ? 'text-yellow-600' : 'text-green-600'">
                  {{ lastResult.errors.length ? 'warning' : 'check_circle' }}
                </mat-icon>
                <div>
                  <p class="font-medium text-gray-800">
                    Generated: <span class="text-green-700">{{ lastResult.generated }}</span>
                    &nbsp;·&nbsp;
                    Skipped (already exists): <span class="text-gray-600">{{ lastResult.skipped }}</span>
                  </p>
                  <p *ngIf="lastResult.errors.length" class="text-yellow-700 mt-0.5">
                    Errors: {{ lastResult.errors.join(', ') }}
                  </p>
                </div>
              </div>

              <div class="flex justify-end pt-2">
                <button mat-raised-button color="primary" type="submit"
                        [disabled]="generateForm.invalid || employeeRows.length === 0 || generating">
                  <mat-spinner *ngIf="generating" diameter="18" class="inline-block mr-1"></mat-spinner>
                  <mat-icon *ngIf="!generating">send</mat-icon>
                  Generate
                </button>
              </div>

            </form>
          </mat-card-content>
        </mat-card>
      </ng-container>

      <!-- ── Payslip History ── -->
      <mat-card>
        <mat-card-content class="p-0">

          <!-- Table header + filters -->
          <div class="px-6 py-4 border-b">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-base font-semibold text-gray-900 flex items-center gap-2">
                <mat-icon class="text-gray-500">receipt_long</mat-icon>
                {{ isHrOrAdmin ? 'All Payroll Records' : 'My Payslips' }}
              </h2>
              <button mat-icon-button (click)="loadHistory()" matTooltip="Refresh" [disabled]="loading">
                <mat-icon>refresh</mat-icon>
              </button>
            </div>

            <!-- HR/Admin: month/year filter -->
            <div *ngIf="isHrOrAdmin" class="flex flex-wrap items-center gap-3">
              <select [(ngModel)]="filterMonth" (ngModelChange)="applyFilter()" class="field-input w-36 text-sm py-1.5">
                <option [value]="0">All Months</option>
                <option *ngFor="let m of months; let i = index" [value]="i + 1">{{ m }}</option>
              </select>
              <input type="number" [(ngModel)]="filterYear" (ngModelChange)="applyFilter()"
                     placeholder="Year" class="field-input w-28 text-sm py-1.5" min="2020" max="2099" />

              <!-- Bulk actions (only when some Generated rows selected) -->
              <ng-container *ngIf="selectedIds.size > 0">
                <span class="text-sm text-gray-500">{{ selectedIds.size }} selected</span>
                <button mat-stroked-button color="primary"
                        [disabled]="bulkMarking"
                        (click)="bulkMarkPaid()">
                  <mat-spinner *ngIf="bulkMarking" diameter="16" class="inline-block mr-1"></mat-spinner>
                  <mat-icon *ngIf="!bulkMarking">check_circle</mat-icon>
                  Mark Selected as Paid
                </button>
              </ng-container>
            </div>
          </div>

          <!-- HR/Admin: Summary cost card -->
          <ng-container *ngIf="isHrOrAdmin && filteredPayrolls.length > 0">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-0 border-b divide-x">
              <div class="px-5 py-3 text-center">
                <p class="text-xs text-gray-500 uppercase tracking-wide">Employees</p>
                <p class="text-xl font-bold text-gray-900 mt-0.5">{{ filteredPayrolls.length }}</p>
              </div>
              <div class="px-5 py-3 text-center">
                <p class="text-xs text-gray-500 uppercase tracking-wide">Total Earnings</p>
                <p class="text-xl font-bold text-green-700 mt-0.5">₹ {{ totalEarnings | number:'1.0-0' }}</p>
              </div>
              <div class="px-5 py-3 text-center">
                <p class="text-xs text-gray-500 uppercase tracking-wide">Total Deductions</p>
                <p class="text-xl font-bold text-red-600 mt-0.5">₹ {{ totalDeductions | number:'1.0-0' }}</p>
              </div>
              <div class="px-5 py-3 text-center">
                <p class="text-xs text-gray-500 uppercase tracking-wide">Net Payroll Cost</p>
                <p class="text-xl font-bold text-blue-700 mt-0.5">₹ {{ totalNet | number:'1.0-0' }}</p>
              </div>
            </div>
          </ng-container>

          <div *ngIf="loading" class="flex justify-center py-12"><mat-spinner diameter="36"></mat-spinner></div>

          <div *ngIf="!loading && filteredPayrolls.length === 0"
               class="flex flex-col items-center py-14 text-gray-400">
            <mat-icon style="font-size:3rem;width:3rem;height:3rem;" class="mb-3">payments</mat-icon>
            <p class="font-medium">No payroll records found</p>
          </div>

          <div *ngIf="!loading && filteredPayrolls.length > 0" class="overflow-x-auto">
            <table mat-table [dataSource]="filteredPayrolls" class="w-full">

              <!-- Checkbox (HR/Admin only) -->
              <ng-container matColumnDef="select">
                <th mat-header-cell *matHeaderCellDef class="w-10">
                  <mat-checkbox [checked]="allGeneratedSelected"
                                [indeterminate]="someGeneratedSelected"
                                (change)="toggleSelectAll($event.checked)">
                  </mat-checkbox>
                </th>
                <td mat-cell *matCellDef="let r" class="w-10">
                  <mat-checkbox *ngIf="r.status === 'Generated'"
                                [checked]="selectedIds.has(r.id)"
                                (change)="toggleSelect(r.id, $event.checked)">
                  </mat-checkbox>
                </td>
              </ng-container>

              <!-- Employee -->
              <ng-container matColumnDef="employee">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">Employee</th>
                <td mat-cell *matCellDef="let r">
                  <p class="font-medium text-gray-900">{{ r.employeeName }}</p>
                  <p class="text-xs text-gray-500">{{ r.department }}</p>
                </td>
              </ng-container>

              <!-- Period -->
              <ng-container matColumnDef="period">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">Period</th>
                <td mat-cell *matCellDef="let r" class="text-sm text-gray-700">
                  {{ monthName(r.month) }} {{ r.year }}
                </td>
              </ng-container>

              <!-- Earnings -->
              <ng-container matColumnDef="earnings">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700 text-right">Earnings</th>
                <td mat-cell *matCellDef="let r" class="text-sm text-right text-green-700">
                  ₹ {{ (r.basicSalary + r.hra + r.allowances) | number:'1.2-2' }}
                </td>
              </ng-container>

              <!-- Deductions -->
              <ng-container matColumnDef="deductions">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700 text-right">Deductions</th>
                <td mat-cell *matCellDef="let r" class="text-sm text-right text-red-600">
                  ₹ {{ r.deductions | number:'1.2-2' }}
                </td>
              </ng-container>

              <!-- Net Salary -->
              <ng-container matColumnDef="netSalary">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700 text-right">Net Salary</th>
                <td mat-cell *matCellDef="let r" class="text-sm font-bold text-right text-blue-700">
                  ₹ {{ r.netSalary | number:'1.2-2' }}
                </td>
              </ng-container>

              <!-- Status -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">Status</th>
                <td mat-cell *matCellDef="let r">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                        [ngClass]="r.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                    {{ r.status }}
                  </span>
                  <p *ngIf="r.paidOn" class="text-xs text-gray-400 mt-0.5">
                    {{ r.paidOn | date:'dd MMM y' }}
                  </p>
                </td>
              </ng-container>

              <!-- Actions -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let r" class="text-right">
                  <button mat-icon-button matTooltip="Download Payslip" (click)="download(r)">
                    <mat-icon>download</mat-icon>
                  </button>
                  <button *ngIf="isHrOrAdmin && r.status === 'Generated'"
                          mat-icon-button color="primary"
                          matTooltip="Mark as Paid"
                          [disabled]="markingPaid === r.id"
                          (click)="markPaid(r)">
                    <mat-spinner *ngIf="markingPaid === r.id" diameter="18"></mat-spinner>
                    <mat-icon *ngIf="markingPaid !== r.id">check_circle</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50"></tr>
              <tr mat-row *matRowDef="let r; columns: cols;" class="hover:bg-gray-50 transition-colors"></tr>
            </table>
          </div>

        </mat-card-content>
      </mat-card>

    </div>
  `,
})
export class PayrollComponent implements OnInit {
  readonly months = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

  isHrOrAdmin = false;
  employeeId  = '';
  allEmployees: any[] = [];
  payrolls: PayrollDto[] = [];
  filteredPayrolls: PayrollDto[] = [];
  loading     = false;
  generating  = false;
  loadingAll  = false;
  bulkMarking = false;
  markingPaid: string | null = null;

  // Filters
  filterMonth = 0;
  filterYear: number | null = null;

  // Bulk selection
  selectedIds = new Set<string>();

  // Last generate result banner
  lastResult: { generated: number; skipped: number; errors: string[] } | null = null;

  generateForm!: FormGroup;

  get cols(): string[] {
    if (this.isHrOrAdmin) {
      return ['select', 'employee', 'period', 'earnings', 'deductions', 'netSalary', 'status', 'actions'];
    }
    return ['period', 'earnings', 'deductions', 'netSalary', 'status', 'actions'];
  }

  get employeeRows(): FormArray {
    return this.generateForm.get('employees') as FormArray;
  }

  // Summary totals
  get totalEarnings(): number {
    return this.filteredPayrolls.reduce((s, r) => s + r.basicSalary + r.hra + r.allowances, 0);
  }
  get totalDeductions(): number {
    return this.filteredPayrolls.reduce((s, r) => s + r.deductions, 0);
  }
  get totalNet(): number {
    return this.filteredPayrolls.reduce((s, r) => s + r.netSalary, 0);
  }

  // Checkbox helpers
  get generatedRows(): PayrollDto[] {
    return this.filteredPayrolls.filter(r => r.status === 'Generated');
  }
  get allGeneratedSelected(): boolean {
    return this.generatedRows.length > 0 && this.generatedRows.every(r => this.selectedIds.has(r.id));
  }
  get someGeneratedSelected(): boolean {
    return this.generatedRows.some(r => this.selectedIds.has(r.id)) && !this.allGeneratedSelected;
  }

  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.isHrOrAdmin = this.authService.hasAnyRole(['Admin', 'HR']);

    const now = new Date();
    this.generateForm = this.fb.group({
      month:     [now.getMonth() + 1, Validators.required],
      year:      [now.getFullYear(),  Validators.required],
      employees: this.fb.array([]),
    });

    if (this.isHrOrAdmin) {
      this.loadHistory();
      this.employeeService.getAll({ page: 1, pageSize: 9999 }).subscribe({
        next: res => this.allEmployees = res.items,
      });
    } else {
      this.employeeService.getMyProfile().subscribe({
        next: p => {
          this.employeeId = p.id;
          this.loadHistory();
        },
      });
    }
  }

  // ── Generate form helpers ──────────────────────────────────────────────

  addEmployee(): void {
    this.employeeRows.push(this.fb.group({
      employeeId:  ['', Validators.required],
      basicSalary: [0, [Validators.required, Validators.min(0)]],
      hra:         [0, [Validators.required, Validators.min(0)]],
      allowances:  [0, [Validators.required, Validators.min(0)]],
      deductions:  [0, [Validators.required, Validators.min(0)]],
    }));
  }

  removeEmployee(i: number): void {
    this.employeeRows.removeAt(i);
  }

  loadAllEmployees(): void {
    if (this.allEmployees.length === 0) {
      this.loadingAll = true;
      this.employeeService.getAll({ page: 1, pageSize: 9999 }).subscribe({
        next: res => {
          this.allEmployees = res.items;
          this.loadingAll = false;
          this._pushAllToForm();
        },
        error: () => { this.loadingAll = false; },
      });
    } else {
      this._pushAllToForm();
    }
  }

  private _pushAllToForm(): void {
    this.employeeRows.clear();
    for (const e of this.allEmployees) {
      this.employeeRows.push(this.fb.group({
        employeeId:  [e.id, Validators.required],
        basicSalary: [0, [Validators.required, Validators.min(0)]],
        hra:         [0, [Validators.required, Validators.min(0)]],
        allowances:  [0, [Validators.required, Validators.min(0)]],
        deductions:  [0, [Validators.required, Validators.min(0)]],
      }));
    }
  }

  // ── Generate submit ────────────────────────────────────────────────────

  onGenerate(): void {
    if (this.generateForm.invalid || this.employeeRows.length === 0) return;
    this.generating  = true;
    this.lastResult  = null;

    const { month, year, employees } = this.generateForm.value;
    this.payrollService.generate({ month, year, employees }).subscribe({
      next: res => {
        this.generating = false;
        this.lastResult = res;
        this.employeeRows.clear();
        this.loadHistory();
      },
      error: err => {
        this.generating = false;
        this.snackBar.open(err?.error?.error || 'Failed to generate payroll.', 'Close', { duration: 4000 });
      },
    });
  }

  // ── History / filter ──────────────────────────────────────────────────

  loadHistory(): void {
    if (!this.isHrOrAdmin && !this.employeeId) return;
    this.loading = true;
    this.selectedIds.clear();

    const obs$ = this.isHrOrAdmin
      ? this.payrollService.getAll()
      : this.payrollService.getHistory(this.employeeId);

    obs$.subscribe({
      next: list => {
        this.payrolls = list;
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  applyFilter(): void {
    this.selectedIds.clear();
    this.filteredPayrolls = this.payrolls.filter(r => {
      const monthOk = !this.filterMonth || r.month === +this.filterMonth;
      const yearOk  = !this.filterYear  || r.year  === +this.filterYear;
      return monthOk && yearOk;
    });
  }

  // ── Selection ─────────────────────────────────────────────────────────

  toggleSelect(id: string, checked: boolean): void {
    checked ? this.selectedIds.add(id) : this.selectedIds.delete(id);
    this.selectedIds = new Set(this.selectedIds); // trigger CD
  }

  toggleSelectAll(checked: boolean): void {
    if (checked) {
      this.generatedRows.forEach(r => this.selectedIds.add(r.id));
    } else {
      this.selectedIds.clear();
    }
    this.selectedIds = new Set(this.selectedIds);
  }

  // ── Bulk Mark as Paid ─────────────────────────────────────────────────

  bulkMarkPaid(): void {
    if (this.selectedIds.size === 0) return;
    this.bulkMarking = true;
    const ids = [...this.selectedIds];
    let done = 0;
    let failed = 0;

    const finish = () => {
      done + failed === ids.length && (() => {
        this.bulkMarking = false;
        this.selectedIds.clear();
        this.snackBar.open(
          `Marked as Paid: ${done}${failed ? '  |  Failed: ' + failed : ''}`,
          'OK', { duration: 4000 });
        this.loadHistory();
      })();
    };

    for (const id of ids) {
      this.payrollService.markPaid(id).subscribe({
        next: () => { done++; finish(); },
        error: () => { failed++; finish(); },
      });
    }
  }

  // ── Individual Mark as Paid ───────────────────────────────────────────

  markPaid(row: PayrollDto): void {
    this.markingPaid = row.id;
    this.payrollService.markPaid(row.id).subscribe({
      next: updated => {
        this.markingPaid = null;
        const idx = this.payrolls.findIndex(p => p.id === updated.id);
        if (idx !== -1) this.payrolls[idx] = updated;
        this.payrolls = [...this.payrolls];
        this.applyFilter();
        this.snackBar.open('Marked as Paid.', 'OK', { duration: 3000 });
      },
      error: err => {
        this.markingPaid = null;
        this.snackBar.open(err?.error?.error || 'Failed.', 'Close', { duration: 3000 });
      },
    });
  }

  // ── Download ──────────────────────────────────────────────────────────

  download(row: PayrollDto): void {
    this.payrollService.downloadPayslip(row.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a   = Object.assign(document.createElement('a'), {
          href: url,
          download: `payslip-${row.employeeName}-${this.monthName(row.month)}-${row.year}.pdf`,
        });
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Failed to download payslip.', 'Close', { duration: 3000 }),
    });
  }

  monthName(m: number): string {
    return this.months[m - 1] ?? '';
  }
}
