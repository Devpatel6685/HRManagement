import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AssetService } from '../../../core/services/asset.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AssetDto } from '../../../models/asset.model';

@Component({
  selector: 'app-my-assets',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="p-6">

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">My Assets</h1>
        <p class="text-sm text-gray-500 mt-0.5">Assets currently assigned to you</p>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-16"><mat-spinner diameter="36"></mat-spinner></div>

      <!-- Empty -->
      <div *ngIf="!loading && assets.length === 0"
           class="flex flex-col items-center py-16 text-gray-400">
        <mat-icon style="font-size:4rem;width:4rem;height:4rem;">inventory_2</mat-icon>
        <p class="mt-3 text-lg font-medium">No assets assigned</p>
        <p class="text-sm">You have no company assets currently assigned to you.</p>
      </div>

      <!-- Assets Grid -->
      <div *ngIf="!loading && assets.length > 0"
           class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let asset of assets"
             class="bg-white rounded-xl border shadow-sm p-5">

          <div class="flex items-start justify-between mb-3">
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <mat-icon class="text-blue-600" style="font-size:1.25rem;width:1.25rem;height:1.25rem;line-height:1.25rem;">
                {{ categoryIcon(asset.category) }}
              </mat-icon>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold" [ngClass]="statusClass(asset.status)">
              {{ asset.status }}
            </span>
          </div>

          <h3 class="font-semibold text-gray-900 text-base">{{ asset.assetName }}</h3>
          <p class="text-xs font-mono text-gray-500 mt-0.5">{{ asset.assetCode }}</p>
          <p class="text-sm text-gray-600 mt-1">{{ asset.category }}</p>

          <div class="mt-4 pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-500">
            <div *ngIf="asset.assignedDate" class="flex items-center gap-1.5">
              <mat-icon style="font-size:0.875rem;width:0.875rem;height:0.875rem;line-height:0.875rem;">calendar_today</mat-icon>
              Assigned: {{ asset.assignedDate | date:'MMM d, y' }}
            </div>
          </div>

        </div>
      </div>

    </div>
  `,
})
export class MyAssetsComponent implements OnInit {
  assets: AssetDto[] = [];
  loading = false;

  constructor(
    private assetService: AssetService,
    private employeeService: EmployeeService,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.employeeService.getMyProfile().subscribe({
      next: profile => {
        this.assetService.getEmployeeAssets(profile.id).subscribe({
          next: data => { this.assets = data; this.loading = false; this.cdr.detectChanges(); },
          error: () => { this.loading = false; this.cdr.detectChanges(); },
        });
      },
      error: () => {
        this.snack.open('Failed to load profile', 'Close', { duration: 3000 });
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  categoryIcon(category: string): string {
    const map: Record<string, string> = {
      Laptop: 'laptop', Desktop: 'computer', Monitor: 'monitor',
      Phone: 'phone_android', Tablet: 'tablet', Printer: 'print',
      Keyboard: 'keyboard', Mouse: 'mouse', Headset: 'headset',
      Chair: 'chair', Desk: 'desk',
    };
    return map[category] ?? 'inventory';
  }

  statusClass(status: string): string {
    return ({
      Available: 'bg-green-100 text-green-800',
      Assigned:  'bg-blue-100 text-blue-800',
    } as any)[status] ?? 'bg-gray-100 text-gray-600';
  }
}
