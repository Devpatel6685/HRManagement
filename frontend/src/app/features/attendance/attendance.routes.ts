import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const attendanceRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./calendar/attendance-calendar.component').then(
        m => m.AttendanceCalendarComponent
      ),
  },
  {
    path: 'team-summary',
    loadComponent: () =>
      import('./team-summary/attendance-team-summary.component').then(
        m => m.AttendanceTeamSummaryComponent
      ),
    canActivate: [roleGuard],
    data: { roles: ['Admin', 'HR', 'Manager'] },
  },
  {
    path: 'monthly-report',
    loadComponent: () =>
      import('./monthly-report/attendance-monthly-report.component').then(
        m => m.AttendanceMonthlyReportComponent
      ),
  },
];
