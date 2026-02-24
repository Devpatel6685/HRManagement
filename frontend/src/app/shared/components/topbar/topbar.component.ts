import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../models/auth.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="bg-white shadow-md border-b border-gray-200">
      <div class="flex items-center justify-between w-full">
        <!-- Left side - could add breadcrumbs or search here -->
        <div class="flex-1">
          <span class="text-gray-600 text-sm">Welcome back!</span>
        </div>

        <!-- Right side - User menu -->
        <div class="flex items-center gap-4">
          <!-- Notifications -->
          <button mat-icon-button>
            <mat-icon [matBadge]="3" matBadgeColor="warn">notifications</mat-icon>
          </button>

          <!-- User Menu -->
          <div class="flex items-center gap-2">
            <button mat-button [matMenuTriggerFor]="userMenu" class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                {{ getUserInitials() }}
              </div>
              <div class="text-left hidden md:block">
                <div class="text-sm font-medium">{{ (currentUser$ | async)?.name }}</div>
                <div class="text-xs text-gray-500">{{ (currentUser$ | async)?.role }}</div>
              </div>
              <mat-icon>arrow_drop_down</mat-icon>
            </button>

            <mat-menu #userMenu="matMenu">
              <button mat-menu-item>
                <mat-icon>person</mat-icon>
                <span>Profile</span>
              </button>
              <button mat-menu-item>
                <mat-icon>settings</mat-icon>
                <span>Settings</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          </div>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class TopbarComponent implements OnInit {
  currentUser$!: Observable<User | null>;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
  }

  getUserInitials(): string {
    const user = this.authService.getCurrentUser();
    if (!user?.name) return 'U';

    const names = user.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
