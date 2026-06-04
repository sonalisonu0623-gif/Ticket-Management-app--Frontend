import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TicketService, EmployeeService, ProjectService } from '../../../core/services/api.services';
import { ProjectStore } from '../../../core/state/project.store';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Ticket, Employee, Project, PRIORITIES, STATUSES, SUPPORT_LEVELS } from '../../../core/models';
import { priorityClass, statusClass, formatDate, slaInfo, truncate, initials } from '../../../core/utils';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ConfirmDialogComponent],
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css']
})
export class TicketListComponent implements OnInit {
  private ticketSvc   = inject(TicketService);
  private empSvc      = inject(EmployeeService);
  private projSvc     = inject(ProjectService);
  readonly store      = inject(ProjectStore);
  readonly auth       = inject(AuthService);
  private toast       = inject(ToastService);
  private route       = inject(ActivatedRoute);
  private fb          = inject(FormBuilder);

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

  // Expose utils
  readonly priorityClass = priorityClass;
  readonly statusClass   = statusClass;
  readonly formatDate    = formatDate;
  readonly slaInfo       = slaInfo;
  readonly truncate      = truncate;
  readonly initials      = initials;

  private search$ = new Subject<string>();

  filterForm = this.fb.group({
    search:        [''],
    projectId:     [null as number | null],
    employeeId:    [null as number | null],
    priority:      [''],
    currentStatus: [''],
    supportLevel:  [''],
    slaBreached:   [false]
  });

  get activeFilters(): number {
    const v = this.filterForm.value;
    return [v.projectId, v.employeeId, v.priority, v.currentStatus, v.supportLevel, v.slaBreached]
      .filter(Boolean).length;
  }

  get pageNums(): number[] {
    const total = this.totalPages();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const cur = this.currentPage();
    const pages = new Set<number>([0, total - 1, cur]);
    for (let i = cur - 1; i <= cur + 1; i++) { if (i >= 0 && i < total) pages.add(i); }
    return [...pages].sort((a, b) => a - b);
  }

  constructor() {
    this.search$.pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => { this.currentPage.set(0); this.load(); });
  }

  ngOnInit(): void {
    // Pre-fill from query params (e.g. from dashboard links)
    const qp = this.route.snapshot.queryParams;
    if (qp['status'])    this.filterForm.patchValue({ currentStatus: qp['status'] });
    if (qp['priority'])  this.filterForm.patchValue({ priority: qp['priority'] });
    if (qp['slaBreached']) this.filterForm.patchValue({ slaBreached: true });

    const pid = this.store.activeId();
    if (pid) this.filterForm.patchValue({ projectId: pid });

    this.load();
    this.empSvc.getAll().subscribe(e => this.employees.set(e));
    this.projSvc.getAll().subscribe(p => this.projects.set(p));
  }

  load(): void {
    this.loading.set(true);
    const v = this.filterForm.value;
    const filter = {
      ticketNumber:  v.search || undefined,
      projectId:     v.projectId ?? undefined,
      employeeId:    v.employeeId ?? undefined,
      priority:      v.priority || undefined,
      currentStatus: v.currentStatus || undefined,
      supportLevel:  v.supportLevel || undefined,
      slaBreached:   v.slaBreached || undefined
    };

    this.ticketSvc.getAll(filter, this.currentPage(), this.pageSize()).subscribe({
      next: res => {
        if (res.success) {
          this.tickets.set(res.data.content);
          this.totalItems.set(res.data.totalElements);
          this.totalPages.set(res.data.totalPages);
        }
        this.loading.set(false);
      },
      error: () => { this.toast.error('Failed to load tickets'); this.loading.set(false); }
    });
  }

  onSearch(val: string): void { this.search$.next(val); }

  applyFilters(): void { this.currentPage.set(0); this.load(); this.filterOpen.set(false); }

  resetFilters(): void {
    this.filterForm.reset();
    const pid = this.store.activeId();
    if (pid) this.filterForm.patchValue({ projectId: pid });
    this.currentPage.set(0);
    this.load();
  }

  goToPage(p: number): void { this.currentPage.set(p); this.load(); }

  doDelete(): void {
    const id = this.deleteTarget();
    if (!id) return;
    this.ticketSvc.delete(id).subscribe({
      next: () => { this.toast.success('Ticket deleted'); this.deleteTarget.set(null); this.load(); },
      error: () => this.toast.error('Failed to delete')
    });
  }
}
