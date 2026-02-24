import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  /** Material icon name shown in the title row. Defaults to 'warning'. */
  icon?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Color of the confirm button. Defaults to 'warn'. */
  confirmColor?: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <!-- Title -->
    <div mat-dialog-title class="flex items-center gap-3 pb-2">
      <div class="flex items-center justify-center w-9 h-9 rounded-full" [ngClass]="iconBgClass">
        <mat-icon [ngClass]="iconColorClass" style="font-size: 1.25rem; width: 1.25rem; height: 1.25rem; line-height: 1.25rem;">
          {{ data.icon || 'warning' }}
        </mat-icon>
      </div>
      <span class="text-lg font-semibold text-gray-900">{{ data.title }}</span>
    </div>

    <!-- Content -->
    <mat-dialog-content class="text-gray-600 text-sm leading-relaxed py-4">
      {{ data.message }}
    </mat-dialog-content>

    <!-- Actions -->
    <mat-dialog-actions align="end" class="gap-2 pt-2">
      <button mat-stroked-button [mat-dialog-close]="false" class="rounded-lg">
        {{ data.cancelLabel || 'Cancel' }}
      </button>
      <button
        mat-raised-button
        [color]="data.confirmColor || 'warn'"
        [mat-dialog-close]="true"
        class="rounded-lg"
      >
        {{ data.confirmLabel || 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host { display: block; min-width: 360px; max-width: 480px; }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  get iconBgClass(): string {
    const color = this.data.confirmColor || 'warn';
    return color === 'warn'    ? 'bg-red-100'
         : color === 'primary' ? 'bg-blue-100'
         :                       'bg-teal-100';
  }

  get iconColorClass(): string {
    const color = this.data.confirmColor || 'warn';
    return color === 'warn'    ? 'text-red-600'
         : color === 'primary' ? 'text-primary-700'
         :                       'text-accent-700';
  }
}
