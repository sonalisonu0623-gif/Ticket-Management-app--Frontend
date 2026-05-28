import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { ShiftService } from '../../../core/services/sla.service';
import { ToastService } from '../../../core/services/toast.service';
import { Project, Shift } from '../../../core/models/models';

@Component({
  selector: 'app-config-projects',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="page-title-block">
          <h1 class="page-title">Project Management</h1>
          <p class="page-subtitle">Create and manage support projects</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Project
        </button>
      </div>

      <!-- Search -->
      <div class="table-card">
        <div class="table-toolbar">
          <div class="search-wrap">
            <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input class="search-input" placeholder="Search projects..." [(ngModel)]="searchQuery" (ngModelChange)="onSearch()" />
          </div>
        </div>

        @if (loading()) {
          <div class="spinner-wrap"><div class="spinner"></div></div>
        } @else {
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Code</th>
                  <th>Support Email</th>
                  <th>SLA (hrs)</th>
                  <th>Shift</th>
                  <th>Status</th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (p of projects(); track p.id) {
                  <tr>
                    <td>
                      <div class="proj-name-cell">
                        <div class="proj-color-dot" [style.background]="getColor(p.id)"></div>
                        <div>
                          <div style="font-weight:600;color:var(--text-primary)">{{ p.projectName }}</div>
                          @if (p.description) {
                            <div class="text-muted text-sm">{{ p.description | slice:0:60 }}{{ p.description!.length > 60 ? '...' : '' }}</div>
                          }
                        </div>
                      </div>
                    </td>
                    <td><span class="level-tag">{{ p.projectCode }}</span></td>
                    <td class="text-sm text-muted">{{ p.supportEmail ?? '—' }}</td>
                    <td>{{ p.slaHours ?? '—' }}</td>
                    <td class="text-sm">{{ p.shiftName ?? '—' }}</td>
                    <td>
                      <span class="status-pill" [class.active]="p.status === 'ACTIVE'">
                        {{ p.status }}
                      </span>
                    </td>
                    <td>
                      <div class="action-group">
                        <button class="action-btn edit" (click)="openModal(p)" title="Edit">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="action-btn" (click)="toggleStatus(p)" [title]="p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 11-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
                        </button>
                        <button class="action-btn delete" (click)="deleteProject(p)" title="Delete">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="7">
                    <div class="empty-state">
                      <svg class="empty-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                      <p class="empty-title">No projects found</p>
                      <p class="empty-sub">Create your first project to get started</p>
                    </div>
                  </td></tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Modal -->
      @if (modalOpen()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">{{ editingProject() ? 'Edit Project' : 'Create Project' }}</h3>
              <button class="modal-close" (click)="closeModal()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <form [formGroup]="form" (ngSubmit)="save()">
                <div class="form-grid two-col">
                  <div class="form-field">
                    <label class="field-label required">Project Name</label>
                    <input class="field-input" [class.invalid]="isInvalid('projectName')" formControlName="projectName" placeholder="e.g. Alpha Support" />
                    @if (isInvalid('projectName')) { <span class="field-error">Required</span> }
                  </div>
                  <div class="form-field">
                    <label class="field-label required">Project Code</label>
                    <input class="field-input" [class.invalid]="isInvalid('projectCode')" formControlName="projectCode" placeholder="e.g. ALPHA" style="text-transform:uppercase" />
                    @if (isInvalid('projectCode')) { <span class="field-error">Required (max 10 chars)</span> }
                  </div>
                </div>
                <div class="form-field">
                  <label class="field-label">Description</label>
                  <textarea class="field-textarea" formControlName="description" rows="2" placeholder="Brief project description..."></textarea>
                </div>
                <div class="form-grid two-col">
                  <div class="form-field">
                    <label class="field-label">Support Email</label>
                    <input type="email" class="field-input" formControlName="supportEmail" placeholder="support@company.com" />
                  </div>
                  <div class="form-field">
                    <label class="field-label">SLA Hours</label>
                    <input type="number" class="field-input" formControlName="slaHours" placeholder="e.g. 8" min="1" />
                  </div>
                </div>
                <div class="form-grid two-col">
                  <div class="form-field">
                    <label class="field-label">Shift</label>
                    <select class="field-select" formControlName="shiftId">
                      <option [ngValue]="null">No shift assigned</option>
                      @for (s of shifts(); track s.id) {
                        <option [ngValue]="s.id">{{ s.shiftName }} ({{ s.startTime }} - {{ s.endTime }})</option>
                      }
                    </select>
                  </div>
                  <div class="form-field">
                    <label class="field-label">Status</label>
                    <select class="field-select" formControlName="status">
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeModal()">Cancel</button>
              <button class="btn btn-primary" (click)="save()" [disabled]="saving()">
                @if (saving()) { <span class="btn-spinner"></span> } {{ editingProject() ? 'Update' : 'Create' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .search-wrap { position: relative; flex: 1; max-width: 320px; }
    .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
    .search-input { width: 100%; background: var(--bg-input); border: 1px solid var(--border); border-radius: 7px; padding: 7px 10px 7px 32px; color: var(--text-primary); font-size: 13px; outline: none; transition: border-color 0.15s; font-family: inherit; }
    .search-input:focus { border-color: var(--border-focus); }

    .proj-name-cell { display: flex; align-items: center; gap: 10px; }
    .proj-color-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

    .status-pill { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; background: var(--danger-light); color: var(--danger); }
    .status-pill.active { background: var(--success-light); color: var(--success); }

    .modal-lg { max-width: 600px; }
  `]
})
export class ConfigProjectsComponent implements OnInit {
  projects = signal<Project[]>([]);
  shifts = signal<Shift[]>([]);
  loading = signal(true);
  saving = signal(false);
  modalOpen = signal(false);
  editingProject = signal<Project | null>(null);
  searchQuery = '';
  form!: FormGroup;

  private colors = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899'];

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private shiftService: ShiftService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadData();
    this.shiftService.getAll().subscribe(s => this.shifts.set(s));
  }

  private buildForm(): void {
    this.form = this.fb.group({
      projectName: ['', Validators.required],
      projectCode: ['', [Validators.required, Validators.maxLength(10)]],
      description: [''],
      supportEmail: ['', Validators.email],
      slaHours: [null],
      shiftId: [null],
      status: ['ACTIVE']
    });
  }

  private loadData(): void {
    this.loading.set(true);
    this.projectService.getAllList().subscribe({
      next: p => { this.projects.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSearch(): void {
    // Client-side filter for demo; switch to server-side for large datasets
    this.projectService.getAllList().subscribe(all => {
      const q = this.searchQuery.toLowerCase();
      this.projects.set(q ? all.filter(p => p.projectName.toLowerCase().includes(q) || p.projectCode.toLowerCase().includes(q)) : all);
    });
  }

  openModal(project?: Project): void {
    this.editingProject.set(project ?? null);
    if (project) {
      this.form.patchValue({
        projectName: project.projectName,
        projectCode: project.projectCode,
        description: project.description ?? '',
        supportEmail: project.supportEmail ?? '',
        slaHours: project.slaHours ?? null,
        shiftId: project.shiftId ?? null,
        status: project.status ?? 'ACTIVE'
      });
    } else {
      this.form.reset({ status: 'ACTIVE' });
    }
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingProject.set(null);
    this.form.reset({ status: 'ACTIVE' });
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const payload: Project = { ...this.form.value };
    const obs$ = this.editingProject()
      ? this.projectService.update(this.editingProject()!.id!, payload)
      : this.projectService.create(payload);

    obs$.subscribe({
      next: () => {
        this.toast.success(this.editingProject() ? 'Project updated!' : 'Project created!');
        this.saving.set(false);
        this.closeModal();
        this.loadData();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to save project.');
      }
    });
  }

  toggleStatus(p: Project): void {
    this.projectService.toggleStatus(p.id!).subscribe({
      next: updated => {
        this.projects.update(list => list.map(x => x.id === updated.id ? updated : x));
        this.toast.success(`Project ${updated.status === 'ACTIVE' ? 'activated' : 'deactivated'}.`);
      },
      error: () => this.toast.error('Failed to update status.')
    });
  }

  deleteProject(p: Project): void {
    if (!confirm(`Delete project "${p.projectName}"? This cannot be undone.`)) return;
    this.projectService.delete(p.id!).subscribe({
      next: () => { this.toast.success('Project deleted.'); this.loadData(); },
      error: () => this.toast.error('Failed to delete project.')
    });
  }

  getColor(id?: number): string {
    return this.colors[(id ?? 0) % this.colors.length];
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }
}
