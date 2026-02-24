import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-employee-add-edit',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div>
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Add/Edit Employee</h1>
      <mat-card class="p-6">
        <p class="text-gray-600">Employee add/edit component - Coming soon!</p>
      </mat-card>
    </div>
  `
})
export class EmployeeAddEditComponent {}
