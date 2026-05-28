import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserManagementService } from '../../services/user-management.service';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;
  userId: number | null = null;
  editUsername = '';
  currentUserId: number | null = null;   // employee.userId of the user being edited
  loading = false;
  submitting = false;
  error: string | null = null;
  successMessage: string | null = null;

  employees: (Employee & { userId?: number })[] = [];

  roleOptions = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'PROJECT_MANAGER', label: 'Project Manager' },
    { value: 'EMPLOYEE', label: 'Employee' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserManagementService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadEmployees();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.userId = Number(id);
      this.loadUser(this.userId);
    }
  }

  initForm(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      role: ['EMPLOYEE', [Validators.required]],
      employeeId: [null],
      isActive: [true]
    });
  }

  loadEmployees(): void {
    this.employeeService.getEmployees(0, 200).subscribe({
      next: res => { this.employees = res.data.content as any; },
      error: () => {}
    });
  }

  loadUser(id: number): void {
    this.loading = true;
    this.userService.getUserById(id).subscribe({
      next: user => {
        this.editUsername = user.username;
        this.currentUserId = user.id;
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId ?? null,
          isActive: user.isActive
        });
        this.loading = false;
      },
      error: () => { this.error = 'Failed to load user.'; this.loading = false; }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) { this.userForm.markAllAsTouched(); return; }
    this.submitting = true;
    this.error = null;
    const v = this.userForm.value;

    if (this.isEditMode && this.userId) {
      this.userService.updateUser(this.userId, {
        username: v.username, email: v.email, role: v.role,
        employeeId: v.employeeId || undefined, isActive: v.isActive
      }).subscribe({
        next: () => { this.submitting = false; this.successMessage = 'User updated!'; setTimeout(() => this.router.navigate(['/users']), 1500); },
        error: err => { this.submitting = false; this.error = err?.error?.message || 'Update failed.'; }
      });
    } else {
      this.userService.createUser({
        username: v.username, email: v.email, password: v.password,
        role: v.role, employeeId: v.employeeId || undefined
      }).subscribe({
        next: () => { this.submitting = false; this.successMessage = 'User created!'; setTimeout(() => this.router.navigate(['/users']), 1500); },
        error: err => { this.submitting = false; this.error = err?.error?.message || 'Create failed.'; }
      });
    }
  }

  onReset(): void {
    if (this.isEditMode && this.userId) { this.loadUser(this.userId); }
    else { this.userForm.reset({ role: 'EMPLOYEE', isActive: true, employeeId: null }); }
    this.error = null; this.successMessage = null;
  }

  isInvalid(f: string): boolean {
    const c = this.userForm.get(f);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  getError(f: string): string {
    const c = this.userForm.get(f);
    if (!c || !c.errors) return '';
    if (c.errors['required']) return 'This field is required';
    if (c.errors['email']) return 'Enter a valid email';
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} characters`;
    return 'Invalid value';
  }
}
