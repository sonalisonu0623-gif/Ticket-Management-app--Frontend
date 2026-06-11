import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import {
  Project, Employee, Shift, SlaConfig,
  PRIORITIES, SUPPORT_LEVELS, ROLES
} from '../../models/models';

type Tab = 'projects' | 'employees' | 'authorization' | 'shifts' | 'sla';

interface AuthAssignment { emp: Employee; role: string; }

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {

  private api   = inject(ApiService);
  private toast = inject(ToastService);
  private fb    = inject(FormBuilder);

  // ── Signals ───────────────────────────────────────────────
  activeTab  = signal<Tab>('projects');
  loading    = signal(true);
  saving     = signal(false);
  modalOpen  = signal(false);
  editingId  = signal<number | null>(null);

  // FIX #1: Store tab at confirm-time so doDelete() always calls correct API
  // even if user navigates between confirm and delete execution.
  deleteId   = signal<number | null>(null);
  deleteTab  = signal<Tab>('projects');
  deleteType = signal<string>('item');

  searchTerm = signal('');

  projects   = signal<Project[]>([]);
  employees  = signal<Employee[]>([]);
  shifts     = signal<Shift[]>([]);
  slaConfigs = signal<SlaConfig[]>([]);

  selectedProjForAuth = signal<Project | null>(null);

  // FIX #2: authMap must be a signal so computed values that depend on it
  // re-run reactively after assign/remove. Old code reset it to {} on every
  // loadAll() call, erasing all UI state before data returned.
  authMap = signal<Record<number, AuthAssignment[]>>({});

  // ── Constants ─────────────────────────────────────────────
  readonly priorities    = PRIORITIES;
  readonly supportLevels = SUPPORT_LEVELS;
  readonly roles         = ROLES;
  readonly weekdays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  readonly tabs = [
    { id: 'projects',      label: 'Project Management',    icon: 'folder_special' },
    { id: 'employees',     label: 'Employee Management',   icon: 'group' },
    { id: 'authorization', label: 'Project Authorization', icon: 'admin_panel_settings' },
    { id: 'shifts',        label: 'Shift Management',      icon: 'schedule' },
    { id: 'sla',           label: 'SLA Configuration',     icon: 'timer' }
  ] as const;

  // ── Forms ─────────────────────────────────────────────────
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
    projectId:         [null as number | null, Validators.required],
    priorityLevel:     ['P3 - Medium', Validators.required],
    responseTimeSla:   [4,  [Validators.required, Validators.min(0)]],
    resolutionTimeSla: [24, [Validators.required, Validators.min(1)]],
    escalationTimeSla: [8,  [Validators.required, Validators.min(1)]]
  });

  authAssignForm = this.fb.group({
    employeeId:    [null as number | null, Validators.required],
    roleInProject: ['L1_SUPPORT', Validators.required]
  });

  // ── Computed ──────────────────────────────────────────────
  filteredProjects = computed(() => {
    const q = this.searchTerm().toLowerCase();
    return this.projects().filter(p =>
      p.projectName.toLowerCase().includes(q) ||
      (p.projectCode ?? '').toLowerCase().includes(q)
    );
  });

  filteredEmployees = computed(() => {
    const q = this.searchTerm().toLowerCase();
    return this.employees().filter(e =>
      e.employeeName.toLowerCase().includes(q) ||
      (e.email ?? '').toLowerCase().includes(q)
    );
  });

  // FIX #3: Plain method getAuthAssignments() is NOT reactive — Angular
  // signals don't track plain method calls. Convert to computed so the
  // authorization panel re-renders automatically after assign/remove.
  readonly currentProjectAssignments = computed<AuthAssignment[]>(() => {
    const proj = this.selectedProjForAuth();
    if (!proj?.id) return [];
    return this.authMap()[proj.id] ?? [];
  });

  // ── Init ──────────────────────────────────────────────────
  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.loading.set(true);

    // FIX #4: Original code set loading=false only after projects responded.
    // Shifts/SLA/employees could still be loading. Use a counter.
    let pending = 4;
    const done = () => { if (--pending === 0) this.loading.set(false); };

    this.api.getProjects().subscribe({
      next: p => { this.projects.set(p); this.rebuildAuthMap(p, this.employees()); done(); },
      error: () => done()
    });
    this.api.getEmployees().subscribe({
      next: e => { this.employees.set(e); this.rebuildAuthMap(this.projects(), e); done(); },
      error: () => done()
    });
    this.api.getShifts().subscribe({
      next: s => { this.shifts.set(s); done(); },
      error: () => done()
    });
    this.api.getSlaConfigs().subscribe({
      next: c => { this.slaConfigs.set(c); done(); },
      error: () => done()
    });
  }

  // FIX #5: Build authMap from employee.projectIds (real backend data)
  // instead of an always-empty object. This makes the Authorization tab
  // show correct assignments on first load without any extra API.
  private rebuildAuthMap(projects: Project[], employees: Employee[]): void {
    const map: Record<number, AuthAssignment[]> = {};
    for (const proj of projects) {
      if (proj.id == null) continue;
      map[proj.id] = employees
        .filter(e => e.projectIds?.includes(proj.id!))
        .map(e => ({ emp: e, role: e.role ?? 'L1_SUPPORT' }));
    }
    this.authMap.set(map);

    // Re-sync the selected project reference so computed signal picks up new data
    const sel = this.selectedProjForAuth();
    if (sel?.id) {
      this.selectedProjForAuth.set(projects.find(p => p.id === sel.id) ?? null);
    }
  }

  // Keep plain getter for template use in static @for blocks (non-reactive context)
  getAuthAssignments(projId: number): AuthAssignment[] {
    return this.authMap()[projId] ?? [];
  }

  // ── Authorization ─────────────────────────────────────────
  selectProjForAuth(p: Project): void {
    this.selectedProjForAuth.set(p);
    this.authAssignForm.reset({ roleInProject: 'L1_SUPPORT' });
  }

  assignEmpToProj(): void {
    if (this.authAssignForm.invalid) {
      this.authAssignForm.markAllAsTouched();
      return;
    }
    const empId  = this.authAssignForm.value.employeeId!;
    const projId = this.selectedProjForAuth()?.id;
    if (!empId || !projId) { this.toast.error('Select employee and project'); return; }

    const already = (this.authMap()[projId] ?? []).some(a => a.emp.id === empId);
    if (already) { this.toast.warning('Employee already assigned to this project'); return; }

    this.api.assignEmployeeToProject(empId, projId).subscribe({
      next: () => {
        const emp  = this.employees().find(e => e.id === empId);
        const role = this.authAssignForm.value.roleInProject ?? 'L1_SUPPORT';
        if (emp) {
          // Optimistic update — UI refreshes immediately without waiting for loadAll()
          this.authMap.update(m => ({
            ...m,
            [projId]: [...(m[projId] ?? []), { emp, role }]
          }));
        }
        this.toast.success('Employee assigned to project');
        this.authAssignForm.reset({ roleInProject: 'L1_SUPPORT' });
        this.loadAll(); // full server sync
      },
      error: () => this.toast.error('Assignment failed')
    });
  }

  removeEmpFromProj(empId: number): void {
    const projId = this.selectedProjForAuth()?.id;
    if (!projId) return;

    // FIX #6: original code had args REVERSED — was (projectId, empId).
    // Correct signature is removeEmployeeFromProject(empId, projId).
    this.api.removeEmployeeFromProject(empId, projId).subscribe({
      next: () => {
        this.authMap.update(m => ({
          ...m,
          [projId]: (m[projId] ?? []).filter(a => a.emp.id !== empId)
        }));
        this.toast.success('Employee removed from project');
        this.loadAll();
      },
      error: () => this.toast.error('Remove failed')
    });
  }

  projectName(id?: number): string {
    return this.projects().find(p => p.id === id)?.projectName ?? '—';
  }

  // ── Tab ───────────────────────────────────────────────────
  switchTab(tab: Tab): void {
    this.activeTab.set(tab);
    this.searchTerm.set('');
    this.closeModal();
  }

  // ── Modal ─────────────────────────────────────────────────
  openCreate(): void {
    this.editingId.set(null);
    this.resetCurrentForm();
    this.modalOpen.set(true);
  }

  openEdit(item: any): void {
    this.editingId.set(item.id ?? null);
    const tab = this.activeTab();

    // FIX #7: reset() before patchValue() so stale values from a previous
    // openEdit() on a different record cannot bleed through.
    // FIX #8: explicitly map only the known fields for each form instead of
    // patchValue(item) which may pass unknown keys or wrong types.
    if (tab === 'projects') {
      this.projectForm.reset();
      this.projectForm.patchValue({
        projectName:  item.projectName  ?? '',
        projectCode:  item.projectCode  ?? '',
        description:  item.description  ?? '',
        supportEmail: item.supportEmail ?? '',
        slaHours:     item.slaHours     ?? 24,
        status:       item.status       ?? 'ACTIVE'
      });
    }

    if (tab === 'employees') {
      this.employeeForm.reset();
      this.employeeForm.patchValue({
        employeeName: item.employeeName ?? '',
        email:        item.email        ?? '',
        supportLevel: item.supportLevel ?? 'L1',
        role:         item.role         ?? 'L1_SUPPORT',
        designation:  item.designation  ?? '',
        status:       item.status       ?? 'ACTIVE',
        projectIds:   item.projectIds   ?? []
      });
    }

    if (tab === 'shifts') {
      this.shiftForm.reset();
      // FIX #9: API may return workingDays as string[] OR comma string.
      // Normalise to string[] before patching.
      const wd: string[] = Array.isArray(item.workingDays)
        ? item.workingDays
        : (typeof item.workingDays === 'string' && item.workingDays)
          ? item.workingDays.split(',').map((d: string) => d.trim())
          : [];
      this.shiftForm.patchValue({
        shiftName:   item.shiftName ?? '',
        startTime:   item.startTime ?? '09:00',
        endTime:     item.endTime   ?? '18:00',
        timezone:    item.timezone  ?? 'Asia/Kolkata',
        workingDays: wd
      });
    }

    if (tab === 'sla') {
      this.slaForm.reset();
      this.slaForm.patchValue({
        projectId:         item.projectId         ?? null,
        priorityLevel:     item.priorityLevel     ?? 'P3 - Medium',
        responseTimeSla:   item.responseTimeSla   ?? 4,
        resolutionTimeSla: item.resolutionTimeSla ?? 24,
        escalationTimeSla: item.escalationTimeSla ?? 8
      });
    }

    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingId.set(null);
  }

  resetCurrentForm(): void {
    const tab = this.activeTab();
    if (tab === 'projects')
      this.projectForm.reset({ slaHours: 24, status: 'ACTIVE' });
    if (tab === 'employees')
      this.employeeForm.reset({ supportLevel: 'L1', role: 'L1_SUPPORT', status: 'ACTIVE', projectIds: [] });
    if (tab === 'shifts')
      this.shiftForm.reset({ startTime: '09:00', endTime: '18:00', timezone: 'Asia/Kolkata', workingDays: [] });
    if (tab === 'sla')
      this.slaForm.reset({ priorityLevel: 'P3 - Medium', responseTimeSla: 4, resolutionTimeSla: 24, escalationTimeSla: 8, projectId: null });
  }

  // ── Save ──────────────────────────────────────────────────
  save(): void {
    const tab = this.activeTab();

    // FIX #10: authorization tab has no save form — old code looked up
    // forms['authorization'] → undefined → undefined.invalid → crash
    if (tab === 'authorization') return;

    const forms: Record<string, any> = {
      projects: this.projectForm, employees: this.employeeForm,
      shifts: this.shiftForm,    sla: this.slaForm
    };

    const form = forms[tab];
    if (!form || form.invalid) { form?.markAllAsTouched(); return; }

    this.saving.set(true);

    // FIX #11: use getRawValue() not form.value — getRawValue() includes
    // values of disabled controls; form.value returns null for them.
    const val = form.getRawValue();
    const id  = this.editingId();

    let req$: any;
    if (tab === 'projects')  req$ = id ? this.api.updateProject(id, val)   : this.api.createProject(val);
    if (tab === 'employees') req$ = id ? this.api.updateEmployee(id, val)  : this.api.createEmployee(val);
    if (tab === 'shifts')    req$ = id ? this.api.updateShift(id, val)     : this.api.createShift(val);
    if (tab === 'sla')       req$ = id ? this.api.updateSlaConfig(id, val) : this.api.createSlaConfig(val);

    req$?.subscribe({
      next: () => {
        this.toast.success(id ? 'Updated successfully' : 'Created successfully');
        this.closeModal();
        this.loadAll();
        this.saving.set(false);
      },
      error: (err: any) => {
        this.toast.error('Save failed', err?.error?.message);
        this.saving.set(false);
      }
    });
  }

  // ── Delete ────────────────────────────────────────────────
  confirmDelete(id: number, type: string): void {
    this.deleteId.set(id);
    this.deleteType.set(type);
    // FIX #12: snapshot tab at confirm time — doDelete() uses this snapshot,
    // not activeTab(), so it always calls the correct API.
    this.deleteTab.set(this.activeTab());
  }

  doDelete(): void {
    const id  = this.deleteId();
    const tab = this.deleteTab(); // FIX: snapshotted tab, never stale
    if (!id) return;

    const reqs: Record<string, any> = {
      projects: this.api.deleteProject(id), employees: this.api.deleteEmployee(id),
      shifts:   this.api.deleteShift(id),   sla:       this.api.deleteSlaConfig(id)
    };

    const req$ = reqs[tab];
    if (!req$) {
      this.toast.error('Cannot delete: unknown record type');
      this.deleteId.set(null);
      return;
    }

    req$.subscribe({
      next: () => { this.toast.success('Deleted successfully'); this.deleteId.set(null); this.loadAll(); },
      error: () => this.toast.error('Delete failed')
    });
  }

  cancelDelete(): void { this.deleteId.set(null); }

  // ── Shift day picker ──────────────────────────────────────
  toggleDay(day: string): void {
    const cur = this.shiftForm.value.workingDays ?? [];
    this.shiftForm.patchValue({
      workingDays: cur.includes(day) ? cur.filter(d => d !== day) : [...cur, day]
    });
  }

  isDaySelected(day: string): boolean {
    return (this.shiftForm.value.workingDays ?? []).includes(day);
  }

  // ── Form control getters (for template validation) ────────
  get pf()   { return this.projectForm.controls; }
  get ef()   { return this.employeeForm.controls; }
  get sf()   { return this.shiftForm.controls; }
  get slaf() { return this.slaForm.controls; }
}
