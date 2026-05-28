import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserRecord, CreateUserRequest, UpdateUserRequest, ChangePasswordRequest, ResetPasswordRequest } from '../models/user.model';
import { UserRole } from '../models/auth.model';
import { ApiResponse, PageResponse } from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  createUser(request: CreateUserRequest): Observable<UserRecord> {
    return this.http.post<ApiResponse<UserRecord>>(this.apiUrl, request)
      .pipe(map(r => r.data));
  }

  getUsers(page = 0, size = 10): Observable<ApiResponse<PageResponse<UserRecord>>> {
    const params = new HttpParams()
      .set('page', page).set('size', size)
      .set('sortBy', 'createdAt').set('sortDir', 'desc');
    return this.http.get<ApiResponse<PageResponse<UserRecord>>>(this.apiUrl, { params });
  }

  searchUsers(search?: string, role?: UserRole, isActive?: boolean, page = 0, size = 10): Observable<ApiResponse<PageResponse<UserRecord>>> {
    let params = new HttpParams()
      .set('page', page).set('size', size)
      .set('sortBy', 'createdAt').set('sortDir', 'desc');
    if (search) params = params.set('search', search);
    if (role) params = params.set('role', role);
    if (isActive !== undefined) params = params.set('isActive', String(isActive));
    return this.http.get<ApiResponse<PageResponse<UserRecord>>>(`${this.apiUrl}/search`, { params });
  }

  getUserById(id: number): Observable<UserRecord> {
    return this.http.get<ApiResponse<UserRecord>>(`${this.apiUrl}/${id}`)
      .pipe(map(r => r.data));
  }

  updateUser(id: number, request: UpdateUserRequest): Observable<UserRecord> {
    return this.http.put<ApiResponse<UserRecord>>(`${this.apiUrl}/${id}`, request)
      .pipe(map(r => r.data));
  }

  activateUser(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivateUser(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  resetPassword(id: number, request: ResetPasswordRequest): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${id}/reset-password`, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/change-password`, request);
  }
}
