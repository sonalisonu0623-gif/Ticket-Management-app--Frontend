import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { Employee } from '../../models/models';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  loading = false;
  showModal = false;
  isEdit = false;
  saving = false;
  editingId?: number;
  form!: FormGroup;

  supportLevels = ['L1', 'L2', 'L3'];

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadEmployees();
  }

  initForm() {
    this.form = this.fb.group({
      employeeName: ['', [Validators.required, Validators.minLength(2)]],
      supportLevel: ['']
    });
  }

  loadEmployees() {
    this.loading = true;
    this.api.getEmployees().subscribe({
      next: (e) => { this.employees = e; this.loading = false; },
      error: () => { this.toast.error('Failed to load employees'); this.loading = false; }
    });
  }

  openCreate() {
    this.isEdit = false;
    this.editingId = undefined;
    this.form.reset();
    this.showModal = true;
  }

  openEdit(emp: Employee) {
    this.isEdit = true;
    this.editingId = emp.id;
    this.form.patchValue({ employeeName: emp.employeeName, supportLevel: emp.supportLevel || '' });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.form.reset();
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const data: Employee = {
      employeeName: this.form.value.employeeName,
      supportLevel: this.form.value.supportLevel || undefined
    };
    const req$ = this.isEdit
      ? this.api.updateEmployee(this.editingId!, data)
      : this.api.createEmployee(data);

    req$.subscribe({
      next: () => {
        this.toast.success(this.isEdit ? 'Employee updated' : 'Employee created');
        this.closeModal();
        this.loadEmployees();
        this.saving = false;
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Failed to save employee');
        this.saving = false;
      }
    });
  }

  deleteEmployee(emp: Employee) {
    if (!confirm(`Delete employee "${emp.employeeName}"? This may affect existing tickets.`)) return;
    this.api.deleteEmployee(emp.id!).subscribe({
      next: () => { this.toast.success('Employee deleted'); this.loadEmployees(); },
      error: (err) => this.toast.error(err?.error?.message || 'Failed to delete employee')
    });
  }

  hasError(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  avatarColor(name: string): string {
    const colors = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#f97316'];
    return colors[name.charCodeAt(0) % colors.length];
  }
}
