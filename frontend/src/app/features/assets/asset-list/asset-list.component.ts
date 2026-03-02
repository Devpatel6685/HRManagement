import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AssetService } from '../../../core/services/asset.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { AssetDto, CreateAssetDto, UpdateAssetDto } from '../../../models/asset.model';
import { EmployeeListItem } from '../../../models/employee.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
  template: `
    <div class="p-6">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Asset Management</h1>
          <p class="text-sm text-gray-500 mt-0.5">Track and manage company assets</p>
        </div>
        <button *ngIf="isAdminOrHR" mat-flat-button color="primary" (click)="openAssetForm()">
          <mat-icon class="mr-1">add</mat-icon> Add Asset
        </button>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div *ngFor="let s of stats" class="bg-white rounded-xl border p-4 flex items-center gap-3 shadow-sm">
          <div class="w-10 h-10 rounded-full flex items-center justify-center" [ngClass]="s.bg">
            <mat-icon [ngClass]="s.iconColor" style="font-size:1.25rem;width:1.25rem;height:1.25rem;line-height:1.25rem;">{{ s.icon }}</mat-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ s.count }}</p>
            <p class="text-xs text-gray-500">{{ s.label }}</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 mb-5">
        <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilter()" class="field-input w-40 text-sm py-1.5">
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Assigned">Assigned</option>
          <option value="UnderMaintenance">Under Maintenance</option>
          <option value="Retired">Retired</option>
        </select>
        <select [(ngModel)]="filterCategory" (ngModelChange)="applyFilter()" class="field-input w-44 text-sm py-1.5">
          <option value="">All Categories</option>
          <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
        </select>
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <mat-icon class="field-icon">search</mat-icon>
          </span>
          <input [(ngModel)]="searchTerm" (ngModelChange)="applyFilter()"
                 placeholder="Search assets…"
                 class="field-input w-56 text-sm py-1.5" />
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-16"><mat-spinner diameter="36"></mat-spinner></div>

      <!-- Empty -->
      <div *ngIf="!loading && filtered.length === 0" class="flex flex-col items-center py-16 text-gray-400">
        <mat-icon style="font-size:3.5rem;width:3.5rem;height:3.5rem;">inventory_2</mat-icon>
        <p class="mt-3 font-medium">No assets found</p>
        <button *ngIf="isAdminOrHR" mat-stroked-button color="primary" class="mt-4" (click)="openAssetForm()">Add First Asset</button>
      </div>

      <!-- Asset Cards -->
      <div *ngIf="!loading && filtered.length > 0"
           class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div *ngFor="let asset of filtered"
             class="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-3">

          <!-- Top row -->
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-900 truncate">{{ asset.assetName }}</p>
              <p class="text-xs text-gray-500 font-mono mt-0.5">{{ asset.assetCode }}</p>
            </div>
            <span class="ml-2 shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold" [ngClass]="statusClass(asset.status)">
              {{ statusLabel(asset.status) }}
            </span>
          </div>

          <!-- Category -->
          <div class="flex items-center gap-1.5 text-sm text-gray-600">
            <mat-icon style="font-size:1rem;width:1rem;height:1rem;line-height:1rem;" class="text-gray-400">category</mat-icon>
            {{ asset.category }}
          </div>

          <!-- Assigned info -->
          <div *ngIf="asset.status === 'Assigned'" class="bg-blue-50 rounded-lg p-2.5 text-xs text-blue-800">
            <div class="flex items-center gap-1 font-medium">
              <mat-icon style="font-size:0.9rem;width:0.9rem;height:0.9rem;line-height:0.9rem;">person</mat-icon>
              {{ asset.assignedToEmployeeName }}
            </div>
            <p class="text-blue-600 mt-0.5">Since {{ asset.assignedDate | date:'MMM d, y' }}</p>
          </div>

          <div *ngIf="asset.returnDate" class="text-xs text-gray-400">
            Returned: {{ asset.returnDate | date:'MMM d, y' }}
          </div>

          <!-- Actions -->
          <div *ngIf="isAdminOrHR" class="flex flex-wrap gap-2 pt-1 border-t border-gray-100 mt-auto">

            <!-- Available → Assign or Send to Maintenance or Retire -->
            <ng-container *ngIf="asset.status === 'Available'">
              <button mat-stroked-button class="flex-1 text-xs py-1" (click)="openAssign(asset)">
                <mat-icon class="text-[14px]">person_add</mat-icon> Assign
              </button>
              <button mat-icon-button matTooltip="Send to Maintenance"
                      (click)="confirmChangeStatus(asset, 'UnderMaintenance')">
                <mat-icon class="text-yellow-500" style="font-size:1.1rem;width:1.1rem;height:1.1rem;line-height:1.1rem;">build</mat-icon>
              </button>
            </ng-container>

            <!-- Assigned → Return -->
            <button mat-stroked-button color="warn" class="flex-1 text-xs py-1"
                    *ngIf="asset.status === 'Assigned'"
                    (click)="confirmReturn(asset)">
              <mat-icon class="text-[14px]">assignment_return</mat-icon> Return
            </button>

            <!-- Under Maintenance → Mark Available or Retire -->
            <ng-container *ngIf="asset.status === 'UnderMaintenance'">
              <button mat-stroked-button color="primary" class="flex-1 text-xs py-1"
                      (click)="confirmChangeStatus(asset, 'Available')">
                <mat-icon class="text-[14px]">check_circle</mat-icon> Mark Available
              </button>
            </ng-container>

            <!-- Retired → Restore to Available -->
            <ng-container *ngIf="asset.status === 'Retired'">
              <button mat-stroked-button color="primary" class="flex-1 text-xs py-1"
                      (click)="confirmChangeStatus(asset, 'Available')">
                <mat-icon class="text-[14px]">restore</mat-icon> Restore
              </button>
            </ng-container>

            <!-- Always: Retire (from Available or Maintenance), Edit, Delete -->
            <button mat-icon-button
                    *ngIf="asset.status === 'Available' || asset.status === 'UnderMaintenance'"
                    matTooltip="Retire asset"
                    (click)="confirmChangeStatus(asset, 'Retired')">
              <mat-icon class="text-gray-400" style="font-size:1.1rem;width:1.1rem;height:1.1rem;line-height:1.1rem;">archive</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Edit" (click)="openAssetForm(asset)">
              <mat-icon class="text-gray-400" style="font-size:1.1rem;width:1.1rem;height:1.1rem;line-height:1.1rem;">edit</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Delete" (click)="confirmDelete(asset)">
              <mat-icon class="text-red-400" style="font-size:1.1rem;width:1.1rem;height:1.1rem;line-height:1.1rem;">delete</mat-icon>
            </button>
          </div>

        </div>
      </div>

    </div>

    <!-- ── Asset Form Modal ─────────────────────────────────────── -->
    <div *ngIf="showAssetForm"
         class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-5">
          {{ editingAsset ? 'Edit Asset' : 'Add Asset' }}
        </h2>
        <form [formGroup]="assetForm" (ngSubmit)="saveAsset()" class="space-y-4">

          <div *ngIf="!editingAsset">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Asset Code <span class="text-red-500">*</span></label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <mat-icon class="field-icon">qr_code</mat-icon>
              </span>
              <input formControlName="assetCode" placeholder="e.g. LAP-001"
                     class="field-input" [class.field-input--error]="f['assetCode']?.invalid && f['assetCode']?.touched" />
            </div>
            <p *ngIf="f['assetCode']?.invalid && f['assetCode']?.touched" class="mt-1 text-xs text-red-500">Asset code is required.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Asset Name <span class="text-red-500">*</span></label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <mat-icon class="field-icon">inventory</mat-icon>
              </span>
              <input formControlName="assetName" placeholder="e.g. Dell Laptop 15"
                     class="field-input" [class.field-input--error]="f['assetName'].invalid && f['assetName'].touched" />
            </div>
            <p *ngIf="f['assetName'].invalid && f['assetName'].touched" class="mt-1 text-xs text-red-500">Asset name is required.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Category <span class="text-red-500">*</span></label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <mat-icon class="field-icon">category</mat-icon>
              </span>
              <select formControlName="category" class="field-input" [class.field-input--error]="f['category'].invalid && f['category'].touched">
                <option value="">Select category…</option>
                <option *ngFor="let c of categoryOptions" [value]="c">{{ c }}</option>
              </select>
            </div>
            <p *ngIf="f['category'].invalid && f['category'].touched" class="mt-1 text-xs text-red-500">Category is required.</p>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" mat-stroked-button (click)="closeAssetForm()">Cancel</button>
            <button type="submit" mat-flat-button color="primary" [disabled]="saving">
              {{ editingAsset ? 'Save Changes' : 'Add Asset' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── Assign Modal ─────────────────────────────────────────── -->
    <div *ngIf="showAssignForm"
         class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-0.5">Assign Asset</h2>
        <p class="text-sm text-gray-500 mb-5">
          <span class="font-medium text-gray-700">{{ assigningAsset?.assetName }}</span>
          <span class="ml-1 font-mono text-xs text-gray-400">({{ assigningAsset?.assetCode }})</span>
        </p>

        <div class="space-y-4">
          <!-- Search box -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Search Employee <span class="text-red-500">*</span></label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <mat-icon class="field-icon">search</mat-icon>
              </span>
              <input [(ngModel)]="employeeSearch"
                     (ngModelChange)="onEmployeeSearch()"
                     placeholder="Type name to search…"
                     autocomplete="off"
                     class="field-input" />
              <button *ngIf="employeeSearch"
                      type="button"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center"
                      (click)="clearEmployeeSearch()">
                <mat-icon class="field-icon text-[1rem]">close</mat-icon>
              </button>
            </div>
          </div>

          <!-- Selected employee chip -->
          <div *ngIf="selectedEmployeeId" class="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
            <div class="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {{ getInitials(selectedEmployeeName) }}
            </div>
            <span class="text-sm font-medium text-blue-900 flex-1">{{ selectedEmployeeName }}</span>
            <button type="button" (click)="clearSelection()" class="text-blue-400 hover:text-blue-600">
              <mat-icon style="font-size:1rem;width:1rem;height:1rem;line-height:1rem;">close</mat-icon>
            </button>
          </div>

          <!-- Dropdown results -->
          <div *ngIf="filteredEmployees.length > 0 && !selectedEmployeeId"
               class="border border-gray-200 rounded-xl overflow-hidden shadow-sm max-h-48 overflow-y-auto">
            <button *ngFor="let e of filteredEmployees"
                    type="button"
                    class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors"
                    (click)="selectEmployee(e)">
              <div class="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                {{ getInitials(e.firstName + ' ' + e.lastName) }}
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ e.firstName }} {{ e.lastName }}</p>
                <p class="text-xs text-gray-400">{{ e.designationTitle || e.departmentName || e.employeeCode }}</p>
              </div>
            </button>
          </div>

          <!-- No results -->
          <p *ngIf="employeeSearch && filteredEmployees.length === 0 && !selectedEmployeeId"
             class="text-sm text-gray-400 text-center py-2">No employees found</p>

          <div class="flex justify-end gap-3 pt-2">
            <button mat-stroked-button (click)="closeAssign()">Cancel</button>
            <button mat-flat-button color="primary" [disabled]="!selectedEmployeeId || saving" (click)="doAssign()">
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AssetListComponent implements OnInit {
  assets:   AssetDto[]       = [];
  filtered: AssetDto[]       = [];
  employees: EmployeeListItem[] = [];

  filterStatus   = '';
  filterCategory = '';
  searchTerm     = '';
  loading        = false;
  saving         = false;

  showAssetForm  = false;
  editingAsset:  AssetDto | null = null;
  showAssignForm    = false;
  assigningAsset:   AssetDto | null = null;
  selectedEmployeeId   = '';
  selectedEmployeeName = '';
  employeeSearch       = '';
  filteredEmployees: EmployeeListItem[] = [];

  readonly categoryOptions = ['Laptop', 'Desktop', 'Monitor', 'Phone', 'Tablet', 'Printer', 'Keyboard', 'Mouse', 'Headset', 'Chair', 'Desk', 'Other'];

  assetForm = this.fb.group({
    assetCode: ['', Validators.required],
    assetName: ['', Validators.required],
    category:  ['', Validators.required],
  });

  get f() { return this.assetForm.controls; }

  get isAdminOrHR(): boolean { return this.authService.hasAnyRole(['Admin', 'HR']); }

  get categories(): string[] {
    return [...new Set(this.assets.map(a => a.category))].sort();
  }

  get stats() {
    return [
      { label: 'Total',       count: this.assets.length,                                       icon: 'inventory_2',      bg: 'bg-gray-100',   iconColor: 'text-gray-600' },
      { label: 'Available',   count: this.assets.filter(a => a.status === 'Available').length,  icon: 'check_circle',     bg: 'bg-green-100',  iconColor: 'text-green-600' },
      { label: 'Assigned',    count: this.assets.filter(a => a.status === 'Assigned').length,   icon: 'person',           bg: 'bg-blue-100',   iconColor: 'text-blue-600' },
      { label: 'Maintenance', count: this.assets.filter(a => a.status === 'UnderMaintenance').length, icon: 'build', bg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
    ];
  }

  constructor(
    private assetService: AssetService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
    this.employeeService.getAll({ page: 1, pageSize: 9999 }).subscribe({
      next: res => { this.employees = res.items; this.cdr.detectChanges(); },
    });
  }

  load(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.assetService.getAll().subscribe({
      next: data => { this.assets = data; this.applyFilter(); this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
    });
  }

  applyFilter(): void {
    this.filtered = this.assets.filter(a => {
      const matchStatus   = !this.filterStatus   || a.status === this.filterStatus;
      const matchCategory = !this.filterCategory || a.category === this.filterCategory;
      const matchSearch   = !this.searchTerm     ||
                            a.assetName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            a.assetCode.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchStatus && matchCategory && matchSearch;
    });
    this.cdr.detectChanges();
  }

  // ── Asset Form ──────────────────────────────────────────────────

  openAssetForm(asset?: AssetDto): void {
    this.editingAsset = asset ?? null;
    if (asset) {
      this.assetForm.patchValue({ assetName: asset.assetName, category: asset.category });
      this.assetForm.get('assetCode')?.disable();
    } else {
      this.assetForm.reset();
      this.assetForm.get('assetCode')?.enable();
    }
    this.showAssetForm = true;
  }

  closeAssetForm(): void { this.showAssetForm = false; this.editingAsset = null; }

  saveAsset(): void {
    if (this.assetForm.invalid) { this.assetForm.markAllAsTouched(); return; }
    this.saving = true;
    const v = this.assetForm.getRawValue();

    const obs = this.editingAsset
      ? this.assetService.update(this.editingAsset.id, { assetName: v.assetName!, category: v.category! })
      : this.assetService.create({ assetCode: v.assetCode!, assetName: v.assetName!, category: v.category! });

    obs.subscribe({
      next: () => {
        this.snack.open(this.editingAsset ? 'Asset updated.' : 'Asset added.', 'Close', { duration: 3000 });
        this.saving = false;
        this.closeAssetForm();
        this.load();
      },
      error: err => {
        this.snack.open(err?.error?.error ?? 'Failed to save asset.', 'Close', { duration: 4000 });
        this.saving = false;
      },
    });
  }

  // ── Assign ──────────────────────────────────────────────────────

  openAssign(asset: AssetDto): void {
    this.assigningAsset      = asset;
    this.selectedEmployeeId  = '';
    this.selectedEmployeeName = '';
    this.employeeSearch      = '';
    this.filteredEmployees   = [];
    this.showAssignForm      = true;
  }

  closeAssign(): void { this.showAssignForm = false; this.assigningAsset = null; }

  onEmployeeSearch(): void {
    const q = this.employeeSearch.toLowerCase().trim();
    if (!q) { this.filteredEmployees = []; return; }
    this.filteredEmployees = this.employees
      .filter(e => `${e.firstName} ${e.lastName}`.toLowerCase().includes(q))
      .slice(0, 8);
  }

  selectEmployee(e: EmployeeListItem): void {
    this.selectedEmployeeId   = e.id;
    this.selectedEmployeeName = `${e.firstName} ${e.lastName}`;
    this.employeeSearch       = '';
    this.filteredEmployees    = [];
  }

  clearSelection(): void {
    this.selectedEmployeeId   = '';
    this.selectedEmployeeName = '';
  }

  clearEmployeeSearch(): void {
    this.employeeSearch    = '';
    this.filteredEmployees = [];
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ').filter(p => p);
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  doAssign(): void {
    if (!this.assigningAsset || !this.selectedEmployeeId) return;
    this.saving = true;
    this.assetService.assign(this.assigningAsset.id, { employeeId: this.selectedEmployeeId }).subscribe({
      next: () => {
        this.snack.open('Asset assigned successfully.', 'Close', { duration: 3000 });
        this.saving = false;
        this.closeAssign();
        this.load();
      },
      error: err => {
        this.snack.open(err?.error?.error ?? 'Failed to assign asset.', 'Close', { duration: 4000 });
        this.saving = false;
      },
    });
  }

  // ── Change Status (Maintenance / Retire / Restore) ──────────────

  confirmChangeStatus(asset: AssetDto, newStatus: string): void {
    const labels: Record<string, { title: string; message: string; icon: string; btn: string; color: 'primary' | 'warn' | 'accent' }> = {
      UnderMaintenance: {
        title:   'Send to Maintenance',
        message: `Mark "${asset.assetName}" as under maintenance?`,
        icon:    'build',
        btn:     'Send to Maintenance',
        color:   'accent',
      },
      Available: {
        title:   asset.status === 'Retired' ? 'Restore Asset' : 'Mark Available',
        message: asset.status === 'Retired'
                   ? `Restore "${asset.assetName}" so it can be assigned again?`
                   : `Mark "${asset.assetName}" as available after maintenance?`,
        icon:    'check_circle',
        btn:     asset.status === 'Retired' ? 'Restore' : 'Mark Available',
        color:   'primary',
      },
      Retired: {
        title:   'Retire Asset',
        message: `Retire "${asset.assetName}"? It will no longer be available for assignment.`,
        icon:    'archive',
        btn:     'Retire',
        color:   'warn',
      },
    };

    const cfg = labels[newStatus];
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: cfg.title, message: cfg.message, icon: cfg.icon, confirmLabel: cfg.btn, confirmColor: cfg.color },
    });

    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.assetService.changeStatus(asset.id, newStatus).subscribe({
        next: updated => {
          const idx = this.assets.findIndex(a => a.id === updated.id);
          if (idx !== -1) this.assets[idx] = updated;
          this.applyFilter();
          this.snack.open(`Status updated to ${newStatus === 'UnderMaintenance' ? 'Under Maintenance' : newStatus}.`, 'Close', { duration: 3000 });
        },
        error: err => this.snack.open(err?.error?.error ?? 'Failed to update status.', 'Close', { duration: 4000 }),
      });
    });
  }

  // ── Return ──────────────────────────────────────────────────────

  confirmReturn(asset: AssetDto): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Return Asset',
        message: `Mark "${asset.assetName}" as returned from ${asset.assignedToEmployeeName}?`,
        icon: 'assignment_return',
        confirmLabel: 'Return',
        confirmColor: 'primary',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.assetService.return(asset.id).subscribe({
        next: () => { this.snack.open('Asset returned.', 'Close', { duration: 3000 }); this.load(); },
        error: err => this.snack.open(err?.error?.error ?? 'Failed.', 'Close', { duration: 4000 }),
      });
    });
  }

  // ── Delete ──────────────────────────────────────────────────────

  confirmDelete(asset: AssetDto): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Asset',
        message: `Delete "${asset.assetName}" (${asset.assetCode})?`,
        icon: 'delete',
        confirmLabel: 'Delete',
        confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.assetService.delete(asset.id).subscribe({
        next: () => { this.snack.open('Asset deleted.', 'Close', { duration: 3000 }); this.load(); },
        error: err => this.snack.open(err?.error?.error ?? 'Failed.', 'Close', { duration: 4000 }),
      });
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────

  statusClass(status: string): string {
    return ({
      Available:        'bg-green-100 text-green-800',
      Assigned:         'bg-blue-100 text-blue-800',
      UnderMaintenance: 'bg-yellow-100 text-yellow-800',
      Retired:          'bg-gray-100 text-gray-600',
    } as any)[status] ?? 'bg-gray-100 text-gray-600';
  }

  statusLabel(status: string): string {
    return status === 'UnderMaintenance' ? 'Maintenance' : status;
  }
}
