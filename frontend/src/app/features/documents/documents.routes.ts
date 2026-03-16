import { Routes } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DocumentService } from '../../core/services/document.service';
import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/services/auth.service';
import { DocumentDto } from '../../models/document.model';
import { EmployeeListItem } from '../../models/employee.model';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule, MatTooltipModule,
  ],
  template: `
    <div class="p-6">

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Documents</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ isAdminOrHR ? 'All employee documents' : 'Your documents' }}
        </p>
      </div>

      <!-- Upload Panel (Admin / HR only) -->
      <mat-card *ngIf="isAdminOrHR" class="mb-6">
        <mat-card-content class="p-5">
          <p class="text-sm font-semibold text-gray-700 mb-4">Upload Document</p>

          <!-- Employee selector + Doc Type -->
          <div class="flex flex-wrap gap-3 mb-4">
            <select [(ngModel)]="uploadEmployeeId"
                    class="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm
                           text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="">— Select Employee —</option>
              <option *ngFor="let e of employees" [value]="e.id">
                {{ e.fullName }} ({{ e.employeeCode }})
              </option>
            </select>
            <select [(ngModel)]="uploadDocType"
                    class="w-44 border border-gray-300 rounded-lg px-3 py-2 text-sm
                           text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="Offer">Offer Letter</option>
              <option value="Payslip">Payslip</option>
              <option value="ID">ID Document</option>
              <option value="Contract">Contract</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <!-- Drag-drop zone -->
          <div class="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors"
               [class.border-indigo-400]="isDragOver"
               [class.bg-indigo-50]="isDragOver"
               [class.border-gray-200]="!isDragOver"
               (click)="fileInput.click()"
               (dragover)="onDragOver($event)"
               (dragleave)="isDragOver = false"
               (drop)="onDrop($event)">
            <mat-icon class="text-gray-300 mb-2"
                      style="font-size:2.5rem;width:2.5rem;height:2.5rem;">upload_file</mat-icon>
            <p *ngIf="!selectedFile" class="text-sm text-gray-500">
              Drag &amp; drop a file here, or
              <span class="text-indigo-600 font-medium">click to browse</span>
            </p>
            <p *ngIf="selectedFile" class="text-sm font-medium text-indigo-700">
              {{ selectedFile.name }}
              <span class="text-gray-400 font-normal ml-1">({{ formatFileSize(selectedFile.size) }})</span>
            </p>
            <p class="text-xs text-gray-400 mt-1">PDF, JPG, PNG — max 5 MB</p>
            <input #fileInput type="file" class="hidden"
                   accept=".pdf,.jpg,.jpeg,.png"
                   (change)="onFileSelected($event)" />
          </div>

          <div class="flex justify-end mt-3">
            <button mat-raised-button color="primary"
                    [disabled]="!selectedFile || !uploadEmployeeId || uploading"
                    (click)="uploadDocument()">
              <mat-spinner *ngIf="uploading" diameter="18" class="mr-1 inline-block"></mat-spinner>
              <mat-icon *ngIf="!uploading">upload</mat-icon>
              {{ uploading ? 'Uploading…' : 'Upload' }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Filter bar (Admin/HR) -->
      <div *ngIf="isAdminOrHR && employees.length" class="flex items-center gap-3 mb-4">
        <mat-icon class="text-gray-400">filter_list</mat-icon>
        <select [(ngModel)]="filterEmployeeId" (ngModelChange)="applyFilter()"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700
                       focus:outline-none focus:ring-2 focus:ring-indigo-400 w-56">
          <option value="">All Employees</option>
          <option *ngFor="let e of employees" [value]="e.id">{{ e.fullName }}</option>
        </select>
        <span class="text-xs text-gray-400 ml-auto">{{ filtered.length }} document(s)</span>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-16">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Empty -->
      <div *ngIf="!loading && filtered.length === 0"
           class="flex flex-col items-center py-16 text-gray-400">
        <mat-icon style="font-size:3.5rem;width:3.5rem;height:3.5rem;" class="mb-3">folder_open</mat-icon>
        <p class="font-medium text-base">No documents found</p>
        <p class="text-sm mt-1">
          {{ isAdminOrHR ? 'Upload a document above to get started.' : 'No documents have been uploaded for you yet.' }}
        </p>
      </div>

      <!-- Document table -->
      <div *ngIf="!loading && filtered.length > 0"
           class="bg-white rounded-xl border overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th *ngIf="isAdminOrHR" class="px-4 py-3 text-left">Employee</th>
              <th class="px-4 py-3 text-left">Type</th>
              <th class="px-4 py-3 text-left">File Name</th>
              <th class="px-4 py-3 text-right">Size</th>
              <th class="px-4 py-3 text-left">Uploaded By</th>
              <th class="px-4 py-3 text-left">Date</th>
              <th class="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr *ngFor="let doc of filtered" class="hover:bg-gray-50">
              <td *ngIf="isAdminOrHR" class="px-4 py-3 font-medium text-gray-900">
                {{ doc.employeeName || '—' }}
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-0.5 rounded text-xs font-semibold"
                      [ngClass]="docTypeBadgeClass(doc.docType)">
                  {{ doc.docType }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-700 max-w-[220px] truncate" [title]="doc.fileName">
                {{ doc.fileName }}
              </td>
              <td class="px-4 py-3 text-right text-gray-500 font-mono text-xs">
                {{ formatFileSize(doc.fileSize) }}
              </td>
              <td class="px-4 py-3 text-gray-500 text-xs">{{ doc.uploadedByName || '—' }}</td>
              <td class="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                {{ doc.uploadedOn | date:'MMM d, y' }}
              </td>
              <td class="px-4 py-3 text-center whitespace-nowrap">
                <button mat-icon-button (click)="downloadDocument(doc)"
                        matTooltip="Download" class="!w-8 !h-8">
                  <mat-icon class="text-indigo-600"
                            style="font-size:1.1rem;width:1.1rem;height:1.1rem;line-height:1.1rem;">
                    download
                  </mat-icon>
                </button>
                <button *ngIf="isAdminOrHR" mat-icon-button (click)="deleteDocument(doc)"
                        matTooltip="Delete" class="!w-8 !h-8">
                  <mat-icon class="text-red-400"
                            style="font-size:1.1rem;width:1.1rem;height:1.1rem;line-height:1.1rem;">
                    delete
                  </mat-icon>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  `,
})
export class DocumentsComponent implements OnInit {
  documents: DocumentDto[] = [];
  filtered: DocumentDto[] = [];
  employees: EmployeeListItem[] = [];
  loading = true;

  // Upload state
  isDragOver = false;
  selectedFile: File | null = null;
  uploadEmployeeId = '';
  uploadDocType = 'Offer';
  uploading = false;

  // Filter state
  filterEmployeeId = '';

  isAdminOrHR = false;
  myEmployeeId: string | null = null;

  constructor(
    private documentService: DocumentService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.isAdminOrHR = this.authService.hasAnyRole(['Admin', 'HR']);

    if (this.isAdminOrHR) {
      this.loadEmployees();
      this.loadAllDocuments();
    } else {
      // Load own employee profile then documents
      this.employeeService.getMyProfile().subscribe({
        next: profile => {
          this.myEmployeeId = profile.id;
          this.loadEmployeeDocuments(profile.id);
        },
        error: () => { this.loading = false; this.cdr.detectChanges(); },
      });
    }
  }

  loadAllDocuments(): void {
    this.loading = true;
    this.documentService.getAllDocuments().subscribe({
      next: docs => {
        this.documents = docs;
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
    });
  }

  loadEmployeeDocuments(employeeId: string): void {
    this.loading = true;
    this.documentService.getEmployeeDocuments(employeeId).subscribe({
      next: docs => {
        this.documents = docs;
        this.filtered = docs;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
    });
  }

  loadEmployees(): void {
    this.employeeService.getAll({ page: 1, pageSize: 500 }).subscribe({
      next: res => { this.employees = res.items; this.cdr.detectChanges(); },
    });
  }

  applyFilter(): void {
    this.filtered = this.filterEmployeeId
      ? this.documents.filter(d => d.employeeId === this.filterEmployeeId)
      : [...this.documents];
  }

  // ── Upload ──────────────────────────────────────────────────

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.selectedFile = file;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.selectedFile = input.files[0];
  }

  uploadDocument(): void {
    if (!this.selectedFile || !this.uploadEmployeeId) return;
    this.uploading = true;
    this.documentService.uploadDocument(this.uploadEmployeeId, this.selectedFile, this.uploadDocType).subscribe({
      next: doc => {
        this.documents = [doc, ...this.documents];
        this.applyFilter();
        this.selectedFile = null;
        this.uploading = false;
        this.snackBar.open('Document uploaded successfully.', 'OK', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.uploading = false;
        this.snackBar.open(err?.error?.error ?? 'Upload failed.', 'Close', { duration: 4000 });
        this.cdr.detectChanges();
      },
    });
  }

  // ── Download ─────────────────────────────────────────────────

  downloadDocument(doc: DocumentDto): void {
    this.documentService.downloadDocument(doc.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = doc.fileName;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Download failed.', 'Close', { duration: 3000 }),
    });
  }

  // ── Delete ───────────────────────────────────────────────────

  deleteDocument(doc: DocumentDto): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Document',
        message: `Delete "${doc.fileName}"? This action cannot be undone.`,
        icon: 'delete',
        confirmLabel: 'Delete',
        confirmColor: 'warn',
      } as ConfirmDialogData,
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (!ok) return;
      this.documentService.deleteDocument(doc.id).subscribe({
        next: () => {
          this.documents = this.documents.filter(d => d.id !== doc.id);
          this.applyFilter();
          this.snackBar.open('Document deleted.', 'OK', { duration: 3000 });
          this.cdr.detectChanges();
        },
        error: () => this.snackBar.open('Delete failed.', 'Close', { duration: 3000 }),
      });
    });
  }

  // ── Helpers ──────────────────────────────────────────────────

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  docTypeBadgeClass(docType: string): string {
    return ({
      Offer:    'bg-blue-100 text-blue-800',
      Payslip:  'bg-green-100 text-green-800',
      ID:       'bg-yellow-100 text-yellow-800',
      Contract: 'bg-purple-100 text-purple-800',
      Other:    'bg-gray-100 text-gray-600',
    } as any)[docType] ?? 'bg-gray-100 text-gray-600';
  }
}

export const documentsRoutes: Routes = [
  { path: '', component: DocumentsComponent }
];
