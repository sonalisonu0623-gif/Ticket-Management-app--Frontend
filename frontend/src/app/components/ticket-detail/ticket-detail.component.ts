import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Ticket } from '../../models/models';
import {
  priorityClass,
  statusClass,
  formatDateTime,
  slaInfo,
  initials
} from '../../models/utils';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.css']
})
export class TicketDetailComponent implements OnInit {

  private api = inject(ApiService);
  readonly auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  loading = signal(true);
  ticket = signal<Ticket | null>(null);

  readonly priorityClass = priorityClass;
  readonly statusClass = statusClass;
  readonly formatDateTime = formatDateTime;
  readonly initials = initials;

  // ✅ SAFE computed SLA (prevents repeated calls + null crash)
  sla = computed(() => {
    const t = this.ticket();
    return t ? slaInfo(t) : null;
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || isNaN(id)) {
      this.toast.error('Invalid ticket id');
      this.loading.set(false);
      return;
    }

    this.api.getTicketById(id).subscribe({
      next: (t) => {
        this.ticket.set(t);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Ticket not found');
        this.loading.set(false);
      }
    });
  }

  // ✅ SAFE initials helper
  safeInitials(name?: string | null): string {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  }
}