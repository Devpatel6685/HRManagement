import { Routes } from '@angular/router';

export const payrollRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./payroll.component').then(m => m.PayrollComponent),
  },
];
