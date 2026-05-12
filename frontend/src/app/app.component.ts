import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-shell">

      <header class="app-header">
        <div class="header-left">
          <div class="logo-wrap">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <rect width="30" height="30" rx="7" fill="#1e40af"/>
              <rect x="1" y="1" width="28" height="28" rx="6" fill="#2563eb"/>
              <path d="M8 10h14M8 15h10M8 20h7" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="brand">
            <span class="brand-name">TicketOps</span>
            <span class="brand-tagline">Enterprise Support System</span>
          </div>
        </div>

        <nav class="header-nav">
          <a routerLink="/tickets"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{exact: true}"
             class="nav-link">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
            All Tickets
          </a>
          <a routerLink="/tickets/new"
             routerLinkActive="active"
             class="nav-link">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
            </svg>
            New Ticket
          </a>
        </nav>

        <div class="header-right">
          <div class="env-badge">PRODUCTION</div>
        </div>
      </header>

      <main class="app-main">
        <router-outlet></router-outlet>
      </main>

      <footer class="app-footer">
        TicketOps &nbsp;·&nbsp; Enterprise Ticket Management &nbsp;·&nbsp; v1.0.0
      </footer>

    </div>
  `,
  styles: [`
    .app-footer {
      text-align: center;
      padding: 14px;
      font-size: 11px;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
      letter-spacing: 0.3px;
    }
    .logo-wrap { display: flex; align-items: center; }
    .env-badge {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 1px;
      color: var(--success);
      background: rgba(16,185,129,0.1);
      border: 1px solid rgba(16,185,129,0.25);
      border-radius: 4px;
      padding: 3px 7px;
    }
    .header-right { display: flex; align-items: center; }
  `]
})
export class AppComponent {}
