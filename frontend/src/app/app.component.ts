import { Component, signal, inject, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { ApiService } from './services/api.service';
import { ProjectStore } from './state/project.store';
import { LoadingService } from './services/loading.service';
import { ToastService } from './services/toast.service';
import { Project, ToastMessage } from './models/models';

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

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.loadProjects();
    }
  }

  // loadProjects(): void {
  //   this.store.setLoading(true);
  //   this.apiService.getProjects('ACTIVE').subscribe({
  //     next: p => { this.store.setProjects(p); this.store.setLoading(false); },
  //     error: () => this.store.setLoading(false)
  //   });
  // }
  loadProjects(): void {
  this.store.setLoading(true);

  this.apiService.getProjects('ACTIVE').subscribe({
    next: (p) => {
      this.store.setProjects(p);

      // ✅ IMPORTANT FIX
      if (p.length > 0 && !this.store.activeProject()) {
        this.store.switchProject(p[0].id!);
      }

      this.store.setLoading(false);
    },
    error: () => this.store.setLoading(false)
  });
}

  switchProject(p: Project): void {
    if (p.id) {
      this.store.switchProject(p.id);
      this.projDropOpen.set(false);
      const url = this.router.url;
      this.router.navigateByUrl('/', { skipLocationChange: true })
          .then(() => this.router.navigate([url]));
    }
  }

  toggleSidebar(): void { this.sidebarCollapsed.update(v => !v); }
  toggleProjDrop(): void { this.projDropOpen.update(v => !v); }

  executeSignout(): void { this.authService.logout(); }

  toastIcon(type: string): string {
    return type === 'success' ? 'check_circle' : type === 'error' ? 'cancel' : type === 'warning' ? 'warning' : 'info';
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    if (!(e.target as HTMLElement).closest('.proj-switcher-area')) {
      this.projDropOpen.set(false);
    }
  }
}
