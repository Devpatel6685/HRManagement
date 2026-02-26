import { Routes } from '@angular/router';

export const departmentsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/department-list.component').then(m => m.DepartmentListComponent),
  },
];
