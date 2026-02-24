import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: '<div><h1 class="text-3xl font-bold mb-6">Assets</h1><mat-card class="p-6"><p>Assets module - Coming soon!</p></mat-card></div>'
})
export class AssetsComponent {}

export const assetsRoutes: Routes = [
  { path: '', component: AssetsComponent }
];
