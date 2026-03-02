import { Routes } from '@angular/router';

export const recruitmentRoutes: Routes = [
  {
    path: '',
    redirectTo: 'jobs',
    pathMatch: 'full',
  },
  {
    path: 'jobs',
    loadComponent: () =>
      import('./jobs/job-list.component').then(m => m.JobListComponent),
  },
  {
    path: 'pipeline/:jobId',
    loadComponent: () =>
      import('./applicant-pipeline/kanban.component').then(m => m.KanbanComponent),
  },
];
