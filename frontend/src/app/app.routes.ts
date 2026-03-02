import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';

export const routes: Routes = [
  // Public routes (no auth required)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  // 403 Forbidden page (outside layout so it's always accessible after auth)
  {
    path: 'forbidden',
    canActivate: [authGuard],
    loadComponent: () => import('./features/forbidden/forbidden.component').then(m => m.ForbiddenComponent)
  },

  // Protected routes (auth required)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'HR', 'Manager', 'Employee'] },
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes)
      },
      {
        path: 'employees',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'HR', 'Manager'] },
        loadChildren: () => import('./features/employees/employees.routes').then(m => m.employeesRoutes)
      },
      {
        path: 'departments',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'HR'] },
        loadChildren: () => import('./features/departments/departments.routes').then(m => m.departmentsRoutes)
      },
      {
        path: 'attendance',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'HR', 'Manager', 'Employee'] },
        loadChildren: () => import('./features/attendance/attendance.routes').then(m => m.attendanceRoutes)
      },
      {
        path: 'leave',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'HR', 'Manager', 'Employee'] },
        loadChildren: () => import('./features/leave/leave.routes').then(m => m.leaveRoutes)
      },
      {
        path: 'payroll',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'HR'] },
        loadChildren: () => import('./features/payroll/payroll.routes').then(m => m.payrollRoutes)
      },
      {
        path: 'recruitment',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'HR'] },
        loadChildren: () => import('./features/recruitment/recruitment.routes').then(m => m.recruitmentRoutes)
      },
      {
        path: 'performance',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'HR', 'Manager', 'Employee'] },
        loadChildren: () => import('./features/performance/performance.routes').then(m => m.performanceRoutes)
      },
      {
        path: 'training',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'HR', 'Manager', 'Employee'] },
        loadChildren: () => import('./features/training/training.routes').then(m => m.trainingRoutes)
      },
      {
        path: 'assets',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'HR', 'Manager', 'Employee'] },
        loadChildren: () => import('./features/assets/assets.routes').then(m => m.assetsRoutes)
      },
      {
        path: 'documents',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'HR', 'Manager', 'Employee'] },
        loadChildren: () => import('./features/documents/documents.routes').then(m => m.documentsRoutes)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Fallback route
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
