import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="h-full flex flex-col bg-gray-900 text-white">
      <!-- Logo -->
      <div class="p-4 flex items-center justify-center border-b border-gray-700">
        <h1 class="text-xl font-bold">HR Management</h1>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-4">
        <mat-nav-list>
          <a
            mat-list-item
            *ngFor="let item of menuItems"
            [routerLink]="item.route"
            routerLinkActive="bg-gray-700"
            class="text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <mat-icon matListItemIcon class="text-gray-400">{{ item.icon }}</mat-icon>
            <span matListItemTitle>{{ item.label }}</span>
          </a>
        </mat-nav-list>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-700 text-xs text-gray-400">
        <p>&copy; 2026 HR System</p>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .mat-mdc-list-item {
      color: inherit !important;
    }

    ::ng-deep .mat-mdc-list-item.mdc-list-item--activated {
      background-color: rgb(55 65 81) !important;
      color: white !important;
    }
  `]
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Employees', icon: 'people', route: '/employees' },
    { label: 'Departments', icon: 'business', route: '/departments' },
    { label: 'Attendance', icon: 'access_time', route: '/attendance' },
    { label: 'Leave Management', icon: 'event_busy', route: '/leave' },
    { label: 'Payroll', icon: 'payments', route: '/payroll' },
    { label: 'Recruitment', icon: 'work', route: '/recruitment' },
    { label: 'Performance', icon: 'trending_up', route: '/performance' },
    { label: 'Training', icon: 'school', route: '/training' },
    { label: 'Assets', icon: 'inventory', route: '/assets' },
    { label: 'Documents', icon: 'folder', route: '/documents' }
  ];
}
