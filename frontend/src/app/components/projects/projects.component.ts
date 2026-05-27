import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { Project } from '../../models/models';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  loading = false;
  showModal = false;
  isEdit = false;
  saving = false;
  editingId?: number;
  form!: FormGroup;

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadProjects();
  }

  initForm() {
    this.form = this.fb.group({
      projectName: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  loadProjects() {
    this.loading = true;
    this.api.getProjects().subscribe({
      next: (p) => { this.projects = p; this.loading = false; },
      error: () => { this.toast.error('Failed to load projects'); this.loading = false; }
    });
  }

  openCreate() {
    this.isEdit = false;
    this.editingId = undefined;
    this.form.reset();
    this.showModal = true;
  }

  openEdit(project: Project) {
    this.isEdit = true;
    this.editingId = project.id;
    this.form.patchValue({ projectName: project.projectName });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.form.reset();
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const data: Project = { projectName: this.form.value.projectName };
    const req$ = this.isEdit
      ? this.api.updateProject(this.editingId!, data)
      : this.api.createProject(data);

    req$.subscribe({
      next: () => {
        this.toast.success(this.isEdit ? 'Project updated' : 'Project created');
        this.closeModal();
        this.loadProjects();
        this.saving = false;
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Failed to save project');
        this.saving = false;
      }
    });
  }

  deleteProject(p: Project) {
    if (!confirm(`Delete project "${p.projectName}"? This may affect existing tickets.`)) return;
    this.api.deleteProject(p.id!).subscribe({
      next: () => { this.toast.success('Project deleted'); this.loadProjects(); },
      error: (err) => this.toast.error(err?.error?.message || 'Failed to delete project')
    });
  }

  hasError(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }
}
