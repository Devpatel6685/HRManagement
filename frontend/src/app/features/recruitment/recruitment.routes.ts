import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-recruitment',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: '<div><h1 class="text-3xl font-bold mb-6">Recruitment</h1><mat-card class="p-6"><p>Recruitment module - Coming soon!</p></mat-card></div>'
})
export class RecruitmentComponent {}

export const recruitmentRoutes: Routes = [
  { path: '', component: RecruitmentComponent }
];
