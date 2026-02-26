import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { CreateEmployee, EmployeeDetail, UpdateEmployee } from '../../../models/employee.model';
import { Department, Designation } from '../../../models/department.model';
import { EmployeeListItem } from '../../../models/employee.model';

@Component({
  selector: 'app-employee-add-edit',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatStepperModule, MatButtonModule, MatIconModule,
    MatCardModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="p-6 max-w-3xl mx-auto">

      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <button mat-icon-button routerLink="/employees">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ isEdit ? 'Edit' : 'Add' }} Employee</h1>
          <p class="text-sm text-gray-500">{{ isEdit ? 'Update employee information' : 'Create a new employee account' }}</p>
        </div>
      </div>

      <!-- Page loading -->
      <div *ngIf="pageLoading" class="flex justify-center py-20">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <mat-card *ngIf="!pageLoading">
        <mat-card-content class="p-6">
          <mat-stepper [linear]="true" orientation="horizontal" #stepper>

            <!-- ── Step 1: Personal Info ───────────────────────────────── -->
            <mat-step [stepControl]="step1" label="Personal Info">
              <form [formGroup]="step1" class="pt-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                    <input formControlName="firstName" placeholder="John"
                      class="field-input field-input--no-icon"
                      [class.field-input--error]="step1.get('firstName')?.invalid && step1.get('firstName')?.touched" />
                    <p *ngIf="step1.get('firstName')?.invalid && step1.get('firstName')?.touched" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <mat-icon style="font-size:0.85rem;width:0.85rem;height:0.85rem;">error_outline</mat-icon>
                      <span *ngIf="step1.get('firstName')?.hasError('required')">Required</span>
                      <span *ngIf="step1.get('firstName')?.hasError('minlength')">Min 2 characters</span>
                    </p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                    <input formControlName="lastName" placeholder="Doe"
                      class="field-input field-input--no-icon"
                      [class.field-input--error]="step1.get('lastName')?.invalid && step1.get('lastName')?.touched" />
                    <p *ngIf="step1.get('lastName')?.invalid && step1.get('lastName')?.touched" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <mat-icon style="font-size:0.85rem;width:0.85rem;height:0.85rem;">error_outline</mat-icon>
                      <span *ngIf="step1.get('lastName')?.hasError('required')">Required</span>
                      <span *ngIf="step1.get('lastName')?.hasError('minlength')">Min 2 characters</span>
                    </p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
                    <input type="date" formControlName="dob"
                      class="field-input field-input--no-icon"
                      [class.field-input--error]="step1.get('dob')?.invalid && step1.get('dob')?.touched" />
                    <p *ngIf="step1.get('dob')?.invalid && step1.get('dob')?.touched" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <mat-icon style="font-size:0.85rem;width:0.85rem;height:0.85rem;">error_outline</mat-icon>
                      Required
                    </p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                    <select formControlName="gender"
                      class="field-input field-input--no-icon field-select"
                      [class.field-input--error]="step1.get('gender')?.invalid && step1.get('gender')?.touched">
                      <option value="">— Select —</option>
                      <option *ngFor="let g of genders" [ngValue]="g.value">{{ g.label }}</option>
                    </select>
                    <p *ngIf="step1.get('gender')?.invalid && step1.get('gender')?.touched" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <mat-icon style="font-size:0.85rem;width:0.85rem;height:0.85rem;">error_outline</mat-icon>
                      Required
                    </p>
                  </div>

                  <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <div class="relative">
                      <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <mat-icon class="field-icon">phone</mat-icon>
                      </span>
                      <input formControlName="phone" placeholder="+1 555 000 0000"
                        class="field-input"
                        [class.field-input--error]="step1.get('phone')?.invalid && step1.get('phone')?.touched" />
                    </div>
                    <p *ngIf="step1.get('phone')?.invalid && step1.get('phone')?.touched" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <mat-icon style="font-size:0.85rem;width:0.85rem;height:0.85rem;">error_outline</mat-icon>
                      Required
                    </p>
                  </div>

                </div>
              </form>
              <div class="flex justify-end gap-2 mt-6">
                <button mat-raised-button color="primary" matStepperNext [disabled]="step1.invalid">
                  Next<mat-icon iconSuffix>chevron_right</mat-icon>
                </button>
              </div>
            </mat-step>

            <!-- ── Step 2: Job Details ─────────────────────────────────── -->
            <mat-step [stepControl]="step2" label="Job Details">
              <form [formGroup]="step2" class="pt-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                    <select formControlName="departmentId" class="field-input field-input--no-icon field-select">
                      <option [ngValue]="null">— None —</option>
                      <option *ngFor="let d of departments" [ngValue]="d.id">{{ d.name }}</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Designation</label>
                    <select formControlName="designationId"
                      class="field-input field-input--no-icon field-select"
                      [class.field-disabled]="!step2.get('departmentId')?.value">
                      <option [ngValue]="null">— None —</option>
                      <option *ngFor="let d of designations" [ngValue]="d.id">{{ d.title }}</option>
                    </select>
                  </div>

                  <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Reporting Manager</label>
                    <select formControlName="managerId" class="field-input field-input--no-icon field-select">
                      <option [ngValue]="null">— None —</option>
                      <option *ngFor="let m of managers" [ngValue]="m.id">{{ m.fullName }} ({{ m.employeeCode }})</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Join Date</label>
                    <input type="date" formControlName="joinDate"
                      class="field-input field-input--no-icon"
                      [class.field-input--error]="step2.get('joinDate')?.invalid && step2.get('joinDate')?.touched" />
                    <p *ngIf="step2.get('joinDate')?.invalid && step2.get('joinDate')?.touched" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <mat-icon style="font-size:0.85rem;width:0.85rem;height:0.85rem;">error_outline</mat-icon>
                      Required
                    </p>
                  </div>

                  <div *ngIf="isEdit">
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                    <select formControlName="status" class="field-input field-input--no-icon field-select">
                      <option *ngFor="let s of statuses" [ngValue]="s.value">{{ s.label }}</option>
                    </select>
                  </div>

                </div>
              </form>
              <div class="flex justify-between gap-2 mt-6">
                <button mat-stroked-button matStepperPrevious>
                  <mat-icon iconPrefix>chevron_left</mat-icon>Back
                </button>
                <button mat-raised-button color="primary" matStepperNext [disabled]="step2.invalid">
                  Next<mat-icon iconSuffix>chevron_right</mat-icon>
                </button>
              </div>
            </mat-step>

            <!-- ── Step 3: Account ────────────────────────────────────── -->
            <mat-step [stepControl]="step3" label="Account">
              <div class="pt-6">

                <ng-container *ngIf="isEdit">
                  <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                    <p class="text-sm text-blue-700 font-medium mb-1">Account credentials</p>
                    <p class="text-sm text-blue-600">Email and role cannot be changed through this form.</p>
                    <p class="mt-2 font-semibold text-gray-900">{{ loadedEmployee?.email }}</p>
                  </div>
                </ng-container>

                <ng-container *ngIf="!isEdit">
                  <form [formGroup]="step3" class="space-y-4">

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                      <div class="relative">
                        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <mat-icon class="field-icon">email</mat-icon>
                        </span>
                        <input type="email" formControlName="email" autocomplete="off"
                          class="field-input"
                          [class.field-input--error]="step3.get('email')?.invalid && step3.get('email')?.touched" />
                      </div>
                      <p *ngIf="step3.get('email')?.invalid && step3.get('email')?.touched" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                        <mat-icon style="font-size:0.85rem;width:0.85rem;height:0.85rem;">error_outline</mat-icon>
                        <span *ngIf="step3.get('email')?.hasError('required')">Required</span>
                        <span *ngIf="step3.get('email')?.hasError('email')">Enter a valid email</span>
                      </p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                        <div class="relative">
                          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <mat-icon class="field-icon">lock</mat-icon>
                          </span>
                          <input type="password" formControlName="password" autocomplete="new-password"
                            class="field-input"
                            [class.field-input--error]="step3.get('password')?.invalid && step3.get('password')?.touched" />
                        </div>
                        <p *ngIf="step3.get('password')?.invalid && step3.get('password')?.touched" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                          <mat-icon style="font-size:0.85rem;width:0.85rem;height:0.85rem;">error_outline</mat-icon>
                          <span *ngIf="step3.get('password')?.hasError('required')">Required</span>
                          <span *ngIf="step3.get('password')?.hasError('minlength')">Min 6 characters</span>
                        </p>
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                        <select formControlName="role"
                          class="field-input field-input--no-icon field-select"
                          [class.field-input--error]="step3.get('role')?.invalid && step3.get('role')?.touched">
                          <option *ngFor="let r of roles" [ngValue]="r.value">{{ r.label }}</option>
                        </select>
                        <p *ngIf="step3.get('role')?.invalid && step3.get('role')?.touched" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                          <mat-icon style="font-size:0.85rem;width:0.85rem;height:0.85rem;">error_outline</mat-icon>
                          Required
                        </p>
                      </div>

                    </div>
                  </form>
                </ng-container>

              </div>

              <div class="flex justify-between gap-2 mt-6">
                <button mat-stroked-button matStepperPrevious>
                  <mat-icon iconPrefix>chevron_left</mat-icon>Back
                </button>
                <button mat-raised-button color="primary" (click)="save()" [disabled]="isSaving">
                  <mat-spinner *ngIf="isSaving" diameter="20" class="mr-2"></mat-spinner>
                  <mat-icon *ngIf="!isSaving">save</mat-icon>
                  {{ isEdit ? 'Save Changes' : 'Create Employee' }}
                </button>
              </div>
            </mat-step>

          </mat-stepper>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`:host { display: block; }`],
})
export class EmployeeAddEditComponent implements OnInit, OnDestroy {
  step1!: FormGroup;
  step2!: FormGroup;
  step3!: FormGroup;

  isEdit = false;
  isSaving = false;
  pageLoading = false;

  departments: Department[] = [];
  designations: Designation[] = [];
  managers: EmployeeListItem[] = [];
  loadedEmployee: EmployeeDetail | null = null;

  readonly genders  = [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }];
  readonly roles    = [{ value: 'Admin', label: 'Admin' }, { value: 'HR', label: 'HR' }, { value: 'Manager', label: 'Manager' }, { value: 'Employee', label: 'Employee' }];
  readonly statuses = [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }, { value: 'OnLeave', label: 'On Leave' }, { value: 'Terminated', label: 'Terminated' }];

  private employeeId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.params['id'] ?? null;
    this.isEdit = !!this.employeeId;

    this.buildForms();
    this.loadDepartments();
    this.loadManagers();
    this.watchDepartmentChange();

    if (this.isEdit) this.loadEmployee(this.employeeId!);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save(): void {
    if ((!this.isEdit && this.step3.invalid)) return;
    this.isSaving = true;
    this.isEdit ? this.updateEmployee() : this.createEmployee();
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private buildForms(): void {
    this.step1 = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName:  ['', [Validators.required, Validators.minLength(2)]],
      dob:       [null, Validators.required],
      gender:    ['', Validators.required],
      phone:     ['', Validators.required],
    });

    this.step2 = this.fb.group({
      departmentId:  [null],
      designationId: [null],
      managerId:     [null],
      joinDate:      [null, Validators.required],
      status:        ['Active'],
    });

    this.step3 = this.isEdit
      ? this.fb.group({ email: [{ value: '', disabled: true }] })
      : this.fb.group({
          email:    ['', [Validators.required, Validators.email]],
          password: ['', [Validators.required, Validators.minLength(6)]],
          role:     ['Employee', Validators.required],
        });
  }

  private loadDepartments(): void {
    this.departmentService.getAll().subscribe({ next: d => this.departments = d });
  }

  private loadManagers(): void {
    this.employeeService.getAll({ page: 1, pageSize: 200 }).subscribe({
      next: r => { this.managers = r.items.filter(e => e.id !== this.employeeId); },
    });
  }

  private watchDepartmentChange(): void {
    this.step2.get('departmentId')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(deptId => {
        this.designations = [];
        this.step2.patchValue({ designationId: null }, { emitEvent: false });
        if (!deptId) return;
        this.departmentService.getDesignations(deptId)
          .subscribe({ next: d => this.designations = d });
      });
  }

  private loadEmployee(id: string): void {
    this.pageLoading = true;
    this.employeeService.getById(id).subscribe({
      next: emp => {
        this.loadedEmployee = emp;
        this.patchForms(emp);
        this.pageLoading = false;
      },
      error: () => this.router.navigate(['/employees']),
    });
  }

  private patchForms(emp: EmployeeDetail): void {
    this.step1.patchValue({
      firstName: emp.firstName,
      lastName:  emp.lastName,
      dob:       emp.dob ?? null,
      gender:    emp.gender,
      phone:     emp.phone,
    });
    this.step2.patchValue({
      departmentId:  emp.departmentId,
      designationId: emp.designationId,
      managerId:     emp.managerId,
      joinDate:      emp.joinDate ?? null,
      status:        emp.status,
    });
    this.step3.patchValue({ email: emp.email ?? '' });

    if (emp.departmentId) {
      this.departmentService.getDesignations(emp.departmentId)
        .subscribe({ next: d => this.designations = d });
    }
  }

  private createEmployee(): void {
    this.employeeService.create(this.buildCreateDto()).subscribe({
      next: emp => this.onSuccess(`Employee ${emp.employeeCode} created successfully.`),
      error: err => this.onError(err),
    });
  }

  private updateEmployee(): void {
    this.employeeService.update(this.employeeId!, this.buildUpdateDto()).subscribe({
      next: () => this.onSuccess('Employee updated successfully.'),
      error: err => this.onError(err),
    });
  }

  private buildCreateDto(): CreateEmployee {
    const s1 = this.step1.getRawValue();
    const s2 = this.step2.getRawValue();
    const s3 = this.step3.getRawValue();
    return {
      firstName: s1.firstName, lastName: s1.lastName,
      email: s3.email, password: s3.password, role: s3.role,
      dob: this.fmtDate(s1.dob), gender: s1.gender, phone: s1.phone,
      joinDate: this.fmtDate(s2.joinDate),
      departmentId: s2.departmentId || null,
      designationId: s2.designationId || null,
      managerId: s2.managerId || null,
    };
  }

  private buildUpdateDto(): UpdateEmployee {
    const s1 = this.step1.getRawValue();
    const s2 = this.step2.getRawValue();
    return {
      firstName: s1.firstName, lastName: s1.lastName,
      phone: s1.phone, dob: this.fmtDate(s1.dob), gender: s1.gender,
      joinDate: this.fmtDate(s2.joinDate), status: s2.status,
      departmentId: s2.departmentId || null,
      designationId: s2.designationId || null,
      managerId: s2.managerId || null,
    };
  }

  private fmtDate(d: Date | string | null): string {
    if (!d) return '';
    if (typeof d === 'string') return d;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private onSuccess(msg: string): void {
    this.snackBar.open(msg, 'OK', { duration: 4000 });
    this.router.navigate(['/employees']);
  }

  private onError(err: any): void {
    this.isSaving = false;
    const msg = err.error?.error || err.error?.message || 'An error occurred. Please try again.';
    this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: ['snack-error'] });
  }
}
