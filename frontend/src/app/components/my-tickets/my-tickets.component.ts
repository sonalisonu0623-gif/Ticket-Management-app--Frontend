import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { TicketService } from '../../services/ticket.service';
import { AuthService }   from '../../services/auth.service';
import {
  Ticket, CurrentStatus, Priority, STATUS_LABELS, PRIORITY_LABELS
} from '../../models/ticket.model';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './my-tickets.component.html',
  styleUrls: ['./my-tickets.component.css']
})
export class MyTicketsComponent implements OnInit, OnDestroy {
  tickets: Ticket[] = [];
  selectedTicket: Ticket | null = null;   // detail modal/panel
  loading = false;
  detailLoading = false;
  error: string | null = null;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  filterStatus:   CurrentStatus | '' = '';
  filterPriority: Priority | ''      = '';
  searchQuery = '';

  searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  statusLabels   = STATUS_LABELS;
  priorityLabels = PRIORITY_LABELS;

  statusOptions: { value: CurrentStatus | '', label: string }[] = [
    { value: '', label: 'All Statuses'  },
    { value: 'OPEN',        label: 'Open'        },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED',    label: 'Resolved'    },
    { value: 'CLOSED',      label: 'Closed'      },
  ];
  priorityOptions: { value: Priority | '', label: string }[] = [
    { value: '', label: 'All Priorities' },
    { value: 'P1_CRITICAL', label: 'P1 - Critical' },
    { value: 'P2_HIGH',     label: 'P2 - High'     },
    { value: 'P3_MEDIUM',   label: 'P3 - Medium'   },
    { value: 'P4_LOW',      label: 'P4 - Low'      },
  ];

  constructor(
    private ticketService: TicketService,
    public  authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMyTickets();

    this.searchSubject.pipe(
      debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$)
    ).subscribe(() => { this.currentPage = 0; this.loadMyTickets(); });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadMyTickets(): void {
    this.loading = true;
    this.error = null;
    this.ticketService.getMyTickets(
      this.filterStatus || undefined,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: res => {
        this.tickets       = res.data.content;
        this.totalElements = res.data.totalElements;
        this.totalPages    = res.data.totalPages;
        this.loading = false;
      },
      error: () => { this.error = 'Failed to load your tickets.'; this.loading = false; }
    });
  }

  openDetail(ticket: Ticket): void {
    if (this.selectedTicket?.id === ticket.id) { this.selectedTicket = null; return; }
    this.detailLoading = true;
    this.selectedTicket = ticket;
    // Refresh ticket from API so SLA fields are populated
    this.ticketService.getTicketById(ticket.id!).subscribe({
      next: t => { this.selectedTicket = t; this.detailLoading = false; },
      error: () => { this.detailLoading = false; }
    });
  }

  closeDetail(): void { this.selectedTicket = null; }

  onSearchChange():  void { this.searchSubject.next(this.searchQuery); }
  onFilterChange():  void { this.currentPage = 0; this.loadMyTickets(); }

  clearFilters(): void {
    this.searchQuery = ''; this.filterStatus = ''; this.filterPriority = '';
    this.currentPage = 0; this.loadMyTickets();
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages) { this.currentPage = p; this.loadMyTickets(); }
  }

  get pages(): number[] {
    const r = [], s = Math.max(0, this.currentPage-2), e = Math.min(this.totalPages-1, this.currentPage+2);
    for (let i = s; i <= e; i++) r.push(i);
    return r;
  }

  getStatusClass(s: CurrentStatus): string {
    const m: Record<CurrentStatus,string> = {
      OPEN: 'status-open', IN_PROGRESS: 'status-progress',
      RESOLVED: 'status-resolved', CLOSED: 'status-closed'
    };
    return m[s] ?? '';
  }

  getPriorityClass(p: Priority): string {
    const m: Record<Priority,string> = {
      P1_CRITICAL: 'priority-p1', P2_HIGH: 'priority-p2',
      P3_MEDIUM: 'priority-p3', P4_LOW: 'priority-p4'
    };
    return m[p] ?? '';
  }
}
