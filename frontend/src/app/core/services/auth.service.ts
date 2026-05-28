import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, UserSessionData, Project } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authUrl = `${environment.apiBaseUrl}/auth`;

  // ---- Signals ----
  private _currentUser = signal<UserSessionData | null>(null);
  private _token = signal<string | null>(null);
  private _activeProject = signal<Project | null>(null);
  private _assignedProjects = signal<Project[]>([]);

  // ---- Computed readonly ----
  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();
  readonly activeProject = this._activeProject.asReadonly();
  readonly assignedProjects = this._assignedProjects.asReadonly();

  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._currentUser()?.role === 'ADMIN');
  readonly isProjectManager = computed(() => this._currentUser()?.role === 'PROJECT_MANAGER');
  readonly isSupport = computed(() => {
    const role = this._currentUser()?.role;
    return role === 'L1_SUPPORT' || role === 'L2_SUPPORT';
  });
  readonly userRole = computed(() => this._currentUser()?.role);
  readonly userInitials = computed(() => {
    const name = this._currentUser()?.username ?? '';
    return name.slice(0, 2).toUpperCase();
  });
  readonly activeProjectId = computed(() => this._activeProject()?.id ?? null);

  constructor(private http: HttpClient, private router: Router) {
    this.hydrateSession();
  }

  private hydrateSession(): void {
    const token = localStorage.getItem(environment.tokenKey);
    const userData = localStorage.getItem(environment.userKey);
    const projectData = localStorage.getItem(environment.projectKey);

    if (token && userData) {
      try {
        this._token.set(token);
        this._currentUser.set(JSON.parse(userData));
      } catch {
        this.clearStorage();
      }
    }

    if (projectData) {
      try {
        this._activeProject.set(JSON.parse(projectData));
      } catch {
        localStorage.removeItem(environment.projectKey);
      }
    }
  }

  login(payload: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.authUrl}/login`, payload).pipe(
      tap((res: ApiResponse<AuthResponse>) => {
        if (res.success && res.data) {
          this.establishSession(res.data.token, res.data.user);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  register(payload: RegisterRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.authUrl}/register`, payload);
  }

  checkMe(): Observable<ApiResponse<UserSessionData>> {
    return this.http.get<ApiResponse<UserSessionData>>(`${this.authUrl}/me`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this._currentUser.set(res.data);
          localStorage.setItem(environment.userKey, JSON.stringify(res.data));
        }
      }),
      catchError(err => {
        if (err.status === 401) this.logout();
        return throwError(() => err);
      })
    );
  }

  private establishSession(jwt: string, user: UserSessionData): void {
    localStorage.setItem(environment.tokenKey, jwt);
    localStorage.setItem(environment.userKey, JSON.stringify(user));
    this._token.set(jwt);
    this._currentUser.set(user);
  }

  switchProject(project: Project): void {
    this._activeProject.set(project);
    localStorage.setItem(environment.projectKey, JSON.stringify(project));
  }

  setAssignedProjects(projects: Project[]): void {
    this._assignedProjects.set(projects);
    // Auto-select first project if none selected
    if (!this._activeProject() && projects.length > 0) {
      this.switchProject(projects[0]);
    }
  }

  canAccessProject(projectId: number): boolean {
    if (this.isAdmin()) return true;
    const user = this._currentUser();
    if (!user) return false;
    return user.assignedProjectIds?.includes(projectId) ?? false;
  }

  hasRole(...roles: string[]): boolean {
    const role = this._currentUser()?.role;
    return role ? roles.includes(role) : false;
  }

  logout(): void {
    this.clearStorage();
    this._token.set(null);
    this._currentUser.set(null);
    this._activeProject.set(null);
    this._assignedProjects.set([]);
    this.router.navigate(['/auth/login']);
  }

  private clearStorage(): void {
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.userKey);
    localStorage.removeItem(environment.projectKey);
  }
}
