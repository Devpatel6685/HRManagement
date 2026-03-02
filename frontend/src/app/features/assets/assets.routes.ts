import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const assetsRoutes: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { roles: ['Admin', 'HR'] },
    loadComponent: () =>
      import('./asset-list/asset-list.component').then(m => m.AssetListComponent),
  },
  {
    path: 'my',
    loadComponent: () =>
      import('./assign-return/my-assets.component').then(m => m.MyAssetsComponent),
  },
];
