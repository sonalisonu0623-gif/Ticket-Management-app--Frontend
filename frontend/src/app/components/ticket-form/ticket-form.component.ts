import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SpinnerComponent } from '../shared/spinner.component';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { Project, Employee, Ticket } from '../../models/models';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SpinnerComponent],
  templateUrl: './ticket-form.component.html',
})
export class TicketFormComponent implements OnInit {
  form!: FormGroup;
  projects: Project[] = [];
  employees: Employee[] = [];
  isEdit = false;
  ticketId?: number;
  loading = false;
  submitting = false;
  ticket?: Ticket;

  priorities = ['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low'];
  supportLevels = ['L1', 'L2', 'L3'];
  statuses = ['Open', 'In Progress', 'On Hold', 'Resolved', 'Closed'];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadDropdowns();

    const rawId = this.route.snapshot.params['id'];
    if (rawId) {
      this.ticketId = +rawId;
      this.isEdit = true;
      this.loadTicket(this.ticketId);
    }

    this.form.get('currentStatus')?.valueChanges.subscribe(status => {
      const resCtrl = this.form.get('resolutionDetails');
      if (status === 'Resolved' || status === 'Closed') {
        resCtrl?.setValidators([Validators.required]);
      } else {
        resCtrl?.clearValidators();
      }
      resCtrl?.updateValueAndValidity();
    });

    this.form.get('responseDatetime')?.valueChanges.subscribe(() => {
      this.calcResolutionTime();
    });
  }

  initForm() {
    const now = this.toLocalStr(new Date());
    this.form = this.fb.group({
      ticketNumber:      [{ value: '', disabled: true }],
      projectId:         [null, Validators.required],
      issueDescription:  ['', [Validators.required, Validators.minLength(10)]],
      assignedEmployeeId:[null],
      supportLevel:      [''],
      priority:          [''],
      generationDatetime:[{ value: now, disabled: true }],
      responseDatetime:  [''],
      resolutionTime:    [{ value: '', disabled: true }],
      currentStatus:     ['Open'],
      resolutionDetails: [''],
      remarks:           ['']
    });
  }

  toLocalStr(d: Date): string {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  loadDropdowns() {
    this.api.getProjects().subscribe({ next: p => this.projects = p });
    this.api.getEmployees().subscribe({ next: e => this.employees = e });
  }

  loadTicket(id: number) {
    this.loading = true;
    this.api.getTicketById(id).subscribe({
      next: (t) => {
        this.ticket = t;
        this.form.patchValue({
          ticketNumber:       t.ticketNumber,
          projectId:          t.projectId,
          issueDescription:   t.issueDescription,
          assignedEmployeeId: t.assignedEmployeeId,
          supportLevel:       t.supportLevel,
          priority:           t.priority,
          generationDatetime: t.generationDatetime ? this.toLocalStr(new Date(t.generationDatetime)) : '',
          responseDatetime:   t.responseDatetime   ? this.toLocalStr(new Date(t.responseDatetime))   : '',
          resolutionTime:     t.resolutionTime,
          currentStatus:      t.currentStatus,
          resolutionDetails:  t.resolutionDetails,
          remarks:            t.remarks
        });
        this.loading = false;
      },
      error: () => {
        this.toast.error('Failed to load ticket');
        this.loading = false;
      }
    });
  }

  calcResolutionTime() {
    const genStr = this.form.get('generationDatetime')?.value;
    const resStr = this.form.get('responseDatetime')?.value;
    if (!genStr || !resStr) { this.form.get('resolutionTime')?.setValue(''); return; }
    const diff = new Date(resStr).getTime() - new Date(genStr).getTime();
    if (diff < 0) { this.form.get('resolutionTime')?.setValue('Invalid — before generation'); return; }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    this.form.get('resolutionTime')?.setValue(`${h}h ${m}m`);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please fix the errors before submitting');
      return;
    }
    const raw = this.form.getRawValue();
    const payload: Ticket = {
      projectId:          raw.projectId,
      issueDescription:   raw.issueDescription,
      assignedEmployeeId: raw.assignedEmployeeId || undefined,
      supportLevel:       raw.supportLevel   || undefined,
      priority:           raw.priority       || undefined,
      responseDatetime:   raw.responseDatetime || undefined,
      currentStatus:      raw.currentStatus,
      resolutionDetails:  raw.resolutionDetails || undefined,
      remarks:            raw.remarks        || undefined
    };

    this.submitting = true;
    const req$ = this.isEdit
      ? this.api.updateTicket(this.ticketId!, payload)
      : this.api.createTicket(payload);

    req$.subscribe({
      next: (t) => {
        this.toast.success(this.isEdit ? 'Ticket updated!' : `Ticket ${t.ticketNumber} created!`);
        this.router.navigate(['/tickets', t.id]);
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'An unexpected error occurred');
        this.submitting = false;
      }
    });
  }

  resetForm() {
    if (this.isEdit && this.ticketId) {
      this.loadTicket(this.ticketId);
    } else {
      this.initForm();
    }
    this.toast.success('Form reset');
  }

  get isResolutionRequired(): boolean {
    const s = this.form.get('currentStatus')?.value;
    return s === 'Resolved' || s === 'Closed';
  }

  hasError(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  getError(field: string): string {
    const c = this.form.get(field);
    if (!c?.touched) return '';
    if (c.errors?.['required'])  return 'This field is required';
    if (c.errors?.['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} characters`;
    return '';
  }
}
