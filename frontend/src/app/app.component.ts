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

  readonly authService  = inject(AuthService);
  readonly themeService = inject(ThemeService);
  readonly apiService   = inject(ApiService);
  readonly store        = inject(ProjectStore);
  readonly loadingSvc   = inject(LoadingService);
  readonly toastSvc     = inject(ToastService);
  readonly router       = inject(Router);

  sidebarCollapsed = signal(false);
  projDropOpen     = signal(false);

  readonly isLoading = this.loadingSvc.isLoading;
  readonly toasts    = this.toastSvc.toasts;

  // ---------------- INIT ----------------
  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.loadProjects();
    }
  }

  // ---------------- LOAD PROJECTS ----------------
  loadProjects(): void {
    this.store.setLoading(true);

    this.apiService.getProjects('ACTIVE').subscribe({
      next: (projects: Project[]) => {

        // 1️⃣ store all projects
        this.store.setProjects(projects);

        // 2️⃣ FIX: set default active project safely
        const currentActive = this.store.activeProject();

        if (projects.length > 0) {

          // if nothing selected OR invalid selection
          if (!currentActive || !projects.find(p => p.id === currentActive.id)) {
            this.store.switchProject(projects[0].id!);
          }
        }

        this.store.setLoading(false);
      },

      error: (err) => {
        console.error('Project load failed', err);
        this.store.setLoading(false);
      }
    });
  }

  // ---------------- SWITCH PROJECT ----------------
  switchProject(p: Project): void {
    if (!p?.id) return;

    this.store.switchProject(p.id);

    // close dropdown
    this.projDropOpen.set(false);

    // refresh current route (forces UI refresh across modules)
    const url = this.router.url;

    this.router.navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

  // ---------------- UI TOGGLES ----------------
  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleProjDrop(): void {
    this.projDropOpen.update(v => !v);
  }

  // ---------------- AUTH ----------------
  executeSignout(): void {
    this.authService.logout();
  }

  // ---------------- TOAST ICON ----------------
  toastIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'cancel';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }

  // ---------------- CLOSE DROPDOWN ON OUTSIDE CLICK ----------------
  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    const target = e.target as HTMLElement;

    if (!target.closest('.proj-switcher-area')) {
      this.projDropOpen.set(false);
    }
  }
}