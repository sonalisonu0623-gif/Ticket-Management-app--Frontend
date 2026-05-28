import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SpinnerComponent } from '../shared/spinner.component';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { Ticket } from '../../models/models';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent],
  templateUrl: './ticket-detail.component.html',
})
export class TicketDetailComponent implements OnInit {
  ticket?: Ticket;
  loading = true;

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.api.getTicketById(id).subscribe({
      next:  (t) => { this.ticket = t; this.loading = false; },
      error: ()  => { this.toast.error('Ticket not found'); this.router.navigate(['/tickets']); }
    });
  }

  deleteTicket() {
    if (!confirm(`Delete ticket ${this.ticket?.ticketNumber}? This cannot be undone.`)) return;
    this.api.deleteTicket(this.ticket!.id!).subscribe({
      next:  () => { this.toast.success('Ticket deleted'); this.router.navigate(['/tickets']); },
      error: ()  => this.toast.error('Failed to delete ticket')
    });
  }

  priorityClass(p?: string): string {
    if (!p) return '';
    if (p.startsWith('P1')) return 'badge-p1';
    if (p.startsWith('P2')) return 'badge-p2';
    if (p.startsWith('P3')) return 'badge-p3';
    return 'badge-p4';
  }

  statusClass(s?: string): string {
    const map: Record<string, string> = {
      'Open': 'status-open', 'In Progress': 'status-progress',
      'On Hold': 'status-hold', 'Resolved': 'status-resolved', 'Closed': 'status-closed'
    };
    return map[s ?? ''] ?? '';
  }
}
