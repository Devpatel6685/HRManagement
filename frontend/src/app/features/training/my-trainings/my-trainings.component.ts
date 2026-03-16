import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TrainingService } from '../../../core/services/training.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { EmployeeTrainingDto } from '../../../models/training.model';

@Component({
  selector: 'app-my-trainings',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatTooltipModule,
  ],
  template: `
    <div class="p-6">

      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <button mat-icon-button routerLink="/training">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">My Trainings</h1>
          <p class="text-sm text-gray-500 mt-0.5">Your enrolled and completed training programs</p>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-16">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Empty -->
      <div *ngIf="!loading && trainings.length === 0" class="flex flex-col items-center py-16 text-gray-400">
        <mat-icon style="font-size:4rem;width:4rem;height:4rem;">school</mat-icon>
        <p class="mt-3 text-lg font-medium">No trainings yet</p>
        <p class="text-sm">You have not been enrolled in any training programs.</p>
      </div>

      <!-- Table -->
      <mat-card *ngIf="!loading && trainings.length > 0" class="shadow-sm">
        <mat-card-content class="p-0">
          <table mat-table [dataSource]="trainings" class="w-full">

            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Training</th>
              <td mat-cell *matCellDef="let t" class="py-4">
                <p class="font-medium text-gray-900">{{ t.trainingTitle }}</p>
              </td>
            </ng-container>

            <ng-container matColumnDef="trainer">
              <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Trainer</th>
              <td mat-cell *matCellDef="let t" class="py-4">
                <span class="text-sm text-gray-700">{{ t.trainer }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="startDate">
              <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Start</th>
              <td mat-cell *matCellDef="let t" class="py-4">
                <span class="text-sm text-gray-600">{{ t.startDate + 'T00:00:00' | date:'MMM d, y' }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="endDate">
              <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase tracking-wider">End</th>
              <td mat-cell *matCellDef="let t" class="py-4">
                <span class="text-sm text-gray-600">{{ t.endDate + 'T00:00:00' | date:'MMM d, y' }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <td mat-cell *matCellDef="let t" class="py-4">
                <span [class]="getStatusClass(t.status)">{{ t.status }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="score">
              <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
              <td mat-cell *matCellDef="let t" class="py-4">
                <span class="text-sm text-gray-700">{{ t.score != null ? t.score : '—' }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="completionDate">
              <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed On</th>
              <td mat-cell *matCellDef="let t" class="py-4">
                <span class="text-sm text-gray-500">
                  {{ t.completionDate ? (t.completionDate | date:'MMM d, y') : '—' }}
                </span>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns" class="bg-gray-50"></tr>
            <tr mat-row *matRowDef="let r; columns: displayedColumns;" class="hover:bg-gray-50 transition-colors"></tr>
          </table>
        </mat-card-content>
      </mat-card>

    </div>
  `,
})
export class MyTrainingsComponent implements OnInit {
  trainings: EmployeeTrainingDto[] = [];
  loading = false;

  readonly displayedColumns = ['title', 'trainer', 'startDate', 'endDate', 'status', 'score', 'completionDate'];

  constructor(
    private trainingService: TrainingService,
    private employeeService: EmployeeService,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.employeeService.getMyProfile().subscribe({
      next: profile => {
        this.trainingService.getMyTrainings(profile.id).subscribe({
          next: data => {
            this.trainings = data;
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.snack.open('Failed to load trainings', 'Close', { duration: 3000 });
            this.loading = false;
            this.cdr.detectChanges();
          },
        });
      },
      error: () => {
        this.snack.open('Failed to load profile', 'Close', { duration: 3000 });
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getStatusClass(status: string): string {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (status) {
      case 'Enrolled':    return `${base} bg-blue-100 text-blue-800`;
      case 'InProgress':  return `${base} bg-yellow-100 text-yellow-800`;
      case 'Completed':   return `${base} bg-green-100 text-green-800`;
      case 'Dropped':     return `${base} bg-gray-100 text-gray-600`;
      default:            return `${base} bg-gray-100 text-gray-600`;
    }
  }
}
