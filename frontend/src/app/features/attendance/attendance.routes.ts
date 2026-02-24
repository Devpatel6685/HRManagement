import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: '<div><h1 class="text-3xl font-bold mb-6">Attendance</h1><mat-card class="p-6"><p>Attendance module - Coming soon!</p></mat-card></div>'
})
export class AttendanceComponent {}

export const attendanceRoutes: Routes = [
  { path: '', component: AttendanceComponent }
];
