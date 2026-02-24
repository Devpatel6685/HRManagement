import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';

export const routes: Routes = [
  // Public routes (no auth required)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  // Protected routes (auth required)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes)
      },
      {
        path: 'employees',
        loadChildren: () => import('./features/employees/employees.routes').then(m => m.employeesRoutes)
      },
      {
        path: 'departments',
        loadChildren: () => import('./features/departments/departments.routes').then(m => m.departmentsRoutes)
      },
      {
        path: 'attendance',
        loadChildren: () => import('./features/attendance/attendance.routes').then(m => m.attendanceRoutes)
      },
      {
        path: 'leave',
        loadChildren: () => import('./features/leave/leave.routes').then(m => m.leaveRoutes)
      },
      {
        path: 'payroll',
        loadChildren: () => import('./features/payroll/payroll.routes').then(m => m.payrollRoutes)
      },
      {
        path: 'recruitment',
        loadChildren: () => import('./features/recruitment/recruitment.routes').then(m => m.recruitmentRoutes)
      },
      {
        path: 'performance',
        loadChildren: () => import('./features/performance/performance.routes').then(m => m.performanceRoutes)
      },
      {
        path: 'training',
        loadChildren: () => import('./features/training/training.routes').then(m => m.trainingRoutes)
      },
      {
        path: 'assets',
        loadChildren: () => import('./features/assets/assets.routes').then(m => m.assetsRoutes)
      },
      {
        path: 'documents',
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
