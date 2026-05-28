import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { ProjectRequest } from '../../models/project.model';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.css']
})
export class ProjectFormComponent implements OnInit {
  projectForm!: FormGroup;
  isEditMode = false;
  projectId: number | null = null;
  projectCode = '';
  loading = false;
  submitting = false;
  error: string | null = null;
  successMessage: string | null = null;

  statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'ON_HOLD', label: 'On Hold' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.projectId = Number(id);
      this.loadProject(this.projectId);
    }
  }

  initForm(): void {
    this.projectForm = this.fb.group({
      projectCode: ['', [Validators.required]],
      projectName: ['', [Validators.required]],
      description: [''],
      status: ['ACTIVE', [Validators.required]],
      startDate: [''],
      endDate: ['']
    });
  }

  loadProject(id: number): void {
    this.loading = true;
    this.projectService.getProjectById(id).subscribe({
      next: (project) => {
        this.projectCode = project.projectCode;
        this.projectForm.patchValue({
          projectCode: project.projectCode,
          projectName: project.projectName,
          description: project.description || '',
          status: project.status,
          startDate: project.startDate || '',
          endDate: project.endDate || ''
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load project details.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = null;

    const formValue = this.projectForm.value;
    const payload: ProjectRequest = {
      projectCode: formValue.projectCode,
      projectName: formValue.projectName,
      description: formValue.description || undefined,
      status: formValue.status,
      startDate: formValue.startDate || undefined,
      endDate: formValue.endDate || undefined
    };

    if (this.isEditMode && this.projectId) {
      this.projectService.updateProject(this.projectId, payload).subscribe({
        next: () => {
          this.submitting = false;
          this.successMessage = 'Project updated successfully!';
          setTimeout(() => this.router.navigate(['/configuration'], { queryParams: { tab: 'projects' } }), 1500);
        },
        error: (err) => {
          this.submitting = false;
          this.error = err.error?.message || 'Failed to update project.';
        }
      });
    } else {
      this.projectService.createProject(payload).subscribe({
        next: (project) => {
          this.submitting = false;
          this.successMessage = `Project ${project.projectCode} created successfully!`;
          setTimeout(() => this.router.navigate(['/configuration'], { queryParams: { tab: 'projects' } }), 1500);
        },
        error: (err) => {
          this.submitting = false;
          this.error = err.error?.message || 'Failed to create project.';
        }
      });
    }
  }

  onReset(): void {
    if (this.isEditMode && this.projectId) {
      this.loadProject(this.projectId);
    } else {
      this.projectForm.reset({ status: 'ACTIVE' });
    }
    this.error = null;
    this.successMessage = null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.projectForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.projectForm.get(fieldName);
    if (!field || !field.errors) return '';
    if (field.errors['required']) return 'This field is required';
    return 'Invalid value';
  }
}
