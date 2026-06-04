import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/api.services';
import { ProjectStore } from '../../core/state/project.store';
import { DashboardDTO, Ticket } from '../../core/models';
import { priorityClass, statusClass, formatDate, slaInfo, truncate, initials } from '../../core/utils';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private readonly dashSvc = inject(DashboardService);
  readonly store           = inject(ProjectStore);

  loading = signal(true);
  data    = signal<DashboardDTO | null>(null);

  // Expose utils to template
  readonly priorityClass = priorityClass;
  readonly statusClass   = statusClass;
  readonly formatDate    = formatDate;
  readonly slaInfo       = slaInfo;
  readonly truncate      = truncate;
  readonly initials      = initials;

  readonly statusBars = computed(() => {
    const d = this.data();
    if (!d) return [];
    const total = d.totalTickets || 1;
    return Object.entries(d.ticketsByStatus ?? {}).map(([label, count]) => ({
      label, count, pct: Math.round((count / total) * 100),
      color: this.statusColor(label)
    })).sort((a, b) => b.count - a.count);
  });

  readonly priorityBars = computed(() => {
    const d = this.data();
    if (!d) return [];
    const total = d.totalTickets || 1;
    return Object.entries(d.ticketsByPriority ?? {}).map(([label, count]) => ({
      label, count, pct: Math.round((count / total) * 100),
      color: this.priorityColor(label)
    })).sort((a, b) => {
      const order = ['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low'];
      return order.indexOf(a.label) - order.indexOf(b.label);
    });
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    const pid = this.store.activeId();
    this.dashSvc.get(pid ?? undefined).subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  statusColor(s: string): string {
    const map: Record<string, string> = {
      'Open': '#3b82f6', 'In Progress': '#f59e0b', 'Pending': '#8b5cf6',
      'Resolved': '#10b981', 'Closed': '#64748b', 'Escalated': '#ef4444'
    };
    return map[s] ?? '#64748b';
  }

  priorityColor(p: string): string {
    const map: Record<string, string> = {
      'P1 - Critical': '#ef4444', 'P2 - High': '#f59e0b',
      'P3 - Medium': '#3b82f6',   'P4 - Low': '#10b981'
    };
    return map[p] ?? '#64748b';
  }

  complianceColor(): string {
    const r = this.data()?.slaComplianceRate ?? 100;
    if (r >= 90) return '#10b981';
    if (r >= 70) return '#f59e0b';
    return '#ef4444';
  }

  ticketStatusIcon(s?: string): string {
    const map: Record<string, string> = {
      'Open': 'radio_button_unchecked', 'In Progress': 'autorenew',
      'Pending': 'pause_circle', 'Resolved': 'check_circle',
      'Closed': 'do_not_disturb_on', 'Escalated': 'priority_high'
    };
    return map[s ?? ''] ?? 'circle';
  }
}
