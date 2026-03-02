import { Routes } from '@angular/router';

export const performanceRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./reviews/review-history.component').then(m => m.ReviewHistoryComponent),
  },
  {
    path: 'review',
    loadComponent: () =>
      import('./reviews/review-form.component').then(m => m.ReviewFormComponent),
  },
];
