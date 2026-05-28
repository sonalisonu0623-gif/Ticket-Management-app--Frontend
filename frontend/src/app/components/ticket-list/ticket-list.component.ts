import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, forkJoin } from 'rxjs';
import { TicketService }   from '../../services/ticket.service';
import { EmployeeService } from '../../services/employee.service';
import { AuthService }     from '../../services/auth.service';
import {
  Ticket, CurrentStatus, Priority, DashboardStats,
  PRIORITY_LABELS, STATUS_LABELS
} from '../../models/ticket.model';
import { Project } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css']
})
export class TicketListComponent implements OnInit, OnDestroy {
  tickets: Ticket[] = [];
  dashboardStats: DashboardStats | null = null;
  loading = false;
  statsLoading = false;
  deleteLoading: number | null = null;
  error: string | null = null;
  successMessage: string | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Search & Filter
  searchQuery   = '';
  filterStatus:   CurrentStatus | '' = '';
  filterPriority: Priority | ''      = '';
  filterProject   = '';               // PM: locked to their project; ADMIN: free select

  // PM-specific: list of projects the logged-in PM is assigned to
  myProjects: Project[] = [];
  allProjects: Project[] = [];

  searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  priorityLabels = PRIORITY_LABELS;
  statusLabels   = STATUS_LABELS;

  statusOptions:   { value: CurrentStatus | '', label: string }[] = [
    { value: '', label: 'All Statuses' }, { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' }, { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' }
  ];
  priorityOptions: { value: Priority | '', label: string }[] = [
    { value: '', label: 'All Priorities' }, { value: 'P1_CRITICAL', label: 'P1 - Critical' },
    { value: 'P2_HIGH', label: 'P2 - High' }, { value: 'P3_MEDIUM', label: 'P3 - Medium' },
    { value: 'P4_LOW', label: 'P4 - Low' }
  ];

  constructor(
    private ticketService: TicketService,
    private employeeService: EmployeeService,
    private projectService: ProjectService,
    public authService: AuthService
  ) {}

  get isAdmin(): boolean { return this.authService.isAdmin(); }
  get isPM(): boolean    { return this.authService.isProjectManager(); }

  /** Visible project dropdown: ADMIN sees all; PM sees only their projects */
  get visibleProjects(): Project[] {
    return this.isAdmin ? this.allProjects : this.myProjects;
  }

  ngOnInit(): void {
    this.loadDashboardStats();

    if (this.isPM) {
      // Load the PM's own employee record to get their project list
      this.loadPmProjects();
    } else {
      // ADMIN: load all projects for the dropdown filter
      this.loadAllProjects();
      this.loadTickets();
    }

    this.searchSubject.pipe(
      debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$)
    ).subscribe(() => { this.currentPage = 0; this.loadTickets(); });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  private loadPmProjects(): void {
    // Get the current user's employee record via profile — the employeeId is in the JWT payload
    const userId = this.authService.currentUser()?.employeeId;
    if (!userId) { this.loadTickets(); return; }

    this.employeeService.getEmployeeById(userId).subscribe({
      next: emp => {
        this.myProjects = (emp.projects ?? []).map(p => ({
          id: p.id, projectCode: p.projectCode, projectName: p.projectName
        } as Project));

        // Auto-select first project if only one assigned
        if (this.myProjects.length === 1) {
          this.filterProject = this.myProjects[0].projectName;
        }
        this.loadTickets();
      },
      error: () => { this.loadTickets(); }
    });
  }

  private loadAllProjects(): void {
    this.projectService.getProjects(0, 200).subscribe({
      next: r => this.allProjects = r.data?.content ?? [],
      error: () => {}
    });
  }

  loadDashboardStats(): void {
    this.statsLoading = true;
    this.ticketService.getDashboardStats().subscribe({
      next: s => { this.dashboardStats = s; this.statsLoading = false; },
      error: () => { this.statsLoading = false; }
    });
  }

  loadTickets(): void {
    this.loading = true;
    this.error = null;

    // PM always filters by project — if no project selected yet, wait
    if (this.isPM && !this.filterProject && this.myProjects.length > 1) {
      // Show all their projects' tickets by searching with no project filter but using search
      // Let them pick a project from the dropdown first — show empty state
      this.tickets = [];
      this.totalElements = 0;
      this.loading = false;
      return;
    }

    this.ticketService.searchTickets({
      ticketId:          this.searchQuery || undefined,
      projectAssignment: this.filterProject || undefined,
      status:            (this.filterStatus  as CurrentStatus) || undefined,
      priority:          (this.filterPriority as Priority)     || undefined,
      page:    this.currentPage,
      size:    this.pageSize,
      sortBy:  'createdAt',
      sortDir: 'desc'
    }).subscribe({
      next: res => {
        this.tickets       = res.data.content;
        this.totalElements = res.data.totalElements;
        this.totalPages    = res.data.totalPages;
        this.loading = false;
      },
      error: () => { this.error = 'Failed to load tickets.'; this.loading = false; }
    });
  }

  onSearchChange():  void { this.searchSubject.next(this.searchQuery); }
  onFilterChange():  void { this.currentPage = 0; this.loadTickets(); }

  clearFilters(): void {
    this.searchQuery   = '';
    this.filterStatus  = '';
    this.filterPriority = '';
    // PM: reset to first project (don't clear their project context)
    if (this.isAdmin) this.filterProject = '';
    else if (this.myProjects.length === 1) this.filterProject = this.myProjects[0].projectName;
    this.currentPage = 0;
    this.loadTickets();
  }

  deleteTicket(id: number): void {
    if (!confirm('Delete this ticket? This action cannot be undone.')) return;
    this.deleteLoading = id;
    this.ticketService.deleteTicket(id).subscribe({
      next: () => {
        this.successMessage = 'Ticket deleted.';
        this.deleteLoading = null;
        this.loadTickets(); this.loadDashboardStats();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: () => { this.error = 'Delete failed.'; this.deleteLoading = null; }
    });
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages) { this.currentPage = p; this.loadTickets(); }
  }

  get pages(): number[] {
    const r = [], s = Math.max(0, this.currentPage - 2), e = Math.min(this.totalPages-1, this.currentPage+2);
    for (let i = s; i <= e; i++) r.push(i);
    return r;
  }

  getPriorityClass(p: Priority): string {
    const m: Record<Priority,string> = {
      P1_CRITICAL: 'priority-critical', P2_HIGH: 'priority-high',
      P3_MEDIUM: 'priority-medium', P4_LOW: 'priority-low'
    };
    return m[p] ?? '';
  }

  getStatusClass(s: CurrentStatus): string {
    const m: Record<CurrentStatus,string> = {
      OPEN: 'status-open', IN_PROGRESS: 'status-progress',
      RESOLVED: 'status-resolved', CLOSED: 'status-closed'
    };
    return m[s] ?? '';
  }
}
