import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <!-- Overlay mode: full-screen backdrop with centred spinner -->
    <div
      *ngIf="overlay"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
    >
      <div class="bg-white rounded-2xl px-10 py-8 flex flex-col items-center gap-4 shadow-2xl">
        <mat-spinner [diameter]="diameter" color="primary"></mat-spinner>
        <p *ngIf="message" class="text-gray-600 text-sm font-medium">{{ message }}</p>
      </div>
    </div>

    <!-- Inline mode: centred within parent -->
    <div
      *ngIf="!overlay"
      class="flex flex-col items-center justify-center py-12 gap-4"
    >
      <mat-spinner [diameter]="diameter" color="primary"></mat-spinner>
      <p *ngIf="message" class="text-gray-500 text-sm">{{ message }}</p>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class LoadingSpinnerComponent {
  @Input() overlay  = false;
  @Input() diameter = 48;
  @Input() message?: string;
}
