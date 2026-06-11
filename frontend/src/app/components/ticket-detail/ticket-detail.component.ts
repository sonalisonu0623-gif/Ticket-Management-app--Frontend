import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Ticket } from '../../models/models';
import { priorityClass, statusClass, formatDateTime, slaInfo } from '../../models/utils';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.css']
})
export class TicketDetailComponent implements OnInit {

  private api    = inject(ApiService);
  readonly auth  = inject(AuthService);
  private route  = inject(ActivatedRoute);
  private toast  = inject(ToastService);

  loading = signal(true);
  ticket  = signal<Ticket | null>(null);

  readonly priorityClass  = priorityClass;
  readonly statusClass    = statusClass;
  readonly formatDateTime = formatDateTime;
  readonly slaInfo        = slaInfo;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getTicketById(id).subscribe({
      next: t  => { this.ticket.set(t);    this.loading.set(false); },
      error: () => { this.toast.error('Ticket not found'); this.loading.set(false); }
    });
  }

  // FIX: initials() is now a component method with a safe string parameter
  // so the template can call initials(name) with a guaranteed string.
  // The Vercel error was: Argument of type 'string | undefined' is not
  // assignable to parameter of type 'string'.
  // Solution: call this wrapper which handles undefined safely.
  initials(name: string | undefined | null): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
