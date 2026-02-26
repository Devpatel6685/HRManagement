import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center px-4">
        <mat-icon class="text-red-400 mb-4" style="font-size: 5rem; width: 5rem; height: 5rem;">lock</mat-icon>
        <h1 class="text-6xl font-bold text-gray-800 mb-2">403</h1>
        <h2 class="text-2xl font-semibold text-gray-600 mb-4">Access Forbidden</h2>
        <p class="text-gray-500 mb-8 max-w-sm mx-auto">
          You don't have permission to view this page. Contact your administrator if you believe this is a mistake.
        </p>
        <button mat-raised-button color="primary" routerLink="/dashboard">
          <mat-icon>home</mat-icon>
          Back to Dashboard
        </button>
      </div>
    </div>
  `,
})
export class ForbiddenComponent {}
