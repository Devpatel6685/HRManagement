import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('newPassword')?.value;
  const confirm  = group.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-reset-password',
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
          <h1 class="text-3xl font-bold text-white tracking-tight">New Password</h1>
          <p class="text-blue-200 mt-1 text-sm">Choose a strong password</p>
        </div>

        <mat-card class="shadow-2xl rounded-2xl overflow-hidden">
          <mat-card-content class="p-8">

            <!-- Invalid token state -->
            <div *ngIf="invalidToken" class="text-center py-4">
              <mat-icon class="text-red-400 mb-3" style="font-size: 3rem; width: 3rem; height: 3rem;">link_off</mat-icon>
              <h2 class="text-xl font-semibold text-gray-800 mb-2">Link Expired</h2>
              <p class="text-gray-500 text-sm mb-6">This reset link is invalid or has expired. Please request a new one.</p>
              <a routerLink="/auth/forgot-password" mat-raised-button color="primary">Request New Link</a>
            </div>

            <!-- Success state -->
            <div *ngIf="!invalidToken && success" class="text-center py-4">
              <mat-icon class="text-green-500 mb-3" style="font-size: 3rem; width: 3rem; height: 3rem;">check_circle</mat-icon>
              <h2 class="text-xl font-semibold text-gray-800 mb-2">Password Updated</h2>
              <p class="text-gray-500 text-sm mb-6">Your password has been reset successfully. You can now sign in.</p>
              <a routerLink="/auth/login" mat-raised-button color="primary" class="w-full">Sign In</a>
            </div>

            <!-- Form state -->
            <form *ngIf="!invalidToken && !success" [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-5">

              <!-- New Password -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <mat-icon class="field-icon">lock</mat-icon>
                  </span>
                  <input
                    [type]="hideNew ? 'password' : 'text'"
                    formControlName="newPassword"
                    placeholder="Min. 6 characters"
                    class="field-input pr-12"
                    [class.field-input--error]="f['newPassword'].invalid && f['newPassword'].touched"
                  />
                  <button type="button" (click)="hideNew = !hideNew" tabindex="-1"
                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-150">
                    <mat-icon style="font-size: 1.2rem; width: 1.2rem; height: 1.2rem;">{{ hideNew ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </div>
                <p *ngIf="f['newPassword'].invalid && f['newPassword'].touched" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <mat-icon style="font-size: 0.85rem; width: 0.85rem; height: 0.85rem;">error_outline</mat-icon>
                  <span *ngIf="f['newPassword'].hasError('required')">Password is required</span>
                  <span *ngIf="f['newPassword'].hasError('minlength')">Minimum 6 characters</span>
                </p>
              </div>

              <!-- Confirm Password -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <mat-icon class="field-icon">lock_outline</mat-icon>
                  </span>
                  <input
                    [type]="hideConfirm ? 'password' : 'text'"
                    formControlName="confirmPassword"
                    placeholder="Repeat new password"
                    class="field-input pr-12"
                    [class.field-input--error]="(f['confirmPassword'].invalid || resetForm.hasError('passwordMismatch')) && f['confirmPassword'].touched"
                  />
                  <button type="button" (click)="hideConfirm = !hideConfirm" tabindex="-1"
                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-150">
                    <mat-icon style="font-size: 1.2rem; width: 1.2rem; height: 1.2rem;">{{ hideConfirm ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </div>
                <p *ngIf="(f['confirmPassword'].invalid || resetForm.hasError('passwordMismatch')) && f['confirmPassword'].touched" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <mat-icon style="font-size: 0.85rem; width: 0.85rem; height: 0.85rem;">error_outline</mat-icon>
                  <span *ngIf="f['confirmPassword'].hasError('required')">Please confirm your password</span>
                  <span *ngIf="resetForm.hasError('passwordMismatch') && !f['confirmPassword'].hasError('required')">Passwords do not match</span>
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
                [disabled]="resetForm.invalid || loading"
              >
                <span *ngIf="!loading" class="flex items-center justify-center gap-2">
                  <mat-icon>save</mat-icon>Reset Password
                </span>
                <mat-spinner *ngIf="loading" diameter="24" class="mx-auto"></mat-spinner>
              </button>

            </form>

          </mat-card-content>
        </mat-card>

      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  loading = false;
  success = false;
  invalidToken = false;
  errorMessage = '';
  hideNew = true;
  hideConfirm = true;
  private token = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] ?? '';
    if (!this.token) {
      this.invalidToken = true;
      return;
    }

    this.resetForm = this.fb.group(
      {
        newPassword:     ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );
  }

  get f() { return this.resetForm.controls; }

  onSubmit(): void {
    if (this.resetForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.resetPassword(this.token, this.resetForm.value.newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 400) {
          this.invalidToken = true;
        } else {
          this.errorMessage = err.error?.message || 'Something went wrong. Please try again.';
        }
      },
    });
  }
}
