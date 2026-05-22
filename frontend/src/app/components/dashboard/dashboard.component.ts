import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { Ticket } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  loading = true;
  recentTickets: Ticket[] = [];

  stats = {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading = true;
    forkJoin({
      recent:     this.api.getTickets({}, 0, 5, 'createdAt', 'desc'),
      open:       this.api.getTickets({ currentStatus: 'Open' }, 0, 1),
      inProgress: this.api.getTickets({ currentStatus: 'In Progress' }, 0, 1),
      resolved:   this.api.getTickets({ currentStatus: 'Resolved' }, 0, 1),
      closed:     this.api.getTickets({ currentStatus: 'Closed' }, 0, 1),
    }).subscribe({
      next: (results) => {
        this.recentTickets      = results.recent.data.content;
        this.stats.total        = results.recent.data.totalElements;
        this.stats.open         = results.open.data.totalElements;
        this.stats.inProgress   = results.inProgress.data.totalElements;
        this.stats.resolved     = results.resolved.data.totalElements;
        this.stats.closed       = results.closed.data.totalElements;
        this.loading = false;
      },
      error: () => { this.loading = false; }
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
