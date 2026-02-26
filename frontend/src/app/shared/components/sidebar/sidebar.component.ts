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
  <div class="h-full flex flex-col bg-gray-900 text-gray-200">
    
    <!-- Logo -->
    <a routerLink="/dashboard" class="p-5 flex items-center justify-center border-b border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer no-underline">
      <h1 class="text-xl font-semibold text-white tracking-wide">
        HR Management
      </h1>
    </a>

    <!-- Navigation -->
    <nav class="sidebar-nav flex-1 overflow-y-auto py-4">
      <mat-nav-list>
        <a
          mat-list-item
          *ngFor="let item of menuItems"
          [routerLink]="item.route"
          routerLinkActive="active-link"
          class="menu-item"
        >
          <mat-icon matListItemIcon class="menu-icon">
            {{ item.icon }}
          </mat-icon>
          <span matListItemTitle>
            {{ item.label }}
          </span>
        </a>
      </mat-nav-list>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
      © 2026 HR System
    </div>
  </div>
`,
styles: [`
  /* Default text - soft gray */
  ::ng-deep .mat-mdc-list-item,
  ::ng-deep .mat-mdc-list-item .mdc-list-item__primary-text,
  ::ng-deep .mat-mdc-list-item .menu-text {
    color: #d1d5db !important; /* gray-300 */
  }

  /* Default icon */
  ::ng-deep .mat-mdc-list-item .mat-icon {
    color: #9ca3af !important; /* gray-400 */
  }

  /* Hover */
  ::ng-deep .mat-mdc-list-item:hover {
    background-color: #1f2937 !important; /* gray-800 */
    color: #e5e7eb !important; /* gray-200 */
  }

  ::ng-deep .mat-mdc-list-item:hover .mat-icon {
    color: #e5e7eb !important;
  }

  /* Active link */
  ::ng-deep .mat-mdc-list-item.active-link,
  ::ng-deep .mat-mdc-list-item.mdc-list-item--activated {
    background-color: #374151 !important; /* gray-700 */
    color: #f3f4f6 !important; /* gray-100 */
  }

  ::ng-deep .mat-mdc-list-item.active-link .mat-icon {
    color: #f3f4f6 !important;
  }

  /* Scrollbar — match sidebar bg-gray-900 */
  .sidebar-nav {
    scrollbar-width: thin;
    scrollbar-color: #374151 #111827;
  }

  .sidebar-nav::-webkit-scrollbar {
    width: 4px;
  }

  .sidebar-nav::-webkit-scrollbar-track {
    background: #111827;
  }

  .sidebar-nav::-webkit-scrollbar-thumb {
    background: #374151;
    border-radius: 4px;
  }

  .sidebar-nav::-webkit-scrollbar-thumb:hover {
    background: #4b5563;
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
