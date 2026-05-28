import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { ProjectService } from '../../services/project.service';
import { ConfigurationService } from '../../services/configuration.service';
import { EmployeeRequest } from '../../models/employee.model';
import { Project } from '../../models/project.model';
import { ShiftHours } from '../../models/configuration.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit {
  employeeForm!: FormGroup;
  isEditMode = false;
  employeeId: number | null = null;
  employeeName = '';
  loading = false;
  submitting = false;
  error: string | null = null;
  successMessage: string | null = null;

  allProjects: Project[] = [];
  selectedProjectIds: number[] = [];

  allShifts: ShiftHours[] = [];

  statusOptions = [
    { value: 'ACTIVE',    label: 'Active'   },
    { value: 'INACTIVE',  label: 'Inactive' },
    { value: 'ON_LEAVE',  label: 'On Leave' }
  ];

  roleOptions = [
    { value: 'ADMIN',           label: 'Admin'           },
    { value: 'PROJECT_MANAGER', label: 'Project Manager' },
    { value: 'EMPLOYEE',        label: 'Employee'        }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private projectService: ProjectService,
    private configService: ConfigurationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProjects();
    this.loadShifts();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.employeeId = Number(id);
      this.loadEmployee(this.employeeId);
    }
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      username:     ['', [Validators.required]],
      email:        ['', [Validators.required, Validators.email]],
      password:     [''],
      role:         ['EMPLOYEE', [Validators.required]],
      employeeName: ['', [Validators.required]],
      designation:  [''],
      department:   [''],
      status:       ['ACTIVE', [Validators.required]],
      shiftId:      [null]    // optional shift
    });

    if (!this.isEditMode) {
      this.employeeForm.get('password')!.setValidators(
        [Validators.required, Validators.minLength(6)]
      );
    }
  }

  loadProjects(): void {
    this.projectService.getProjects(0, 200).subscribe({
      next: res => this.allProjects = res.data?.content ?? [],
      error: () => {}
    });
  }

  loadShifts(): void {
    this.configService.getShifts().subscribe({
      next: shifts => this.allShifts = shifts.filter(s => s.isActive),
      error: () => {}
    });
  }

  loadEmployee(id: number): void {
    this.loading = true;
    this.employeeService.getEmployeeById(id).subscribe({
      next: emp => {
        this.employeeName = emp.employeeName;
        this.selectedProjectIds = emp.projects?.map(p => p.id) ?? [];
        this.employeeForm.patchValue({
          username:     emp.username,
          email:        emp.email,
          role:         emp.role,
          employeeName: emp.employeeName,
          designation:  emp.designation || '',
          department:   emp.department  || '',
          status:       emp.status,
          shiftId:      emp.shiftId ?? null
        });
        this.loading = false;
      },
      error: () => { this.error = 'Failed to load employee.'; this.loading = false; }
    });
  }

  toggleProject(id: number): void {
    const idx = this.selectedProjectIds.indexOf(id);
    if (idx >= 0) this.selectedProjectIds.splice(idx, 1);
    else this.selectedProjectIds.push(id);
  }

  isProjectSelected(id: number): boolean {
    return this.selectedProjectIds.includes(id);
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) { this.employeeForm.markAllAsTouched(); return; }

    this.submitting = true;
    this.error = null;
    const v = this.employeeForm.value;

    const payload: EmployeeRequest = {
      username:     v.username,
      email:        v.email,
      role:         v.role,
      employeeName: v.employeeName,
      designation:  v.designation  || undefined,
      department:   v.department   || undefined,
      status:       v.status,
      shiftId:      v.shiftId      || undefined,
      projectIds:   this.selectedProjectIds
    };
    if (v.password) payload.password = v.password;

    const req = this.isEditMode && this.employeeId
      ? this.employeeService.updateEmployee(this.employeeId, payload)
      : this.employeeService.createEmployee(payload);

    req.subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = `Employee ${this.isEditMode ? 'updated' : 'created'} successfully!`;
        setTimeout(() => this.router.navigate(['/configuration'],
          { queryParams: { tab: 'employees' } }), 1500);
      },
      error: err => {
        this.submitting = false;
        this.error = err.error?.message || 'Operation failed.';
      }
    });
  }

  onReset(): void {
    if (this.isEditMode && this.employeeId) this.loadEmployee(this.employeeId);
    else {
      this.employeeForm.reset({ status: 'ACTIVE', role: 'EMPLOYEE', shiftId: null });
      this.selectedProjectIds = [];
    }
    this.error = null; this.successMessage = null;
  }

  isFieldInvalid(f: string): boolean {
    const field = this.employeeForm.get(f);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(f: string): string {
    const field = this.employeeForm.get(f);
    if (!field?.errors) return '';
    if (field.errors['required'])  return 'This field is required';
    if (field.errors['email'])     return 'Enter a valid email';
    if (field.errors['minlength']) return 'Minimum 6 characters';
    return 'Invalid value';
  }
}
