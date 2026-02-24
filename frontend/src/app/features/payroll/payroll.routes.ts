import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: '<div><h1 class="text-3xl font-bold mb-6">Payroll</h1><mat-card class="p-6"><p>Payroll module - Coming soon!</p></mat-card></div>'
})
export class PayrollComponent {}

export const payrollRoutes: Routes = [
  { path: '', component: PayrollComponent }
];
