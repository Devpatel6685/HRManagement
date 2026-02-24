import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: '<div><h1 class="text-3xl font-bold mb-6">Performance</h1><mat-card class="p-6"><p>Performance module - Coming soon!</p></mat-card></div>'
})
export class PerformanceComponent {}

export const performanceRoutes: Routes = [
  { path: '', component: PerformanceComponent }
];
