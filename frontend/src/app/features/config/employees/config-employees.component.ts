import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { ProjectService } from '../../../core/services/project.service';
import { ShiftService } from '../../../core/services/sla.service';
import { ToastService } from '../../../core/services/toast.service';
import { Employee, Project, Shift } from '../../../core/models/models';

@Component({
  selector: 'app-config-employees',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="page-title-block">
          <h1 class="page-title">Employee Management</h1>
          <p class="page-subtitle">Manage support employees and project assignments</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Employee
        </button>
      </div>

      <div class="table-card">
        <div class="table-toolbar">
          <div class="search-wrap">
            <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input class="search-input" placeholder="Search employees..." [(ngModel)]="searchQuery" (ngModelChange)="onSearch()" />
          </div>
          <select class="filter-select" style="width:160px" [(ngModel)]="projectFilter" (ngModelChange)="onSearch()">
            <option value="">All Projects</option>
            @for (p of projects(); track p.id) {
              <option [value]="p.id">{{ p.projectName }}</option>
            }
          </select>
        </div>

        @if (loading()) {
          <div class="spinner-wrap"><div class="spinner"></div></div>
        } @else {
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>ID</th>
                  <th>Role</th>
                  <th>Support Level</th>
                  <th>Shift</th>
                  <th>Projects</th>
                  <th>Status</th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (e of employees(); track e.id) {
                  <tr>
                    <td>
                      <div class="emp-cell">
                        <div class="emp-avatar">{{ e.employeeName.slice(0,2).toUpperCase() }}</div>
                        <div>
                          <div class="emp-name">{{ e.employeeName }}</div>
                          <div class="emp-email">{{ e.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="mono text-sm">{{ e.employeeId ?? '—' }}</td>
                    <td>
                      <span class="role-tag" [class]="'role-' + (e.role ?? '').toLowerCase()">{{ e.role?.replace('_',' ') }}</span>
                    </td>
                    <td>
                      @if (e.supportLevel) {
                        <span class="level-tag">{{ e.supportLevel }}</span>
                      } @else { <span class="text-muted">—</span> }
                    </td>
                    <td class="text-sm">{{ e.shiftName ?? '—' }}</td>
                    <td>
                      <div class="proj-chips">
                        @for (p of (e.assignedProjects ?? []).slice(0,3); track p.id) {
                          <span class="proj-mini-chip">{{ p.projectCode }}</span>
                        }
                        @if ((e.assignedProjects?.length ?? 0) > 3) {
                          <span class="proj-mini-chip more">+{{ (e.assignedProjects?.length ?? 0) - 3 }}</span>
                        }
                        @if ((e.assignedProjects?.length ?? 0) === 0) {
                          <span class="text-muted">None</span>
                        }
                      </div>
                    </td>
                    <td>
                      <span class="status-pill" [class.active]="e.status === 'ACTIVE'">{{ e.status }}</span>
                    </td>
                    <td>
                      <div class="action-group">
                        <button class="action-btn edit" (click)="openModal(e)" title="Edit">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="action-btn" (click)="toggleStatus(e)" title="Toggle Status">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 11-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
                        </button>
                        <button class="action-btn delete" (click)="deleteEmployee(e)" title="Delete">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="8">
                    <div class="empty-state">
                      <svg class="empty-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                      <p class="empty-title">No employees found</p>
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
              <h3 class="modal-title">{{ editingEmployee() ? 'Edit Employee' : 'Add Employee' }}</h3>
              <button class="modal-close" (click)="closeModal()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body" style="max-height:70vh;overflow-y:auto">
              <form [formGroup]="form">
                <div class="form-grid two-col">
                  <div class="form-field">
                    <label class="field-label required">Full Name</label>
                    <input class="field-input" [class.invalid]="isInvalid('employeeName')" formControlName="employeeName" placeholder="John Smith" />
                    @if (isInvalid('employeeName')) { <span class="field-error">Required</span> }
                  </div>
                  <div class="form-field">
                    <label class="field-label">Employee ID</label>
                    <input class="field-input" formControlName="employeeId" placeholder="EMP-001" />
                  </div>
                </div>
                <div class="form-grid two-col">
                  <div class="form-field">
                    <label class="field-label required">Email</label>
                    <input type="email" class="field-input" [class.invalid]="isInvalid('email')" formControlName="email" placeholder="john@company.com" />
                    @if (isInvalid('email')) { <span class="field-error">Valid email required</span> }
                  </div>
                  <div class="form-field">
                    <label class="field-label">Designation</label>
                    <input class="field-input" formControlName="designation" placeholder="e.g. Senior Support Engineer" />
                  </div>
                </div>
                <div class="form-grid three-col">
                  <div class="form-field">
                    <label class="field-label required">Role</label>
                    <select class="field-select" [class.invalid]="isInvalid('role')" formControlName="role">
                      <option value="">Select role</option>
                      <option value="PROJECT_MANAGER">Project Manager</option>
                      <option value="L1_SUPPORT">L1 Support</option>
                      <option value="L2_SUPPORT">L2 Support</option>
                    </select>
                    @if (isInvalid('role')) { <span class="field-error">Required</span> }
                  </div>
                  <div class="form-field">
                    <label class="field-label">Support Level</label>
                    <select class="field-select" formControlName="supportLevel">
                      <option [ngValue]="null">Auto</option>
                      <option value="L1">L1</option>
                      <option value="L2">L2</option>
                      <option value="L3">L3</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label class="field-label">Shift</label>
                    <select class="field-select" formControlName="shiftId">
                      <option [ngValue]="null">No shift</option>
                      @for (s of shifts(); track s.id) {
                        <option [ngValue]="s.id">{{ s.shiftName }}</option>
                      }
                    </select>
                  </div>
                </div>

                <!-- Project Assignment -->
                <div class="form-field">
                  <label class="field-label">Assign to Projects</label>
                  <div class="project-checkboxes">
                    @for (p of projects(); track p.id) {
                      <label class="project-checkbox" [class.checked]="isProjectSelected(p.id!)">
                        <input type="checkbox" [checked]="isProjectSelected(p.id!)" (change)="toggleProject(p.id!)" />
                        <span class="proj-check-dot" [style.background]="getColor(p.id)"></span>
                        <span>{{ p.projectName }}</span>
                        <span class="proj-code-small">{{ p.projectCode }}</span>
                      </label>
                    }
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeModal()">Cancel</button>
              <button class="btn btn-primary" (click)="save()" [disabled]="saving()">
                @if (saving()) { <span class="btn-spinner"></span> } {{ editingEmployee() ? 'Update' : 'Add Employee' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .search-wrap { position: relative; flex: 1; max-width: 280px; }
    .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
    .search-input { width: 100%; background: var(--bg-input); border: 1px solid var(--border); border-radius: 7px; padding: 7px 10px 7px 32px; color: var(--text-primary); font-size: 13px; outline: none; font-family: inherit; transition: border-color 0.15s; }
    .search-input:focus { border-color: var(--border-focus); }

    .emp-cell { display: flex; align-items: center; gap: 10px; }
    .emp-avatar { width: 34px; height: 34px; border-radius: 8px; background: var(--accent); color: white; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .emp-name { font-size: 13.5px; font-weight: 600; color: var(--text-primary); }
    .emp-email { font-size: 12px; color: var(--text-muted); }

    .role-tag { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; }
    .role-admin { background: var(--purple-light); color: var(--purple); }
    .role-project_manager { background: var(--info-light); color: var(--info); }
    .role-l1_support { background: var(--accent-light); color: var(--accent); }
    .role-l2_support { background: var(--warning-light); color: var(--warning); }

    .proj-chips { display: flex; flex-wrap: wrap; gap: 4px; }
    .proj-mini-chip { font-size: 10.5px; font-weight: 600; padding: 2px 6px; border-radius: 3px; background: var(--accent-light); color: var(--accent); }
    .proj-mini-chip.more { background: var(--bg-primary); color: var(--text-muted); }

    .status-pill { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; background: var(--danger-light); color: var(--danger); }
    .status-pill.active { background: var(--success-light); color: var(--success); }

    .modal-lg { max-width: 640px; }

    .project-checkboxes { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-height: 200px; overflow-y: auto; padding: 4px; }
    .project-checkbox { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 7px; border: 1px solid var(--border); cursor: pointer; font-size: 13px; color: var(--text-secondary); transition: all 0.13s; }
    .project-checkbox input { display: none; }
    .project-checkbox:hover { border-color: var(--border-hover); color: var(--text-primary); }
    .project-checkbox.checked { border-color: var(--accent); background: var(--accent-light); color: var(--text-primary); }
    .proj-check-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .proj-code-small { margin-left: auto; font-size: 10.5px; color: var(--text-muted); }
  `]
})
export class ConfigEmployeesComponent implements OnInit {
  employees = signal<Employee[]>([]);
  projects = signal<Project[]>([]);
  shifts = signal<Shift[]>([]);
  loading = signal(true);
  saving = signal(false);
  modalOpen = signal(false);
  editingEmployee = signal<Employee | null>(null);
  selectedProjectIds = new Set<number>();
  searchQuery = '';
  projectFilter = '';
  form!: FormGroup;
  private colors = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4'];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private projectService: ProjectService,
    private shiftService: ShiftService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadData();
    this.projectService.getAllList().subscribe(p => this.projects.set(p));
    this.shiftService.getAll().subscribe(s => this.shifts.set(s));
  }

  private buildForm(): void {
    this.form = this.fb.group({
      employeeName: ['', Validators.required],
      employeeId: [''],
      email: ['', [Validators.required, Validators.email]],
      designation: [''],
      role: ['', Validators.required],
      supportLevel: [null],
      shiftId: [null],
      status: ['ACTIVE']
    });
  }

  private loadData(): void {
    this.loading.set(true);
    this.employeeService.getAll(0, 100).subscribe({
      next: res => { this.employees.set(res.data?.content ?? []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSearch(): void {
    this.employeeService.getAll(0, 100, this.searchQuery, this.projectFilter ? +this.projectFilter : undefined).subscribe(
      res => this.employees.set(res.data?.content ?? [])
    );
  }

  openModal(emp?: Employee): void {
    this.editingEmployee.set(emp ?? null);
    this.selectedProjectIds = new Set(emp?.assignedProjectIds ?? []);
    if (emp) {
      this.form.patchValue({
        employeeName: emp.employeeName,
        employeeId: emp.employeeId ?? '',
        email: emp.email ?? '',
        designation: emp.designation ?? '',
        role: emp.role ?? '',
        supportLevel: emp.supportLevel ?? null,
        shiftId: emp.shiftId ?? null,
        status: emp.status ?? 'ACTIVE'
      });
    } else {
      this.form.reset({ status: 'ACTIVE' });
    }
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingEmployee.set(null);
    this.selectedProjectIds = new Set();
    this.form.reset({ status: 'ACTIVE' });
  }

  isProjectSelected(id: number): boolean { return this.selectedProjectIds.has(id); }

  toggleProject(id: number): void {
    if (this.selectedProjectIds.has(id)) this.selectedProjectIds.delete(id);
    else this.selectedProjectIds.add(id);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const payload: Employee = {
      ...this.form.value,
      assignedProjectIds: Array.from(this.selectedProjectIds)
    };

    const obs$ = this.editingEmployee()
      ? this.employeeService.update(this.editingEmployee()!.id!, payload)
      : this.employeeService.create(payload);

    obs$.subscribe({
      next: () => {
        this.toast.success(this.editingEmployee() ? 'Employee updated!' : 'Employee added!');
        this.saving.set(false);
        this.closeModal();
        this.loadData();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to save employee.');
      }
    });
  }

  toggleStatus(e: Employee): void {
    this.employeeService.toggleStatus(e.id!).subscribe({
      next: updated => {
        this.employees.update(list => list.map(x => x.id === updated.id ? updated : x));
        this.toast.success(`Employee ${updated.status === 'ACTIVE' ? 'activated' : 'deactivated'}.`);
      },
      error: () => this.toast.error('Failed to update.')
    });
  }

  deleteEmployee(e: Employee): void {
    if (!confirm(`Delete employee "${e.employeeName}"?`)) return;
    this.employeeService.delete(e.id!).subscribe({
      next: () => { this.toast.success('Employee deleted.'); this.loadData(); },
      error: () => this.toast.error('Failed to delete.')
    });
  }

  getColor(id: number): string { return this.colors[id % this.colors.length]; }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }
}
