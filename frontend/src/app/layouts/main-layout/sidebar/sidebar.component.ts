import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NavItem } from '../../../core/models/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        @if (!collapsed) {
          <span class="logo-text">TicketOps</span>
        }
        <button class="collapse-btn" (click)="toggleCollapse.emit()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            @if (collapsed) {
              <polyline points="9 18 15 12 9 6"></polyline>
            } @else {
              <polyline points="15 18 9 12 15 6"></polyline>
            }
          </svg>
        </button>
      </div>

      <!-- Nav items -->
      <nav class="sidebar-nav">
        @for (item of visibleNavItems(); track item.route) {
          @if (!item.children) {
            <a
              class="nav-item"
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{exact: item.route === '/dashboard'}"
              [title]="collapsed ? item.label : ''"
            >
              <span class="nav-icon" [innerHTML]="item.icon"></span>
              @if (!collapsed) {
                <span class="nav-label">{{ item.label }}</span>
                @if (item.badge) {
                  <span class="nav-badge">{{ item.badge }}</span>
                }
              }
            </a>
          } @else {
            <!-- Group with children -->
            <div class="nav-group">
              <button class="nav-group-trigger" (click)="toggleGroup(item.label)" [title]="collapsed ? item.label : ''">
                <span class="nav-icon" [innerHTML]="item.icon"></span>
                @if (!collapsed) {
                  <span class="nav-label">{{ item.label }}</span>
                  <svg class="chevron" [class.open]="openGroups().has(item.label)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                }
              </button>
              @if (!collapsed && openGroups().has(item.label)) {
                <div class="nav-children">
                  @for (child of item.children!; track child.route) {
                    <a class="nav-child" [routerLink]="child.route" routerLinkActive="active">
                      <span class="child-dot"></span>
                      {{ child.label }}
                    </a>
                  }
                </div>
              }
            </div>
          }
        }
      </nav>

      <!-- Bottom section -->
      @if (!collapsed) {
        <div class="sidebar-footer">
          <div class="user-mini">
            <div class="user-avatar">{{ auth.userInitials() }}</div>
            <div class="user-info">
              <div class="user-name">{{ auth.currentUser()?.username }}</div>
              <div class="user-role">{{ formatRole(auth.userRole()) }}</div>
            </div>
          </div>
        </div>
      }
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 240px;
      min-width: 240px;
      height: 100vh;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      transition: width 0.25s ease, min-width 0.25s ease;
      overflow: hidden;
      position: relative;
      z-index: 200;
    }
    .sidebar.collapsed {
      width: 60px;
      min-width: 60px;
    }

    /* Logo */
    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 12px;
      border-bottom: 1px solid var(--border);
      height: 60px;
      position: relative;
    }
    .logo-icon {
      width: 36px;
      height: 36px;
      background: var(--accent);
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }
    .logo-text {
      font-size: 16px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.5px;
      white-space: nowrap;
    }
    .collapse-btn {
      margin-left: auto;
      width: 24px;
      height: 24px;
      border-radius: 5px;
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
      flex-shrink: 0;
    }
    .collapse-btn:hover { background: var(--nav-hover); color: var(--text-primary); }

    /* Nav */
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 10px 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .sidebar-nav::-webkit-scrollbar { width: 4px; }
    .sidebar-nav::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 7px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 500;
      transition: all 0.13s;
      white-space: nowrap;
      cursor: pointer;
    }
    .nav-item:hover { background: var(--nav-hover); color: var(--text-primary); }
    .nav-item.active {
      background: var(--nav-active-bg);
      color: var(--accent);
    }
    .nav-icon { width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .nav-icon svg { width: 16px; height: 16px; }
    .nav-label { flex: 1; }
    .nav-badge {
      background: var(--accent);
      color: white;
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    /* Groups */
    .nav-group { display: flex; flex-direction: column; }
    .nav-group-trigger {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 7px;
      color: var(--text-secondary);
      background: none;
      border: none;
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
      width: 100%;
      text-align: left;
      transition: all 0.13s;
      white-space: nowrap;
    }
    .nav-group-trigger:hover { background: var(--nav-hover); color: var(--text-primary); }
    .chevron { margin-left: auto; transition: transform 0.2s; }
    .chevron.open { transform: rotate(180deg); }
    .nav-children { padding-left: 28px; display: flex; flex-direction: column; gap: 1px; margin-top: 2px; }
    .nav-child {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 6px;
      color: var(--text-muted);
      font-size: 13px;
      text-decoration: none;
      transition: all 0.13s;
    }
    .nav-child:hover { color: var(--text-primary); background: var(--nav-hover); }
    .nav-child.active { color: var(--accent); }
    .child-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

    /* Section divider */
    .nav-divider { height: 1px; background: var(--border); margin: 6px 4px; }

    /* Footer */
    .sidebar-footer {
      border-top: 1px solid var(--border);
      padding: 12px;
    }
    .user-mini { display: flex; align-items: center; gap: 10px; }
    .user-avatar {
      width: 32px; height: 32px; border-radius: 8px;
      background: var(--accent); color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; flex-shrink: 0;
    }
    .user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; }
    .user-role { font-size: 11px; color: var(--text-muted); }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  openGroups = signal(new Set<string>(['Configuration']));

  constructor(public auth: AuthService) {}

  toggleGroup(label: string): void {
    this.openGroups.update(groups => {
      const next = new Set(groups);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  visibleNavItems = computed(() => {
    const role = this.auth.userRole();
    return this.allNavItems.filter(item => {
      if (!item.roles) return true;
      return role && item.roles.includes(role as any);
    });
  });

  formatRole(role: string | undefined): string {
    if (!role) return '';
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  private allNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
      route: '/dashboard'
    },
    {
      label: 'Tickets',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>`,
      route: '/tickets'
    },
    {
      label: 'Reports',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
      route: '/reports',
      roles: ['ADMIN', 'PROJECT_MANAGER']
    },
    {
      label: 'Configuration',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>`,
      route: '/config',
      roles: ['ADMIN'],
      children: [
        { label: 'Projects', icon: '', route: '/config/projects' },
        { label: 'Employees', icon: '', route: '/config/employees' },
        { label: 'Authorization', icon: '', route: '/config/authorization' },
        { label: 'Shifts', icon: '', route: '/config/shifts' },
        { label: 'SLA Config', icon: '', route: '/config/sla' }
      ]
    },
    {
      label: 'Profile',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      route: '/profile'
    }
  ];
}
