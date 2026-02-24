import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    SidebarComponent,
    TopbarComponent
  ],
  template: `
    <div class="flex h-screen bg-gray-100">
      <app-sidebar class="w-64 bg-white shadow-lg"></app-sidebar>
      <div class="flex-1 flex flex-col overflow-hidden">
        <app-topbar></app-topbar>
        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class MainLayoutComponent {}
