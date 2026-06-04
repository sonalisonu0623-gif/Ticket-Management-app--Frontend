import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService, EmployeeService, ShiftService, SlaConfigService } from '../../core/services/api.services';
import { ToastService } from '../../core/services/toast.service';
import { Project, Employee, Shift, SlaConfig, PRIORITIES, SUPPORT_LEVELS, ROLES } from '../../core/models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

type Tab = 'projects' | 'employees' | 'authorization' | 'shifts' | 'sla';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmDialogComponent],
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {
  private projSvc  = inject(ProjectService);
  private empSvc   = inject(EmployeeService);
  private shiftSvc = inject(ShiftService);
  private slaSvc   = inject(SlaConfigService);
  private toast    = inject(ToastService);
  private fb       = inject(FormBuilder);

  activeTab   = signal<Tab>('projects');
  loading     = signal(true);
  saving      = signal(false);
  modalOpen   = signal(false);
  editingId   = signal<number | null>(null);
  deleteId    = signal<number | null>(null);
  deleteType  = signal<string>('item');
  searchTerm  = signal('');

  // Data
  projects  = signal<Project[]>([]);
  employees = signal<Employee[]>([]);
  shifts    = signal<Shift[]>([]);
  slaConfigs= signal<SlaConfig[]>([]);

  // Authorization state
  selectedProjForAuth = signal<Project | null>(null);
  authMap = signal<Record<number, { emp: Employee; role: string }[]>>({});

  readonly priorities    = PRIORITIES;
  readonly supportLevels = SUPPORT_LEVELS;
  readonly roles         = ROLES;
  readonly weekdays      = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  readonly tabs = [
    { id: 'projects',      label: 'Project Management', icon: 'folder_special' },
    { id: 'employees',     label: 'Employee Management', icon: 'group' },
    { id: 'authorization', label: 'Project Authorization', icon: 'admin_panel_settings' },
    { id: 'shifts',        label: 'Shift Management', icon: 'schedule' },
    { id: 'sla',           label: 'SLA Configuration', icon: 'timer' }
  ] as const;

  // Forms
  projectForm = this.fb.group({
    projectName:  ['', [Validators.required, Validators.minLength(2)]],
    projectCode:  ['', Validators.required],
    description:  [''],
    supportEmail: ['', Validators.email],
    slaHours:     [24, [Validators.required, Validators.min(1)]],
    status:       ['ACTIVE']
  });

  employeeForm = this.fb.group({
    employeeName: ['', [Validators.required, Validators.minLength(2)]],
    email:        ['', [Validators.required, Validators.email]],
    supportLevel: ['L1'],
    role:         ['L1_SUPPORT'],
    designation:  [''],
    status:       ['ACTIVE'],
    projectIds:   [[] as number[]]
  });

  shiftForm = this.fb.group({
    shiftName:   ['', Validators.required],
    startTime:   ['09:00', Validators.required],
    endTime:     ['18:00', Validators.required],
    timezone:    ['Asia/Kolkata'],
    workingDays: [[] as string[]]
  });

  slaForm = this.fb.group({
    projectId:          [null as number | null, Validators.required],
    priorityLevel:      ['P3 - Medium', Validators.required],
    responseTimeSla:    [4,  [Validators.required, Validators.min(0)]],
    resolutionTimeSla:  [24, [Validators.required, Validators.min(1)]],
    escalationTimeSla:  [8,  [Validators.required, Validators.min(1)]]
  });

  authAssignForm = this.fb.group({
    employeeId:    [null as number | null, Validators.required],
    roleInProject: ['L1_SUPPORT', Validators.required]
  });

  // Filtered data
  filteredProjects  = computed(() => {
    const q = this.searchTerm().toLowerCase();
    return this.projects().filter(p => p.projectName.toLowerCase().includes(q) || (p.projectCode ?? '').toLowerCase().includes(q));
  });
  filteredEmployees = computed(() => {
    const q = this.searchTerm().toLowerCase();
    return this.employees().filter(e => e.employeeName.toLowerCase().includes(q) || (e.email ?? '').toLowerCase().includes(q));
  });

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.loading.set(true);
    this.projSvc.getAll().subscribe(p => { this.projects.set(p); this.loading.set(false); });
    this.empSvc.getAll().subscribe(e => this.employees.set(e));
    this.shiftSvc.getAll().subscribe(s => this.shifts.set(s));
    this.slaSvc.getAll().subscribe(c => this.slaConfigs.set(c));
  }

  switchTab(tab: Tab): void {
    this.activeTab.set(tab);
    this.searchTerm.set('');
    this.closeModal();
  }

  // ── Modal helpers ─────────────────────────────────────────

  openCreate(): void {
    this.editingId.set(null);
    this.resetCurrentForm();
    this.modalOpen.set(true);
  }

  openEdit(item: any): void {
    this.editingId.set(item.id ?? null);
    const tab = this.activeTab();
    if (tab === 'projects') {
      this.projectForm.patchValue({ ...item, slaHours: item.slaHours ?? 24 });
    } else if (tab === 'employees') {
      this.employeeForm.patchValue({ ...item, projectIds: item.projectIds ?? [] });
    } else if (tab === 'shifts') {
      this.shiftForm.patchValue({ ...item, workingDays: item.workingDays ?? [] });
    } else if (tab === 'sla') {
      this.slaForm.patchValue({ ...item, projectId: item.projectId ?? null });
    }
    this.modalOpen.set(true);
  }

  closeModal(): void { this.modalOpen.set(false); this.editingId.set(null); }

  resetCurrentForm(): void {
    const tab = this.activeTab();
    if (tab === 'projects')  this.projectForm.reset({ slaHours: 24, status: 'ACTIVE' });
    if (tab === 'employees') this.employeeForm.reset({ supportLevel: 'L1', role: 'L1_SUPPORT', status: 'ACTIVE', projectIds: [] });
    if (tab === 'shifts')    this.shiftForm.reset({ startTime: '09:00', endTime: '18:00', timezone: 'Asia/Kolkata', workingDays: [] });
    if (tab === 'sla')       this.slaForm.reset({ priorityLevel: 'P3 - Medium', responseTimeSla: 4, resolutionTimeSla: 24, escalationTimeSla: 8, projectId: null });
  }

  save(): void {
    const tab = this.activeTab();
    let form: any;
    if (tab === 'projects')  form = this.projectForm;
    if (tab === 'employees') form = this.employeeForm;
    if (tab === 'shifts')    form = this.shiftForm;
    if (tab === 'sla')       form = this.slaForm;

    if (form?.invalid) { form.markAllAsTouched(); return; }
    this.saving.set(true);

    const val  = form.value;
    const id   = this.editingId();
    let req$: any;

    if (tab === 'projects') {
      req$ = id ? this.projSvc.update(id, val) : this.projSvc.create(val);
    } else if (tab === 'employees') {
      req$ = id ? this.empSvc.update(id, val) : this.empSvc.create(val);
    } else if (tab === 'shifts') {
      req$ = id ? this.shiftSvc.update(id, val) : this.shiftSvc.create(val);
    } else if (tab === 'sla') {
      req$ = id ? this.slaSvc.update(id, val) : this.slaSvc.create(val);
    }

    req$.subscribe({
      next: () => {
        this.toast.success(id ? 'Updated successfully' : 'Created successfully');
        this.closeModal();
        this.loadAll();
        this.saving.set(false);
      },
      error: (err: any) => {
        this.toast.error('Failed to save', err?.error?.message);
        this.saving.set(false);
      }
    });
  }

  confirmDelete(id: number, type: string): void {
    this.deleteId.set(id);
    this.deleteType.set(type);
  }

  doDelete(): void {
    const id  = this.deleteId();
    const tab = this.activeTab();
    if (!id) return;

    let req$: any;
    if (tab === 'projects')  req$ = this.projSvc.delete(id);
    if (tab === 'employees') req$ = this.empSvc.delete(id);
    if (tab === 'shifts')    req$ = this.shiftSvc.delete(id);
    if (tab === 'sla')       req$ = this.slaSvc.delete(id);

    req$.subscribe({
      next: () => { this.toast.success('Deleted'); this.deleteId.set(null); this.loadAll(); },
      error: () => this.toast.error('Failed to delete')
    });
  }

  // ── Shifts: toggle day ────────────────────────────────────
  toggleDay(day: string): void {
    const cur = this.shiftForm.value.workingDays ?? [];
    this.shiftForm.patchValue({
      workingDays: cur.includes(day) ? cur.filter(d => d !== day) : [...cur, day]
    });
  }
  isDaySelected(day: string): boolean {
    return (this.shiftForm.value.workingDays ?? []).includes(day);
  }

  // ── Authorization ─────────────────────────────────────────
  selectProjForAuth(p: Project): void {
    this.selectedProjForAuth.set(p);
    this.authAssignForm.reset({ roleInProject: 'L1_SUPPORT' });
  }

  getAuthAssignments(projId: number): { emp: Employee; role: string }[] {
    return this.authMap()[projId] ?? [];
  }

  assignEmpToProj(): void {
    if (this.authAssignForm.invalid) { this.authAssignForm.markAllAsTouched(); return; }
    const { employeeId, roleInProject } = this.authAssignForm.value;
    const proj = this.selectedProjForAuth();
    if (!proj?.id || !employeeId) return;

    this.empSvc.assignToProject(employeeId!, proj.id).subscribe({
      next: () => {
        const emp = this.employees().find(e => e.id === employeeId);
        if (emp) {
          this.authMap.update(m => ({
            ...m,
            [proj.id!]: [...(m[proj.id!] ?? []), { emp, role: roleInProject! }]
          }));
        }
        this.toast.success('Employee assigned to project');
        this.authAssignForm.reset({ roleInProject: 'L1_SUPPORT' });
      },
      error: () => this.toast.error('Assignment failed')
    });
  }

  removeEmpFromProj(empId: number): void {
    const proj = this.selectedProjForAuth();
    if (!proj?.id) return;
    this.empSvc.removeFromProject(empId, proj.id).subscribe({
      next: () => {
        this.authMap.update(m => ({
          ...m,
          [proj.id!]: (m[proj.id!] ?? []).filter(a => a.emp.id !== empId)
        }));
        this.toast.success('Employee removed from project');
      },
      error: () => this.toast.error('Removal failed')
    });
  }

  // ── Helpers ───────────────────────────────────────────────
  projectName(id?: number): string {
    return this.projects().find(p => p.id === id)?.projectName ?? '—';
  }
}
