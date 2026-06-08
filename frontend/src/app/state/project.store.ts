import { Injectable, signal, computed, inject } from '@angular/core';
import { Project } from '../models/models';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class ProjectStore {
  private readonly auth = inject(AuthService);
  private _projects = signal<Project[]>([]);
  private _activeId = signal<number | null>(null);
  private _loading  = signal(false);

  readonly projects      = this._projects.asReadonly();
  readonly activeId      = this._activeId.asReadonly();
  readonly isLoading     = this._loading.asReadonly();
  readonly activeProject = computed(() => {
    const id = this._activeId();
    return id ? (this._projects().find(p => p.id === id) ?? null) : null;
  });

  setProjects(projects: Project[]): void {
    this._projects.set(projects);
    const saved = this.auth.activeProjectId();
    const valid = saved && projects.find(p => p.id === saved);
    if (!this._activeId() || !valid) {
      const first = projects[0]?.id ?? null;
      this._activeId.set(valid ? saved : first);
      if (first && !valid) this.auth.setActiveProject(first);
    }
  }

  switchProject(id: number): void {
    this._activeId.set(id);
    this.auth.setActiveProject(id);
  }

  setLoading(v: boolean): void { this._loading.set(v); }
  clear(): void { this._projects.set([]); this._activeId.set(null); }
}
