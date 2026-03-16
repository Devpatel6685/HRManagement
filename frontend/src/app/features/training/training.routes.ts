import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const trainingRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/training-list.component').then(m => m.TrainingListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./form/training-form.component').then(m => m.TrainingFormComponent),
    canActivate: [roleGuard],
    data: { roles: ['Admin', 'HR'] },
  },
  {
    path: 'mine',
    loadComponent: () =>
      import('./my-trainings/my-trainings.component').then(m => m.MyTrainingsComponent),
  },
];
