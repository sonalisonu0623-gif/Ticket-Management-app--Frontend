import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../core/services/ticket.service';
import { ProjectService } from '../../../core/services/project.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Ticket, TicketFilter, Project, Employee, PageResponse } from '../../../core/models/models';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="page-title-block">
          <h1 class="page-title">Tickets</h1>
          <p class="page-subtitle">{{ pagination().totalElements }} total tickets</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary btn-sm" (click)="filterOpen.update(v => !v)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filters {{ activeFilterCount() > 0 ? '(' + activeFilterCount() + ')' : '' }}
          </button>
          <a routerLink="/tickets/new" class="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Ticket
          </a>
        </div>
      </div>

      <!-- Filter Panel -->
      @if (filterOpen()) {
        <div class="filter-card">
          <div class="filter-grid">
            <div>
              <label class="filter-label">Search</label>
              <input class="filter-input" placeholder="Ticket # or description..." [(ngModel)]="filter.ticketNumber" (ngModelChange)="onFilterChange()" />
            </div>
            @if (auth.isAdmin()) {
              <div>
                <label class="filter-label">Project</label>
                <select class="filter-select" [(ngModel)]="filter.projectId" (ngModelChange)="onFilterChange()">
                  <option [ngValue]="undefined">All Projects</option>
                  @for (p of projects(); track p.id) {
                    <option [ngValue]="p.id">{{ p.projectName }}</option>
                  }
                </select>
              </div>
            }
            <div>
              <label class="filter-label">Priority</label>
              <select class="filter-select" [(ngModel)]="filter.priority" (ngModelChange)="onFilterChange()">
                <option value="">All Priorities</option>
                <option value="P1">P1 - Critical</option>
                <option value="P2">P2 - High</option>
                <option value="P3">P3 - Medium</option>
                <option value="P4">P4 - Low</option>
              </select>
            </div>
            <div>
              <label class="filter-label">Status</label>
              <select class="filter-select" [(ngModel)]="filter.currentStatus" (ngModelChange)="onFilterChange()">
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div>
              <label class="filter-label">Support Level</label>
              <select class="filter-select" [(ngModel)]="filter.supportLevel" (ngModelChange)="onFilterChange()">
                <option value="">All Levels</option>
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
              </select>
            </div>
            <div>
              <label class="filter-label">Assignee</label>
              <select class="filter-select" [(ngModel)]="filter.employeeId" (ngModelChange)="onFilterChange()">
                <option [ngValue]="undefined">All Employees</option>
                @for (e of employees(); track e.id) {
                  <option [ngValue]="e.id">{{ e.employeeName }}</option>
                }
              </select>
            </div>
            <div>
              <label class="filter-label">From Date</label>
              <input type="date" class="filter-input" [(ngModel)]="filter.dateFrom" (ngModelChange)="onFilterChange()" />
            </div>
            <div>
              <label class="filter-label">To Date</label>
              <input type="date" class="filter-input" [(ngModel)]="filter.dateTo" (ngModelChange)="onFilterChange()" />
            </div>
            <div>
              <label class="filter-label">SLA</label>
              <select class="filter-select" [(ngModel)]="slaFilter" (ngModelChange)="onSlaFilterChange()">
                <option value="">All</option>
                <option value="true">Breached Only</option>
                <option value="false">Within SLA</option>
              </select>
            </div>
          </div>
          <div class="filter-footer">
            <button class="btn btn-ghost btn-sm" (click)="resetFilters()">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
              Reset Filters
            </button>
            <span class="filter-count-info">{{ pagination().totalElements }} results</span>
          </div>
        </div>
      }

      <!-- Table -->
      <div class="table-card">
        <div class="table-toolbar">
          <span class="table-info">
            Showing {{ tickets().length }} of {{ pagination().totalElements }}
          </span>
          <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
            <label class="filter-label" style="margin:0">Per page:</label>
            <select class="filter-select" style="width:80px" [(ngModel)]="pageSize" (ngModelChange)="loadTickets()">
              <option [ngValue]="10">10</option>
              <option [ngValue]="25">25</option>
              <option [ngValue]="50">50</option>
            </select>
          </div>
        </div>

        @if (loading()) {
          <div class="spinner-wrap">
            <div class="spinner"></div>
            <span style="color:var(--text-muted);font-size:13px">Loading tickets...</span>
          </div>
        } @else {
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="sortable" (click)="sort('ticketNumber')">Ticket # <span class="sort-icon">{{ sortIcon('ticketNumber') }}</span></th>
                  <th>Project</th>
                  <th>Description</th>
                  <th class="sortable" (click)="sort('priority')">Priority</th>
                  <th>Status</th>
                  <th>Assignee</th>
                  <th>SLA</th>
                  <th class="sortable" (click)="sort('createdAt')">Created</th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (ticket of tickets(); track ticket.id) {
                  <tr [class.sla-row-breach]="ticket.slaBreached">
                    <td>
                      <a class="ticket-link" [routerLink]="['/tickets', ticket.id]">{{ ticket.ticketNumber }}</a>
                    </td>
                    <td>
                      <span class="proj-chip">{{ ticket.projectName }}</span>
                    </td>
                    <td class="desc-cell" [title]="ticket.issueDescription">{{ ticket.issueDescription }}</td>
                    <td>
                      <span class="badge" [class]="priorityClass(ticket.priority)">{{ ticket.priority }}</span>
                    </td>
                    <td>
                      <span class="status-badge" [class]="statusClass(ticket.currentStatus)">{{ formatStatus(ticket.currentStatus) }}</span>
                    </td>
                    <td>
                      @if (ticket.assignedEmployeeName) {
                        <div class="assignee">
                          <div class="avatar" style="width:22px;height:22px;font-size:9px">
                            {{ ticket.assignedEmployeeName.slice(0,2).toUpperCase() }}
                          </div>
                          {{ ticket.assignedEmployeeName }}
                        </div>
                      } @else {
                        <span class="text-muted">Unassigned</span>
                      }
                    </td>
                    <td>
                      @if (ticket.slaBreached) {
                        <span class="sla-badge breached">BREACHED</span>
                      } @else if (ticket.slaRemainingHours != null) {
                        <span class="sla-badge ok">{{ ticket.slaRemainingHours | number:'1.0-1' }}h</span>
                      } @else {
                        <span class="text-muted">—</span>
                      }
                    </td>
                    <td class="date-cell">{{ ticket.createdAt | date:'dd MMM, HH:mm' }}</td>
                    <td>
                      <div class="action-group">
                        <a class="action-btn edit" [routerLink]="['/tickets', ticket.id]" title="View">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </a>
                        @if (canEdit()) {
                          <a class="action-btn edit" [routerLink]="['/tickets/edit', ticket.id]" title="Edit">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </a>
                          @if (auth.isAdmin()) {
                            <button class="action-btn delete" (click)="deleteTicket(ticket)" title="Delete">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                            </button>
                          }
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="9">
                      <div class="empty-state">
                        <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                        </svg>
                        <p class="empty-title">No tickets found</p>
                        <p class="empty-sub">Try adjusting your filters or <a routerLink="/tickets/new">create a new ticket</a></p>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (pagination().totalPages > 1) {
            <div class="pagination">
              <button class="page-btn" [disabled]="currentPage() === 0" (click)="goToPage(0)">«</button>
              <button class="page-btn" [disabled]="currentPage() === 0" (click)="goToPage(currentPage() - 1)">‹</button>
              @for (p of pageNumbers(); track p) {
                @if (p === -1) {
                  <span class="page-ellipsis">…</span>
                } @else {
                  <button class="page-btn" [class.active]="p === currentPage()" (click)="goToPage(p)">{{ p + 1 }}</button>
                }
              }
              <button class="page-btn" [disabled]="currentPage() === pagination().totalPages - 1" (click)="goToPage(currentPage() + 1)">›</button>
              <button class="page-btn" [disabled]="currentPage() === pagination().totalPages - 1" (click)="goToPage(pagination().totalPages - 1)">»</button>
              <span class="page-info">{{ pagination().totalElements }} total</span>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .sla-row-breach td { background: rgba(239,68,68,0.03); }
    .sla-badge { font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 4px; }
    .sla-badge.breached { background: var(--danger-light); color: var(--danger); border: 1px solid rgba(239,68,68,0.25); }
    .sla-badge.ok { background: var(--success-light); color: var(--success); }
    .proj-chip { font-size: 11.5px; background: var(--accent-light); color: var(--accent); padding: 2px 7px; border-radius: 4px; white-space: nowrap; }
    .table-info { font-size: 12.5px; color: var(--text-muted); }
    .filter-count-info { font-size: 12px; color: var(--text-muted); margin-left: auto; }
  `]
})
export class TicketListComponent implements OnInit {
  tickets = signal<Ticket[]>([]);
  projects = signal<Project[]>([]);
  employees = signal<Employee[]>([]);
  loading = signal(true);
  filterOpen = signal(false);
  currentPage = signal(0);
  pageSize = 10;
  sortBy = 'createdAt';
  sortDirection = 'desc';
  slaFilter = '';
  pagination = signal<PageResponse<Ticket>>({
    content: [], totalElements: 0, totalPages: 0, size: 10, number: 0, first: true, last: true
  });

  filter: TicketFilter = {};

  constructor(
    private ticketService: TicketService,
    private projectService: ProjectService,
    private employeeService: EmployeeService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadTickets();

    // Pre-populate project filter for non-admins
    const activeProject = this.auth.activeProject();
    if (!this.auth.isAdmin() && activeProject?.id) {
      this.filter.projectId = activeProject.id;
    }
  }

  canEdit = computed(() => this.auth.hasRole('ADMIN', 'PROJECT_MANAGER', 'L1_SUPPORT', 'L2_SUPPORT'));

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.filter.ticketNumber) count++;
    if (this.filter.projectId) count++;
    if (this.filter.priority) count++;
    if (this.filter.currentStatus) count++;
    if (this.filter.supportLevel) count++;
    if (this.filter.employeeId) count++;
    if (this.filter.dateFrom) count++;
    if (this.filter.dateTo) count++;
    if (this.filter.slaBreached != null) count++;
    return count;
  });

  pageNumbers = computed(() => {
    const total = this.pagination().totalPages;
    const cur = this.currentPage();
    const pages: number[] = [];
    if (total <= 7) {
      for (let i = 0; i < total; i++) pages.push(i);
    } else {
      pages.push(0);
      if (cur > 2) pages.push(-1);
      for (let i = Math.max(1, cur - 1); i <= Math.min(total - 2, cur + 1); i++) pages.push(i);
      if (cur < total - 3) pages.push(-1);
      pages.push(total - 1);
    }
    return pages;
  });

  private loadDropdowns(): void {
    this.projectService.getAllList().subscribe(p => this.projects.set(p));
    this.employeeService.getAllList(this.filter.projectId).subscribe(e => this.employees.set(e));
  }

  loadTickets(): void {
    this.loading.set(true);
    this.ticketService.getAll(this.filter, this.currentPage(), this.pageSize, this.sortBy, this.sortDirection).subscribe({
      next: res => {
        if (res.data) {
          this.tickets.set(res.data.content);
          this.pagination.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFilterChange(): void {
    this.currentPage.set(0);
    this.loadTickets();
  }

  onSlaFilterChange(): void {
    this.filter.slaBreached = this.slaFilter === '' ? undefined : this.slaFilter === 'true';
    this.onFilterChange();
  }

  resetFilters(): void {
    this.filter = {};
    this.slaFilter = '';
    this.onFilterChange();
  }

  sort(field: string): void {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'desc';
    }
    this.loadTickets();
  }

  sortIcon(field: string): string {
    if (this.sortBy !== field) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadTickets();
  }

  deleteTicket(ticket: Ticket): void {
    if (!confirm(`Delete ticket ${ticket.ticketNumber}?`)) return;
    this.ticketService.delete(ticket.id!).subscribe({
      next: () => { this.toast.success('Ticket deleted.'); this.loadTickets(); },
      error: () => this.toast.error('Failed to delete ticket.')
    });
  }

  priorityClass(p?: string): string {
    const map: Record<string, string> = { P1: 'badge-p1', P2: 'badge-p2', P3: 'badge-p3', P4: 'badge-p4' };
    return p ? (map[p] ?? '') : '';
  }

  statusClass(s?: string): string {
    const map: Record<string, string> = {
      OPEN: 'status-open', IN_PROGRESS: 'status-progress',
      ON_HOLD: 'status-hold', RESOLVED: 'status-resolved', CLOSED: 'status-closed'
    };
    return s ? (map[s] ?? '') : '';
  }

  formatStatus(s?: string): string {
    return s ? s.replace(/_/g, ' ') : '—';
  }
}
