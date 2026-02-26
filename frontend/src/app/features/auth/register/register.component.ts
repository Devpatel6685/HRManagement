import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-800 to-primary-900 py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-lg">

        <!-- Brand mark -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <mat-icon class="text-primary-800" style="font-size: 2rem; width: 2rem; height: 2rem;">person_add</mat-icon>
          </div>
          <h1 class="text-3xl font-bold text-white tracking-tight">Create Account</h1>
          <p class="text-blue-200 mt-1 text-sm">Register a new HR Management account</p>
        </div>

        <!-- Success Banner -->
        <div *ngIf="successMessage" class="mb-4 p-4 bg-green-50 border border-green-300 rounded-xl flex items-center gap-3 text-green-700 text-sm shadow">
          <mat-icon class="text-green-500">check_circle</mat-icon>
          {{ successMessage }}
        </div>

        <mat-card class="shadow-2xl rounded-2xl overflow-hidden">
          <mat-card-content class="p-8">

            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">

              <!-- First + Last Name row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <!-- First Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <mat-icon class="field-icon">badge</mat-icon>
                    </span>
                    <input
                      formControlName="firstName"
                      placeholder="John"
                      class="field-input"
                      [class.field-input--error]="f['firstName'].invalid && f['firstName'].touched"
                    />
                  </div>
                  <p *ngIf="f['firstName'].invalid && f['firstName'].touched" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <mat-icon style="font-size: 0.85rem; width: 0.85rem; height: 0.85rem;">error_outline</mat-icon>
                    <span *ngIf="f['firstName'].hasError('required')">Required</span>
                    <span *ngIf="f['firstName'].hasError('maxlength')">Max 100 characters</span>
                  </p>
                </div>

                <!-- Last Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                  <input
                    formControlName="lastName"
                    placeholder="Doe"
                    class="field-input field-input--no-icon"
                    [class.field-input--error]="f['lastName'].invalid && f['lastName'].touched"
                  />
                  <p *ngIf="f['lastName'].invalid && f['lastName'].touched" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <mat-icon style="font-size: 0.85rem; width: 0.85rem; height: 0.85rem;">error_outline</mat-icon>
                    <span *ngIf="f['lastName'].hasError('required')">Required</span>
                    <span *ngIf="f['lastName'].hasError('maxlength')">Max 100 characters</span>
                  </p>
                </div>

              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <mat-icon class="field-icon">email</mat-icon>
                  </span>
                  <input
                    type="email"
                    formControlName="email"
                    placeholder="john@company.com"
                    autocomplete="email"
                    class="field-input"
                    [class.field-input--error]="f['email'].invalid && f['email'].touched"
                  />
                </div>
                <p *ngIf="f['email'].invalid && f['email'].touched" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <mat-icon style="font-size: 0.85rem; width: 0.85rem; height: 0.85rem;">error_outline</mat-icon>
                  <span *ngIf="f['email'].hasError('required')">Email is required</span>
                  <span *ngIf="f['email'].hasError('email')">Enter a valid email address</span>
                </p>
              </div>

              <!-- Role -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <mat-icon class="field-icon">manage_accounts</mat-icon>
                  </span>
                  <select
                    formControlName="role"
                    class="field-input field-select"
                    [class.field-input--error]="f['role'].invalid && f['role'].touched"
                  >
                    <option *ngFor="let r of roles" [ngValue]="r.value">{{ r.label }}</option>
                  </select>
                </div>
                <p *ngIf="f['role'].invalid && f['role'].touched" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <mat-icon style="font-size: 0.85rem; width: 0.85rem; height: 0.85rem;">error_outline</mat-icon>
                  Role is required
                </p>
              </div>

              <!-- Password -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <mat-icon class="field-icon">lock</mat-icon>
                  </span>
                  <input
                    [type]="hidePassword ? 'password' : 'text'"
                    formControlName="password"
                    placeholder="Min. 8 characters"
                    autocomplete="new-password"
                    class="field-input pr-12"
                    [class.field-input--error]="f['password'].invalid && f['password'].touched"
                  />
                  <button type="button" (click)="hidePassword = !hidePassword" tabindex="-1"
                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-150">
                    <mat-icon style="font-size: 1.2rem; width: 1.2rem; height: 1.2rem;">{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </div>
                <p *ngIf="f['password'].invalid && f['password'].touched" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <mat-icon style="font-size: 0.85rem; width: 0.85rem; height: 0.85rem;">error_outline</mat-icon>
                  <span *ngIf="f['password'].hasError('required')">Password is required</span>
                  <span *ngIf="f['password'].hasError('minlength')">Minimum 8 characters</span>
                </p>
              </div>

              <!-- Confirm Password -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <mat-icon class="field-icon">lock_reset</mat-icon>
                  </span>
                  <input
                    [type]="hideConfirmPassword ? 'password' : 'text'"
                    formControlName="confirmPassword"
                    placeholder="Re-enter password"
                    autocomplete="new-password"
                    class="field-input pr-12"
                    [class.field-input--error]="(f['confirmPassword'].invalid || registerForm.hasError('passwordMismatch')) && f['confirmPassword'].touched"
                  />
                  <button type="button" (click)="hideConfirmPassword = !hideConfirmPassword" tabindex="-1"
                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-150">
                    <mat-icon style="font-size: 1.2rem; width: 1.2rem; height: 1.2rem;">{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </div>
                <p *ngIf="(f['confirmPassword'].invalid || registerForm.hasError('passwordMismatch')) && f['confirmPassword'].touched" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <mat-icon style="font-size: 0.85rem; width: 0.85rem; height: 0.85rem;">error_outline</mat-icon>
                  <span *ngIf="f['confirmPassword'].hasError('required')">Please confirm your password</span>
                  <span *ngIf="registerForm.hasError('passwordMismatch') && !f['confirmPassword'].hasError('required')">Passwords do not match</span>
                </p>
              </div>

              <!-- Error Banner -->
              <div *ngIf="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
                <mat-icon class="text-red-500" style="font-size: 1.1rem; width: 1.1rem; height: 1.1rem;">error_outline</mat-icon>
                {{ errorMessage }}
              </div>

              <!-- Submit -->
              <button
                mat-raised-button
                color="primary"
                type="submit"
                class="w-full h-12 text-base font-semibold rounded-xl"
                [disabled]="registerForm.invalid || loading"
              >
                <span *ngIf="!loading" class="flex items-center justify-center gap-2">
                  <mat-icon>person_add</mat-icon>Create Account
                </span>
                <mat-spinner *ngIf="loading" diameter="24" class="mx-auto"></mat-spinner>
              </button>

            </form>

            <mat-divider class="my-6"></mat-divider>

            <p class="text-center text-sm text-gray-500">
              Already have an account?
              <a routerLink="/auth/login" class="text-primary-700 hover:text-primary-900 font-semibold ml-1">Sign in</a>
            </p>

          </mat-card-content>
        </mat-card>

      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  hidePassword = true;
  hideConfirmPassword = true;

  readonly roles = [
    { value: 'Admin',    label: 'Admin'    },
    { value: 'HR',       label: 'HR'       },
    { value: 'Manager',  label: 'Manager'  },
    { value: 'Employee', label: 'Employee' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        firstName:       ['', [Validators.required, Validators.maxLength(100)]],
        lastName:        ['', [Validators.required, Validators.maxLength(100)]],
        email:           ['', [Validators.required, Validators.email]],
        role:            ['Employee', Validators.required],
        password:        ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );
  }

  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { firstName, lastName, email, password, role } = this.registerForm.value;
    const request: RegisterRequest = { firstName, lastName, email, password, role };

    this.authService.register(request).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Account created successfully! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/auth/login']), 1800);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      },
    });
  }
}

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password        = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}
