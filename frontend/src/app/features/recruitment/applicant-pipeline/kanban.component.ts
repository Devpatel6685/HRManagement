import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { RecruitmentService } from '../../../core/services/recruitment.service';
import { ApplicantDto, KanbanBoardDto, ApplicantStatus } from '../../../models/recruitment.model';
import { ApplicantDetailDialogComponent } from './applicant-detail-dialog.component';
import { AddApplicantDialogComponent } from './add-applicant-dialog.component';

interface KanbanColumn {
  key: ApplicantStatus;
  label: string;
  color: string;
  items: ApplicantDto[];
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatDialogModule, MatTooltipModule, DragDropModule,
  ],
  template: `
    <div class="p-6">

      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <a mat-icon-button [routerLink]="['/recruitment/jobs']">
          <mat-icon>arrow_back</mat-icon>
        </a>
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900">{{ jobTitle || 'Applicant Pipeline' }}</h1>
          <p class="text-sm text-gray-500 mt-0.5">Drag cards between columns to update status</p>
        </div>
        <button mat-raised-button color="primary" (click)="openAddApplicant()">
          <mat-icon>person_add</mat-icon> Add Applicant
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-20"><mat-spinner diameter="36"></mat-spinner></div>

      <!-- Kanban Board -->
      <div *ngIf="!loading"
           cdkDropListGroup
           class="flex gap-4 overflow-x-auto pb-4" style="min-height:70vh">

        <div *ngFor="let col of columns"
             class="flex-shrink-0 w-64 flex flex-col"
             cdkDropList
             [id]="col.key"
             [cdkDropListData]="col.items"
             [cdkDropListConnectedTo]="connectedLists"
             (cdkDropListDropped)="onDrop($event, col.key)">

          <!-- Column header -->
          <div class="flex items-center justify-between px-3 py-2 rounded-t-xl mb-2"
               [ngClass]="col.color + '-header'">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-sm">{{ col.label }}</span>
              <span class="text-xs font-bold px-1.5 py-0.5 rounded-full bg-white bg-opacity-60">
                {{ col.items.length }}
              </span>
            </div>
          </div>

          <!-- Cards -->
          <div class="flex-1 min-h-32 rounded-b-xl p-2 space-y-2"
               [ngClass]="col.color + '-bg'"
               cdkDropList
               [id]="col.key + '-inner'"
               [cdkDropListData]="col.items"
               [cdkDropListConnectedTo]="connectedLists"
               (cdkDropListDropped)="onDrop($event, col.key)">

            <div *ngFor="let app of col.items"
                 cdkDrag
                 [cdkDragData]="app"
                 class="bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                 (click)="openDetail(app)">

              <div class="flex items-start justify-between">
                <p class="font-medium text-gray-900 text-sm leading-tight">{{ app.name }}</p>
                <mat-icon *ngIf="app.hasResume" class="text-gray-400 text-[14px] mt-0.5"
                          matTooltip="Resume available">attach_file</mat-icon>
              </div>
              <p class="text-xs text-gray-500 mt-0.5">{{ app.email }}</p>
              <p *ngIf="app.phone" class="text-xs text-gray-400">{{ app.phone }}</p>
              <p class="text-xs text-gray-400 mt-2">
                Applied {{ app.appliedOn + 'T00:00:00' | date:'MMM d' }}
              </p>
              <p *ngIf="app.notes" class="text-xs text-gray-500 mt-1.5 italic line-clamp-1">
                {{ app.notes }}
              </p>

            </div>

            <!-- Empty placeholder -->
            <div *ngIf="col.items.length === 0"
                 class="text-center py-6 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              Drop here
            </div>

          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .Applied-header   { background:#e0e7ff; color:#3730a3; }
    .Applied-bg       { background:#f0f4ff; }
    .Shortlisted-header { background:#fef9c3; color:#713f12; }
    .Shortlisted-bg   { background:#fefce8; }
    .Interviewed-header { background:#fce7f3; color:#831843; }
    .Interviewed-bg   { background:#fdf4ff; }
    .Offered-header   { background:#d1fae5; color:#064e3b; }
    .Offered-bg       { background:#f0fdf4; }
    .Hired-header     { background:#dcfce7; color:#14532d; }
    .Hired-bg         { background:#f0fdf4; }
    .Rejected-header  { background:#fee2e2; color:#7f1d1d; }
    .Rejected-bg      { background:#fff5f5; }
    .line-clamp-1 { display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden; }
    [cdkDrag]:active  { opacity:0.8; }
  `],
})
export class KanbanComponent implements OnInit {
  jobId = '';
  jobTitle = '';
  loading = false;

  columns: KanbanColumn[] = [
    { key: 'Applied',     label: 'Applied',     color: 'Applied',     items: [] },
    { key: 'Shortlisted', label: 'Shortlisted', color: 'Shortlisted', items: [] },
    { key: 'Interviewed', label: 'Interviewed', color: 'Interviewed', items: [] },
    { key: 'Offered',     label: 'Offered',     color: 'Offered',     items: [] },
    { key: 'Hired',       label: 'Hired',       color: 'Hired',       items: [] },
    { key: 'Rejected',    label: 'Rejected',    color: 'Rejected',    items: [] },
  ];

  get connectedLists(): string[] {
    return this.columns.flatMap(c => [c.key, c.key + '-inner']);
  }

  constructor(
    private route: ActivatedRoute,
    private recruitmentService: RecruitmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('jobId') ?? '';
    this.recruitmentService.getJob(this.jobId).subscribe({
      next: job => { this.jobTitle = job.title; this.cdr.detectChanges(); },
    });
    this.loadBoard();
  }

  loadBoard(): void {
    if (!this.jobId) return;
    this.loading = true;
    this.cdr.detectChanges();
    this.recruitmentService.getKanban(this.jobId).subscribe({
      next: board => {
        this.columns[0].items = board.applied;
        this.columns[1].items = board.shortlisted;
        this.columns[2].items = board.interviewed;
        this.columns[3].items = board.offered;
        this.columns[4].items = board.hired;
        this.columns[5].items = board.rejected;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
    });
  }

  onDrop(event: CdkDragDrop<ApplicantDto[]>, targetStatus: ApplicantStatus): void {
    if (event.previousContainer === event.container) return;

    const applicant: ApplicantDto = event.item.data;
    const newStatus = targetStatus;

    // Confirm hire
    if (newStatus === 'Hired') {
      const ok = confirm(
        `Hiring "${applicant.name}" will automatically create an employee account and send a welcome email. Continue?`
      );
      if (!ok) return;
    }

    // Optimistic UI update
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
    applicant.status = newStatus;

    this.recruitmentService.updateStatus(applicant.id, { status: newStatus }).subscribe({
      next: updated => {
        // Sync updated data back
        const col = this.columns.find(c => c.key === newStatus);
        if (col) {
          const idx = col.items.findIndex(a => a.id === updated.id);
          if (idx !== -1) col.items[idx] = updated;
        }
        if (newStatus === 'Hired') {
          this.snackBar.open(`${applicant.name} hired! Employee account created.`, 'OK', { duration: 5000 });
          this.loadBoard(); // reload to reflect openings count change
        }
      },
      error: err => {
        // Revert optimistic update
        this.loadBoard();
        this.snackBar.open(err?.error?.error || 'Failed to update status.', 'Close', { duration: 4000 });
      },
    });
  }

  openDetail(app: ApplicantDto): void {
    const ref = this.dialog.open(ApplicantDetailDialogComponent, {
      width: '560px',
      data: { applicant: app, jobId: this.jobId },
    });
    ref.afterClosed().subscribe(changed => {
      if (changed) this.loadBoard();
    });
  }

  openAddApplicant(): void {
    const ref = this.dialog.open(AddApplicantDialogComponent, {
      width: '540px',
      data: { jobId: this.jobId },
    });
    ref.afterClosed().subscribe(added => {
      if (added) this.loadBoard();
    });
  }
}
