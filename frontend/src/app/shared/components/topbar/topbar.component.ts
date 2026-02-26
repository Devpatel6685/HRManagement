import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../models/auth.model';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

interface Breadcrumb {
  label: string;
  url: string;
  isLast: boolean;
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard:    'Dashboard',
  employees:    'Employees',
  departments:  'Departments',
  attendance:   'Attendance',
  leave:        'Leave Management',
  payroll:      'Payroll',
  recruitment:  'Recruitment',
  performance:  'Performance',
  training:     'Training',
  assets:       'Assets',
  documents:    'Documents',
  add:          'Add Employee',
  edit:         'Edit Employee',
  forbidden:    'Forbidden',
};

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
  ],
  template: `
    <mat-toolbar class="bg-white shadow-md border-b border-gray-200">
      <div class="flex items-center justify-between w-full">

        <!-- Left side — Breadcrumbs -->
        <nav class="flex items-center gap-1 flex-1 min-w-0">
          <ng-container *ngFor="let crumb of breadcrumbs">
            <!-- Separator (before every item except first) -->
            <mat-icon *ngIf="!crumb.isLast || breadcrumbs.length > 1"
                      class="text-gray-400 shrink-0"
                      style="font-size:1rem;width:1rem;height:1rem;line-height:1rem;">
              {{ crumb === breadcrumbs[0] ? 'home' : 'chevron_right' }}
            </mat-icon>

            <!-- Clickable crumb -->
            <a *ngIf="!crumb.isLast"
               [routerLink]="crumb.url"
               class="text-sm text-indigo-600 hover:text-indigo-800 font-medium truncate transition-colors">
              {{ crumb.label }}
            </a>

            <!-- Current (last) crumb — not clickable -->
            <span *ngIf="crumb.isLast"
                  class="text-sm font-semibold text-gray-800 truncate">
              {{ crumb.label }}
            </span>
          </ng-container>
        </nav>

        <!-- Right side — User menu -->
        <div class="flex items-center gap-4 shrink-0">
          <!-- Notifications -->
          <button mat-icon-button>
            <mat-icon [matBadge]="3" matBadgeColor="warn">notifications</mat-icon>
          </button>

          <!-- User trigger -->
          <div [matMenuTriggerFor]="userMenu"
               class="flex items-center gap-2 cursor-pointer rounded-xl px-2 py-1 hover:bg-gray-100 transition-colors select-none">
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600
                        flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
              {{ getUserInitials() }}
            </div>
            <div class="text-left hidden md:block">
              <div class="text-sm font-medium text-gray-800 leading-tight">{{ (currentUser$ | async)?.name }}</div>
              <div class="text-xs text-gray-500 leading-tight">{{ (currentUser$ | async)?.role }}</div>
            </div>
            <mat-icon class="text-gray-400 shrink-0">arrow_drop_down</mat-icon>
          </div>

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
    </mat-toolbar>
  `,
  styles: [`:host { display: block; }`],
})
export class TopbarComponent implements OnInit, OnDestroy {
  currentUser$!: Observable<User | null>;
  breadcrumbs: Breadcrumb[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;

    this.buildBreadcrumbs(this.router.url);

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.destroy$),
    ).subscribe((e: any) => this.buildBreadcrumbs(e.urlAfterRedirects));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getUserInitials(): string {
    const user = this.authService.getCurrentUser();
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    return names.length >= 2
      ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
      : user.name.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }

  private buildBreadcrumbs(url: string): void {
    const segments = url.split('?')[0].split('/').filter(s => s.length > 0);

    if (!segments.length) {
      this.breadcrumbs = [{ label: 'Dashboard', url: '/dashboard', isLast: true }];
      return;
    }

    const crumbs: Breadcrumb[] = [];
    let accumulated = '';

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      accumulated += '/' + seg;

      const label = ROUTE_LABELS[seg] ?? this.toTitleCase(seg);
      const isUuid = /^[0-9a-f-]{36}$/i.test(seg);
      if (isUuid) continue;

      crumbs.push({ label, url: accumulated, isLast: i === segments.length - 1 });
    }

    // Mark last non-uuid segment as last
    if (crumbs.length) crumbs[crumbs.length - 1].isLast = true;

    this.breadcrumbs = crumbs;
  }

  private toTitleCase(str: string): string {
    return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
