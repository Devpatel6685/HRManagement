import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, RouterModule],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Employees</h1>
        <button mat-raised-button color="primary" routerLink="/employees/add">Add Employee</button>
      </div>
      <mat-card class="p-6">
        <p class="text-gray-600">Employee list component - Coming soon!</p>
      </mat-card>
    </div>
  `
})
export class EmployeeListComponent {}
