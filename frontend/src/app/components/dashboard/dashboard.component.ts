import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
    // Load all tickets to compute stats
    this.api.getTickets({}, 0, 5, 'createdAt', 'desc').subscribe({
      next: (res) => {
        this.recentTickets = res.data.content;
        this.stats.total = res.data.totalElements;
        this.loadStatusStats();
      },
      error: () => { this.loading = false; }
    });
  }

  loadStatusStats() {
    let done = 0;
    const statuses = [
      { key: 'open', value: 'Open' },
      { key: 'inProgress', value: 'In Progress' },
      { key: 'resolved', value: 'Resolved' },
      { key: 'closed', value: 'Closed' },
    ];

    statuses.forEach(s => {
      this.api.getTickets({ currentStatus: s.value }, 0, 1).subscribe({
        next: (res) => {
          (this.stats as any)[s.key] = res.data.totalElements;
          done++;
          if (done === statuses.length) this.loading = false;
        },
        error: () => {
          done++;
          if (done === statuses.length) this.loading = false;
        }
      });
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
