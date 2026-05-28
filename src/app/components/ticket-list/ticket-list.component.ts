import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { TicketService } from '../../services/ticket.service';
import {
  Ticket,
  CurrentStatus,
  Priority,
  DashboardStats,
  PRIORITY_LABELS,
  STATUS_LABELS
} from '../../models/ticket.model';

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
  searchQuery = '';
  filterStatus: CurrentStatus | '' = '';
  filterPriority: Priority | '' = '';
  filterProject = '';

  searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  priorityLabels = PRIORITY_LABELS;
  statusLabels = STATUS_LABELS;

  statusOptions: { value: CurrentStatus | '', label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' }
  ];

  priorityOptions: { value: Priority | '', label: string }[] = [
    { value: '', label: 'All Priorities' },
    { value: 'P1_CRITICAL', label: 'P1 - Critical' },
    { value: 'P2_HIGH', label: 'P2 - High' },
    { value: 'P3_MEDIUM', label: 'P3 - Medium' },
    { value: 'P4_LOW', label: 'P4 - Low' }
  ];

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadTickets();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadTickets();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardStats(): void {
    this.statsLoading = true;
    this.ticketService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.statsLoading = false;
      },
      error: () => { this.statsLoading = false; }
    });
  }

  loadTickets(): void {
    this.loading = true;
    this.error = null;

    const hasFilters = this.searchQuery || this.filterStatus || this.filterPriority || this.filterProject;

    if (hasFilters) {
      this.ticketService.searchTickets({
        ticketId: this.searchQuery || undefined,
        projectAssignment: this.filterProject || undefined,
        status: (this.filterStatus as CurrentStatus) || undefined,
        priority: (this.filterPriority as Priority) || undefined,
        page: this.currentPage,
        size: this.pageSize,
        sortBy: 'createdAt',
        sortDir: 'desc'
      }).subscribe({
        next: (res) => {
          this.tickets = res.data.content;
          this.totalElements = res.data.totalElements;
          this.totalPages = res.data.totalPages;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load tickets. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.ticketService.getTickets(this.currentPage, this.pageSize).subscribe({
        next: (res) => {
          this.tickets = res.data.content;
          this.totalElements = res.data.totalElements;
          this.totalPages = res.data.totalPages;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load tickets. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadTickets();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterStatus = '';
    this.filterPriority = '';
    this.filterProject = '';
    this.currentPage = 0;
    this.loadTickets();
  }

  deleteTicket(id: number): void {
    if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) return;

    this.deleteLoading = id;
    this.ticketService.deleteTicket(id).subscribe({
      next: () => {
        this.successMessage = 'Ticket deleted successfully';
        this.deleteLoading = null;
        this.loadTickets();
        this.loadDashboardStats();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: () => {
        this.error = 'Failed to delete ticket.';
        this.deleteLoading = null;
        setTimeout(() => this.error = null, 3000);
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadTickets();
    }
  }

  get pages(): number[] {
    const range = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  getPriorityClass(priority: Priority): string {
    const classes: Record<Priority, string> = {
      P1_CRITICAL: 'priority-critical',
      P2_HIGH: 'priority-high',
      P3_MEDIUM: 'priority-medium',
      P4_LOW: 'priority-low'
    };
    return classes[priority] || '';
  }

  getStatusClass(status: CurrentStatus): string {
    const classes: Record<CurrentStatus, string> = {
      OPEN: 'status-open',
      IN_PROGRESS: 'status-progress',
      RESOLVED: 'status-resolved',
      CLOSED: 'status-closed'
    };
    return classes[status] || '';
  }

  constructor(private ticketService: TicketService) {}
}
