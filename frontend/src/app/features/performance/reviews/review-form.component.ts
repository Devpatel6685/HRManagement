import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { PerformanceService } from '../../../core/services/performance.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { EmployeeListItem } from '../../../models/employee.model';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="p-6 max-w-3xl mx-auto">

      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <button mat-icon-button (click)="router.navigate(['/performance'])">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Add Performance Review</h1>
          <p class="text-sm text-gray-500 mt-0.5">Submit a review for an employee</p>
        </div>
      </div>

      <mat-card class="shadow-sm">
        <mat-card-content class="p-6">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">

            <!-- Employee -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Employee <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <mat-icon class="field-icon">person</mat-icon>
                </span>
                <select formControlName="employeeId" class="field-input"
                        [class.field-input--error]="f['employeeId'].invalid && f['employeeId'].touched">
                  <option value="">Select employee…</option>
                  <option *ngFor="let e of employees" [value]="e.id">
                    {{ e.firstName }} {{ e.lastName }}
                  </option>
                </select>
              </div>
              <p *ngIf="f['employeeId'].invalid && f['employeeId'].touched"
                 class="mt-1 text-xs text-red-500">Employee is required.</p>
            </div>

            <!-- Review Period -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Review Period <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <mat-icon class="field-icon">date_range</mat-icon>
                </span>
                <select formControlName="period" class="field-input"
                        [class.field-input--error]="f['period'].invalid && f['period'].touched">
                  <option value="">Select period…</option>
                  <option *ngFor="let p of periods" [value]="p">{{ p }}</option>
                </select>
              </div>
              <p *ngIf="f['period'].invalid && f['period'].touched"
                 class="mt-1 text-xs text-red-500">Review period is required.</p>
            </div>

            <!-- Star Rating -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Rating <span class="text-red-500">*</span>
              </label>
              <div class="flex items-center gap-1">
                <button
                  *ngFor="let star of [1,2,3,4,5]"
                  type="button"
                  class="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                  (click)="setRating(star)"
                  (mouseenter)="hoverRating = star"
                  (mouseleave)="hoverRating = 0"
                >
                  <mat-icon
                    [style.color]="(hoverRating || currentRating) >= star ? '#f59e0b' : '#d1d5db'"
                    style="font-size: 2rem; width: 2rem; height: 2rem; line-height: 2rem;">
                    {{ (hoverRating || currentRating) >= star ? 'star' : 'star_border' }}
                  </mat-icon>
                </button>
                <span class="ml-2 text-sm font-medium text-gray-600">
                  {{ ratingLabel }}
                </span>
              </div>
              <p *ngIf="submitted && !currentRating" class="mt-1 text-xs text-red-500">Rating is required.</p>
            </div>

            <!-- Comments -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Comments</label>
              <textarea formControlName="comments" rows="3"
                        placeholder="Overall performance summary…"
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"></textarea>
            </div>

            <!-- Strengths -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Strengths</label>
              <textarea formControlName="strengths" rows="3"
                        placeholder="Key strengths demonstrated…"
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"></textarea>
            </div>

            <!-- Areas for Improvement -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Areas for Improvement</label>
              <textarea formControlName="improvements" rows="3"
                        placeholder="Areas to focus on for growth…"
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"></textarea>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-2">
              <button mat-stroked-button type="button" (click)="router.navigate(['/performance'])">
                Cancel
              </button>
              <button mat-flat-button color="primary" type="submit" [disabled]="saving">
                <mat-spinner *ngIf="saving" diameter="18" class="mr-2 inline-block"></mat-spinner>
                Submit Review
              </button>
            </div>

          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class ReviewFormComponent implements OnInit {
  form = this.fb.group({
    employeeId:   ['', Validators.required],
    period:       ['', Validators.required],
    comments:     [''],
    strengths:    [''],
    improvements: [''],
  });

  employees: EmployeeListItem[] = [];
  reviewerId    = '';
  currentRating = 0;
  hoverRating   = 0;
  saving        = false;
  submitted     = false;

  periods: string[] = this.buildPeriods();

  get f() { return this.form.controls; }

  get ratingLabel(): string {
    const r = this.hoverRating || this.currentRating;
    return ['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent'][r] ?? '';
  }

  constructor(
    private fb: FormBuilder,
    private performanceService: PerformanceService,
    private employeeService: EmployeeService,
    private snack: MatSnackBar,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.employeeService.getMyProfile().subscribe({
      next: profile => this.reviewerId = profile.id,
      error: () => this.snack.open('Failed to load profile', 'Close', { duration: 3000 }),
    });

    this.employeeService.getAll({ page: 1, pageSize: 9999 }).subscribe({
      next: res => this.employees = res.items,
      error: () => this.snack.open('Failed to load employees', 'Close', { duration: 3000 }),
    });
  }

  setRating(star: number): void {
    this.currentRating = star;
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid || !this.currentRating) return;

    if (!this.reviewerId) {
      this.snack.open('Reviewer profile not loaded yet. Please try again.', 'Close', { duration: 3000 });
      return;
    }

    this.saving = true;
    const v = this.form.value;

    this.performanceService.addReview({
      employeeId:   v.employeeId!,
      reviewerId:   this.reviewerId,
      period:       v.period!,
      rating:       this.currentRating,
      comments:     v.comments || null,
      strengths:    v.strengths || null,
      improvements: v.improvements || null,
    }).subscribe({
      next: () => {
        this.snack.open('Review submitted successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/performance']);
      },
      error: err => {
        this.snack.open(err?.error?.error ?? 'Failed to submit review', 'Close', { duration: 4000 });
        this.saving = false;
      },
    });
  }

  private buildPeriods(): string[] {
    const year = new Date().getFullYear();
    const periods: string[] = [];
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    for (let y = year; y >= year - 1; y--) {
      for (let q = 3; q >= 0; q--) {
        periods.push(`${quarters[q]} ${y}`);
      }
      periods.push(`Annual ${y}`);
    }
    return periods;
  }
}
