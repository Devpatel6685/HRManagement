import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-800 to-primary-900 py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md">

        <!-- Brand mark -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <mat-icon class="text-primary-800" style="font-size: 2rem; width: 2rem; height: 2rem;">lock_reset</mat-icon>
          </div>
          <h1 class="text-3xl font-bold text-white tracking-tight">Reset Password</h1>
          <p class="text-blue-200 mt-1 text-sm">We'll send you a reset link</p>
        </div>

        <mat-card class="shadow-2xl rounded-2xl overflow-hidden">
          <mat-card-content class="p-8">

            <!-- Success state -->
            <div *ngIf="submitted" class="text-center py-4">
              <mat-icon class="text-green-500 mb-3" style="font-size: 3rem; width: 3rem; height: 3rem;">mark_email_read</mat-icon>
              <h2 class="text-xl font-semibold text-gray-800 mb-2">Check your email</h2>
              <p class="text-gray-500 text-sm mb-6">
                If an account with that email exists, we've sent a password reset link. Check your inbox and spam folder.
              </p>
              <a routerLink="/auth/login" mat-raised-button color="primary" class="w-full">Back to Sign In</a>
            </div>

            <!-- Form state -->
            <form *ngIf="!submitted" [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="space-y-5">

              <p class="text-gray-600 text-sm">
                Enter your account email address and we'll send you a link to reset your password.
              </p>

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

              <!-- Error banner -->
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
                [disabled]="forgotForm.invalid || loading"
              >
                <span *ngIf="!loading" class="flex items-center justify-center gap-2">
                  <mat-icon>send</mat-icon>Send Reset Link
                </span>
                <mat-spinner *ngIf="loading" diameter="24" class="mx-auto"></mat-spinner>
              </button>

              <div class="text-center">
                <a routerLink="/auth/login" class="text-sm text-primary-700 hover:text-primary-900 font-medium flex items-center justify-center gap-1 transition-colors">
                  <mat-icon style="font-size: 1rem; width: 1rem; height: 1rem;">arrow_back</mat-icon>
                  Back to Sign In
                </a>
              </div>

            </form>

          </mat-card-content>
        </mat-card>

      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get f() { return this.forgotForm.controls; }

  onSubmit(): void {
    if (this.forgotForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = true;
      },
      error: () => {
        this.loading = false;
        // Always show success to prevent email enumeration
        this.submitted = true;
      },
    });
  }
}
