import { Component, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="navbar">
      <!-- Left: menu + breadcrumb -->
      <div class="navbar-left">
        <button class="menu-btn" (click)="menuToggle.emit()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <!-- Project Switcher -->
        @if (auth.assignedProjects().length > 0) {
          <div class="project-switcher" [class.open]="projectDropOpen()">
            <button class="project-trigger" (click)="toggleProjectDrop()">
              <div class="project-dot" [style.background]="getProjectColor(auth.activeProject()?.id)"></div>
              <span class="project-name">{{ auth.activeProject()?.projectName ?? 'Select Project' }}</span>
              <span class="project-code">{{ auth.activeProject()?.projectCode }}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            @if (projectDropOpen()) {
              <div class="project-dropdown">
                <div class="project-drop-header">Switch Project</div>
                @for (p of auth.assignedProjects(); track p.id) {
                  <button
                    class="project-option"
                    [class.active]="p.id === auth.activeProject()?.id"
                    (click)="switchProject(p)"
                  >
                    <div class="project-dot" [style.background]="getProjectColor(p.id)"></div>
                    <div class="proj-info">
                      <span class="proj-name">{{ p.projectName }}</span>
                      <span class="proj-code">{{ p.projectCode }}</span>
                    </div>
                    @if (p.id === auth.activeProject()?.id) {
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    }
                  </button>
                }
              </div>
            }
          </div>
        }
      </div>

      <!-- Right: actions + profile -->
      <div class="navbar-right">
        <!-- Role badge -->
        <span class="role-chip">{{ formatRole(auth.userRole()) }}</span>

        <!-- Profile -->
        <div class="profile-wrap" [class.open]="profileOpen()">
          <button class="profile-btn" (click)="toggleProfile()">
            <div class="avatar">{{ auth.userInitials() }}</div>
            <div class="profile-info">
              <span class="profile-name">{{ auth.currentUser()?.username }}</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          @if (profileOpen()) {
            <div class="profile-dropdown">
              <div class="profile-drop-header">
                <div class="avatar lg">{{ auth.userInitials() }}</div>
                <div>
                  <div class="pd-name">{{ auth.currentUser()?.username }}</div>
                  <div class="pd-email">{{ auth.currentUser()?.email }}</div>
                </div>
              </div>
              <div class="profile-drop-divider"></div>
              <a class="profile-drop-item" routerLink="/profile" (click)="profileOpen.set(false)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                My Profile
              </a>
              <div class="profile-drop-divider"></div>
              <button class="profile-drop-item danger" (click)="logout()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
              </button>
            </div>
          }
        </div>
      </div>
    </header>

    <!-- Click-away overlay -->
    @if (projectDropOpen() || profileOpen()) {
      <div class="drop-overlay" (click)="closeAll()"></div>
    }
  `,
  styles: [`
    .navbar {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      background: var(--topbar-bg);
      border-bottom: 1px solid var(--border);
      gap: 12px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .navbar-left { display: flex; align-items: center; gap: 12px; }
    .navbar-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }

    /* Menu btn */
    .menu-btn {
      width: 34px; height: 34px; border-radius: 7px;
      background: transparent; border: 1px solid var(--border);
      color: var(--text-muted); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s;
    }
    .menu-btn:hover { background: var(--nav-hover); color: var(--text-primary); }

    /* Project switcher */
    .project-switcher { position: relative; }
    .project-trigger {
      display: flex; align-items: center; gap: 7px;
      padding: 6px 10px; border-radius: 7px;
      background: var(--bg-card); border: 1px solid var(--border);
      color: var(--text-primary); cursor: pointer;
      font-size: 13px; font-weight: 500;
      transition: all 0.15s;
    }
    .project-trigger:hover { border-color: var(--border-hover); }
    .project-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .project-name { font-weight: 600; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .project-code { font-size: 11px; color: var(--text-muted); background: var(--bg-primary); border-radius: 3px; padding: 1px 5px; }

    .project-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      min-width: 240px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      z-index: 300;
      animation: fadeDown 0.15s ease;
    }
    .project-drop-header { padding: 10px 14px; font-size: 11px; font-weight: 600; color: var(--text-muted); letter-spacing: 0.5px; text-transform: uppercase; border-bottom: 1px solid var(--border); }
    .project-option {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; width: 100%; text-align: left;
      background: none; border: none; cursor: pointer;
      transition: background 0.1s; color: var(--text-primary);
    }
    .project-option:hover { background: var(--nav-hover); }
    .project-option.active { background: var(--nav-active-bg); }
    .proj-info { display: flex; flex-direction: column; flex: 1; }
    .proj-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
    .proj-code { font-size: 11px; color: var(--text-muted); }

    /* Role chip */
    .role-chip {
      padding: 3px 9px; border-radius: 4px;
      background: var(--accent-light); color: var(--accent);
      font-size: 11px; font-weight: 600; letter-spacing: 0.3px;
      white-space: nowrap;
    }

    /* Profile */
    .profile-wrap { position: relative; }
    .profile-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 5px 10px; border-radius: 8px;
      background: var(--bg-card); border: 1px solid var(--border);
      cursor: pointer; transition: all 0.15s;
    }
    .profile-btn:hover { border-color: var(--border-hover); }
    .avatar {
      width: 28px; height: 28px; border-radius: 7px;
      background: var(--accent); color: white;
      font-size: 11px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
    .avatar.lg { width: 36px; height: 36px; border-radius: 9px; font-size: 13px; flex-shrink: 0; }
    .profile-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }

    .profile-dropdown {
      position: absolute; top: calc(100% + 8px); right: 0;
      min-width: 220px; background: var(--bg-card);
      border: 1px solid var(--border); border-radius: 10px;
      box-shadow: var(--shadow-lg); z-index: 300;
      animation: fadeDown 0.15s ease; overflow: hidden;
    }
    .profile-drop-header { display: flex; align-items: center; gap: 10px; padding: 14px; }
    .pd-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .pd-email { font-size: 11.5px; color: var(--text-muted); }
    .profile-drop-divider { height: 1px; background: var(--border); }
    .profile-drop-item {
      display: flex; align-items: center; gap: 9px;
      padding: 10px 14px; font-size: 13px; color: var(--text-secondary);
      text-decoration: none; background: none; border: none;
      cursor: pointer; width: 100%; text-align: left; transition: all 0.12s;
    }
    .profile-drop-item:hover { background: var(--nav-hover); color: var(--text-primary); }
    .profile-drop-item.danger:hover { color: var(--danger); background: var(--danger-light); }

    /* Click overlay */
    .drop-overlay { position: fixed; inset: 0; z-index: 200; }

    @keyframes fadeDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class NavbarComponent implements OnInit {
  @Output() menuToggle = new EventEmitter<void>();

  projectDropOpen = signal(false);
  profileOpen = signal(false);

  private projectColors = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899','#14b8a6'];

  constructor(
    public auth: AuthService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    if (this.auth.isAdmin()) {
      this.projectService.getAllList().subscribe(projects => {
        this.auth.setAssignedProjects(projects);
      });
    } else {
      this.projectService.getMyProjects().subscribe(projects => {
        this.auth.setAssignedProjects(projects);
      });
    }
  }

  switchProject(project: Project): void {
    this.auth.switchProject(project);
    this.projectDropOpen.set(false);
    // Trigger a soft refresh via the router if needed
  }

  getProjectColor(id?: number): string {
    if (!id) return this.projectColors[0];
    return this.projectColors[id % this.projectColors.length];
  }

  toggleProjectDrop(): void {
    this.projectDropOpen.update(v => !v);
    this.profileOpen.set(false);
  }

  toggleProfile(): void {
    this.profileOpen.update(v => !v);
    this.projectDropOpen.set(false);
  }

  closeAll(): void {
    this.projectDropOpen.set(false);
    this.profileOpen.set(false);
  }

  formatRole(role: string | undefined): string {
    if (!role) return '';
    return role.replace(/_/g, ' ');
  }

  logout(): void {
    this.auth.logout();
  }
}
