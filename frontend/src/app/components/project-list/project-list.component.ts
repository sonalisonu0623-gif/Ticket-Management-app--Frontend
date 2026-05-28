import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ProjectService } from '../../services/project.service';
import { Project, ProjectStatus, PROJECT_STATUS_LABELS } from '../../models/project.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  loading = false;
  deleteLoading: number | null = null;
  error: string | null = null;
  successMessage: string | null = null;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  searchQuery = '';
  filterStatus: ProjectStatus | '' = '';

  searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  statusLabels = PROJECT_STATUS_LABELS;

  statusOptions: { value: ProjectStatus | '', label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'ON_HOLD', label: 'On Hold' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadProjects();
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadProjects();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects(): void {
    this.loading = true;
    this.error = null;
    const hasFilters = this.searchQuery || this.filterStatus;

    if (hasFilters) {
      this.projectService.searchProjects(
        this.searchQuery || undefined,
        (this.filterStatus as ProjectStatus) || undefined,
        this.currentPage,
        this.pageSize
      ).subscribe({
        next: (res) => {
          this.projects = res.data.content;
          this.totalElements = res.data.totalElements;
          this.totalPages = res.data.totalPages;
          this.loading = false;
        },
        error: () => { this.error = 'Failed to load projects.'; this.loading = false; }
      });
    } else {
      this.projectService.getProjects(this.currentPage, this.pageSize).subscribe({
        next: (res) => {
          this.projects = res.data.content;
          this.totalElements = res.data.totalElements;
          this.totalPages = res.data.totalPages;
          this.loading = false;
        },
        error: () => { this.error = 'Failed to load projects.'; this.loading = false; }
      });
    }
  }

  onSearchChange(): void { this.searchSubject.next(this.searchQuery); }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadProjects();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterStatus = '';
    this.currentPage = 0;
    this.loadProjects();
  }

  deleteProject(id: number): void {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    this.deleteLoading = id;
    this.projectService.deleteProject(id).subscribe({
      next: () => {
        this.successMessage = 'Project deleted successfully';
        this.deleteLoading = null;
        this.loadProjects();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: () => {
        this.error = 'Failed to delete project.';
        this.deleteLoading = null;
        setTimeout(() => this.error = null, 3000);
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadProjects();
    }
  }

  get pages(): number[] {
    const range = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  getStatusClass(status: ProjectStatus): string {
    const classes: Record<ProjectStatus, string> = {
      ACTIVE: 'status-active',
      ON_HOLD: 'status-hold',
      COMPLETED: 'status-completed',
      CANCELLED: 'status-cancelled'
    };
    return classes[status] || '';
  }
}
