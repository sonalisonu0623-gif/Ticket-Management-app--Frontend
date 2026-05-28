import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { EmployeeService } from '../../services/employee.service';
import { ProjectService } from '../../services/project.service';
import {
  TicketRequest,
  PRIORITY_LABELS,
  STATUS_LABELS
} from '../../models/ticket.model';
import { Employee } from '../../models/employee.model';
import { Project } from '../../models/project.model';

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
  loading = false;
  submitting = false;
  error: string | null = null;
  successMessage: string | null = null;

  projectOptions: Project[] = [];
  employeeOptions: Employee[] = [];
  supportLevels = ['L1', 'L2', 'L3'];

  priorities = [
    { value: 'P1_CRITICAL', label: 'P1 - Critical' },
    { value: 'P2_HIGH', label: 'P2 - High' },
    { value: 'P3_MEDIUM', label: 'P3 - Medium' },
    { value: 'P4_LOW', label: 'P4 - Low' }
  ];

  statuses = [
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' }
  ];

  constructor(
    private employeeService: EmployeeService,
    private projectService: ProjectService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.loadProjectOptions();
    this.loadEmployeeOptions();
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
      issueDescription: ['', [Validators.required, Validators.minLength(10)]],
      assignedEmployee: [''],
      supportLevel: ['L1', [Validators.required]],
      priority: ['P3_MEDIUM', [Validators.required]],
      generationDateTime: [''],
      responseDateTime: [''],
      resolutionTime: [''],
      currentStatus: ['OPEN', [Validators.required]],
      resolutionDetails: [''],
      remarks: ['']
    });
  }

  loadTicket(id: number): void {
    this.loading = true;
    this.ticketService.getTicketById(id).subscribe({
      next: (ticket) => {
        this.existingTicketId = ticket.ticketId || '';
        this.ticketForm.patchValue({
          projectAssignment: ticket.projectAssignment,
          issueDescription: ticket.issueDescription,
          assignedEmployee: ticket.assignedEmployee,
          supportLevel: ticket.supportLevel,
          priority: ticket.priority,
          generationDateTime: this.formatDateForInput(ticket.generationDateTime),
          responseDateTime: this.formatDateForInput(ticket.responseDateTime),
          resolutionTime: this.formatDateForInput(ticket.resolutionTime),
          currentStatus: ticket.currentStatus,
          resolutionDetails: ticket.resolutionDetails,
          remarks: ticket.remarks
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load ticket details.';
        this.loading = false;
      }
    });
  }

  formatDateForInput(dateStr?: string): string {
    if (!dateStr) return '';
    // Convert ISO datetime string to datetime-local format
    return dateStr.substring(0, 16);
  }

  formatDateForApi(dateStr: string): string | undefined {
    if (!dateStr) return undefined;
    return dateStr + ':00'; // append seconds
  }

  onSubmit(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = null;

    const formValue = this.ticketForm.value;
    const payload: TicketRequest = {
      projectAssignment: formValue.projectAssignment,
      issueDescription: formValue.issueDescription,
      assignedEmployee: formValue.assignedEmployee || undefined,
      supportLevel: formValue.supportLevel,
      priority: formValue.priority,
      generationDateTime: this.formatDateForApi(formValue.generationDateTime),
      responseDateTime: this.formatDateForApi(formValue.responseDateTime),
      resolutionTime: this.formatDateForApi(formValue.resolutionTime),
      currentStatus: formValue.currentStatus,
      resolutionDetails: formValue.resolutionDetails || undefined,
      remarks: formValue.remarks || undefined
    };

    if (this.isEditMode && this.ticketId) {
      this.ticketService.updateTicket(this.ticketId, payload).subscribe({
        next: () => {
          this.submitting = false;
          this.successMessage = 'Ticket updated successfully!';
          setTimeout(() => this.router.navigate(['/tickets']), 1500);
        },
        error: (err) => {
          this.submitting = false;
          this.error = err.error?.message || 'Failed to update ticket.';
        }
      });
    } else {
      this.ticketService.createTicket(payload).subscribe({
        next: (ticket) => {
          this.submitting = false;
          this.successMessage = `Ticket ${ticket.ticketId} created successfully!`;
          setTimeout(() => this.router.navigate(['/tickets']), 1500);
        },
        error: (err) => {
          this.submitting = false;
          this.error = err.error?.message || 'Failed to create ticket.';
        }
      });
    }
  }

  onReset(): void {
    if (this.isEditMode && this.ticketId) {
      this.loadTicket(this.ticketId);
    } else {
      this.ticketForm.reset({
        supportLevel: 'L1',
        priority: 'P3_MEDIUM',
        currentStatus: 'OPEN'
      });
    }
    this.error = null;
    this.successMessage = null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.ticketForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.ticketForm.get(fieldName);
    if (!field || !field.errors) return '';
    if (field.errors['required']) return 'This field is required';
    if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
    return 'Invalid value';
  }
  loadProjectOptions(): void {
    this.projectService.getProjects(0, 200).subscribe({
      next: r => this.projectOptions = r.data?.content ?? [],
      error: () => {}
    });
  }

  loadEmployeeOptions(): void {
    this.employeeService.getEmployees(0, 200).subscribe({
      next: r => this.employeeOptions = r.data?.content ?? [],
      error: () => {}
    });
  }


}
