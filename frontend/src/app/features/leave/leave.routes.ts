import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const leaveRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./apply/leave-request.component').then(
        m => m.LeaveRequestComponent
      ),
  },
  {
    path: 'approvals',
    loadComponent: () =>
      import('./approvals/leave-approval.component').then(
        m => m.LeaveApprovalComponent
      ),
    canActivate: [roleGuard],
    data: { roles: ['Admin', 'HR', 'Manager'] },
  },
];
