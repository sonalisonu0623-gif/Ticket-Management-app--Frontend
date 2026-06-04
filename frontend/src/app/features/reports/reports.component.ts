import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DashboardService, ProjectService } from '../../core/services/api.services';
import { ProjectStore } from '../../core/state/project.store';
import { DashboardDTO, Project } from '../../core/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  private dashSvc  = inject(DashboardService);
  private projSvc  = inject(ProjectService);
  readonly store   = inject(ProjectStore);
  private fb       = inject(FormBuilder);

  loading   = signal(true);
  data      = signal<DashboardDTO | null>(null);
  projects  = signal<Project[]>([]);

  filterForm = this.fb.group({
    projectId: [null as number | null]
  });

  readonly statusEntries = computed(() => {
    const d = this.data();
    if (!d) return [];
    return Object.entries(d.ticketsByStatus ?? {}).sort((a, b) => b[1] - a[1]);
  });

  readonly priorityEntries = computed(() => {
    const d = this.data();
    if (!d) return [];
    const order = ['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low'];
    return Object.entries(d.ticketsByPriority ?? {})
      .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  });

  readonly levelEntries = computed(() => {
    const d = this.data();
    if (!d) return [];
    return Object.entries(d.ticketsBySupportLevel ?? {}).sort((a, b) => a[0].localeCompare(b[0]));
  });

  ngOnInit(): void {
    this.projSvc.getAll('ACTIVE').subscribe(p => this.projects.set(p));
    const pid = this.store.activeId();
    if (pid) this.filterForm.patchValue({ projectId: pid });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const pid = this.filterForm.value.projectId ?? undefined;
    this.dashSvc.get(pid).subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
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
      'P3 - Medium': '#3b82f6', 'P4 - Low': '#10b981'
    };
    return m[p] ?? '#64748b';
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
