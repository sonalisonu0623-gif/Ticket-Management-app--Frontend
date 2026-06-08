import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ProjectStore } from '../../state/project.store';
import { DashboardDTO, Project } from '../../models/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  private api = inject(ApiService);
  readonly store = inject(ProjectStore);
  private fb = inject(FormBuilder);

  loading = signal(true);
  data = signal<DashboardDTO | null>(null);
  projects = signal<Project[]>([]);

  filterForm = this.fb.group({
    projectId: [null as number | null]
  });

  ngOnInit(): void {
    this.api.getProjects('ACTIVE').subscribe(p => this.projects.set(p));
    this.load();
  }

  load(): void {
    this.loading.set(true);

    const pid = this.filterForm.value.projectId ?? undefined;

    this.api.getDashboard(pid).subscribe({
      next: d => {
        this.data.set(d);
        this.loading.set(false);
      },
      error: () => {
        this.data.set(null);
        this.loading.set(false);
      }
    });
  }

  applyFilter(): void {
    this.load();
  }

  statusEntries = computed(() => {
    const d = this.data();
    if (!d?.ticketsByStatus) return [];
    return Object.entries(d.ticketsByStatus).map(([k, v]) => [k, Number(v)] as [string, number]);
  });

  priorityEntries = computed(() => {
    const d = this.data();
    if (!d?.ticketsByPriority) return [];

    const order = ['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low'];

    return Object.entries(d.ticketsByPriority)
      .map(([k, v]) => [k, Number(v)] as [string, number])
      .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  });

  statusColor(s: string): string {
    return {
      Open: '#3b82f6',
      'In Progress': '#f59e0b',
      Pending: '#8b5cf6',
      Resolved: '#10b981',
      Closed: '#64748b',
      Escalated: '#ef4444'
    }[s] ?? '#64748b';
  }

  priorityColor(p: string): string {
    return {
      'P1 - Critical': '#ef4444',
      'P2 - High': '#f59e0b',
      'P3 - Medium': '#3b82f6',
      'P4 - Low': '#10b981'
    }[p] ?? '#64748b';
  }

  barWidth(val: number, max: number): number {
    return max > 0 ? Math.round((val / max) * 100) : 0;
  }

  maxStatus(): number {
    return Math.max(...this.statusEntries().map(([, v]) => v), 1);
  }

  maxPriority(): number {
    return Math.max(...this.priorityEntries().map(([, v]) => v), 1);
  }
}