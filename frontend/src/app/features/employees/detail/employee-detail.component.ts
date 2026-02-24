import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div>
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Employee Details</h1>
      <mat-card class="p-6">
        <p class="text-gray-600">Employee detail component - Coming soon!</p>
      </mat-card>
    </div>
  `
})
export class EmployeeDetailComponent {}
