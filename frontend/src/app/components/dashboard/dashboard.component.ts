import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { DashboardStats } from '../../models/ticket.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-page">

      <div class="page-header">
        <div class="page-title">
          <span class="title-accent">■</span>
          DASHBOARD
          <span class="welcome-text">Welcome, {{ authService.currentUser()?.username }}</span>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid" *ngIf="stats">
        <div class="stat-card">
          <div class="stat-icon open-icon">○</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.openTickets }}</div>
            <div class="stat-label">OPEN TICKETS</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon progress-icon">◎</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.inProgressTickets }}</div>
            <div class="stat-label">IN PROGRESS</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon resolved-icon">●</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.resolvedTickets }}</div>
            <div class="stat-label">RESOLVED</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon total-icon">◈</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalTickets }}</div>
            <div class="stat-label">TOTAL TICKETS</div>
          </div>
        </div>
      </div>

      <!-- Loading stats -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div> Loading dashboard...
      </div>

      <!-- Quick Links -->
      <div class="quick-links">
        <div class="section-title"><span class="title-accent">■</span> QUICK ACTIONS</div>
        <div class="links-grid">
          <a routerLink="/tickets" class="quick-link-card">
            <span class="ql-icon">▦</span>
            <span class="ql-label">All Tickets</span>
          </a>
          <a routerLink="/tickets/new" class="quick-link-card ql-primary">
            <span class="ql-icon">＋</span>
            <span class="ql-label">New Ticket</span>
          </a>
          <a routerLink="/projects" class="quick-link-card">
            <span class="ql-icon">◈</span>
            <span class="ql-label">Projects</span>
          </a>
          <a routerLink="/employees" class="quick-link-card">
            <span class="ql-icon">◉</span>
            <span class="ql-label">Employees</span>
          </a>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-page { color: var(--text-primary); }

    .page-header { margin-bottom: 2rem; }

    .page-title {
      display: flex; align-items: center; gap: 0.75rem;
      font-family: 'Courier New', monospace; font-size: 1rem;
      font-weight: 700; letter-spacing: 0.15em; color: var(--text-secondary);
    }
    .title-accent { color: var(--accent); font-size: 0.8rem; }
    .welcome-text {
      font-size: 0.8rem; font-weight: 400; color: var(--text-muted);
      letter-spacing: 0.05em;
    }

    /* Stats */
    .stats-grid {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 1rem; margin-bottom: 2rem;
    }

    .stat-card {
      display: flex; align-items: center; gap: 1rem;
      padding: 1.25rem 1.5rem;
      background: var(--bg-surface); border: 1px solid var(--border);
      border-radius: 6px; transition: border-color 0.2s;
    }
    .stat-card:hover { border-color: var(--accent-border); }
    .stat-card-alert { border-color: rgba(255,107,107,0.3) !important; background: rgba(255,107,107,0.05); }
    .stat-card-alert:hover { border-color: rgba(255,107,107,0.6) !important; }
    .stat-value-alert { color: #ff6b6b !important; }

    .stat-icon { font-size: 1.6rem; line-height: 1; }
    .open-icon     { color: #ffa94d; }
    .progress-icon { color: var(--accent); }
    .resolved-icon { color: #69db7c; }
    .total-icon    { color: var(--text-muted); }

    .stat-value {
      font-family: 'Courier New', monospace; font-size: 1.8rem;
      font-weight: 700; color: var(--text-bright); line-height: 1;
    }
    .stat-label {
      font-family: 'Courier New', monospace; font-size: 0.65rem;
      font-weight: 700; letter-spacing: 0.1em; color: var(--text-muted);
      margin-top: 0.25rem;
    }

    /* Loading */
    .loading-state {
      display: flex; align-items: center; gap: 1rem;
      color: var(--text-muted); font-size: 0.85rem;
      padding: 2rem; margin-bottom: 2rem;
    }
    .spinner {
      width: 20px; height: 20px;
      border: 2px solid var(--accent-border); border-top-color: var(--accent);
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Quick Links */
    .quick-links {}
    .section-title {
      display: flex; align-items: center; gap: 0.6rem;
      font-family: 'Courier New', monospace; font-size: 0.75rem;
      font-weight: 700; letter-spacing: 0.12em; color: var(--text-muted);
      margin-bottom: 1rem;
    }

    .links-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;
    }

    .quick-link-card {
      display: flex; flex-direction: column; align-items: center;
      gap: 0.6rem; padding: 1.5rem 1rem;
      background: var(--bg-surface); border: 1px solid var(--border);
      border-radius: 6px; text-decoration: none;
      font-family: 'Courier New', monospace; font-size: 0.78rem;
      font-weight: 600; letter-spacing: 0.05em; color: var(--text-secondary);
      transition: all 0.2s;
    }
    .quick-link-card:hover {
      border-color: var(--accent-border); color: var(--accent);
      background: var(--accent-bg);
    }
    .quick-link-card.ql-primary {
      border-color: var(--accent-border); color: var(--accent);
      background: var(--accent-bg);
    }
    .ql-icon { font-size: 1.5rem; }
    .ql-label { font-size: 0.75rem; }

    @media (max-width: 900px) {
      .stats-grid, .links-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 500px) {
      .stats-grid, .links-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;

  constructor(
    public authService: AuthService,
    private ticketService: TicketService
  ) {}

  ngOnInit(): void {
    this.ticketService.getDashboardStats().subscribe({
      next: (s) => { this.stats = s; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
