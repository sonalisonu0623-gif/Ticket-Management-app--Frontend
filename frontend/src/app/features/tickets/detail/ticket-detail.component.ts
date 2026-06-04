import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TicketService } from '../../../core/services/api.services';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Ticket } from '../../../core/models';
import { priorityClass, statusClass, formatDateTime, slaInfo, initials } from '../../../core/utils';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.css']
})
export class TicketDetailComponent implements OnInit {
  private ticketSvc = inject(TicketService);
  readonly auth     = inject(AuthService);
  private route     = inject(ActivatedRoute);
  private toast     = inject(ToastService);

  loading = signal(true);
  ticket  = signal<Ticket | null>(null);

  readonly priorityClass = priorityClass;
  readonly statusClass   = statusClass;
  readonly formatDateTime= formatDateTime;
  readonly slaInfo       = slaInfo;
  readonly initials      = initials;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.ticketSvc.getById(id).subscribe({
      next: t => { this.ticket.set(t); this.loading.set(false); },
      error: () => { this.toast.error('Ticket not found'); this.loading.set(false); }
    });
  }
}
