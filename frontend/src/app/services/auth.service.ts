import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/models';
import { AuthStateResponse, UserSessionData } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authUrl = `${environment.apiBaseUrl}/auth`;
  private readonly TOKEN_KEY = 'ticketops_auth_token';
  private readonly USER_KEY = 'ticketops_user_data';

  // Core state management utilizing Angular Signals
  private _currentUser = signal<UserSessionData | null>(null);
  private _token = signal<string | null>(null);

  currentUser = this._currentUser.asReadonly();
  token = this._token.asReadonly();
  isAuthenticated = computed(() => !!this._token());
  isAdmin = computed(() => this._currentUser()?.role === 'ADMIN');

  constructor(private http: HttpClient, private router: Router) {
    this.hydrateSession();
  }

  private hydrateSession() {
    const savedToken = localStorage.getItem(this.TOKEN_KEY);
    const savedUser = localStorage.getItem(this.USER_KEY);

    if (savedToken && savedUser) {
      this._token.set(savedToken);
      this._currentUser.set(JSON.parse(savedUser));
    }
  }

  login(payload: any): Observable<ApiResponse<AuthStateResponse>> {
    return this.http.post<ApiResponse<AuthStateResponse>>(`${this.authUrl}/login`, payload).pipe(
      // Explicitly giving 'res' its explicit type definition here clears the 'unknown' error instantly
      tap((res: ApiResponse<AuthStateResponse>) => {
        if (res.success && res.data) {
          this.establishSession(res.data.token, res.data.user);
        }
      })
    );
  }

  register(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.authUrl}/register`, payload);
  }

  private establishSession(jwt: string, profile: UserSessionData) {
    localStorage.setItem(this.TOKEN_KEY, jwt);
    localStorage.setItem(this.USER_KEY, JSON.stringify(profile));
    this._token.set(jwt);
    this._currentUser.set(profile);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._token.set(null);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  checkTokenValidity(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.authUrl}/me`).pipe(
      catchError(err => {
        if (err.status === 401) {
          this.logout();
        }
        return throwError(() => err);
      })
    );
  }
}