import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TrainingService } from '../../../core/services/training.service';
import { AuthService } from '../../../core/services/auth.service';
import { TrainingDto } from '../../../models/training.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AssignEmployeesDialogComponent } from '../assign-dialog/assign-employees-dialog.component';

@Component({
  selector: 'app-training-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatTabsModule,
    MatProgressSpinnerModule, MatSnackBarModule,
    MatTooltipModule, MatDialogModule,
  ],
  template: `
    <div class="p-6">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Training Management</h1>
          <p class="text-sm text-gray-500 mt-0.5">Manage and track employee training programs</p>
        </div>
        <div class="flex gap-2">
          <button mat-stroked-button routerLink="/training/mine">
            <mat-icon class="mr-1">school</mat-icon>
            My Trainings
          </button>
          <button *ngIf="isAdminOrHR" mat-flat-button color="primary" routerLink="/training/new">
            <mat-icon class="mr-1">add</mat-icon>
            New Training
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <mat-tab-group (selectedTabChange)="onTabChange($event.index)" animationDuration="150ms">

        <!-- Upcoming Tab -->
        <mat-tab label="Upcoming">
          <div class="pt-4">
            <div *ngIf="loadingUpcoming" class="flex justify-center py-16">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
            <div *ngIf="!loadingUpcoming && upcoming.length === 0" class="flex flex-col items-center py-16 text-gray-400">
              <mat-icon style="font-size:4rem;width:4rem;height:4rem;">event_available</mat-icon>
              <p class="mt-3 text-lg font-medium">No upcoming trainings</p>
              <p class="text-sm">{{ isAdminOrHR ? 'Click "New Training" to schedule one.' : 'Check back later.' }}</p>
            </div>
            <mat-card *ngIf="!loadingUpcoming && upcoming.length > 0" class="shadow-sm">
              <mat-card-content class="p-0">
                <ng-container *ngTemplateOutlet="trainingTable; context: { list: upcoming }"></ng-container>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- All Trainings Tab -->
        <mat-tab label="All Trainings">
          <div class="pt-4">
            <div *ngIf="loadingAll" class="flex justify-center py-16">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
            <div *ngIf="!loadingAll && all.length === 0" class="flex flex-col items-center py-16 text-gray-400">
              <mat-icon style="font-size:4rem;width:4rem;height:4rem;">school</mat-icon>
              <p class="mt-3 text-lg font-medium">No trainings found</p>
              <p class="text-sm">{{ isAdminOrHR ? 'Click "New Training" to create the first one.' : 'No training programs available.' }}</p>
            </div>
            <mat-card *ngIf="!loadingAll && all.length > 0" class="shadow-sm">
              <mat-card-content class="p-0">
                <ng-container *ngTemplateOutlet="trainingTable; context: { list: all }"></ng-container>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

      </mat-tab-group>

      <!-- Shared Table Template -->
      <ng-template #trainingTable let-list="list">
        <table mat-table [dataSource]="list" class="w-full">

          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
            <td mat-cell *matCellDef="let t" class="py-4">
              <p class="font-medium text-gray-900">{{ t.title }}</p>
              <p class="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{{ t.description }}</p>
            </td>
          </ng-container>

          <ng-container matColumnDef="trainer">
            <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Trainer</th>
            <td mat-cell *matCellDef="let t" class="py-4">
              <span class="text-sm text-gray-700">{{ t.trainer }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="startDate">
            <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</th>
            <td mat-cell *matCellDef="let t" class="py-4">
              <span class="text-sm text-gray-600">{{ t.startDate + 'T00:00:00' | date:'MMM d, y' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="endDate">
            <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</th>
            <td mat-cell *matCellDef="let t" class="py-4">
              <span class="text-sm text-gray-600">{{ t.endDate + 'T00:00:00' | date:'MMM d, y' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="enrolled">
            <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrolled / Max</th>
            <td mat-cell *matCellDef="let t" class="py-4">
              <span class="text-sm text-gray-700">{{ t.enrolledCount }} / {{ t.maxParticipants }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <td mat-cell *matCellDef="let t" class="py-4">
              <span [class]="getStatusClass(t)">{{ getStatusLabel(t) }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let t" class="py-4 text-right">
              <button *ngIf="isAdminOrHR"
                mat-icon-button color="primary"
                [matTooltip]="'Assign Employees'"
                (click)="openAssignDialog(t)"
              >
                <mat-icon style="font-size:1.15rem;width:1.15rem;height:1.15rem;line-height:1.15rem;">group_add</mat-icon>
              </button>
              <button *ngIf="isAdminOrHR"
                mat-icon-button color="warn"
                [matTooltip]="'Delete training'"
                (click)="confirmDelete(t)"
              >
                <mat-icon style="font-size:1.15rem;width:1.15rem;height:1.15rem;line-height:1.15rem;">delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns" class="bg-gray-50"></tr>
          <tr mat-row *matRowDef="let r; columns: displayedColumns;" class="hover:bg-gray-50 transition-colors"></tr>
        </table>
      </ng-template>

    </div>
  `,
})
export class TrainingListComponent implements OnInit {
  upcoming: TrainingDto[] = [];
  all: TrainingDto[] = [];
  loadingUpcoming = false;
  loadingAll = false;
  activeTab = 0;

  get isAdminOrHR(): boolean {
    return this.authService.hasAnyRole(['Admin', 'HR']);
  }

  get displayedColumns(): string[] {
    const base = ['title', 'trainer', 'startDate', 'endDate', 'enrolled', 'status'];
    return this.isAdminOrHR ? [...base, 'actions'] : base;
  }

  constructor(
    private trainingService: TrainingService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUpcoming();
  }

  onTabChange(index: number): void {
    this.activeTab = index;
    if (index === 1 && this.all.length === 0) {
      this.loadAll();
    }
  }

  loadUpcoming(): void {
    this.loadingUpcoming = true;
    this.trainingService.getUpcoming().subscribe({
      next: data => {
        this.upcoming = data;
        this.loadingUpcoming = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snack.open('Failed to load upcoming trainings', 'Close', { duration: 3000 });
        this.loadingUpcoming = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadAll(): void {
    this.loadingAll = true;
    this.trainingService.getAll().subscribe({
      next: data => {
        this.all = data;
        this.loadingAll = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snack.open('Failed to load trainings', 'Close', { duration: 3000 });
        this.loadingAll = false;
        this.cdr.detectChanges();
      },
    });
  }

  getStatusLabel(t: TrainingDto): string {
    const now = new Date();
    const start = new Date(t.startDate + 'T00:00:00');
    const end   = new Date(t.endDate   + 'T00:00:00');
    if (now < start) return 'Upcoming';
    if (now > end)   return 'Past';
    return 'Ongoing';
  }

  getStatusClass(t: TrainingDto): string {
    const label = this.getStatusLabel(t);
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    if (label === 'Upcoming') return `${base} bg-blue-100 text-blue-800`;
    if (label === 'Ongoing')  return `${base} bg-green-100 text-green-800`;
    return `${base} bg-gray-100 text-gray-600`;
  }

  openAssignDialog(training: TrainingDto): void {
    const ref = this.dialog.open(AssignEmployeesDialogComponent, {
      data: { trainingId: training.id },
      width: '460px',
    });

    ref.afterClosed().subscribe(assigned => {
      if (assigned) {
        // Refresh counts
        this.loadUpcoming();
        if (this.activeTab === 1) this.loadAll();
      }
    });
  }

  confirmDelete(training: TrainingDto): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Training',
        message: `Delete "${training.title}"? This will also remove all employee enrollments.`,
        icon: 'delete',
        confirmLabel: 'Delete',
        confirmColor: 'warn',
      },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.trainingService.delete(training.id).subscribe({
        next: () => {
          this.snack.open('Training deleted', 'Close', { duration: 3000 });
          this.upcoming = this.upcoming.filter(t => t.id !== training.id);
          this.all = this.all.filter(t => t.id !== training.id);
          this.cdr.detectChanges();
        },
        error: err => this.snack.open(err?.error?.error ?? 'Failed to delete', 'Close', { duration: 3000 }),
      });
    });
  }
}
