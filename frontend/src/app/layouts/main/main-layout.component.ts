import { Component, inject, signal, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProjectStore } from '../../core/state/project.store';
import { ProjectService } from '../../core/services/api.services';
import { LoadingService } from '../../core/services/loading.service';
import { Project } from '../../core/models';

interface NavItem { label: string; icon: string; route: string; adminOnly?: boolean; }
interface NavSection { label: string; items: NavItem[]; }

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent implements OnInit {
  readonly auth         = inject(AuthService);
  readonly store        = inject(ProjectStore);
  readonly projectSvc   = inject(ProjectService);
  readonly loadingSvc   = inject(LoadingService);
  readonly router       = inject(Router);

  sidebarOpen   = signal(true);
  projDropOpen  = signal(false);
  profileOpen   = signal(false);

  readonly isLoading = this.loadingSvc.isLoading;

  readonly navSections: NavSection[] = [
    {
      label: 'Overview',
      items: [{ label: 'Dashboard', icon: 'dashboard', route: '/dashboard' }]
    },
    {
      label: 'Ticketing',
      items: [
        { label: 'All Tickets', icon: 'confirmation_number', route: '/tickets' },
        { label: 'New Ticket',  icon: 'add_circle_outline',  route: '/tickets/new' }
      ]
    },
    {
      label: 'Analytics',
      items: [{ label: 'Reports', icon: 'bar_chart', route: '/reports' }]
    },
    {
      label: 'Administration',
      items: [{ label: 'Configuration', icon: 'settings', route: '/config', adminOnly: true }]
    }
  ];

  get visibleSections(): NavSection[] {
    return this.navSections
      .map(s => ({ ...s, items: s.items.filter(i => !i.adminOnly || this.auth.isAdmin()) }))
      .filter(s => s.items.length > 0);
  }

  ngOnInit(): void { this.loadProjects(); }

  loadProjects(): void {
    this.store.setLoading(true);
    this.projectSvc.getAll('ACTIVE').subscribe({
      next: p => { this.store.setProjects(p); this.store.setLoading(false); },
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

  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }
  logout(): void { this.auth.logout(); }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    if (!(e.target as HTMLElement).closest('.proj-dd-wrap')) this.projDropOpen.set(false);
    if (!(e.target as HTMLElement).closest('.profile-wrap'))  this.profileOpen.set(false);
  }
}
