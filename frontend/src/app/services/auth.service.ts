import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, UserProfile, UserRole } from '../models/auth.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const TOKEN_KEY = 'nexus_jwt_token';
const USER_KEY  = 'nexus_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  // Reactive state
  private _token = signal<string | null>(null);
  private _user   = signal<AuthResponse | null>(null);

  readonly isAuthenticated = computed(() => !!this._token());
  readonly currentUser     = computed(() => this._user());
  readonly userRole         = computed(() => this._user()?.role ?? null);

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, request).pipe(
      map(res => {
        if (!res.success) throw new Error(res.message);
        return res.data;
      }),
      tap(data => this.saveSession(data))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, request).pipe(
      map(res => {
        if (!res.success) throw new Error(res.message);
        return res.data;
      }),
      tap(data => this.saveSession(data))
    );
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.apiUrl}/me`).pipe(
      map(res => res.data)
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  // ── Role helpers ──────────────────────────────────────────────────────────

  isAdmin(): boolean { return this._user()?.role === 'ADMIN'; }
  isProjectManager(): boolean { return this._user()?.role === 'PROJECT_MANAGER'; }
  isEmployee(): boolean { return this._user()?.role === 'EMPLOYEE'; }

  hasRole(...roles: UserRole[]): boolean {
    const role = this._user()?.role;
    return role ? roles.includes(role) : false;
  }

  canManageProjects(): boolean { return this.hasRole('ADMIN', 'PROJECT_MANAGER'); }
  canManageEmployees(): boolean { return this.hasRole('ADMIN'); }
  canDeleteTickets(): boolean { return this.hasRole('ADMIN', 'PROJECT_MANAGER'); }
  canCreateTickets(): boolean { return this.hasRole('ADMIN', 'PROJECT_MANAGER'); }

  // ── Session persistence ───────────────────────────────────────────────────

  private saveSession(data: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    this._token.set(data.token);
    this._user.set(data);
  }

  private restoreSession(): void {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    if (token && userJson) {
      try {
        const user: AuthResponse = JSON.parse(userJson);
        if (!this.isTokenExpired(token)) {
          this._token.set(token);
          this._user.set(user);
        } else {
          this.clearSession();
        }
      } catch {
        this.clearSession();
      }
    }
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
