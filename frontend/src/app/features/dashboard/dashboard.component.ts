import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { TicketService } from '../../core/services/ticket.service';
import { DashboardStats, TicketTrend, EmployeePerformance, PriorityDistribution, Ticket } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-wrapper">
      <!-- Page header -->
      <div class="page-header">
        <div class="page-title-block">
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">
            {{ auth.activeProject()?.projectName ?? 'All Projects' }} &bull;
            Real-time overview
          </p>
        </div>
        <div class="page-actions">
          <a routerLink="/tickets/new" class="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Ticket
          </a>
        </div>
      </div>

      <!-- Stats loading -->
      @if (statsLoading()) {
        <div class="stat-grid">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="stat-card skeleton-card">
              <div class="skeleton-icon"></div>
              <div class="skeleton-text">
                <div class="skeleton-line w60"></div>
                <div class="skeleton-line w40"></div>
              </div>
            </div>
          }
        </div>
      } @else if (stats()) {
        <!-- KPI Cards -->
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(59,130,246,0.12);color:#3b82f6">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats()!.totalTickets }}</div>
              <div class="stat-label">Total Tickets</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(239,68,68,0.12);color:#ef4444">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats()!.openTickets }}</div>
              <div class="stat-label">Open Tickets</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(245,158,11,0.12);color:#f59e0b">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats()!.inProgressTickets }}</div>
              <div class="stat-label">In Progress</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(139,92,246,0.12);color:#8b5cf6">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats()!.onHoldTickets }}</div>
              <div class="stat-label">On Hold</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(16,185,129,0.12);color:#10b981">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats()!.resolvedTickets }}</div>
              <div class="stat-label">Resolved</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(239,68,68,0.15);color:#ef4444">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div class="stat-info">
              <div class="stat-value sla-breach">{{ stats()!.slaBreachedTickets }}</div>
              <div class="stat-label">SLA Breached</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(245,158,11,0.12);color:#f59e0b">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats()!.criticalTickets }}</div>
              <div class="stat-label">Critical (P1)</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(6,182,212,0.12);color:#06b6d4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats()!.avgResolutionHours | number:'1.1-1' }}h</div>
              <div class="stat-label">Avg Resolution</div>
            </div>
          </div>
        </div>
      }

      <!-- Two column charts -->
      <div class="dashboard-grid">
        <!-- Priority Distribution -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Priority Distribution</span>
          </div>
          <div class="card-body">
            @if (priorities().length > 0) {
              <div class="priority-bars">
                @for (p of priorities(); track p.priority) {
                  <div class="priority-row">
                    <span class="prio-label">{{ p.priority }}</span>
                    <div class="prio-bar-wrap">
                      <div class="prio-bar" [style.width.%]="p.percentage" [class]="'prio-' + p.priority.toLowerCase()"></div>
                    </div>
                    <span class="prio-count">{{ p.count }}</span>
                    <span class="prio-pct">{{ p.percentage | number:'1.0-0' }}%</span>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-state small">No data available</div>
            }
          </div>
        </div>

        <!-- Trend Chart (SVG-based) -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Ticket Trend (30 days)</span>
          </div>
          <div class="card-body">
            @if (trends().length > 0) {
              <div class="trend-chart">
                <svg width="100%" height="160" viewBox="0 0 400 160" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3"/>
                      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
                    </linearGradient>
                    <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#10b981" stop-opacity="0.3"/>
                      <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
                    </linearGradient>
                  </defs>
                  <!-- Created area -->
                  <path [attr.d]="createdAreaPath()" fill="url(#createdGrad)" />
                  <path [attr.d]="createdLinePath()" fill="none" stroke="#3b82f6" stroke-width="1.5"/>
                  <!-- Resolved area -->
                  <path [attr.d]="resolvedAreaPath()" fill="url(#resolvedGrad)" />
                  <path [attr.d]="resolvedLinePath()" fill="none" stroke="#10b981" stroke-width="1.5"/>
                </svg>
                <div class="trend-legend">
                  <span class="legend-item"><span class="legend-dot created"></span>Created</span>
                  <span class="legend-item"><span class="legend-dot resolved"></span>Resolved</span>
                </div>
              </div>
            } @else {
              <div class="empty-state small">No trend data</div>
            }
          </div>
        </div>
      </div>

      <!-- Recent Tickets + Employee Performance -->
      <div class="dashboard-grid mt16">
        <!-- Recent Tickets -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Recent Tickets</span>
            <a routerLink="/tickets" class="btn btn-ghost btn-sm">View all</a>
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>SLA</th>
                </tr>
              </thead>
              <tbody>
                @for (t of recentTickets(); track t.id) {
                  <tr>
                    <td>
                      <a class="ticket-link" [routerLink]="['/tickets', t.id]">{{ t.ticketNumber }}</a>
                    </td>
                    <td><span class="badge" [class]="'badge-' + t.priority?.toLowerCase()">{{ t.priority }}</span></td>
                    <td><span class="status-badge" [class]="statusClass(t.currentStatus)">{{ formatStatus(t.currentStatus) }}</span></td>
                    <td>
                      @if (t.slaBreached) {
                        <span class="sla-badge breached">BREACHED</span>
                      } @else if (t.slaRemainingHours != null) {
                        <span class="sla-badge ok">{{ t.slaRemainingHours | number:'1.0-1' }}h left</span>
                      } @else {
                        <span class="text-muted">—</span>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="4" class="empty-cell">No recent tickets</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Employee Performance -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Employee Performance</span>
          </div>
          <div class="card-body">
            @for (emp of performance(); track emp.employeeId) {
              <div class="perf-row">
                <div class="perf-avatar">{{ emp.employeeName.slice(0,2).toUpperCase() }}</div>
                <div class="perf-info">
                  <div class="perf-name">{{ emp.employeeName }}</div>
                  <div class="perf-meta">{{ emp.resolvedTickets }}/{{ emp.assignedTickets }} resolved &bull; {{ emp.avgResolutionHours | number:'1.0-1' }}h avg</div>
                  <div class="perf-bar-wrap">
                    <div class="perf-bar" [style.width.%]="getResolveRate(emp)"></div>
                  </div>
                </div>
                @if (emp.slaBreachCount > 0) {
                  <span class="breach-chip">{{ emp.slaBreachCount }} breaches</span>
                }
              </div>
            } @empty {
              <div class="empty-state small">No performance data</div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .mt16 { margin-top: 16px; }
    .sla-breach { color: var(--danger); }

    /* Skeleton */
    .skeleton-card { animation: pulse 1.5s ease infinite; }
    .skeleton-icon { width: 40px; height: 40px; border-radius: 9px; background: var(--border); }
    .skeleton-text { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .skeleton-line { height: 10px; border-radius: 4px; background: var(--border); }
    .skeleton-line.w60 { width: 60%; }
    .skeleton-line.w40 { width: 40%; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

    /* Priority bars */
    .priority-bars { display: flex; flex-direction: column; gap: 12px; }
    .priority-row { display: flex; align-items: center; gap: 10px; }
    .prio-label { font-size: 12px; font-weight: 700; width: 26px; color: var(--text-muted); }
    .prio-bar-wrap { flex: 1; height: 8px; background: var(--bg-primary); border-radius: 4px; overflow: hidden; }
    .prio-bar { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
    .prio-p1 { background: var(--danger); }
    .prio-p2 { background: var(--warning); }
    .prio-p3 { background: #eab308; }
    .prio-p4 { background: var(--success); }
    .prio-count { font-size: 12px; font-weight: 600; color: var(--text-primary); width: 28px; text-align: right; }
    .prio-pct { font-size: 11px; color: var(--text-muted); width: 36px; text-align: right; }

    /* Trend */
    .trend-chart { display: flex; flex-direction: column; gap: 12px; }
    .trend-legend { display: flex; gap: 16px; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); }
    .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
    .legend-dot.created { background: #3b82f6; }
    .legend-dot.resolved { background: #10b981; }

    /* SLA badges */
    .sla-badge { font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 4px; }
    .sla-badge.breached { background: var(--danger-light); color: var(--danger); }
    .sla-badge.ok { background: var(--success-light); color: var(--success); }

    /* Employee performance */
    .perf-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
    .perf-row:last-child { border-bottom: none; }
    .perf-avatar { width: 34px; height: 34px; border-radius: 8px; background: var(--accent); color: white; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .perf-info { flex: 1; min-width: 0; }
    .perf-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .perf-meta { font-size: 11.5px; color: var(--text-muted); margin: 2px 0; }
    .perf-bar-wrap { height: 4px; background: var(--bg-primary); border-radius: 2px; margin-top: 5px; overflow: hidden; }
    .perf-bar { height: 100%; background: var(--success); border-radius: 2px; transition: width 0.5s; }
    .breach-chip { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 3px; background: var(--danger-light); color: var(--danger); white-space: nowrap; }

    .empty-cell { text-align: center; padding: 24px; color: var(--text-muted); font-size: 13px; }
    .empty-state.small { padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px; }

    @media (max-width: 900px) {
      .dashboard-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats = signal<DashboardStats | null>(null);
  trends = signal<TicketTrend[]>([]);
  performance = signal<EmployeePerformance[]>([]);
  priorities = signal<PriorityDistribution[]>([]);
  recentTickets = signal<Ticket[]>([]);
  statsLoading = signal(true);

  private destroy$ = new Subject<void>();

  constructor(
    public auth: AuthService,
    private dashboardService: DashboardService,
    private ticketService: TicketService
  ) {}

  ngOnInit(): void {
    this.loadData();

    // Reload when project switches
    effect(() => {
      const projectId = this.auth.activeProjectId();
      this.loadData(projectId ?? undefined);
    }, { allowSignalWrites: true });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(projectId?: number): void {
    this.statsLoading.set(true);

    this.dashboardService.getStats(projectId).pipe(takeUntil(this.destroy$)).subscribe({
      next: s => { this.stats.set(s); this.statsLoading.set(false); },
      error: () => this.statsLoading.set(false)
    });

    this.dashboardService.getTrends(projectId).pipe(takeUntil(this.destroy$)).subscribe(t => this.trends.set(t));
    this.dashboardService.getEmployeePerformance(projectId).pipe(takeUntil(this.destroy$)).subscribe(p => this.performance.set(p));
    this.dashboardService.getPriorityDistribution(projectId).pipe(takeUntil(this.destroy$)).subscribe(p => this.priorities.set(p));

    const filter = projectId ? { projectId } : {};
    this.ticketService.getAll(filter, 0, 8).pipe(takeUntil(this.destroy$)).subscribe(r => {
      this.recentTickets.set(r.data?.content ?? []);
    });
  }

  // SVG path helpers for trend chart
  createdLinePath = computed(() => this.buildLinePath(this.trends().map(t => t.created)));
  resolvedLinePath = computed(() => this.buildLinePath(this.trends().map(t => t.resolved)));
  createdAreaPath = computed(() => this.buildAreaPath(this.trends().map(t => t.created)));
  resolvedAreaPath = computed(() => this.buildAreaPath(this.trends().map(t => t.resolved)));

  private buildLinePath(values: number[]): string {
    if (!values.length) return '';
    const max = Math.max(...values, 1);
    const pts = values.map((v, i) => `${(i / (values.length - 1)) * 400},${160 - (v / max) * 140}`);
    return 'M' + pts.join('L');
  }

  private buildAreaPath(values: number[]): string {
    if (!values.length) return '';
    const line = this.buildLinePath(values);
    return `${line}L400,160L0,160Z`;
  }

  statusClass(status?: string): string {
    const map: Record<string, string> = {
      OPEN: 'status-open', IN_PROGRESS: 'status-progress',
      ON_HOLD: 'status-hold', RESOLVED: 'status-resolved', CLOSED: 'status-closed'
    };
    return status ? (map[status] ?? '') : '';
  }

  formatStatus(status?: string): string {
    return status ? status.replace(/_/g, ' ') : '—';
  }

  getResolveRate(emp: EmployeePerformance): number {
    return emp.assignedTickets ? (emp.resolvedTickets / emp.assignedTickets) * 100 : 0;
  }
}
