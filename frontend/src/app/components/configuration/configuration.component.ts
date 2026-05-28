import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ConfigurationService } from '../../services/configuration.service';
import { EmployeeService } from '../../services/employee.service';
import { ProjectService } from '../../services/project.service';
import { ShiftHours, Holiday, SlaConfig, SLA_PRIORITIES, SLA_SUPPORT_LEVELS } from '../../models/configuration.model';
import { Employee } from '../../models/employee.model';
import { Project } from '../../models/project.model';

type Tab = 'projects' | 'employees' | 'shifts' | 'sla' | 'holidays';

@Component({
  selector: 'app-configuration',
  standalone: true,
imports: [
  CommonModule,
  RouterLink,
  ReactiveFormsModule,
  FormsModule
],
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {
  activeTab: Tab = 'projects';

  // ── Projects ────────────────────────────────────────────────────────────
  projects: Project[] = [];
  projectsLoading = false;

  // ── Employees ───────────────────────────────────────────────────────────
  employees: Employee[] = [];
  employeesLoading = false;
  employeeSearch = '';
  employeeStatusFilter = '';

  // ── Shift Hours ─────────────────────────────────────────────────────────
  shifts: ShiftHours[] = [];
  shiftsLoading = false;
  shiftForm!: FormGroup;
  editingShiftId: number | null = null;
  showShiftForm = false;

  // ── Holidays ────────────────────────────────────────────────────────────
  holidays: Holiday[] = [];
  holidaysLoading = false;
  holidayForm!: FormGroup;
  editingHolidayId: number | null = null;
  showHolidayForm = false;

  // ── SLA ─────────────────────────────────────────────────────────────────
  slaConfigs: SlaConfig[] = [];
  slaLoading = false;
  slaForm!: FormGroup;
  editingSlaId: number | null = null;
  showSlaForm = false;

  slaAllPriorities = SLA_PRIORITIES;
  slaSupportLevels = SLA_SUPPORT_LEVELS;

  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private configSvc: ConfigurationService,
    private employeeSvc: EmployeeService,
    private projectSvc: ProjectService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.route.queryParams.subscribe(p => {
      if (p['tab']) this.activeTab = p['tab'] as Tab;
      this.loadTab(this.activeTab);
    });
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;
    this.clearMessages();
    this.router.navigate([], { queryParams: { tab }, replaceUrl: true });
    this.loadTab(tab);
  }

  loadTab(tab: Tab): void {
    if (tab === 'projects')   this.loadProjects();
    if (tab === 'employees')  this.loadEmployees();
    if (tab === 'shifts')     this.loadShifts();
    if (tab === 'holidays')   this.loadHolidays();
    if (tab === 'sla')        this.loadSla();
  }

  // ── Initialise forms ────────────────────────────────────────────────────

  initForms(): void {
    this.shiftForm = this.fb.group({
      shiftName:  ['', Validators.required],
      startTime:  ['', Validators.required],
      endTime:    ['', Validators.required],
      isActive:   [true]
    });

    this.holidayForm = this.fb.group({
      holidayName: ['', Validators.required],
      holidayDate: ['', Validators.required],
      description: ['']
    });

    this.slaForm = this.fb.group({
      priority:             ['P1_CRITICAL', Validators.required],
      supportLevel:         ['L1',          Validators.required],
      responseTimeHours:    [1,  [Validators.required, Validators.min(0.1)]],
      resolutionTimeHours:  [4,  [Validators.required, Validators.min(0.1)]],
      isActive:             [true]
    });
  }

  // ── Projects ────────────────────────────────────────────────────────────

  loadProjects(): void {
    this.projectsLoading = true;
    this.projectSvc.getProjects(0, 200).subscribe({
      next: r => { this.projects = r.data?.content ?? []; this.projectsLoading = false; },
      error: () => { this.error = 'Failed to load projects.'; this.projectsLoading = false; }
    });
  }

  deleteProject(id: number): void {
    if (!confirm('Delete this project?')) return;
    this.projectSvc.deleteProject(id).subscribe({
      next: () => { this.showSuccess('Project deleted.'); this.loadProjects(); },
      error: err => this.error = err.error?.message || 'Delete failed.'
    });
  }

  // ── Employees ───────────────────────────────────────────────────────────

  loadEmployees(): void {
    this.employeesLoading = true;
    this.employeeSvc.searchEmployees(this.employeeSearch || undefined,
        (this.employeeStatusFilter as any) || undefined, 0, 200).subscribe({
      next: r => { this.employees = r.data?.content ?? []; this.employeesLoading = false; },
      error: () => { this.error = 'Failed to load employees.'; this.employeesLoading = false; }
    });
  }

  deleteEmployee(id: number): void {
    if (!confirm('Delete this employee? This will remove their login access.')) return;
    this.employeeSvc.deleteEmployee(id).subscribe({
      next: () => { this.showSuccess('Employee deleted.'); this.loadEmployees(); },
      error: err => this.error = err.error?.message || 'Delete failed.'
    });
  }

  // ── Shift Hours ─────────────────────────────────────────────────────────

  loadShifts(): void {
    this.shiftsLoading = true;
    this.configSvc.getShifts().subscribe({
      next: s => { this.shifts = s; this.shiftsLoading = false; },
      error: () => { this.error = 'Failed to load shifts.'; this.shiftsLoading = false; }
    });
  }

  openShiftForm(s?: ShiftHours): void {
    this.showShiftForm = true;
    this.editingShiftId = s?.id ?? null;
    this.shiftForm.reset({ isActive: true });
    if (s) this.shiftForm.patchValue(s);
  }

  cancelShiftForm(): void { this.showShiftForm = false; this.editingShiftId = null; }

  saveShift(): void {
    if (this.shiftForm.invalid) { this.shiftForm.markAllAsTouched(); return; }
    const val: ShiftHours = this.shiftForm.value;
    const req = this.editingShiftId
      ? this.configSvc.updateShift(this.editingShiftId, val)
      : this.configSvc.createShift(val);
    req.subscribe({
      next: () => { this.showSuccess('Shift saved.'); this.cancelShiftForm(); this.loadShifts(); },
      error: err => this.error = err.error?.message || 'Failed to save shift.'
    });
  }

  deleteShift(id: number): void {
    if (!confirm('Delete this shift?')) return;
    this.configSvc.deleteShift(id).subscribe({
      next: () => { this.showSuccess('Shift deleted.'); this.loadShifts(); },
      error: err => this.error = err.error?.message || 'Delete failed.'
    });
  }

  // ── Holidays ────────────────────────────────────────────────────────────

  loadHolidays(): void {
    this.holidaysLoading = true;
    this.configSvc.getHolidays().subscribe({
      next: h => { this.holidays = h; this.holidaysLoading = false; },
      error: () => { this.error = 'Failed to load holidays.'; this.holidaysLoading = false; }
    });
  }

  openHolidayForm(h?: Holiday): void {
    this.showHolidayForm = true;
    this.editingHolidayId = h?.id ?? null;
    this.holidayForm.reset();
    if (h) this.holidayForm.patchValue(h);
  }

  cancelHolidayForm(): void { this.showHolidayForm = false; this.editingHolidayId = null; }

  saveHoliday(): void {
    if (this.holidayForm.invalid) { this.holidayForm.markAllAsTouched(); return; }
    const val: Holiday = this.holidayForm.value;
    const req = this.editingHolidayId
      ? this.configSvc.updateHoliday(this.editingHolidayId, val)
      : this.configSvc.createHoliday(val);
    req.subscribe({
      next: () => { this.showSuccess('Holiday saved.'); this.cancelHolidayForm(); this.loadHolidays(); },
      error: err => this.error = err.error?.message || 'Failed to save holiday.'
    });
  }

  deleteHoliday(id: number): void {
    if (!confirm('Delete this holiday?')) return;
    this.configSvc.deleteHoliday(id).subscribe({
      next: () => { this.showSuccess('Holiday deleted.'); this.loadHolidays(); },
      error: err => this.error = err.error?.message || 'Delete failed.'
    });
  }

  // ── SLA ─────────────────────────────────────────────────────────────────

  loadSla(): void {
    this.slaLoading = true;
    this.configSvc.getSlaConfigs().subscribe({
      next: c => { this.slaConfigs = c; this.slaLoading = false; },
      error: () => { this.error = 'Failed to load SLA configs.'; this.slaLoading = false; }
    });
  }

  openSlaForm(c?: SlaConfig): void {
    this.showSlaForm = true;
    this.editingSlaId = c?.id ?? null;
    this.slaForm.reset({ priority: 'P1_CRITICAL', supportLevel: 'L1', responseTimeHours: 1, resolutionTimeHours: 4, isActive: true });
    if (c) this.slaForm.patchValue(c);
  }

  cancelSlaForm(): void { this.showSlaForm = false; this.editingSlaId = null; }

  saveSla(): void {
    if (this.slaForm.invalid) { this.slaForm.markAllAsTouched(); return; }
    const val: SlaConfig = this.slaForm.value;
    const req = this.editingSlaId
      ? this.configSvc.updateSlaConfig(this.editingSlaId, val)
      : this.configSvc.createSlaConfig(val);
    req.subscribe({
      next: () => { this.showSuccess('SLA config saved.'); this.cancelSlaForm(); this.loadSla(); },
      error: err => this.error = err.error?.message || 'Failed to save SLA config.'
    });
  }

  deleteSla(id: number): void {
    if (!confirm('Delete this SLA config?')) return;
    this.configSvc.deleteSlaConfig(id).subscribe({
      next: () => { this.showSuccess('SLA config deleted.'); this.loadSla(); },
      error: err => this.error = err.error?.message || 'Delete failed.'
    });
  }

  // ── utilities ────────────────────────────────────────────────────────────

  private showSuccess(msg: string): void {
    this.successMessage = msg; this.error = null;
    setTimeout(() => this.successMessage = null, 3000);
  }

  clearMessages(): void { this.error = null; this.successMessage = null; }

  priorityLabel(p: string): string {
    return { P1_CRITICAL: 'P1 – Critical', P2_HIGH: 'P2 – High', P3_MEDIUM: 'P3 – Medium', P4_LOW: 'P4 – Low' }[p] ?? p;
  }

  isFieldInvalid(form: FormGroup, f: string): boolean {
    const field = form.get(f);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}