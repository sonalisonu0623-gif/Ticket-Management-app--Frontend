import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { Ticket, CurrentStatus, STATUS_LABELS, PRIORITY_LABELS, Priority } from '../../models/ticket.model';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './my-tickets.component.html',
  styleUrls: ['./my-tickets.component.css']
})
export class MyTicketsComponent implements OnInit, OnDestroy {
  tickets: Ticket[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  filterStatus: CurrentStatus | '' = '';

  filterSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  statusLabels = STATUS_LABELS;
  priorityLabels = PRIORITY_LABELS;

  statusOptions: { value: CurrentStatus | '', label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' }
  ];

  constructor(
    private ticketService: TicketService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMyTickets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMyTickets(): void {
    this.loading = true;
    this.error = null;
    this.ticketService.getMyTickets(
      this.filterStatus || undefined,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (res) => {
        this.tickets = res.data.content;
        this.totalElements = res.data.totalElements;
        this.totalPages = res.data.totalPages;
        this.loading = false;
      },
      error: () => { this.error = 'Failed to load your tickets.'; this.loading = false; }
    });
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadMyTickets();
  }

  clearFilters(): void {
    this.filterStatus = '';
    this.currentPage = 0;
    this.loadMyTickets();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadMyTickets();
    }
  }

  get pages(): number[] {
    const range = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  getStatusClass(status: CurrentStatus): string {
    const map: Record<CurrentStatus, string> = {
      OPEN: 'status-open', IN_PROGRESS: 'status-progress',
      RESOLVED: 'status-resolved', CLOSED: 'status-closed'
    };
    return map[status] || '';
  }

  getPriorityClass(priority: Priority): string {
    const map: Record<Priority, string> = {
      P1_CRITICAL: 'priority-p1', P2_HIGH: 'priority-p2',
      P3_MEDIUM: 'priority-p3', P4_LOW: 'priority-p4'
    };
    return map[priority] || '';
  }
}
