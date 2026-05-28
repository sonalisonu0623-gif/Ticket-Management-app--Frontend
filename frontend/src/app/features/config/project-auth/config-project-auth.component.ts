import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { ToastService } from '../../../core/services/toast.service';
import { Project, Employee, ProjectAuthorization } from '../../../core/models/models';

@Component({
  selector: 'app-config-project-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="page-title-block">
          <h1 class="page-title">Project Authorization</h1>
          <p class="page-subtitle">Map employees to projects and configure roles</p>
        </div>
      </div>

      <div class="auth-layout">
        <!-- Project selector -->
        <div class="project-panel">
          <div class="panel-header">Projects</div>
          @for (p of projects(); track p.id) {
            <button
              class="project-item"
              [class.active]="selectedProject()?.id === p.id"
              (click)="selectProject(p)"
            >
              <div class="proj-dot" [style.background]="getColor(p.id)"></div>
              <div class="proj-info-col">
                <span class="proj-name-text">{{ p.projectName }}</span>
                <span class="proj-code-text">{{ p.projectCode }}</span>
              </div>
              <span class="proj-emp-count">{{ getEmpCount(p.id!) }}</span>
            </button>
          }
        </div>

        <!-- Employee assignment -->
        <div class="assignment-panel">
          @if (!selectedProject()) {
            <div class="empty-state" style="padding:80px 20px">
              <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              <p class="empty-title">Select a project</p>
              <p class="empty-sub">Choose a project from the left to manage its employee authorizations</p>
            </div>
          } @else {
            <div class="panel-header" style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px">
              <div>
                <span style="font-weight:600;color:var(--text-primary)">{{ selectedProject()!.projectName }}</span>
                <span class="level-tag" style="margin-left:8px">{{ selectedProject()!.projectCode }}</span>
              </div>
              <button class="btn btn-primary btn-sm" (click)="openAddModal()">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Employee
              </button>
            </div>

            @if (loadingEmployees()) {
              <div class="spinner-wrap"><div class="spinner"></div></div>
            } @else {
              <div class="table-wrapper">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Project Role</th>
                      <th>Support Level</th>
                      <th>Assigned</th>
                      <th class="col-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (a of authorizations(); track a.employeeId) {
                      <tr>
                        <td>
                          <div class="emp-cell">
                            <div class="emp-avatar-sm">{{ a.employeeName?.slice(0,2).toUpperCase() }}</div>
                            {{ a.employeeName }}
                          </div>
                        </td>
                        <td>
                          <select class="role-select" [ngModel]="a.role" (ngModelChange)="updateRole(a, $event)">
                            <option value="PROJECT_MANAGER">Project Manager</option>
                            <option value="L1_SUPPORT">L1 Support</option>
                            <option value="L2_SUPPORT">L2 Support</option>
                            <option value="USER">User</option>
                          </select>
                        </td>
                        <td>
                          @if (getEmployeeLevel(a.employeeId)) {
                            <span class="level-tag">{{ getEmployeeLevel(a.employeeId) }}</span>
                          } @else { — }
                        </td>
                        <td class="date-cell">{{ a.assignedAt | date:'dd MMM yyyy' }}</td>
                        <td>
                          <button class="action-btn delete" (click)="removeEmployee(a)" title="Remove">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                          </button>
                        </td>
                      </tr>
                    } @empty {
                      <tr><td colspan="5">
                        <div class="empty-state">
                          <p class="empty-title">No employees assigned</p>
                          <p class="empty-sub">Add employees to this project</p>
                        </div>
                      </td></tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          }
        </div>
      </div>

      <!-- Add Employee Modal -->
      @if (addModalOpen()) {
        <div class="modal-overlay" (click)="addModalOpen.set(false)">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Add Employee to {{ selectedProject()!.projectName }}</h3>
              <button class="modal-close" (click)="addModalOpen.set(false)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-field">
                <label class="field-label">Select Employees</label>
                <div class="emp-checkboxes">
                  @for (e of availableEmployees(); track e.id) {
                    <label class="emp-check-item" [class.checked]="newSelectedIds.has(e.id!)">
                      <input type="checkbox" [checked]="newSelectedIds.has(e.id!)" (change)="toggleNewEmployee(e.id!)" />
                      <div class="emp-avatar-sm">{{ e.employeeName.slice(0,2).toUpperCase() }}</div>
                      <div>
                        <div style="font-size:13px;font-weight:500">{{ e.employeeName }}</div>
                        <div style="font-size:11.5px;color:var(--text-muted)">{{ e.role?.replace('_',' ') }}</div>
                      </div>
                    </label>
                  } @empty {
                    <p class="text-muted" style="padding:12px;font-size:13px">All available employees are already assigned.</p>
                  }
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="addModalOpen.set(false)">Cancel</button>
              <button class="btn btn-primary" (click)="addEmployees()" [disabled]="newSelectedIds.size === 0 || saving()">
                Add {{ newSelectedIds.size > 0 ? '(' + newSelectedIds.size + ')' : '' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .auth-layout { display: grid; grid-template-columns: 260px 1fr; gap: 16px; align-items: start; }

    .project-panel, .assignment-panel {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
    }

    .panel-header {
      padding: 12px 16px;
      font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
      text-transform: uppercase; color: var(--text-muted);
      border-bottom: 1px solid var(--border);
      background: var(--bg-secondary);
    }

    .project-item {
      display: flex; align-items: center; gap: 10px;
      padding: 11px 14px; width: 100%; text-align: left;
      background: none; border: none; border-bottom: 1px solid var(--border);
      cursor: pointer; transition: background 0.12s;
    }
    .project-item:last-child { border-bottom: none; }
    .project-item:hover { background: var(--nav-hover); }
    .project-item.active { background: var(--nav-active-bg); }
    .proj-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .proj-info-col { flex: 1; display: flex; flex-direction: column; }
    .proj-name-text { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .proj-code-text { font-size: 11px; color: var(--text-muted); }
    .proj-emp-count { font-size: 11px; font-weight: 700; background: var(--bg-primary); color: var(--text-muted); padding: 2px 7px; border-radius: 10px; }

    .emp-cell { display: flex; align-items: center; gap: 8px; }
    .emp-avatar-sm { width: 28px; height: 28px; border-radius: 7px; background: var(--accent); color: white; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

    .role-select { background: var(--bg-input); border: 1px solid var(--border); border-radius: 5px; padding: 4px 8px; color: var(--text-primary); font-size: 12.5px; outline: none; font-family: inherit; }

    .emp-checkboxes { display: flex; flex-direction: column; gap: 6px; max-height: 300px; overflow-y: auto; }
    .emp-check-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 7px; border: 1px solid var(--border); cursor: pointer; transition: all 0.13s; }
    .emp-check-item input { display: none; }
    .emp-check-item:hover { border-color: var(--border-hover); }
    .emp-check-item.checked { border-color: var(--accent); background: var(--accent-light); }
  `]
})
export class ConfigProjectAuthComponent implements OnInit {
  projects = signal<Project[]>([]);
  allEmployees = signal<Employee[]>([]);
  authorizations = signal<ProjectAuthorization[]>([]);
  selectedProject = signal<Project | null>(null);
  loadingEmployees = signal(false);
  addModalOpen = signal(false);
  saving = signal(false);
  newSelectedIds = new Set<number>();
  private empCountMap = new Map<number, number>();

  constructor(
    private projectService: ProjectService,
    private employeeService: EmployeeService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.projectService.getAllList().subscribe(p => this.projects.set(p));
    this.employeeService.getAllList().subscribe(e => this.allEmployees.set(e));
  }

  selectProject(p: Project): void {
    this.selectedProject.set(p);
    this.loadAuthorizations(p.id!);
  }

  private loadAuthorizations(projectId: number): void {
    this.loadingEmployees.set(true);
    this.projectService.getAuthorizations(projectId).subscribe({
      next: auth => {
        this.authorizations.set(auth);
        this.empCountMap.set(projectId, auth.length);
        this.loadingEmployees.set(false);
      },
      error: () => this.loadingEmployees.set(false)
    });
  }

  availableEmployees = () => {
    const assignedIds = new Set(this.authorizations().map(a => a.employeeId));
    return this.allEmployees().filter(e => !assignedIds.has(e.id!));
  };

  openAddModal(): void {
    this.newSelectedIds = new Set();
    this.addModalOpen.set(true);
  }

  toggleNewEmployee(id: number): void {
    if (this.newSelectedIds.has(id)) this.newSelectedIds.delete(id);
    else this.newSelectedIds.add(id);
  }

  addEmployees(): void {
    if (!this.selectedProject()) return;
    this.saving.set(true);
    const ids = Array.from(this.newSelectedIds);
    this.projectService.assignEmployees(this.selectedProject()!.id!, ids).subscribe({
      next: () => {
        this.toast.success('Employees added to project.');
        this.addModalOpen.set(false);
        this.saving.set(false);
        this.loadAuthorizations(this.selectedProject()!.id!);
      },
      error: () => { this.saving.set(false); this.toast.error('Failed to add employees.'); }
    });
  }

  updateRole(auth: ProjectAuthorization, role: string): void {
    this.projectService.updateAuthorization({ ...auth, role: role as any }).subscribe({
      next: () => this.toast.success('Role updated.'),
      error: () => this.toast.error('Failed to update role.')
    });
  }

  removeEmployee(auth: ProjectAuthorization): void {
    if (!confirm(`Remove ${auth.employeeName} from ${this.selectedProject()!.projectName}?`)) return;
    this.projectService.removeEmployee(this.selectedProject()!.id!, auth.employeeId).subscribe({
      next: () => {
        this.toast.success('Employee removed.');
        this.loadAuthorizations(this.selectedProject()!.id!);
      },
      error: () => this.toast.error('Failed to remove.')
    });
  }

  getColor(id?: number): string {
    const colors = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4'];
    return colors[(id ?? 0) % colors.length];
  }

  getEmpCount(projectId: number): number {
    return this.empCountMap.get(projectId) ?? 0;
  }

  getEmployeeLevel(empId: number): string | undefined {
    return this.allEmployees().find(e => e.id === empId)?.supportLevel;
  }
}
