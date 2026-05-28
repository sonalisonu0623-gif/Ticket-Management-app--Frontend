import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { AuthService }   from '../../services/auth.service';
import { Ticket, PRIORITY_LABELS, STATUS_LABELS } from '../../models/ticket.model';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.css']
})
export class TicketDetailComponent implements OnInit {
  ticket: Ticket | null = null;
  loading = false;
  error: string | null = null;
  deleteLoading = false;

  priorityLabels = PRIORITY_LABELS;
  statusLabels   = STATUS_LABELS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    public authService: AuthService
  ) {}

  /** EMPLOYEE = read-only, no edit / delete buttons */
  get isReadOnly(): boolean { return this.authService.isEmployee(); }
  get canDelete():  boolean { return this.authService.isAdmin(); }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadTicket(Number(id));
  }

  loadTicket(id: number): void {
    this.loading = true;
    this.ticketService.getTicketById(id).subscribe({
      next: t => { this.ticket = t; this.loading = false; },
      error: () => { this.error = 'Ticket not found.'; this.loading = false; }
    });
  }

  deleteTicket(): void {
    if (!this.ticket?.id || !confirm('Delete this ticket?')) return;
    this.deleteLoading = true;
    this.ticketService.deleteTicket(this.ticket.id).subscribe({
      next: () => this.router.navigate(['/tickets']),
      error: () => { this.error = 'Delete failed.'; this.deleteLoading = false; }
    });
  }

  back(): void {
    if (this.authService.isEmployee()) this.router.navigate(['/my-tickets']);
    else this.router.navigate(['/tickets']);
  }

  getPriorityClass(p: string): string {
    const m: Record<string,string> = {
      P1_CRITICAL: 'priority-critical', P2_HIGH: 'priority-high',
      P3_MEDIUM: 'priority-medium', P4_LOW: 'priority-low'
    };
    return m[p] ?? '';
  }
  getStatusClass(s: string): string {
    const m: Record<string,string> = {
      OPEN: 'status-open', IN_PROGRESS: 'status-progress',
      RESOLVED: 'status-resolved', CLOSED: 'status-closed'
    };
    return m[s] ?? '';
  }
}
