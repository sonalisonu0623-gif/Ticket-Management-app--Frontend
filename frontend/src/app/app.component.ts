import { Component, signal, inject, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { ApiService } from './services/api.service';
import { ProjectStore } from './state/project.store';
import { LoadingService } from './services/loading.service';
import { ToastService } from './services/toast.service';
import { Project } from './models/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  // ---------------- SERVICES ----------------
  readonly authService  = inject(AuthService);
  readonly themeService = inject(ThemeService);
  readonly apiService   = inject(ApiService);
  readonly store        = inject(ProjectStore);
  readonly loadingSvc   = inject(LoadingService);
  readonly toastSvc     = inject(ToastService);
  readonly router       = inject(Router);

  // ---------------- UI STATE ----------------
  sidebarCollapsed = signal(false);
  projDropOpen     = signal(false);

  readonly isLoading = this.loadingSvc.isLoading;
  readonly toasts    = this.toastSvc.toasts;

  // ---------------- INIT ----------------
  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.loadProjectsAndSetActive();
    }
  }

  // ---------------- FIXED PROJECT LOAD ----------------
  loadProjectsAndSetActive(): void {
    this.apiService.getProjects('ACTIVE').subscribe({
      next: (projects: Project[]) => {

        // 1. Store all projects
        this.store.setProjects(projects);

        if (!projects.length) return;

        // 2. Get current active id (source of truth)
        const activeId = this.store.activeId();

        // 3. Validate active project exists in new list
        let activeProject = projects.find(p => p.id === activeId);

        // 4. If invalid OR not set → fallback to first project
        if (!activeProject) {
          activeProject = projects[0];
        }

        // 5. IMPORTANT: call ONLY ONCE
        this.store.switchProject(activeProject.id!);
      },
      error: (err) => console.error('Project load failed', err)
    });
  }

  // ---------------- SWITCH PROJECT ----------------
  switchProject(p: Project): void {
    if (!p?.id) return;

    this.store.switchProject(p.id);
    this.projDropOpen.set(false);

    const url = this.router.url;

    this.router.navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

  // ---------------- UI ----------------
  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleProjDrop(): void {
    this.projDropOpen.update(v => !v);
  }

  executeSignout(): void {
    this.authService.logout();
  }

  // ---------------- TOAST ICON ----------------
  toastIcon(type: string): string {
    if (type === 'success') return 'check_circle';
    if (type === 'error') return 'cancel';
    if (type === 'warning') return 'warning';
    return 'info';
  }

  // ---------------- CLOSE DROPDOWN ----------------
  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    const el = e.target as HTMLElement;

    if (!el.closest('.proj-switcher-area')) {
      this.projDropOpen.set(false);
    }
  }
}