import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <mat-card class="max-w-md w-full p-8">
        <h1 class="text-2xl font-bold mb-4">Forgot Password</h1>
        <p>Password recovery component - Coming soon!</p>
      </mat-card>
    </div>
  `
})
export class ForgotPasswordComponent {}
