import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDividerModule],
  template: `
    <div class="mb-6">
      <div class="flex items-start justify-between">
        <!-- Title block -->
        <div class="flex items-center gap-3">
          <div *ngIf="icon" class="flex items-center justify-center w-10 h-10 bg-primary-50 rounded-xl">
            <mat-icon class="text-primary-800">{{ icon }}</mat-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 leading-tight m-0">{{ title }}</h1>
            <p *ngIf="subtitle" class="text-gray-500 text-sm mt-0.5 m-0">{{ subtitle }}</p>
          </div>
        </div>

        <!-- Action slot -->
        <div class="flex items-center gap-2">
          <ng-content select="[actions]"></ng-content>
        </div>
      </div>

      <mat-divider class="mt-4"></mat-divider>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input() icon?: string;
}
