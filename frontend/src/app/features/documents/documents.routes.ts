import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: '<div><h1 class="text-3xl font-bold mb-6">Documents</h1><mat-card class="p-6"><p>Documents module - Coming soon!</p></mat-card></div>'
})
export class DocumentsComponent {}

export const documentsRoutes: Routes = [
  { path: '', component: DocumentsComponent }
];
