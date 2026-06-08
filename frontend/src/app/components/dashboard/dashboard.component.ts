import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ProjectStore } from '../../state/project.store';
import { DashboardDTO, Ticket } from '../../models/models';
import { priorityClass, statusClass, formatDate, slaInfo, truncate, initials } from '../../models/utils';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly store       = inject(ProjectStore);

  loading = signal(true);
  data    = signal<DashboardDTO | null>(null);

  readonly priorityClass = priorityClass;
  readonly statusClass   = statusClass;
  readonly formatDate    = formatDate;
  readonly slaInfo       = slaInfo;
  readonly truncate      = truncate;
  readonly initials      = initials;

  readonly statusBars = computed(() => {
    const d = this.data(); if (!d) return [];
    const total = d.totalTickets || 1;
    return Object.entries(d.ticketsByStatus ?? {})
      .map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100), color: this.statusColor(label) }))
      .sort((a, b) => b.count - a.count);
  });

  readonly priorityBars = computed(() => {
    const d = this.data(); if (!d) return [];
    const total = d.totalTickets || 1;
    const order = ['P1 - Critical','P2 - High','P3 - Medium','P4 - Low'];
    return Object.entries(d.ticketsByPriority ?? {})
      .map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100), color: this.priorityColor(label) }))
      .sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.getDashboard(this.store.activeId() ?? undefined).subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  statusColor(s: string): string {
    const m: Record<string,string> = { 'Open':'#3b82f6','In Progress':'#f59e0b','Pending':'#8b5cf6','Resolved':'#10b981','Closed':'#64748b','Escalated':'#ef4444' };
    return m[s] ?? '#64748b';
  }
  priorityColor(p: string): string {
    const m: Record<string,string> = { 'P1 - Critical':'#ef4444','P2 - High':'#f59e0b','P3 - Medium':'#3b82f6','P4 - Low':'#10b981' };
    return m[p] ?? '#64748b';
  }
  complianceColor(): string {
    const r = this.data()?.slaComplianceRate ?? 100;
    return r >= 90 ? '#10b981' : r >= 70 ? '#f59e0b' : '#ef4444';
  }
}
