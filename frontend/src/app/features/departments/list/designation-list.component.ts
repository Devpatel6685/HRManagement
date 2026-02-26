import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DepartmentService } from '../../../core/services/department.service';
import { AuthService } from '../../../core/services/auth.service';
import { Department, DesignationListItem } from '../../../models/department.model';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  DesignationFormDialogComponent,
  DesignationFormDialogData,
} from './designation-form-dialog.component';

interface GroupHeader {
  isGroup: true;
  departmentName: string;
  count: number;
}

type DesignRow = GroupHeader | DesignationListItem;

@Component({
  selector: 'app-designation-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  template: `
    <mat-card>
      <!-- Toolbar -->
      <mat-card-content class="p-4">
        <div class="flex flex-wrap items-end gap-4 mb-4">
          <div class="flex-1 min-w-44">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Filter by Department</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <mat-icon class="field-icon">business</mat-icon>
              </span>
              <select [formControl]="deptCtrl" class="field-input">
                <option value="">All Departments</option>
                <option *ngFor="let d of departments" [value]="d.id">{{ d.name }}</option>
              </select>
            </div>
          </div>
          <button *ngIf="canEdit" mat-raised-button color="primary" (click)="openAdd()">
            <mat-icon>add</mat-icon>Add Designation
          </button>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="flex justify-center py-10">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <!-- Table -->
        <div *ngIf="!loading" class="overflow-x-auto">
          <table mat-table [dataSource]="flatRows" class="w-full">

            <!-- Group header row -->
            <ng-container matColumnDef="groupHeader">
              <td mat-cell *matCellDef="let row" [attr.colspan]="columns.length">
                <div class="flex items-center gap-2 py-2 px-1">
                  <mat-icon class="text-gray-500" style="font-size:1rem;width:1rem;height:1rem;">business</mat-icon>
                  <span class="font-semibold text-gray-800 text-sm">{{ asGroup(row).departmentName }}</span>
                  <span class="ml-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
                    {{ asGroup(row).count }}
                  </span>
                </div>
              </td>
            </ng-container>

            <!-- Title -->
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let row">
                <span class="font-medium text-gray-900 text-sm">{{ asDesig(row).title }}</span>
              </td>
            </ng-container>

            <!-- Level -->
            <ng-container matColumnDef="level">
              <th mat-header-cell *matHeaderCellDef>Level</th>
              <td mat-cell *matCellDef="let row">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                      [ngClass]="getLevelClass(asDesig(row).level)">
                  {{ asDesig(row).levelLabel }}
                </span>
              </td>
            </ng-container>

            <!-- Employee Count -->
            <ng-container matColumnDef="employeeCount">
              <th mat-header-cell *matHeaderCellDef>Employees</th>
              <td mat-cell *matCellDef="let row">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                  <mat-icon style="font-size:0.75rem;width:0.75rem;height:0.75rem;">people</mat-icon>
                  {{ asDesig(row).employeeCount }}
                </span>
              </td>
            </ng-container>

            <!-- Actions -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="text-right pr-4">Actions</th>
              <td mat-cell *matCellDef="let row" class="text-right">
                <button *ngIf="canEdit" mat-icon-button (click)="openEdit(asDesig(row))" matTooltip="Edit">
                  <mat-icon class="text-blue-500">edit</mat-icon>
                </button>
                <button *ngIf="canDelete" mat-icon-button (click)="confirmDelete(asDesig(row))" matTooltip="Delete">
                  <mat-icon class="text-red-500">delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: ['groupHeader']; when: isGroupRow"
                class="bg-gray-50 border-t border-b border-gray-200"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"
                class="hover:bg-gray-50 transition-colors"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" [attr.colspan]="columns.length">
                <div class="flex flex-col items-center py-12 text-gray-400">
                  <mat-icon style="font-size:3rem;width:3rem;height:3rem;" class="mb-3">badge</mat-icon>
                  <p class="font-medium">No designations found</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </mat-card-content>
    </mat-card>
  `,
})
export class DesignationListComponent implements OnInit {
  readonly columns = ['title', 'level', 'employeeCount', 'actions'];

  flatRows: DesignRow[] = [];
  departments: Department[] = [];
  loading = false;
  canEdit   = false;
  canDelete = false;

  deptCtrl = new FormControl('');

  constructor(
    private deptService: DepartmentService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.canEdit   = this.authService.hasAnyRole(['Admin', 'HR']);
    this.canDelete = this.authService.hasRole('Admin');

    this.deptService.getAll().subscribe({ next: d => this.departments = d });

    this.deptCtrl.valueChanges.subscribe(() => this.loadDesignations());

    this.loadDesignations();
  }

  isGroupRow = (_: number, row: DesignRow): boolean => 'isGroup' in row;

  asGroup(row: DesignRow): GroupHeader {
    return row as GroupHeader;
  }

  asDesig(row: DesignRow): DesignationListItem {
    return row as DesignationListItem;
  }

  getLevelClass(level: number): Record<string, boolean> {
    return {
      'bg-blue-100 text-blue-800':   level === 1,
      'bg-green-100 text-green-800': level === 2,
      'bg-yellow-100 text-yellow-800': level === 3,
      'bg-orange-100 text-orange-800': level === 4,
      'bg-purple-100 text-purple-800': level === 5,
    };
  }

  openAdd(): void {
    const ref = this.dialog.open(DesignationFormDialogComponent, {
      data: {
        designation: null,
        preselectedDepartmentId: this.deptCtrl.value || undefined,
      } as DesignationFormDialogData,
    });
    ref.afterClosed().subscribe(result => { if (result) this.loadDesignations(); });
  }

  openEdit(desig: DesignationListItem): void {
    const ref = this.dialog.open(DesignationFormDialogComponent, {
      data: { designation: desig } as DesignationFormDialogData,
    });
    ref.afterClosed().subscribe(result => { if (result) this.loadDesignations(); });
  }

  confirmDelete(desig: DesignationListItem): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Designation',
        message: `Delete '${desig.title}'? This cannot be undone.`,
        icon: 'badge',
        confirmLabel: 'Delete',
        confirmColor: 'warn',
      } as ConfirmDialogData,
    });
    ref.afterClosed().subscribe((ok: boolean) => { if (ok) this.deleteDesignation(desig); });
  }

  private loadDesignations(): void {
    this.loading = true;
    const deptId = this.deptCtrl.value || undefined;
    this.deptService.getAllDesignations(deptId).subscribe({
      next: items => {
        this.flatRows = this.buildFlatRows(items);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  private buildFlatRows(items: DesignationListItem[]): DesignRow[] {
    const grouped = new Map<string, DesignationListItem[]>();
    for (const item of items) {
      const existing = grouped.get(item.departmentId) ?? [];
      existing.push(item);
      grouped.set(item.departmentId, existing);
    }

    const result: DesignRow[] = [];
    for (const [, group] of grouped) {
      result.push({
        isGroup: true,
        departmentName: group[0].departmentName,
        count: group.length,
      });
      result.push(...group);
    }
    return result;
  }

  private deleteDesignation(desig: DesignationListItem): void {
    this.deptService.deleteDesignation(desig.id).subscribe({
      next: () => {
        this.snackBar.open(`'${desig.title}' deleted.`, 'OK', { duration: 3000 });
        this.loadDesignations();
      },
      error: err => {
        const msg = err?.error?.error || 'Failed to delete designation.';
        this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: ['snack-error'] });
      },
    });
  }
}
