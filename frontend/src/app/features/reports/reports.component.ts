import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../core/services/report.service';
import { ProjectService } from '../../core/services/project.service';
import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Project, Employee, SlaReport, EmployeePerformance, TicketTrend, ReportFilter } from '../../core/models/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="page-title-block">
          <h1 class="page-title">Reports & Analytics</h1>
          <p class="page-subtitle">Project-wise performance and SLA insights</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary" (click)="exportReport('csv')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="filter-card">
        <div class="filter-grid">
          <div>
            <label class="filter-label">Project</label>
            <select class="filter-select" [(ngModel)]="filter.projectId" (ngModelChange)="loadAll()">
              <option [ngValue]="undefined">All Projects</option>
              @for (p of projects(); track p.id) { <option [ngValue]="p.id">{{ p.projectName }}</option> }
            </select>
          </div>
          <div>
            <label class="filter-label">Employee</label>
            <select class="filter-select" [(ngModel)]="filter.employeeId" (ngModelChange)="loadAll()">
              <option [ngValue]="undefined">All Employees</option>
              @for (e of employees(); track e.id) { <option [ngValue]="e.id">{{ e.employeeName }}</option> }
            </select>
          </div>
          <div>
            <label class="filter-label">From Date</label>
            <input type="date" class="filter-input" [(ngModel)]="filter.dateFrom" (ngModelChange)="loadAll()" />
          </div>
          <div>
            <label class="filter-label">To Date</label>
            <input type="date" class="filter-input" [(ngModel)]="filter.dateTo" (ngModelChange)="loadAll()" />
          </div>
          <div>
            <label class="filter-label">Group By</label>
            <select class="filter-select" [(ngModel)]="filter.groupBy" (ngModelChange)="loadAll()">
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tab navigation -->
      <div class="report-tabs">
        @for (tab of tabs; track tab.id) {
          <button class="report-tab" [class.active]="activeTab() === tab.id" (click)="activeTab.set(tab.id)">
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- Tab: Overview -->
      @if (activeTab() === 'overview') {
        @if (loading()) {
          <div class="spinner-wrap"><div class="spinner"></div></div>
        } @else {
          <div class="reports-grid">
            <!-- Trend Chart -->
            <div class="card span-2">
              <div class="card-header">
                <span class="card-title">Ticket Volume Trend</span>
              </div>
              <div class="card-body">
                @if (trends().length > 0) {
                  <div class="chart-container">
                    <svg width="100%" height="200" viewBox="0 0 800 200" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="rCreatedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25"/>
                          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
                        </linearGradient>
                        <linearGradient id="rResolvedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stop-color="#10b981" stop-opacity="0.25"/>
                          <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
                        </linearGradient>
                      </defs>
                      <path [attr.d]="buildAreaPath(trends().map(t => t.created), 800, 180)" fill="url(#rCreatedGrad)"/>
                      <path [attr.d]="buildLinePath(trends().map(t => t.created), 800, 180)" fill="none" stroke="#3b82f6" stroke-width="2"/>
                      <path [attr.d]="buildAreaPath(trends().map(t => t.resolved), 800, 180)" fill="url(#rResolvedGrad)"/>
                      <path [attr.d]="buildLinePath(trends().map(t => t.resolved), 800, 180)" fill="none" stroke="#10b981" stroke-width="2"/>
                    </svg>
                    <div class="chart-legend">
                      <span class="legend-item"><span class="legend-dot" style="background:#3b82f6"></span>Created</span>
                      <span class="legend-item"><span class="legend-dot" style="background:#10b981"></span>Resolved</span>
                    </div>
                  </div>
                } @else {
                  <div class="empty-state small">No trend data available for selected filters.</div>
                }
              </div>
            </div>
          </div>
        }
      }

      <!-- Tab: SLA Report -->
      @if (activeTab() === 'sla') {
        @if (loading()) {
          <div class="spinner-wrap"><div class="spinner"></div></div>
        } @else {
          <div class="table-card">
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Total Tickets</th>
                    <th>Within SLA</th>
                    <th>Breached</th>
                    <th>Breach Rate</th>
                    <th>Avg Resolution (hrs)</th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of slaReports(); track r.projectId) {
                    <tr>
                      <td><span style="font-weight:600">{{ r.projectName }}</span></td>
                      <td>{{ r.totalTickets }}</td>
                      <td><span style="color:var(--success)">{{ r.withinSla }}</span></td>
                      <td><span style="color:var(--danger)">{{ r.breached }}</span></td>
                      <td>
                        <div class="breach-rate-cell">
                          <div class="breach-bar-wrap">
                            <div class="breach-bar" [style.width.%]="r.breachRate" [class.high]="r.breachRate > 20"></div>
                          </div>
                          <span class="breach-pct" [class.danger-text]="r.breachRate > 20">{{ r.breachRate | number:'1.1-1' }}%</span>
                        </div>
                      </td>
                      <td>{{ r.avgResolutionHours | number:'1.1-1' }}h</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="6"><div class="empty-state">No SLA data available</div></td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      }

      <!-- Tab: Employee Performance -->
      @if (activeTab() === 'employees') {
        @if (loading()) {
          <div class="spinner-wrap"><div class="spinner"></div></div>
        } @else {
          <div class="table-card">
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Assigned</th>
                    <th>Resolved</th>
                    <th>Resolution Rate</th>
                    <th>Avg Resolution (hrs)</th>
                    <th>SLA Breaches</th>
                  </tr>
                </thead>
                <tbody>
                  @for (e of empPerformance(); track e.employeeId) {
                    <tr>
                      <td>
                        <div class="emp-cell">
                          <div class="emp-avatar-sm">{{ e.employeeName.slice(0,2).toUpperCase() }}</div>
                          {{ e.employeeName }}
                        </div>
                      </td>
                      <td>{{ e.assignedTickets }}</td>
                      <td>{{ e.resolvedTickets }}</td>
                      <td>
                        <div class="rate-cell">
                          <div class="rate-bar-wrap">
                            <div class="rate-bar" [style.width.%]="resolveRate(e)"></div>
                          </div>
                          <span>{{ resolveRate(e) | number:'1.0-0' }}%</span>
                        </div>
                      </td>
                      <td>{{ e.avgResolutionHours | number:'1.1-1' }}h</td>
                      <td>
                        @if (e.slaBreachCount > 0) {
                          <span class="breach-count">{{ e.slaBreachCount }}</span>
                        } @else {
                          <span class="text-muted">0</span>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="6"><div class="empty-state">No employee performance data</div></td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .report-tabs { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 6px; }
    .report-tab { padding: 7px 16px; border-radius: 7px; border: none; background: none; color: var(--text-secondary); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; font-family: inherit; }
    .report-tab:hover { background: var(--nav-hover); color: var(--text-primary); }
    .report-tab.active { background: var(--accent); color: white; }

    .reports-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .span-2 { grid-column: span 2; }

    /* Chart */
    .chart-container { display: flex; flex-direction: column; gap: 12px; }
    .chart-legend { display: flex; gap: 16px; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); }
    .legend-dot { width: 8px; height: 8px; border-radius: 50%; }

    /* SLA */
    .breach-rate-cell { display: flex; align-items: center; gap: 8px; }
    .breach-bar-wrap { width: 80px; height: 6px; background: var(--bg-primary); border-radius: 3px; overflow: hidden; }
    .breach-bar { height: 100%; background: var(--success); border-radius: 3px; }
    .breach-bar.high { background: var(--danger); }
    .breach-pct { font-size: 12.5px; font-weight: 600; }
    .danger-text { color: var(--danger); }

    /* Employee */
    .emp-cell { display: flex; align-items: center; gap: 8px; }
    .emp-avatar-sm { width: 28px; height: 28px; border-radius: 7px; background: var(--accent); color: white; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .rate-cell { display: flex; align-items: center; gap: 8px; }
    .rate-bar-wrap { width: 70px; height: 6px; background: var(--bg-primary); border-radius: 3px; overflow: hidden; }
    .rate-bar { height: 100%; background: var(--success); border-radius: 3px; }
    .breach-count { font-size: 12px; font-weight: 700; color: var(--danger); background: var(--danger-light); padding: 2px 7px; border-radius: 4px; }

    .empty-state.small { padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px; }
  `]
})
export class ReportsComponent implements OnInit {
  projects = signal<Project[]>([]);
  employees = signal<Employee[]>([]);
  trends = signal<TicketTrend[]>([]);
  slaReports = signal<SlaReport[]>([]);
  empPerformance = signal<EmployeePerformance[]>([]);
  loading = signal(false);
  activeTab = signal<string>('overview');

  filter: ReportFilter = { groupBy: 'day' };

  readonly tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'sla', label: 'SLA Report' },
    { id: 'employees', label: 'Employee Performance' }
  ];

  constructor(
    private reportService: ReportService,
    private projectService: ProjectService,
    private employeeService: EmployeeService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.projectService.getAllList().subscribe(p => this.projects.set(p));
    this.employeeService.getAllList().subscribe(e => this.employees.set(e));

    // Pre-select active project
    const active = this.auth.activeProject();
    if (active?.id) this.filter.projectId = active.id;

    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    let remaining = 3;
    const done = () => { if (--remaining === 0) this.loading.set(false); };

    this.reportService.getTrendReport(this.filter).subscribe({ next: t => { this.trends.set(t); done(); }, error: done });
    this.reportService.getSlaReport(this.filter).subscribe({ next: s => { this.slaReports.set(s); done(); }, error: done });
    this.reportService.getEmployeeReport(this.filter).subscribe({ next: e => { this.empPerformance.set(e); done(); }, error: done });
  }

  exportReport(type: string): void {
    this.reportService.exportCsv(type, this.filter).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `report-${new Date().toISOString().slice(0,10)}.csv`;
        a.click(); URL.revokeObjectURL(url);
      },
      error: () => this.toast.error('Export failed.')
    });
  }

  buildLinePath(values: number[], width: number, height: number): string {
    if (!values.length) return '';
    const max = Math.max(...values, 1);
    const pts = values.map((v, i) => `${(i / (values.length - 1)) * width},${height - (v / max) * (height - 20)}`);
    return 'M' + pts.join('L');
  }

  buildAreaPath(values: number[], width: number, height: number): string {
    const line = this.buildLinePath(values, width, height);
    return `${line}L${width},${height}L0,${height}Z`;
  }

  resolveRate(e: EmployeePerformance): number {
    return e.assignedTickets ? (e.resolvedTickets / e.assignedTickets) * 100 : 0;
  }
}
