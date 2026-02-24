import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: '<div><h1 class="text-3xl font-bold mb-6">Training</h1><mat-card class="p-6"><p>Training module - Coming soon!</p></mat-card></div>'
})
export class TrainingComponent {}

export const trainingRoutes: Routes = [
  { path: '', component: TrainingComponent }
];
