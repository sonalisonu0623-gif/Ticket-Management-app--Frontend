import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { UserManagementService } from '../../services/user-management.service';
import { UserRecord, ROLE_LABELS } from '../../models/user.model';
import { UserRole } from '../../models/auth.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
  users: UserRecord[] = [];
  loading = false;
  toggleLoading: number | null = null;
  error: string | null = null;
  successMessage: string | null = null;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  searchQuery = '';
  filterRole: UserRole | '' = '';
  filterActive = '';

  resetTarget: UserRecord | null = null;
  resetPassword = '';

  searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  roleLabels = ROLE_LABELS;

  roleOptions: { value: UserRole | '', label: string }[] = [
    { value: '', label: 'All Roles' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'PROJECT_MANAGER', label: 'Project Manager' },
    { value: 'EMPLOYEE', label: 'Employee' }
  ];

  constructor(private userService: UserManagementService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => { this.currentPage = 0; this.loadUsers(); });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    const hasFilters = this.searchQuery || this.filterRole || this.filterActive !== '';
    const isActive = this.filterActive === '' ? undefined : this.filterActive === 'true';

    if (hasFilters) {
      this.userService.searchUsers(
        this.searchQuery || undefined,
        (this.filterRole as UserRole) || undefined,
        isActive,
        this.currentPage, this.pageSize
      ).subscribe({
        next: r => { this.users = r.data.content; this.totalElements = r.data.totalElements; this.totalPages = r.data.totalPages; this.loading = false; },
        error: () => { this.error = 'Failed to load users.'; this.loading = false; }
      });
    } else {
      this.userService.getUsers(this.currentPage, this.pageSize).subscribe({
        next: r => { this.users = r.data.content; this.totalElements = r.data.totalElements; this.totalPages = r.data.totalPages; this.loading = false; },
        error: () => { this.error = 'Failed to load users.'; this.loading = false; }
      });
    }
  }

  onSearchChange(): void { this.searchSubject.next(this.searchQuery); }
  onFilterChange(): void { this.currentPage = 0; this.loadUsers(); }
  clearFilters(): void { this.searchQuery = ''; this.filterRole = ''; this.filterActive = ''; this.currentPage = 0; this.loadUsers(); }

  toggleActive(user: UserRecord): void {
    this.toggleLoading = user.id;
    const action = user.isActive
      ? this.userService.deactivateUser(user.id)
      : this.userService.activateUser(user.id);
    action.subscribe({
      next: () => {
        this.successMessage = `User ${user.isActive ? 'deactivated' : 'activated'} successfully`;
        this.toggleLoading = null;
        this.loadUsers();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: () => { this.error = 'Operation failed.'; this.toggleLoading = null; setTimeout(() => this.error = null, 3000); }
    });
  }

  openResetPassword(user: UserRecord): void { this.resetTarget = user; this.resetPassword = ''; }
  cancelReset(): void { this.resetTarget = null; this.resetPassword = ''; }

  confirmReset(): void {
    if (!this.resetTarget) return;
    this.userService.resetPassword(this.resetTarget.id, { newPassword: this.resetPassword }).subscribe({
      next: () => {
        this.successMessage = `Password reset for ${this.resetTarget!.username}`;
        this.resetTarget = null; this.resetPassword = '';
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: () => { this.error = 'Password reset failed.'; setTimeout(() => this.error = null, 3000); }
    });
  }

  goToPage(page: number): void { if (page >= 0 && page < this.totalPages) { this.currentPage = page; this.loadUsers(); } }

  get pages(): number[] {
    const range = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  getRoleClass(role: UserRole): string {
    const m: Record<UserRole, string> = { ADMIN: 'role-admin', PROJECT_MANAGER: 'role-pm', EMPLOYEE: 'role-emp' };
    return m[role] || '';
  }
}
