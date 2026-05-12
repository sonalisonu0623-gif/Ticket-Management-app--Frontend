import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { SpinnerComponent } from '../shared/spinner.component';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { Ticket, Project, Employee, TicketFilter } from '../../models/models';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './ticket-list.component.html',
})
export class TicketListComponent implements OnInit {
  tickets: Ticket[] = [];
  projects: Project[] = [];
  employees: Employee[] = [];
  filterForm!: FormGroup;

  loading = false;
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  pageSize = 10;
  sortBy = 'createdAt';
  sortDir = 'desc';

  priorities    = ['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low'];
  supportLevels = ['L1', 'L2', 'L3'];
  statuses      = ['Open', 'In Progress', 'On Hold', 'Resolved', 'Closed'];

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.filterForm = this.fb.group({
      ticketNumber:  [''],
      projectId:     [''],
      employeeId:    [''],
      priority:      [''],
      currentStatus: [''],
      supportLevel:  ['']
    });

    this.api.getProjects().subscribe({ next: p => this.projects = p });
    this.api.getEmployees().subscribe({ next: e => this.employees = e });
    this.loadTickets();

    this.filterForm.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.currentPage = 0;
      this.loadTickets();
    });
  }

  loadTickets() {
    this.loading = true;
    const f = this.filterForm.value;
    const filter: TicketFilter = {
      ticketNumber:  f.ticketNumber  || undefined,
      projectId:     f.projectId     || undefined,
      employeeId:    f.employeeId    || undefined,
      priority:      f.priority      || undefined,
      currentStatus: f.currentStatus || undefined,
      supportLevel:  f.supportLevel  || undefined,
    };

    this.api.getTickets(filter, this.currentPage, this.pageSize, this.sortBy, this.sortDir).subscribe({
      next: (res) => {
        this.tickets       = res.data.content;
        this.totalElements = res.data.totalElements;
        this.totalPages    = res.data.totalPages;
        this.loading       = false;
      },
      error: () => {
        this.toast.error('Failed to load tickets');
        this.loading = false;
      }
    });
  }

  deleteTicket(id: number, ticketNumber: string) {
    if (!confirm(`Delete ${ticketNumber}? This action cannot be undone.`)) return;
    this.api.deleteTicket(id).subscribe({
      next: () => { this.toast.success(`${ticketNumber} deleted`); this.loadTickets(); },
      error: () => this.toast.error('Failed to delete ticket')
    });
  }

  onPageChange(page: number) {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadTickets();
  }

  onSort(field: string) {
    this.sortDir = this.sortBy === field ? (this.sortDir === 'asc' ? 'desc' : 'asc') : 'desc';
    this.sortBy  = field;
    this.loadTickets();
  }

  clearFilters() {
    this.filterForm.reset();
  }

  get pages(): number[] {
    const total = this.totalPages;
    const cur   = this.currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages: number[] = [0];
    if (cur > 2) pages.push(-1);
    for (let i = Math.max(1, cur - 1); i <= Math.min(total - 2, cur + 1); i++) pages.push(i);
    if (cur < total - 3) pages.push(-1);
    pages.push(total - 1);
    return pages;
  }

  priorityClass(p?: string): string {
    if (!p) return '';
    if (p.startsWith('P1')) return 'badge-critical';
    if (p.startsWith('P2')) return 'badge-high';
    if (p.startsWith('P3')) return 'badge-medium';
    return 'badge-low';
  }

  statusClass(s?: string): string {
    const map: Record<string, string> = {
      'Open': 'status-open', 'In Progress': 'status-progress',
      'On Hold': 'status-hold', 'Resolved': 'status-resolved', 'Closed': 'status-closed'
    };
    return map[s ?? ''] ?? '';
  }

  sortIcon(field: string): string {
    if (this.sortBy !== field) return '↕';
    return this.sortDir === 'asc' ? '↑' : '↓';
  }
}
