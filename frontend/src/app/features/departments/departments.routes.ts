import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: '<div><h1 class="text-3xl font-bold mb-6">Departments</h1><mat-card class="p-6"><p>Departments module - Coming soon!</p></mat-card></div>'
})
export class DepartmentsComponent {}

export const departmentsRoutes: Routes = [
  { path: '', component: DepartmentsComponent }
];
