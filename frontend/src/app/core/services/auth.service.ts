import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, UserDTO, UserRole } from '../models';

const TOKEN_KEY   = 'tko_token';
const USER_KEY    = 'tko_user';
const PROJECT_KEY = 'tko_project';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base   = `${environment.apiBaseUrl}/auth`;

  private _user      = signal<UserDTO | null>(null);
  private _token     = signal<string | null>(null);
  private _projectId = signal<number | null>(null);

  readonly currentUser     = this._user.asReadonly();
  readonly token           = this._token.asReadonly();
  readonly activeProjectId = this._projectId.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin         = computed(() => this._user()?.role === 'ADMIN');
  readonly isProjectManager= computed(() => this._user()?.role === 'PROJECT_MANAGER');
  readonly isSupport       = computed(() => {
    const r = this._user()?.role;
    return r === 'L1_SUPPORT' || r === 'L2_SUPPORT' || r === 'L3_SUPPORT';
  });

  constructor() { this.hydrateSession(); }

  private hydrateSession(): void {
    const t = localStorage.getItem(TOKEN_KEY);
    const u = localStorage.getItem(USER_KEY);
    const p = localStorage.getItem(PROJECT_KEY);
    if (t && u) { this._token.set(t); this._user.set(JSON.parse(u)); }
    if (p) this._projectId.set(Number(p));
  }

  login(payload: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.base}/login`, payload).pipe(
      tap(res => {
        if (res.success && res.data) {
          localStorage.setItem(TOKEN_KEY, res.data.token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
          this._token.set(res.data.token);
          this._user.set(res.data.user);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  register(payload: RegisterRequest): Observable<ApiResponse<UserDTO>> {
    return this.http.post<ApiResponse<UserDTO>>(`${this.base}/register`, payload);
  }

  getProfile(): Observable<ApiResponse<UserDTO>> {
    return this.http.get<ApiResponse<UserDTO>>(`${this.base}/me`);
  }

  setActiveProject(id: number): void {
    localStorage.setItem(PROJECT_KEY, String(id));
    this._projectId.set(id);
  }

  clearActiveProject(): void {
    localStorage.removeItem(PROJECT_KEY);
    this._projectId.set(null);
  }

  logout(): void {
    [TOKEN_KEY, USER_KEY, PROJECT_KEY].forEach(k => localStorage.removeItem(k));
    this._token.set(null); this._user.set(null); this._projectId.set(null);
    this.router.navigate(['/auth/login']);
  }

  hasRole(...roles: UserRole[]): boolean {
    const r = this._user()?.role;
    return r ? roles.includes(r) : false;
  }

  getRoleDisplayClass(): string {
    const map: Record<string, string> = {
      ADMIN: 'role-admin', PROJECT_MANAGER: 'role-pm',
      L1_SUPPORT: 'role-l1', L2_SUPPORT: 'role-l2', L3_SUPPORT: 'role-l3', USER: 'role-user'
    };
    return map[this._user()?.role ?? ''] ?? 'role-user';
  }

  getRoleLabel(): string {
    const map: Record<string, string> = {
      ADMIN: 'Admin', PROJECT_MANAGER: 'PM',
      L1_SUPPORT: 'L1', L2_SUPPORT: 'L2', L3_SUPPORT: 'L3', USER: 'User'
    };
    return map[this._user()?.role ?? ''] ?? 'User';
  }

  initials(): string {
    return (this._user()?.username ?? 'U')[0].toUpperCase();
  }
}
