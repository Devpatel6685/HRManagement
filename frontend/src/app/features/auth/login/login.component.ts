import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
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
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-800 to-primary-900 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full">

        <!-- Brand mark -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <mat-icon class="text-primary-800" style="font-size: 2rem; width: 2rem; height: 2rem;">groups</mat-icon>
          </div>
          <h1 class="text-3xl font-bold text-white tracking-tight">HR Management</h1>
          <p class="text-primary-200 mt-1 text-sm">Sign in to your account</p>
        </div>

        <mat-card class="shadow-2xl rounded-2xl overflow-hidden">
          <mat-card-content class="p-8">

            <!-- Login Form -->
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">

              <!-- Email -->
              <mat-form-field class="w-full" appearance="outline">
                <mat-label>Email address</mat-label>
                <mat-icon matPrefix class="mr-2 text-gray-400">email</mat-icon>
                <input
                  matInput
                  type="email"
                  formControlName="email"
                  placeholder="you@company.com"
                  autocomplete="email"
                />
                <mat-error *ngIf="f['email'].hasError('required')">Email is required</mat-error>
                <mat-error *ngIf="f['email'].hasError('email')">Enter a valid email</mat-error>
              </mat-form-field>

              <!-- Password -->
              <mat-form-field class="w-full mt-3" appearance="outline">
                <mat-label>Password</mat-label>
                <mat-icon matPrefix class="mr-2 text-gray-400">lock</mat-icon>
                <input
                  matInput
                  [type]="hidePassword ? 'password' : 'text'"
                  formControlName="password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                />
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="hidePassword = !hidePassword"
                  [attr.aria-label]="'Toggle password visibility'"
                >
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="f['password'].hasError('required')">Password is required</mat-error>
              </mat-form-field>

              <!-- Forgot password -->
              <div class="flex justify-end mt-1 mb-5">
                <a routerLink="/auth/forgot-password" class="text-sm text-primary-700 hover:text-primary-900 font-medium">
                  Forgot password?
                </a>
              </div>

              <!-- Error Banner -->
              <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <mat-icon class="text-red-500 text-base" style="font-size: 1.1rem;">error_outline</mat-icon>
                {{ errorMessage }}
              </div>

              <!-- Submit -->
              <button
                mat-raised-button
                color="primary"
                type="submit"
                class="w-full h-12 text-base font-semibold rounded-lg"
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
            <p class="text-center text-sm text-gray-500 mb-6">
              Don't have an account?
              <a routerLink="/auth/register" class="text-primary-700 hover:text-primary-900 font-semibold ml-1">Create one</a>
            </p>


          </mat-card-content>
        </mat-card>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .primary-200 { color: #90caf9; }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  hidePassword = true;
  returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => this.router.navigate([this.returnUrl]),
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password. Please try again.';
      },
    });
  }
}
