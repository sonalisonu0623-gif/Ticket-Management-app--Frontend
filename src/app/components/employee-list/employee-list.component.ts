import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { EmployeeService } from '../../services/employee.service';
import { Employee, EmployeeStatus, EMPLOYEE_STATUS_LABELS } from '../../models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  employees: Employee[] = [];
  loading = false;
  deleteLoading: number | null = null;
  error: string | null = null;
  successMessage: string | null = null;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  searchQuery = '';
  filterStatus: EmployeeStatus | '' = '';

  searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  statusLabels = EMPLOYEE_STATUS_LABELS;

  statusOptions: { value: EmployeeStatus | '', label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'ON_LEAVE', label: 'On Leave' }
  ];

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadEmployees();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEmployees(): void {
    this.loading = true;
    this.error = null;
    const hasFilters = this.searchQuery || this.filterStatus;

    if (hasFilters) {
      this.employeeService.searchEmployees(
        this.searchQuery || undefined,
        (this.filterStatus as EmployeeStatus) || undefined,
        this.currentPage,
        this.pageSize
      ).subscribe({
        next: (res) => {
          this.employees = res.data.content;
          this.totalElements = res.data.totalElements;
          this.totalPages = res.data.totalPages;
          this.loading = false;
        },
        error: () => { this.error = 'Failed to load employees.'; this.loading = false; }
      });
    } else {
      this.employeeService.getEmployees(this.currentPage, this.pageSize).subscribe({
        next: (res) => {
          this.employees = res.data.content;
          this.totalElements = res.data.totalElements;
          this.totalPages = res.data.totalPages;
          this.loading = false;
        },
        error: () => { this.error = 'Failed to load employees.'; this.loading = false; }
      });
    }
  }

  onSearchChange(): void { this.searchSubject.next(this.searchQuery); }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadEmployees();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterStatus = '';
    this.currentPage = 0;
    this.loadEmployees();
  }

  deleteEmployee(id: number): void {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) return;
    this.deleteLoading = id;
    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
        this.successMessage = 'Employee deleted successfully';
        this.deleteLoading = null;
        this.loadEmployees();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: () => {
        this.error = 'Failed to delete employee.';
        this.deleteLoading = null;
        setTimeout(() => this.error = null, 3000);
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadEmployees();
    }
  }

  get pages(): number[] {
    const range = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  getStatusClass(status: EmployeeStatus): string {
    const classes: Record<EmployeeStatus, string> = {
      ACTIVE: 'status-active',
      INACTIVE: 'status-inactive',
      ON_LEAVE: 'status-leave'
    };
    return classes[status] || '';
  }
}
