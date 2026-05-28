import { Component, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../../core/services/ticket.service';
import { ProjectService } from '../../../core/services/project.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Project, Employee } from '../../../core/models/models';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="page-title-block">
          <h1 class="page-title">{{ isEdit() ? 'Edit Ticket' : 'New Ticket' }}</h1>
          <p class="page-subtitle">{{ isEdit() ? 'Update ticket details' : 'Create a support ticket' }}</p>
        </div>
        <div class="page-actions">
          <a routerLink="/tickets" class="btn btn-secondary">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </a>
        </div>
      </div>

      @if (loadingData()) {
        <div class="spinner-wrap"><div class="spinner"></div></div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-layout">
            <!-- Main column -->
            <div class="form-main">
              <div class="form-section">
                <div class="section-header">
                  <div class="section-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
                  </div>
                  <span class="section-title">Ticket Information</span>
                </div>

                <div class="form-field">
                  <label class="field-label required">Project</label>
                  <select class="field-select" [class.invalid]="isInvalid('projectId')" formControlName="projectId" (change)="onProjectChange()">
                    <option [ngValue]="null">Select project...</option>
                    @for (p of projects(); track p.id) {
                      <option [ngValue]="p.id">{{ p.projectName }} ({{ p.projectCode }})</option>
                    }
                  </select>
                  @if (isInvalid('projectId')) {
                    <span class="field-error">Project is required</span>
                  }
                </div>

                <div class="form-field">
                  <label class="field-label required">Issue Description</label>
                  <textarea
                    class="field-textarea"
                    [class.invalid]="isInvalid('issueDescription')"
                    formControlName="issueDescription"
                    rows="5"
                    placeholder="Describe the issue in detail..."
                  ></textarea>
                  @if (isInvalid('issueDescription')) {
                    <span class="field-error">Description is required (min 10 characters)</span>
                  }
                  <span class="field-hint">{{ form.get('issueDescription')?.value?.length ?? 0 }} characters</span>
                </div>

                @if (isEdit()) {
                  <div class="form-field">
                    <label class="field-label">Resolution Details</label>
                    <textarea
                      class="field-textarea"
                      formControlName="resolutionDetails"
                      rows="4"
                      placeholder="Describe how the issue was resolved..."
                    ></textarea>
                  </div>

                  <div class="form-field">
                    <label class="field-label">Remarks</label>
                    <textarea
                      class="field-textarea"
                      formControlName="remarks"
                      rows="3"
                      placeholder="Any additional remarks..."
                    ></textarea>
                  </div>
                }
              </div>
            </div>

            <!-- Side column -->
            <div class="form-side">
              <div class="form-section">
                <div class="section-header">
                  <div class="section-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  </div>
                  <span class="section-title">Classification</span>
                </div>

                <div class="form-field">
                  <label class="field-label required">Priority</label>
                  <select class="field-select" [class.invalid]="isInvalid('priority')" formControlName="priority">
                    <option [ngValue]="null">Select priority...</option>
                    <option value="P1">P1 – Critical</option>
                    <option value="P2">P2 – High</option>
                    <option value="P3">P3 – Medium</option>
                    <option value="P4">P4 – Low</option>
                  </select>
                  @if (isInvalid('priority')) {
                    <span class="field-error">Priority is required</span>
                  }
                </div>

                <div class="form-field">
                  <label class="field-label">Support Level</label>
                  <select class="field-select" formControlName="supportLevel">
                    <option [ngValue]="null">Auto-assign</option>
                    <option value="L1">L1 Support</option>
                    <option value="L2">L2 Support</option>
                    <option value="L3">L3 Support</option>
                  </select>
                </div>

                @if (canAssign()) {
                  <div class="form-field">
                    <label class="field-label">Assign To</label>
                    <select class="field-select" formControlName="assignedEmployeeId">
                      <option [ngValue]="null">Unassigned</option>
                      @for (e of projectEmployees(); track e.id) {
                        <option [ngValue]="e.id">{{ e.employeeName }}</option>
                      }
                    </select>
                    @if (!form.get('projectId')?.value) {
                      <span class="field-hint">Select a project first</span>
                    }
                  </div>
                }

                @if (isEdit()) {
                  <div class="form-field">
                    <label class="field-label">Status</label>
                    <select class="field-select" formControlName="currentStatus">
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="ON_HOLD">On Hold</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                }
              </div>

              <!-- SLA Info -->
              @if (selectedProject()) {
                <div class="sla-info-card">
                  <div class="sla-info-header">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    SLA Policy
                  </div>
                  <div class="sla-info-row">
                    <span>Project SLA</span>
                    <strong>{{ selectedProject()!.slaHours }}h</strong>
                  </div>
                  @if (selectedProject()!.shiftName) {
                    <div class="sla-info-row">
                      <span>Shift</span>
                      <strong>{{ selectedProject()!.shiftName }}</strong>
                    </div>
                  }
                  <div class="sla-info-note">
                    Resolution time is calculated in business hours only.
                  </div>
                </div>
              }

              <!-- Form Actions -->
              <div class="form-actions-card">
                <button type="submit" class="btn btn-primary" style="width:100%" [disabled]="saving()">
                  @if (saving()) {
                    <span class="btn-spinner"></span>
                    Saving...
                  } @else {
                    {{ isEdit() ? 'Update Ticket' : 'Create Ticket' }}
                  }
                </button>
                <a routerLink="/tickets" class="btn btn-secondary" style="width:100%;justify-content:center">Cancel</a>
              </div>
            </div>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .form-layout {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 20px;
      align-items: start;
    }
    .form-main, .form-side { display: flex; flex-direction: column; gap: 16px; }

    .field-hint { font-size: 11.5px; color: var(--text-muted); margin-top: 4px; display: block; }

    .sla-info-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px 16px;
    }
    .sla-info-header {
      display: flex; align-items: center; gap: 7px;
      font-size: 12px; font-weight: 600; color: var(--info);
      margin-bottom: 10px; padding-bottom: 10px;
      border-bottom: 1px solid var(--border);
    }
    .sla-info-row {
      display: flex; justify-content: space-between;
      font-size: 13px; color: var(--text-secondary);
      padding: 5px 0;
    }
    .sla-info-row strong { color: var(--text-primary); }
    .sla-info-note { font-size: 11.5px; color: var(--text-muted); margin-top: 8px; line-height: 1.5; }

    .form-actions-card { display: flex; flex-direction: column; gap: 8px; }

    @media (max-width: 900px) {
      .form-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class TicketFormComponent implements OnInit {
  form!: FormGroup;
  projects = signal<Project[]>([]);
  projectEmployees = signal<Employee[]>([]);
  loadingData = signal(true);
  saving = signal(false);
  ticketId = signal<number | null>(null);

  isEdit = computed(() => !!this.ticketId());
  canAssign = computed(() => this.auth.hasRole('ADMIN', 'PROJECT_MANAGER'));
  selectedProject = computed(() => {
    const id = this.form?.get('projectId')?.value;
    return this.projects().find(p => p.id === id) ?? null;
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private projectService: ProjectService,
    private employeeService: EmployeeService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadProjects();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ticketId.set(+id);
      this.loadTicket(+id);
    } else {
      this.loadingData.set(false);
      // Pre-select active project
      const activeProject = this.auth.activeProject();
      if (activeProject?.id) {
        this.form.patchValue({ projectId: activeProject.id });
        this.onProjectChange();
      }
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      projectId: [null, Validators.required],
      issueDescription: ['', [Validators.required, Validators.minLength(10)]],
      priority: [null, Validators.required],
      supportLevel: [null],
      assignedEmployeeId: [null],
      currentStatus: ['OPEN'],
      resolutionDetails: [''],
      remarks: ['']
    });
  }

  private loadProjects(): void {
    const obs = this.auth.isAdmin()
      ? this.projectService.getAllList()
      : this.projectService.getMyProjects();

    obs.subscribe(p => this.projects.set(p));
  }

  private loadTicket(id: number): void {
    this.ticketService.getById(id).subscribe({
      next: t => {
        this.form.patchValue({
          projectId: t.projectId,
          issueDescription: t.issueDescription,
          priority: t.priority,
          supportLevel: t.supportLevel ?? null,
          assignedEmployeeId: t.assignedEmployeeId ?? null,
          currentStatus: t.currentStatus,
          resolutionDetails: t.resolutionDetails ?? '',
          remarks: t.remarks ?? ''
        });
        this.loadingData.set(false);
        this.onProjectChange();
      },
      error: () => { this.toast.error('Failed to load ticket.'); this.router.navigate(['/tickets']); }
    });
  }

  onProjectChange(): void {
    const projectId = this.form.get('projectId')?.value;
    if (projectId) {
      this.employeeService.getAllList(projectId).subscribe(e => this.projectEmployees.set(e));
    } else {
      this.projectEmployees.set([]);
    }
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);

    const payload = { ...this.form.value };
    // Clean up nulls
    if (!payload.assignedEmployeeId) delete payload.assignedEmployeeId;
    if (!payload.supportLevel) delete payload.supportLevel;

    const obs$ = this.isEdit()
      ? this.ticketService.update(this.ticketId()!, payload)
      : this.ticketService.create(payload);

    obs$.subscribe({
      next: (ticket) => {
        this.toast.success(this.isEdit() ? 'Ticket updated!' : 'Ticket created!');
        this.router.navigate(['/tickets', ticket.id]);
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to save ticket.');
      }
    });
  }
}
