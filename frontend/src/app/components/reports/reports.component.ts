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

  private api    = inject(ApiService);
  readonly store = inject(ProjectStore);
  private fb     = inject(FormBuilder);

  loading  = signal<boolean>(true);
  data     = signal<DashboardDTO | null>(null);
  projects = signal<Project[]>([]);

  filterForm = this.fb.group({
    projectId: [null as number | null]
  });

  // ── Computed entries (safe typed tuples) ──────────────────
  readonly statusEntries = computed((): [string, number][] => {
    const d = this.data();
    if (!d?.ticketsByStatus) return [];
    return Object.entries(d.ticketsByStatus)
      .map(([k, v]) => [k, Number(v)] as [string, number])
      .sort((a, b) => b[1] - a[1]);
  });

  readonly priorityEntries = computed((): [string, number][] => {
    const d = this.data();
    if (!d?.ticketsByPriority) return [];
    const order = ['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low'];
    return Object.entries(d.ticketsByPriority)
      .map(([k, v]) => [k, Number(v)] as [string, number])
      .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  });

  // FIX: pre-compute max values as computed signals instead of
  // calling them as methods in every change-detection cycle
  readonly maxStatusVal = computed(() =>
    Math.max(...this.statusEntries().map(([, v]) => v), 1)
  );

  readonly maxPriorityVal = computed(() =>
    Math.max(...this.priorityEntries().map(([, v]) => v), 1)
  );

  ngOnInit(): void {
    this.api.getProjects('ACTIVE').subscribe({
      next: p => this.projects.set(p),
      error: () => this.projects.set([])
    });
    const pid = this.store.activeId();
    if (pid) this.filterForm.patchValue({ projectId: pid });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const pid = this.filterForm.value.projectId ?? undefined;
    this.api.getDashboard(pid).subscribe({
      next: d  => { this.data.set(d);    this.loading.set(false); },
      error: () => { this.data.set(null); this.loading.set(false); }
    });
  }

  applyFilter(): void { this.load(); }

  statusColor(s: string): string {
    const m: Record<string, string> = {
      'Open': '#3b82f6', 'In Progress': '#f59e0b', 'Pending': '#8b5cf6',
      'Resolved': '#10b981', 'Closed': '#64748b', 'Escalated': '#ef4444'
    };
    return m[s] ?? '#64748b';
  }

  priorityColor(p: string): string {
    const m: Record<string, string> = {
      'P1 - Critical': '#ef4444', 'P2 - High': '#f59e0b',
      'P3 - Medium': '#3b82f6',   'P4 - Low': '#10b981'
    };
    return m[p] ?? '#64748b';
  }

  barWidth(val: number, max: number): number {
    return max > 0 ? Math.round((val / max) * 100) : 0;
  }

  // Kept as methods but delegate to computed signals to avoid
  // recalculation on every template binding check
  maxStatus(): number   { return this.maxStatusVal(); }
  maxPriority(): number { return this.maxPriorityVal(); }

  // FIX: helper to compute resolution rate inline in template
  // replaces the @let rate = ... which is Angular 18+ only
  resolutionRate(resolved: number, total: number): number {
    return total > 0 ? Math.round((resolved / total) * 100) : 0;
  }

  rateColor(rate: number): string {
    return rate >= 80 ? '#10b981' : rate >= 60 ? '#f59e0b' : '#ef4444';
  }
}
