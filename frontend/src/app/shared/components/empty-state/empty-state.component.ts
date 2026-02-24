import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-8 text-center">
      <!-- Icon circle -->
      <div class="flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
        <mat-icon
          class="text-gray-400"
          style="font-size: 2.5rem; width: 2.5rem; height: 2.5rem; line-height: 2.5rem;"
        >{{ icon }}</mat-icon>
      </div>

      <!-- Text -->
      <h3 class="text-xl font-semibold text-gray-700 mb-2">{{ title }}</h3>
      <p class="text-gray-500 text-sm max-w-xs leading-relaxed">{{ message }}</p>

      <!-- Optional CTA -->
      <button
        *ngIf="actionLabel"
        mat-raised-button
        color="primary"
        class="mt-6"
        (click)="action.emit()"
      >
        <mat-icon *ngIf="actionIcon" class="mr-1">{{ actionIcon }}</mat-icon>
        {{ actionLabel }}
      </button>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class EmptyStateComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) message!: string;
  @Input() icon        = 'inbox';
  @Input() actionLabel?: string;
  @Input() actionIcon?: string;
  @Output() action = new EventEmitter<void>();
}
