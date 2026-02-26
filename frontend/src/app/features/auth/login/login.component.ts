import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
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
    MatSnackBarModule,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-800 to-primary-900 py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md">

        <!-- Brand mark -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <mat-icon class="text-primary-800" style="font-size: 2rem; width: 2rem; height: 2rem;">groups</mat-icon>
          </div>
          <h1 class="text-3xl font-bold text-white tracking-tight">HR Management</h1>
          <p class="text-blue-200 mt-1 text-sm">Sign in to your account</p>
        </div>

        <mat-card class="shadow-2xl rounded-2xl overflow-hidden">
          <mat-card-content class="p-8">

            <!-- Login Form -->
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">

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
                    placeholder="you@company.com"
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
                    placeholder="Enter your password"
                    autocomplete="current-password"
                    class="field-input pr-12"
                    [class.field-input--error]="f['password'].invalid && f['password'].touched"
                  />
                  <button
                    type="button"
                    (click)="hidePassword = !hidePassword"
                    tabindex="-1"
                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-150"
                  >
                    <mat-icon style="font-size: 1.2rem; width: 1.2rem; height: 1.2rem;">
                      {{ hidePassword ? 'visibility_off' : 'visibility' }}
                    </mat-icon>
                  </button>
                </div>
                <p *ngIf="f['password'].invalid && f['password'].touched" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <mat-icon style="font-size: 0.85rem; width: 0.85rem; height: 0.85rem;">error_outline</mat-icon>
                  <span *ngIf="f['password'].hasError('required')">Password is required</span>
                  <span *ngIf="f['password'].hasError('minlength')">Must be at least 6 characters</span>
                </p>
              </div>

              <!-- Forgot password -->
              <div class="flex justify-end -mt-1">
                <a routerLink="/auth/forgot-password" class="text-sm text-primary-700 hover:text-primary-900 font-medium transition-colors">
                  Forgot password?
                </a>
              </div>

              <!-- Submit -->
              <button
                mat-raised-button
                color="primary"
                type="submit"
                class="w-full h-12 text-base font-semibold rounded-xl"
                [disabled]="loginForm.invalid || loading"
              >
                <span *ngIf="!loading" class="flex items-center justify-center gap-2">
                  <mat-icon>login</mat-icon>Sign In
                </span>
                <mat-spinner *ngIf="loading" diameter="24" class="mx-auto"></mat-spinner>
              </button>

            </form>

            <mat-divider class="my-6"></mat-divider>

            <!-- Register Link -->
            <p class="text-center text-sm text-gray-500">
              Don't have an account?
              <a routerLink="/auth/register" class="text-primary-700 hover:text-primary-900 font-semibold ml-1">Create one</a>
            </p>

          </mat-card-content>
        </mat-card>

      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  hidePassword = true;
  private returnUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '';

    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        const destination = this.returnUrl || this.getRoleRedirect();
        this.router.navigate([destination]);
      },
      error: (err) => {
        this.loading = false;
        const message = err.error?.message || 'Invalid email or password. Please try again.';
        this.snackBar.open(message, 'Dismiss', {
          duration: 4000,
          panelClass: ['snack-error'],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
    });
  }

  private getRoleRedirect(): string {
    const role = this.authService.getUserFromToken()?.role;
    switch (role) {
      case 'Admin':
      case 'HR':
        return '/dashboard';
      case 'Manager':
        return '/attendance';
      case 'Employee':
        return '/profile';
      default:
        return '/dashboard';
    }
  }
}
