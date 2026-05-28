import { Component, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-shell">

      <!-- Navbar — only shown when authenticated -->
      <nav class="navbar" *ngIf="authService.isAuthenticated()">
        <div class="nav-brand">
          <span class="nav-icon">⬡</span>
          <span class="nav-title">NEXUS <span class="nav-subtitle">TICKETING</span></span>
        </div>

        <div class="nav-links">
          <!-- ADMIN: Dashboard link -->
          <a *ngIf="authService.isAdmin()"
             routerLink="/dashboard" routerLinkActive="active" class="nav-link">
            <span class="link-icon">▣</span> Dashboard
          </a>

          <!-- ADMIN + PROJECT_MANAGER see all tickets -->
          <a *ngIf="authService.canCreateTickets()"
             routerLink="/tickets" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            <span class="link-icon">▦</span> All Tickets
          </a>

          <!-- EMPLOYEE sees My Tickets -->
          <a *ngIf="authService.isEmployee()"
             routerLink="/my-tickets" routerLinkActive="active" class="nav-link">
            <span class="link-icon">▦</span> My Tickets
          </a>

          <!-- PROJECT_MANAGER still sees Projects directly -->
          <a *ngIf="authService.isProjectManager()"
             routerLink="/projects" routerLinkActive="active" class="nav-link">
            <span class="link-icon">◈</span> Projects
          </a>

          <!-- ADMIN + PROJECT_MANAGER can create tickets -->
          <a *ngIf="authService.canCreateTickets()"
             routerLink="/tickets/new" routerLinkActive="active" class="nav-link nav-link-cta">
            <span class="link-icon">＋</span> New Ticket
          </a>

          <!-- ADMIN: single Configuration link replaces Employees / Users / Projects -->
          <a *ngIf="authService.isAdmin()"
             routerLink="/configuration" routerLinkActive="active" class="nav-link">
            <span class="link-icon">⚙</span> Configuration
          </a>

          <!-- User profile pill -->
          <a routerLink="/profile" class="user-pill" title="My Profile">
            <span class="user-role-badge" [ngClass]="roleBadgeClass()">{{ authService.userRole() }}</span>
            <span class="user-name">{{ authService.currentUser()?.username }}</span>
          </a>

          <!-- Logout -->
          <button class="btn-logout" (click)="logout()" title="Sign out">⏻</button>

          <!-- Theme toggle -->
          <button class="theme-toggle" (click)="themeService.toggle()"
                  [title]="isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            <span *ngIf="isDark()">☀</span>
            <span *ngIf="!isDark()">☾</span>
          </button>
        </div>
      </nav>

      <main class="main-content" [class.full-width]="!authService.isAuthenticated()">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: var(--bg-base); }
    .app-shell { min-height: 100vh; display: flex; flex-direction: column; }
    .navbar {
      position: sticky; top: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 2rem; height: 64px;
      background: var(--navbar-bg);
      border-bottom: 1px solid var(--border-accent);
      backdrop-filter: blur(12px);
    }
    .nav-brand { display: flex; align-items: center; gap: 0.75rem; }
    .nav-icon  { font-size: 1.5rem; color: var(--accent); filter: drop-shadow(0 0 8px var(--accent)); }
    .nav-title { font-family: 'Courier New', monospace; font-size: 1.1rem; font-weight: 700; letter-spacing: 0.2em; color: var(--text-bright); }
    .nav-subtitle { color: var(--accent); opacity: 0.7; }
    .nav-links { display: flex; align-items: center; gap: 0.5rem; }
    .nav-link {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.5rem 1.1rem; border-radius: 4px; text-decoration: none;
      font-family: 'Courier New', monospace; font-size: 0.8rem;
      font-weight: 600; letter-spacing: 0.05em;
      color: var(--text-secondary); border: 1px solid transparent;
      transition: all 0.2s ease;
    }
    .nav-link:hover, .nav-link.active { color: var(--accent); border-color: var(--accent-border); background: var(--accent-bg); }
    .nav-link-cta { border-color: var(--accent-border); color: var(--accent); background: var(--accent-bg); }
    .nav-link-cta:hover { background: var(--accent-hover); box-shadow: 0 0 12px rgba(0,212,255,0.2); }
    .link-icon { font-size: 0.9rem; }
    .user-pill {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.3rem 0.75rem;
      background: var(--bg-surface-3);
      border: 1px solid var(--border-mid);
      border-radius: 4px; margin-left: 0.25rem;
      text-decoration: none; transition: border-color 0.2s;
    }
    .user-pill:hover { border-color: var(--accent-border); }
    .user-name {
      font-family: 'Courier New', monospace; font-size: 0.75rem;
      color: var(--text-secondary); font-weight: 600; max-width: 120px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .user-role-badge {
      font-family: 'Courier New', monospace; font-size: 0.6rem;
      font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 3px;
      letter-spacing: 0.05em; white-space: nowrap;
    }
    .role-admin { background: rgba(255,107,107,0.1); border: 1px solid rgba(255,107,107,0.3); color: #ff6b6b; }
    .role-pm    { background: rgba(255,169,77,0.1);  border: 1px solid rgba(255,169,77,0.3);  color: #ffa94d; }
    .role-emp   { background: rgba(105,219,124,0.1); border: 1px solid rgba(105,219,124,0.3); color: #69db7c; }
    .btn-logout {
      display: inline-flex; align-items: center; justify-content: center;
      width: 34px; height: 34px; border-radius: 4px;
      background: transparent; border: 1px solid var(--border-mid);
      color: var(--text-muted); font-size: 1rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-logout:hover { border-color: rgba(255,107,107,0.4); color: #ff6b6b; background: rgba(255,107,107,0.08); }
    .theme-toggle {
      display: inline-flex; align-items: center; justify-content: center;
      width: 34px; height: 34px; border-radius: 4px;
      background: transparent; border: 1px solid var(--border-mid);
      color: var(--text-muted); font-size: 1rem; cursor: pointer;
      transition: all 0.2s; margin-left: 0.25rem;
    }
    .theme-toggle:hover { border-color: var(--accent-border); color: var(--accent); background: var(--accent-bg); }
    .main-content {
      flex: 1; padding: 2rem;
      max-width: 1400px; margin: 0 auto; width: 100%; box-sizing: border-box;
    }
    .main-content.full-width { max-width: 100%; padding: 0; }
  `]
})
export class AppComponent {
  title = 'Nexus Ticketing';
  isDark = this.themeService.isDark;

  constructor(
    public themeService: ThemeService,
    public authService: AuthService,
    private router: Router
  ) {}

  logout(): void { this.authService.logout(); }

  roleBadgeClass(): string {
    const role = this.authService.userRole();
    if (role === 'ADMIN') return 'user-role-badge role-admin';
    if (role === 'PROJECT_MANAGER') return 'user-role-badge role-pm';
    return 'user-role-badge role-emp';
  }
}
