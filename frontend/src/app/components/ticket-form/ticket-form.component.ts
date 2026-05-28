import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketService }   from '../../services/ticket.service';
import { EmployeeService } from '../../services/employee.service';
import { ProjectService }  from '../../services/project.service';
import { ConfigurationService } from '../../services/configuration.service';
import { AuthService } from '../../services/auth.service';
import { TicketRequest, PRIORITY_LABELS, STATUS_LABELS } from '../../models/ticket.model';
import { Employee } from '../../models/employee.model';
import { Project }  from '../../models/project.model';
import { SlaConfig } from '../../models/configuration.model';

/** SLA matrix used in the contextual reference panel (in minutes) */
const SLA_REFERENCE: Record<string, { response: number; resolution: number }> = {
  P1_CRITICAL: { response: 15,   resolution: 240  },
  P2_HIGH:     { response: 30,   resolution: 480  },
  P3_MEDIUM:   { response: 60,   resolution: 4320 },
  P4_LOW:      { response: 120,  resolution: 5760 },
};

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.css']
})
export class TicketFormComponent implements OnInit {
  ticketForm!: FormGroup;
  isEditMode = false;
  ticketId: number | null = null;
  existingTicketId = '';
  loading    = false;
  submitting = false;
  error: string | null = null;
  successMessage: string | null = null;

  projectOptions:  Project[]   = [];
  employeeOptions: Employee[]  = [];
  filteredEmployees: Employee[] = [];  // employees filtered by selected project
  slaConfigs: SlaConfig[] = [];

  supportLevels = ['L1', 'L2', 'L3'];

  priorities = [
    { value: 'P1_CRITICAL', label: 'P1 - Critical' },
    { value: 'P2_HIGH',     label: 'P2 - High'     },
    { value: 'P3_MEDIUM',   label: 'P3 - Medium'   },
    { value: 'P4_LOW',      label: 'P4 - Low'      },
  ];

  statuses = [
    { value: 'OPEN',        label: 'Open'        },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED',    label: 'Resolved'    },
    { value: 'CLOSED',      label: 'Closed'      },
  ];

  // SLA panel state
  slaRows = Object.entries(SLA_REFERENCE).map(([key, v]) => ({
    key,
    label: PRIORITY_LABELS[key as keyof typeof PRIORITY_LABELS] ?? key,
    response:   v.response,
    resolution: v.resolution,
    resFmt:     this.fmtMins(v.resolution),
  }));

  // Live SLA hint for selected priority
  get currentSla() {
    const p = this.ticketForm?.get('priority')?.value;
    const l = this.ticketForm?.get('supportLevel')?.value;
    if (!p) return null;

    // Try backend config first
    const cfg = this.slaConfigs.find(c => c.priority === p && c.supportLevel === l);
    if (cfg) return { response: cfg.responseTimeHours * 60, resolution: cfg.resolutionTimeHours * 60 };

    // Fallback to hardcoded table
    const ref = SLA_REFERENCE[p];
    return ref ? { response: ref.response, resolution: ref.resolution } : null;
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private employeeService: EmployeeService,
    private projectService: ProjectService,
    private configService: ConfigurationService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProjectOptions();
    this.loadEmployeeOptions();
    this.loadSlaConfigs();

    // When project changes, filter employees to only those assigned to that project
    this.ticketForm.get('projectAssignment')!.valueChanges.subscribe(v => {
      this.onProjectChange(v);
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.ticketId = Number(id);
      this.loadTicket(this.ticketId);
    }
  }

  initForm(): void {
    this.ticketForm = this.fb.group({
      projectAssignment: ['', [Validators.required]],
      issueDescription:  ['', [Validators.required, Validators.minLength(10)]],
      assignedEmployee:  [''],
      supportLevel:      ['L1', [Validators.required]],
      priority:          ['P3_MEDIUM', [Validators.required]],
      generationDateTime: [''],
      responseDateTime:  [''],
      resolutionTime:    [''],
      currentStatus:     ['OPEN', [Validators.required]],
      resolutionDetails: [''],
      remarks:           [''],
    });
  }

  loadProjectOptions(): void {
    this.projectService.getProjects(0, 200).subscribe({
      next: r => this.projectOptions = r.data?.content ?? [],
      error: () => {}
    });
  }

  loadEmployeeOptions(): void {
    this.employeeService.getEmployees(0, 200).subscribe({
      next: r => {
        this.employeeOptions = r.data?.content ?? [];
        this.filteredEmployees = this.employeeOptions;
      },
      error: () => {}
    });
  }

  loadSlaConfigs(): void {
    this.configService.getSlaConfigs().subscribe({
      next: cfgs => this.slaConfigs = cfgs,
      error: () => {}   // silently fall back to hardcoded table
    });
  }

  /** Filter employee dropdown to only members of the selected project */
  onProjectChange(projectName: string): void {
    if (!projectName) {
      this.filteredEmployees = this.employeeOptions;
      return;
    }
    this.filteredEmployees = this.employeeOptions.filter(e =>
      e.projects?.some(p => p.projectName === projectName || p.projectCode === projectName)
    );
    // If selected employee is no longer valid for the new project, clear it
    const currentAssignee = this.ticketForm.get('assignedEmployee')?.value;
    if (currentAssignee && !this.filteredEmployees.find(e => e.employeeName === currentAssignee)) {
      this.ticketForm.get('assignedEmployee')?.setValue('');
    }
  }

  loadTicket(id: number): void {
    this.loading = true;
    this.ticketService.getTicketById(id).subscribe({
      next: ticket => {
        this.existingTicketId = ticket.ticketId || '';
        this.ticketForm.patchValue({
          projectAssignment: ticket.projectAssignment,
          issueDescription:  ticket.issueDescription,
          assignedEmployee:  ticket.assignedEmployee,
          supportLevel:      ticket.supportLevel,
          priority:          ticket.priority,
          generationDateTime: this.fmtDateInput(ticket.generationDateTime),
          responseDateTime:   this.fmtDateInput(ticket.responseDateTime),
          resolutionTime:     this.fmtDateInput(ticket.resolutionTime),
          currentStatus:      ticket.currentStatus,
          resolutionDetails:  ticket.resolutionDetails,
          remarks:            ticket.remarks,
        });
        this.loading = false;
      },
      error: () => { this.error = 'Failed to load ticket details.'; this.loading = false; }
    });
  }

  onSubmit(): void {
    if (this.ticketForm.invalid) { this.ticketForm.markAllAsTouched(); return; }
    this.submitting = true;
    this.error = null;
    const v = this.ticketForm.value;
    const payload: TicketRequest = {
      projectAssignment: v.projectAssignment,
      issueDescription:  v.issueDescription,
      assignedEmployee:  v.assignedEmployee || undefined,
      supportLevel:      v.supportLevel,
      priority:          v.priority,
      generationDateTime: this.fmtDateApi(v.generationDateTime),
      responseDateTime:  this.fmtDateApi(v.responseDateTime),
      resolutionTime:    this.fmtDateApi(v.resolutionTime),
      currentStatus:     v.currentStatus,
      resolutionDetails: v.resolutionDetails || undefined,
      remarks:           v.remarks          || undefined,
    };

    const req = this.isEditMode && this.ticketId
      ? this.ticketService.updateTicket(this.ticketId, payload)
      : this.ticketService.createTicket(payload);

    req.subscribe({
      next: (t: any) => {
        this.submitting = false;
        this.successMessage = this.isEditMode
          ? 'Ticket updated successfully!'
          : `Ticket ${t.ticketId} created successfully!`;
        setTimeout(() => this.router.navigate(['/tickets']), 1500);
      },
      error: (err: any) => {
        this.submitting = false;
        this.error = err.error?.message || 'Operation failed. Please try again.';
      }
    });
  }

  onReset(): void {
    if (this.isEditMode && this.ticketId) this.loadTicket(this.ticketId);
    else this.ticketForm.reset({ supportLevel: 'L1', priority: 'P3_MEDIUM', currentStatus: 'OPEN' });
    this.error = null; this.successMessage = null;
  }

  // ── helpers ───────────────────────────────────────────────────────────────
  isFieldInvalid(f: string): boolean {
    const field = this.ticketForm.get(f);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
  getFieldError(f: string): string {
    const e = this.ticketForm.get(f)?.errors;
    if (!e) return '';
    if (e['required'])  return 'This field is required';
    if (e['minlength']) return `Minimum ${e['minlength'].requiredLength} characters`;
    return 'Invalid value';
  }
  private fmtDateInput(d?: string): string { return d ? d.substring(0, 16) : ''; }
  private fmtDateApi(d: string): string | undefined { return d ? d + ':00' : undefined; }

  fmtMins(m: number): string {
    if (m < 60)   return `${m}m`;
    if (m < 1440) return `${Math.round(m/60)}h`;
    return `${Math.round(m/60/24)}d ${Math.round((m/60) % 24)}h`;
  }

  getSlaClass(priority: string): string {
    const map: Record<string,string> = {
      P1_CRITICAL: 'sla-p1', P2_HIGH: 'sla-p2', P3_MEDIUM: 'sla-p3', P4_LOW: 'sla-p4'
    };
    return map[priority] ?? '';
  }

  getPriorityClass(p: string): string {
    const m: Record<string,string> = {
      P1_CRITICAL: 'pi-p1_critical', P2_HIGH: 'pi-p2_high',
      P3_MEDIUM: 'pi-p3_medium', P4_LOW: 'pi-p4_low'
    };
    return m[p] ?? '';
  }
}
