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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
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
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-800 to-primary-900 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-lg w-full">

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

            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">

              <!-- First + Last Name row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <mat-form-field appearance="outline">
                  <mat-label>First Name</mat-label>
                  <mat-icon matPrefix class="mr-2 text-gray-400">badge</mat-icon>
                  <input matInput formControlName="firstName" placeholder="John" />
                  <mat-error *ngIf="f['firstName'].hasError('required')">Required</mat-error>
                  <mat-error *ngIf="f['firstName'].hasError('maxlength')">Max 100 characters</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="lastName" placeholder="Doe" />
                  <mat-error *ngIf="f['lastName'].hasError('required')">Required</mat-error>
                  <mat-error *ngIf="f['lastName'].hasError('maxlength')">Max 100 characters</mat-error>
                </mat-form-field>
              </div>

              <!-- Email -->
              <mat-form-field class="w-full mt-3" appearance="outline">
                <mat-label>Email address</mat-label>
                <mat-icon matPrefix class="mr-2 text-gray-400">email</mat-icon>
                <input matInput type="email" formControlName="email" placeholder="john@company.com" autocomplete="email" />
                <mat-error *ngIf="f['email'].hasError('required')">Email is required</mat-error>
                <mat-error *ngIf="f['email'].hasError('email')">Enter a valid email</mat-error>
              </mat-form-field>

              <!-- Role -->
              <mat-form-field class="w-full mt-3" appearance="outline">
                <mat-label>Role</mat-label>
                <mat-icon matPrefix class="mr-2 text-gray-400">manage_accounts</mat-icon>
                <mat-select formControlName="role">
                  <mat-option *ngFor="let r of roles" [value]="r.value">
                    <span class="flex items-center gap-2">{{ r.label }}</span>
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="f['role'].hasError('required')">Role is required</mat-error>
              </mat-form-field>

              <!-- Password -->
              <mat-form-field class="w-full mt-3" appearance="outline">
                <mat-label>Password</mat-label>
                <mat-icon matPrefix class="mr-2 text-gray-400">lock</mat-icon>
                <input
                  matInput
                  [type]="hidePassword ? 'password' : 'text'"
                  formControlName="password"
                  placeholder="Min. 8 characters"
                  autocomplete="new-password"
                />
                <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="f['password'].hasError('required')">Password is required</mat-error>
                <mat-error *ngIf="f['password'].hasError('minlength')">Minimum 8 characters</mat-error>
              </mat-form-field>

              <!-- Confirm Password -->
              <mat-form-field class="w-full mt-3" appearance="outline">
                <mat-label>Confirm Password</mat-label>
                <mat-icon matPrefix class="mr-2 text-gray-400">lock_reset</mat-icon>
                <input
                  matInput
                  [type]="hideConfirmPassword ? 'password' : 'text'"
                  formControlName="confirmPassword"
                  placeholder="Re-enter password"
                  autocomplete="new-password"
                />
                <button mat-icon-button matSuffix type="button" (click)="hideConfirmPassword = !hideConfirmPassword">
                  <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="f['confirmPassword'].hasError('required')">Please confirm your password</mat-error>
                <mat-error *ngIf="registerForm.hasError('passwordMismatch') && !f['confirmPassword'].hasError('required')">
                  Passwords do not match
                </mat-error>
              </mat-form-field>

              <!-- Error Banner -->
              <div *ngIf="errorMessage" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <mat-icon class="text-red-500 text-base" style="font-size: 1.1rem;">error_outline</mat-icon>
                {{ errorMessage }}
              </div>

              <!-- Submit -->
              <button
                mat-raised-button
                color="primary"
                type="submit"
                class="w-full h-12 mt-6 text-base font-semibold rounded-lg"
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
