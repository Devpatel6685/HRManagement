import { Routes } from '@angular/router';

export const employeesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/employee-list.component').then(m => m.EmployeeListComponent)
  },
  {
    path: 'add',
    loadComponent: () => import('./add-edit/employee-add-edit.component').then(m => m.EmployeeAddEditComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./add-edit/employee-add-edit.component').then(m => m.EmployeeAddEditComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./detail/employee-detail.component').then(m => m.EmployeeDetailComponent)
  }
];
