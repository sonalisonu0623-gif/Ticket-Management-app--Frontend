import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { ProjectStore } from '../../state/project.store';
import { Ticket, Project, Employee, PRIORITIES, STATUSES, SUPPORT_LEVELS } from '../../models/models';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.css']
})
export class TicketFormComponent implements OnInit {
  private api    = inject(ApiService);
  private store  = inject(ProjectStore);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private toast  = inject(ToastService);
  private fb     = inject(FormBuilder);

  loading   = signal(true);
  saving    = signal(false);
  isEdit    = signal(false);
  ticketId  = signal<number | null>(null);
  projects  = signal<Project[]>([]);
  employees = signal<Employee[]>([]);

  readonly priorities    = PRIORITIES;
  readonly statuses      = STATUSES;
  readonly supportLevels = SUPPORT_LEVELS;

  form = this.fb.group({
    projectId:          [null as number | null, Validators.required],
    issueDescription:   ['', [Validators.required, Validators.minLength(5)]],
    assignedEmployeeId: [null as number | null],
    supportLevel:       [''],
    priority:           ['P3 - Medium'],
    currentStatus:      ['Open'],
    generationDatetime: [''],
    resolutionDetails:  [''],
    remarks:            ['']
  });

  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.api.getProjects('ACTIVE').subscribe(p => this.projects.set(p));
    this.api.getEmployees().subscribe(e => this.employees.set(e));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true); this.ticketId.set(Number(id));
      this.api.getTicketById(Number(id)).subscribe({
        next: t => {
          this.form.patchValue({
            projectId: t.projectId, issueDescription: t.issueDescription,
            assignedEmployeeId: t.assignedEmployeeId ?? null,
            supportLevel: t.supportLevel ?? '', priority: t.priority ?? 'P3 - Medium',
            currentStatus: t.currentStatus ?? 'Open',
            generationDatetime: t.generationDatetime?.slice(0, 16) ?? '',
            resolutionDetails: t.resolutionDetails ?? '', remarks: t.remarks ?? ''
          });
          this.loading.set(false);
        },
        error: () => { this.toast.error('Ticket not found'); this.router.navigate(['/tickets']); }
      });
    } else {
      const pid = this.store.activeId();
      if (pid) this.form.patchValue({ projectId: pid });
      this.form.patchValue({ generationDatetime: new Date().toISOString().slice(0, 16) });
      this.loading.set(false);
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const v = this.form.value;
    const payload: Ticket = {
      projectId: v.projectId!, issueDescription: v.issueDescription!.trim(),
      assignedEmployeeId: v.assignedEmployeeId ?? undefined,
      supportLevel: v.supportLevel || undefined, priority: (v.priority || 'P3 - Medium') as any,
      currentStatus: (v.currentStatus || 'Open') as any,
      generationDatetime: v.generationDatetime || undefined,
      resolutionDetails: v.resolutionDetails || undefined, remarks: v.remarks || undefined
    };

    const req$ = this.isEdit() ? this.api.updateTicket(this.ticketId()!, payload) : this.api.createTicket(payload);
    req$.subscribe({
      next: t => { this.saving.set(false); this.toast.success(this.isEdit() ? 'Ticket updated' : 'Ticket created'); this.router.navigate(['/tickets', t.id]); },
      error: err => { this.saving.set(false); this.toast.error('Failed to save ticket', err?.error?.message); }
    });
  }
}
