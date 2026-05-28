import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse, Employee } from '../models/models';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly url = `${environment.apiBaseUrl}/employees`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20, search = '', projectId?: number): Observable<ApiResponse<PageResponse<Employee>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<ApiResponse<PageResponse<Employee>>>(this.url, { params });
  }

  getAllList(projectId?: number): Observable<Employee[]> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<ApiResponse<Employee[]>>(`${this.url}/list`, { params }).pipe(map(r => r.data));
  }

  getById(id: number): Observable<Employee> {
    return this.http.get<ApiResponse<Employee>>(`${this.url}/${id}`).pipe(map(r => r.data));
  }

  create(employee: Employee): Observable<Employee> {
    return this.http.post<ApiResponse<Employee>>(this.url, employee).pipe(map(r => r.data));
  }

  update(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<ApiResponse<Employee>>(`${this.url}/${id}`, employee).pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`).pipe(map(() => void 0));
  }

  toggleStatus(id: number): Observable<Employee> {
    return this.http.patch<ApiResponse<Employee>>(`${this.url}/${id}/toggle-status`, {}).pipe(map(r => r.data));
  }

  assignProjects(employeeId: number, projectIds: number[]): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.url}/${employeeId}/projects`, { projectIds }).pipe(map(() => void 0));
  }
}
