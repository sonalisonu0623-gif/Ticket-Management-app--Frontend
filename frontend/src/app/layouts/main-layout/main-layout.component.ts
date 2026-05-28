import { Component, signal, computed, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  template: `
    <div class="layout-root" [class.sidebar-collapsed]="sidebarCollapsed()">
      <!-- Global loading bar -->
      <div class="global-loader" [class.active]="loading.isLoading()">
        <div class="loader-bar"></div>
      </div>

      <!-- Sidebar -->
      <app-sidebar
        [collapsed]="sidebarCollapsed()"
        (toggleCollapse)="toggleSidebar()"
      />

      <!-- Main content area -->
      <div class="layout-main">
        <app-navbar (menuToggle)="toggleSidebar()" />
        <main class="layout-content">
          <router-outlet />
        </main>
      </div>

      <!-- Mobile overlay -->
      @if (!sidebarCollapsed() && isMobile()) {
        <div class="mobile-overlay" (click)="toggleSidebar()"></div>
      }
    </div>
  `,
  styles: [`
    .layout-root {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--bg-primary);
    }

    .layout-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: margin-left 0.25s ease;
    }

    .layout-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    /* Global loading bar */
    .global-loader {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .global-loader.active { opacity: 1; }
    .loader-bar {
      height: 100%;
      background: linear-gradient(90deg, transparent, var(--accent), #00d9ff, var(--accent), transparent);
      background-size: 200% 100%;
      animation: loadingSlide 1.2s linear infinite;
    }
    @keyframes loadingSlide {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Mobile overlay */
    .mobile-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 199;
      backdrop-filter: blur(2px);
    }

    @media (max-width: 768px) {
      .layout-root { position: relative; }
    }
  `]
})
export class MainLayoutComponent {
  sidebarCollapsed = signal(false);
  isMobile = signal(window.innerWidth < 768);

  constructor(public loading: LoadingService) {}

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(window.innerWidth < 768);
    if (window.innerWidth < 768) {
      this.sidebarCollapsed.set(true);
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(c => !c);
  }
}
