import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

interface SectionHeader {
  header: string;
}

type SidebarEntry = MenuItem | SectionHeader;

function isHeader(entry: SidebarEntry): entry is SectionHeader {
  return 'header' in entry;
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
        <ng-container *ngFor="let entry of entries">

          <!-- Section label -->
          <div *ngIf="isHeader(entry)"
               class="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-widest text-gray-500">
            {{ entry.header }}
          </div>

          <!-- Menu item -->
          <a *ngIf="!isHeader(entry) && isVisible(entry)"
             mat-list-item
             [routerLink]="entry.route"
             routerLinkActive="active-link"
             class="menu-item">
            <mat-icon matListItemIcon class="menu-icon">{{ entry.icon }}</mat-icon>
            <span matListItemTitle>{{ entry.label }}</span>
          </a>

        </ng-container>
      </mat-nav-list>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
      © 2026 HR System
    </div>
  </div>
`,
  styles: [`
  ::ng-deep .mat-mdc-list-item,
  ::ng-deep .mat-mdc-list-item .mdc-list-item__primary-text {
    color: #d1d5db !important;
  }
  ::ng-deep .mat-mdc-list-item .mat-icon {
    color: #9ca3af !important;
  }
  ::ng-deep .mat-mdc-list-item:hover {
    background-color: #1f2937 !important;
    color: #e5e7eb !important;
  }
  ::ng-deep .mat-mdc-list-item:hover .mat-icon {
    color: #e5e7eb !important;
  }
  ::ng-deep .mat-mdc-list-item.active-link,
  ::ng-deep .mat-mdc-list-item.mdc-list-item--activated {
    background-color: #374151 !important;
    color: #f3f4f6 !important;
  }
  ::ng-deep .mat-mdc-list-item.active-link .mat-icon {
    color: #f3f4f6 !important;
  }
  .sidebar-nav {
    scrollbar-width: thin;
    scrollbar-color: #374151 #111827;
  }
  .sidebar-nav::-webkit-scrollbar { width: 4px; }
  .sidebar-nav::-webkit-scrollbar-track { background: #111827; }
  .sidebar-nav::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
  .sidebar-nav::-webkit-scrollbar-thumb:hover { background: #4b5563; }
`]
})
export class SidebarComponent implements OnInit {

  readonly isHeader = isHeader;

  entries: SidebarEntry[] = [
    { label: 'Dashboard',         icon: 'dashboard',    route: '/dashboard' },
    { label: 'Employees',         icon: 'people',       route: '/employees',               roles: ['Admin', 'HR', 'Manager'] },
    { label: 'Departments',       icon: 'business',     route: '/departments',             roles: ['Admin', 'HR'] },

    { label: 'My Attendance',     icon: 'access_time',  route: '/attendance' },
    { label: 'Team Attendance',   icon: 'groups',       route: '/attendance/team-summary', roles: ['Admin', 'HR', 'Manager'] },
    { label: 'Attendance Report', icon: 'assessment',   route: '/attendance/monthly-report' },

    { label: 'Leave',             icon: 'event_busy',   route: '/leave' },
    { label: 'Leave Approvals',   icon: 'approval',     route: '/leave/approvals',         roles: ['Admin', 'HR', 'Manager'] },
    { label: 'Payroll',           icon: 'payments',     route: '/payroll' },
    { label: 'Recruitment',       icon: 'work',         route: '/recruitment' },
    { label: 'Performance',       icon: 'trending_up',  route: '/performance' },
    { label: 'Training',          icon: 'school',       route: '/training' },
    { label: 'Assets',            icon: 'inventory',    route: '/assets',                  roles: ['Admin', 'HR'] },
    { label: 'My Assets',         icon: 'inventory',    route: '/assets/my',               roles: ['Manager', 'Employee'] },
    { label: 'Documents',         icon: 'folder',       route: '/documents' },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {}

  isVisible(entry: SidebarEntry): boolean {
    if (isHeader(entry)) return true;
    const item = entry as MenuItem;
    if (!item.roles || item.roles.length === 0) return true;
    return this.authService.hasAnyRole(item.roles);
  }
}
