import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ProjectStore } from '../../state/project.store';
import { Ticket, Employee, Project, PRIORITIES, STATUSES, SUPPORT_LEVELS } from '../../models/models';
import { priorityClass, statusClass, formatDate, slaInfo, truncate, initials } from '../../models/utils';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css']
})
export class TicketListComponent implements OnInit {
  private api     = inject(ApiService);
  readonly auth   = inject(AuthService);
  private toast   = inject(ToastService);
  private store   = inject(ProjectStore);
  private route   = inject(ActivatedRoute);
  private fb      = inject(FormBuilder);

  loading      = signal(true);
  tickets      = signal<Ticket[]>([]);
  employees    = signal<Employee[]>([]);
  projects     = signal<Project[]>([]);
  totalItems   = signal(0);
  totalPages   = signal(0);
  currentPage  = signal(0);
  pageSize     = signal(15);
  filterOpen   = signal(false);
  deleteTarget = signal<number | null>(null);

  readonly priorities    = PRIORITIES;
  readonly statuses      = STATUSES;
  readonly supportLevels = SUPPORT_LEVELS;
  readonly priorityClass = priorityClass;
  readonly statusClass   = statusClass;
  readonly formatDate    = formatDate;
  readonly slaInfo       = slaInfo;
  readonly truncate      = truncate;
  readonly initials      = initials;

  private search$ = new Subject<string>();

  filterForm = this.fb.group({
    search: [''], projectId: [null as number|null], employeeId: [null as number|null],
    priority: [''], currentStatus: [''], supportLevel: [''], slaBreached: [false]
  });

  get activeFilters(): number {
    const v = this.filterForm.value;
    return [v.projectId, v.employeeId, v.priority, v.currentStatus, v.supportLevel, v.slaBreached].filter(Boolean).length;
  }

  get pageNums(): number[] {
    const total = this.totalPages(), cur = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages = new Set([0, total - 1, cur, Math.max(0, cur-1), Math.min(total-1, cur+1)]);
    return [...pages].sort((a, b) => a - b);
  }

  constructor() {
    this.search$.pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => { this.currentPage.set(0); this.load(); });
  }

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParams;
    if (qp['status'])     this.filterForm.patchValue({ currentStatus: qp['status'] });
    if (qp['priority'])   this.filterForm.patchValue({ priority: qp['priority'] });
    if (qp['slaBreached']) this.filterForm.patchValue({ slaBreached: true });
    const pid = this.store.activeId();
    if (pid) this.filterForm.patchValue({ projectId: pid });
    this.load();
    this.api.getEmployees().subscribe(e => this.employees.set(e));
    this.api.getProjects().subscribe(p => this.projects.set(p));
  }

  load(): void {
    this.loading.set(true);
    const v = this.filterForm.value;
    const filter = {
      ticketNumber:  v.search || undefined, projectId: v.projectId ?? undefined,
      employeeId:    v.employeeId ?? undefined, priority: v.priority || undefined,
      currentStatus: v.currentStatus || undefined, supportLevel: v.supportLevel || undefined,
      slaBreached:   v.slaBreached || undefined
    };
    this.api.getTickets(filter, this.currentPage(), this.pageSize()).subscribe({
      next: res => {
        if (res.success) { this.tickets.set(res.data.content); this.totalItems.set(res.data.totalElements); this.totalPages.set(res.data.totalPages); }
        this.loading.set(false);
      },
      error: () => { this.toast.error('Failed to load tickets'); this.loading.set(false); }
    });
  }
  
  toggleFilter() {
  this.filterOpen.update(v => !v);
}

  onSearch(val: string): void { this.search$.next(val); }
  applyFilters(): void { this.currentPage.set(0); this.load(); this.filterOpen.set(false); }
  resetFilters(): void {
    this.filterForm.reset();
    const pid = this.store.activeId();
    if (pid) this.filterForm.patchValue({ projectId: pid });
    this.currentPage.set(0); this.load();
  }
  goToPage(p: number): void { this.currentPage.set(p); this.load(); }

  doDelete(): void {
    const id = this.deleteTarget(); if (!id) return;
    this.api.deleteTicket(id).subscribe({
      next: () => { this.toast.success('Ticket deleted'); this.deleteTarget.set(null); this.load(); },
      error: () => this.toast.error('Failed to delete ticket')
    });
  }
}
