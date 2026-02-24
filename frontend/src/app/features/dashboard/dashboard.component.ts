import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="dashboard-container">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <!-- Stats Cards -->
        <mat-card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Total Employees</p>
              <p class="text-2xl font-bold text-gray-900">150</p>
            </div>
            <mat-icon class="text-blue-500 text-4xl">people</mat-icon>
          </div>
        </mat-card>

        <mat-card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Present Today</p>
              <p class="text-2xl font-bold text-gray-900">142</p>
            </div>
            <mat-icon class="text-green-500 text-4xl">check_circle</mat-icon>
          </div>
        </mat-card>

        <mat-card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">On Leave</p>
              <p class="text-2xl font-bold text-gray-900">8</p>
            </div>
            <mat-icon class="text-orange-500 text-4xl">event_busy</mat-icon>
          </div>
        </mat-card>

        <mat-card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Open Positions</p>
              <p class="text-2xl font-bold text-gray-900">5</p>
            </div>
            <mat-icon class="text-purple-500 text-4xl">work</mat-icon>
          </div>
        </mat-card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <mat-card class="p-6">
          <h2 class="text-xl font-semibold mb-4">Recent Activities</h2>
          <p class="text-gray-600">Activity feed coming soon...</p>
        </mat-card>

        <mat-card class="p-6">
          <h2 class="text-xl font-semibold mb-4">Pending Approvals</h2>
          <p class="text-gray-600">Approval list coming soon...</p>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class DashboardComponent {}
