import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TrainingService } from '../../../core/services/training.service';

@Component({
  selector: 'app-training-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="p-6 max-w-2xl mx-auto">

      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <button mat-icon-button (click)="router.navigate(['/training'])">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">New Training Program</h1>
          <p class="text-sm text-gray-500 mt-0.5">Schedule a new employee training session</p>
        </div>
      </div>

      <mat-card class="shadow-sm">
        <mat-card-content class="p-6">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">

            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Training Title <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <mat-icon class="field-icon">school</mat-icon>
                </span>
                <input formControlName="title" type="text"
                       placeholder="e.g. Angular Fundamentals"
                       class="field-input"
                       [class.field-input--error]="f['title'].invalid && f['title'].touched" />
              </div>
              <p *ngIf="f['title'].invalid && f['title'].touched" class="mt-1 text-xs text-red-500">
                Title is required.
              </p>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea formControlName="description" rows="3"
                        placeholder="Optional description of the training program…"
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"></textarea>
            </div>

            <!-- Trainer -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Trainer <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <mat-icon class="field-icon">person</mat-icon>
                </span>
                <input formControlName="trainer" type="text"
                       placeholder="Trainer name"
                       class="field-input"
                       [class.field-input--error]="f['trainer'].invalid && f['trainer'].touched" />
              </div>
              <p *ngIf="f['trainer'].invalid && f['trainer'].touched" class="mt-1 text-xs text-red-500">
                Trainer is required.
              </p>
            </div>

            <!-- Start Date / End Date -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Start Date <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <mat-icon class="field-icon">calendar_today</mat-icon>
                  </span>
                  <input formControlName="startDate" type="date"
                         class="field-input"
                         [class.field-input--error]="f['startDate'].invalid && f['startDate'].touched" />
                </div>
                <p *ngIf="f['startDate'].invalid && f['startDate'].touched" class="mt-1 text-xs text-red-500">
                  Start date is required.
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  End Date <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <mat-icon class="field-icon">event</mat-icon>
                  </span>
                  <input formControlName="endDate" type="date"
                         class="field-input"
                         [class.field-input--error]="f['endDate'].invalid && f['endDate'].touched" />
                </div>
                <p *ngIf="f['endDate'].invalid && f['endDate'].touched" class="mt-1 text-xs text-red-500">
                  End date is required.
                </p>
              </div>
            </div>

            <!-- Date validation error -->
            <p *ngIf="dateError" class="text-xs text-red-500 -mt-3">{{ dateError }}</p>

            <!-- Max Participants -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Max Participants <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <mat-icon class="field-icon">group</mat-icon>
                </span>
                <input formControlName="maxParticipants" type="number" min="1"
                       placeholder="e.g. 20"
                       class="field-input"
                       [class.field-input--error]="f['maxParticipants'].invalid && f['maxParticipants'].touched" />
              </div>
              <p *ngIf="f['maxParticipants'].invalid && f['maxParticipants'].touched" class="mt-1 text-xs text-red-500">
                Must be at least 1.
              </p>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-2">
              <button mat-stroked-button type="button" (click)="router.navigate(['/training'])" [disabled]="saving">
                Cancel
              </button>
              <button mat-flat-button color="primary" type="submit" [disabled]="saving">
                <mat-spinner *ngIf="saving" diameter="18" class="mr-2 inline-block"></mat-spinner>
                Create Training
              </button>
            </div>

          </form>
        </mat-card-content>
      </mat-card>

    </div>
  `,
})
export class TrainingFormComponent {
  saving = false;
  dateError = '';

  form = this.fb.group({
    title:           ['', Validators.required],
    description:     [''],
    trainer:         ['', Validators.required],
    startDate:       ['', Validators.required],
    endDate:         ['', Validators.required],
    maxParticipants: [1, [Validators.required, Validators.min(1)]],
  });

  get f() { return this.form.controls; }

  constructor(
    private fb: FormBuilder,
    private trainingService: TrainingService,
    private snack: MatSnackBar,
    public router: Router,
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const start = v.startDate!;
    const end   = v.endDate!;

    if (end < start) {
      this.dateError = 'End date must be on or after start date.';
      return;
    }
    this.dateError = '';

    this.saving = true;
    this.trainingService.create({
      title:           v.title!,
      description:     v.description ?? '',
      trainer:         v.trainer!,
      startDate:       start,
      endDate:         end,
      maxParticipants: v.maxParticipants!,
    }).subscribe({
      next: () => {
        this.snack.open('Training created successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/training']);
      },
      error: err => {
        this.snack.open(err?.error?.error ?? 'Failed to create training', 'Close', { duration: 4000 });
        this.saving = false;
      },
    });
  }
}
