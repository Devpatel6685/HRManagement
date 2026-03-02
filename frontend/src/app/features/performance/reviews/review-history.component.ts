import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PerformanceService } from '../../../core/services/performance.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { PerformanceReviewDto, AverageRatingDto } from '../../../models/performance.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-review-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  template: `
    <div class="p-6">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Performance Reviews</h1>
          <p class="text-sm text-gray-500 mt-0.5">Track and manage employee performance reviews</p>
        </div>
        <button
          *ngIf="canAddReview"
          mat-flat-button color="primary"
          (click)="router.navigate(['/performance/review'])"
        >
          <mat-icon class="mr-1">add</mat-icon>
          Add Review
        </button>
      </div>

      <!-- Average Rating Card (employee / manager view) -->
      <div *ngIf="!isAdminOrHR && avgRating && avgRating.reviewCount > 0" class="mb-6">
        <mat-card class="shadow-sm">
          <mat-card-content class="pt-4">
            <div class="flex items-center gap-6">
              <div class="flex flex-col items-center">
                <span class="text-5xl font-bold text-gray-900">{{ avgRating.averageRating | number:'1.1-1' }}</span>
                <div class="flex mt-1">
                  <mat-icon *ngFor="let s of getStars(avgRating.averageRating)" [style.color]="s.color"
                    style="font-size:1.3rem;width:1.3rem;height:1.3rem;line-height:1.3rem;">{{ s.icon }}</mat-icon>
                </div>
                <span class="text-sm text-gray-500 mt-1">out of 5</span>
              </div>
              <div class="border-l pl-6">
                <p class="text-2xl font-semibold text-gray-700">{{ avgRating.reviewCount }}</p>
                <p class="text-sm text-gray-500">Total Reviews</p>
              </div>
              <div class="border-l pl-6">
                <p class="text-lg font-semibold text-gray-700">{{ getRatingLabel(avgRating.averageRating) }}</p>
                <p class="text-sm text-gray-500">Overall Performance</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-16">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && reviews.length === 0" class="flex flex-col items-center py-16 text-gray-400">
        <mat-icon style="font-size:4rem;width:4rem;height:4rem;">assessment</mat-icon>
        <p class="mt-3 text-lg font-medium">No reviews found</p>
        <p class="text-sm">{{ canAddReview ? 'Click "Add Review" to create the first one.' : 'No performance reviews have been recorded yet.' }}</p>
      </div>

      <!-- Reviews Table -->
      <mat-card *ngIf="!loading && reviews.length > 0" class="shadow-sm">
        <mat-card-content class="p-0">
          <table mat-table [dataSource]="reviews" class="w-full">

            <!-- Employee Column (admin/HR view) -->
            <ng-container matColumnDef="employee">
              <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
              <td mat-cell *matCellDef="let r" class="py-4">
                <span class="font-medium text-gray-900">{{ r.employeeName }}</span>
              </td>
            </ng-container>

            <!-- Period Column -->
            <ng-container matColumnDef="period">
              <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Period</th>
              <td mat-cell *matCellDef="let r" class="py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {{ r.period }}
                </span>
              </td>
            </ng-container>

            <!-- Rating Column -->
            <ng-container matColumnDef="rating">
              <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
              <td mat-cell *matCellDef="let r" class="py-4">
                <div class="flex items-center gap-2">
                  <div class="flex">
                    <mat-icon *ngFor="let s of getStars(r.rating)" [style.color]="s.color"
                      style="font-size:1.1rem;width:1.1rem;height:1.1rem;line-height:1.1rem;">{{ s.icon }}</mat-icon>
                  </div>
                  <span class="text-sm text-gray-600 font-medium">{{ r.rating }}/5</span>
                </div>
              </td>
            </ng-container>

            <!-- Reviewer Column -->
            <ng-container matColumnDef="reviewer">
              <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reviewer</th>
              <td mat-cell *matCellDef="let r" class="py-4">
                <span class="text-sm text-gray-600">{{ r.reviewerName }}</span>
              </td>
            </ng-container>

            <!-- Comments Column -->
            <ng-container matColumnDef="comments">
              <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Comments</th>
              <td mat-cell *matCellDef="let r" class="py-4 max-w-xs">
                <span class="text-sm text-gray-600 truncate-2" [matTooltip]="r.comments || ''">
                  {{ r.comments || '—' }}
                </span>
              </td>
            </ng-container>

            <!-- Date Column -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <td mat-cell *matCellDef="let r" class="py-4">
                <span class="text-sm text-gray-500">{{ r.reviewDate | date:'MMM d, y' }}</span>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let r" class="py-4 text-right">
                <button
                  mat-icon-button color="warn"
                  [matTooltip]="'Delete review'"
                  (click)="confirmDelete(r)"
                >
                  <mat-icon style="font-size:1.1rem;width:1.1rem;height:1.1rem;line-height:1.1rem;">delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns" class="bg-gray-50"></tr>
            <tr mat-row *matRowDef="let r; columns: displayedColumns;" class="hover:bg-gray-50 transition-colors"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .truncate-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `],
})
export class ReviewHistoryComponent implements OnInit {
  reviews: PerformanceReviewDto[] = [];
  avgRating: AverageRatingDto | null = null;
  loading = false;
  private employeeId = '';

  get isAdminOrHR(): boolean {
    return this.authService.hasAnyRole(['Admin', 'HR']);
  }

  get canAddReview(): boolean {
    return this.authService.hasAnyRole(['Admin', 'HR', 'Manager']);
  }

  get displayedColumns(): string[] {
    return this.isAdminOrHR
      ? ['employee', 'period', 'rating', 'reviewer', 'comments', 'date', 'actions']
      : ['period', 'rating', 'reviewer', 'comments', 'date'];
  }

  constructor(
    private performanceService: PerformanceService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef,
    public router: Router,
  ) {}

  ngOnInit(): void {
    if (this.isAdminOrHR) {
      this.loadAll();
    } else {
      this.loading = true;
      this.employeeService.getMyProfile().subscribe({
        next: profile => {
          this.employeeId = profile.id;
          this.loadForEmployee(profile.id);
        },
        error: () => {
          this.snack.open('Failed to load profile', 'Close', { duration: 3000 });
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  loadAll(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.performanceService.getAllReviews().subscribe({
      next: data => {
        this.reviews = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snack.open('Failed to load reviews', 'Close', { duration: 3000 });
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadForEmployee(id: string): void {
    this.loading = true;
    this.performanceService.getEmployeeReviews(id).subscribe({
      next: data => {
        this.reviews = data;
        this.loading = false;
        this.cdr.detectChanges();

        this.performanceService.getAverageRating(id).subscribe({
          next: avg => {
            this.avgRating = avg;
            this.cdr.detectChanges();
          },
        });
      },
      error: () => {
        this.snack.open('Failed to load reviews', 'Close', { duration: 3000 });
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getStars(rating: number): { icon: string; color: string }[] {
    return [1, 2, 3, 4, 5].map(s => ({
      icon:  s <= Math.round(rating) ? 'star' : 'star_border',
      color: s <= Math.round(rating) ? '#f59e0b' : '#d1d5db',
    }));
  }

  getRatingLabel(rating: number): string {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Good';
    if (rating >= 2.5) return 'Average';
    if (rating >= 1.5) return 'Below Average';
    return 'Poor';
  }

  confirmDelete(review: PerformanceReviewDto): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Review',
        message: `Delete the review for ${review.employeeName} (${review.period})?`,
        icon: 'delete',
        confirmLabel: 'Delete',
        confirmColor: 'warn',
      },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.performanceService.deleteReview(review.id).subscribe({
        next: () => {
          this.snack.open('Review deleted', 'Close', { duration: 3000 });
          this.reviews = this.reviews.filter(r => r.id !== review.id);
          this.cdr.detectChanges();
        },
        error: err => this.snack.open(err?.error?.error ?? 'Failed to delete', 'Close', { duration: 3000 }),
      });
    });
  }
}
