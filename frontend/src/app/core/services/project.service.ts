import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse, Project, Employee, ProjectAuthorization } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly url = `${environment.apiBaseUrl}/projects`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20, search = ''): Observable<ApiResponse<PageResponse<Project>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<PageResponse<Project>>>(this.url, { params });
  }

  getAllList(): Observable<Project[]> {
    return this.http.get<ApiResponse<Project[]>>(`${this.url}/list`).pipe(map(r => r.data));
  }

  getById(id: number): Observable<Project> {
    return this.http.get<ApiResponse<Project>>(`${this.url}/${id}`).pipe(map(r => r.data));
  }

  getMyProjects(): Observable<Project[]> {
    return this.http.get<ApiResponse<Project[]>>(`${this.url}/my`).pipe(map(r => r.data));
  }

  create(project: Project): Observable<Project> {
    return this.http.post<ApiResponse<Project>>(this.url, project).pipe(map(r => r.data));
  }

  update(id: number, project: Project): Observable<Project> {
    return this.http.put<ApiResponse<Project>>(`${this.url}/${id}`, project).pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`).pipe(map(() => void 0));
  }

  toggleStatus(id: number): Observable<Project> {
    return this.http.patch<ApiResponse<Project>>(`${this.url}/${id}/toggle-status`, {}).pipe(map(r => r.data));
  }

  getProjectEmployees(projectId: number): Observable<Employee[]> {
    return this.http.get<ApiResponse<Employee[]>>(`${this.url}/${projectId}/employees`).pipe(map(r => r.data));
  }

  assignEmployees(projectId: number, employeeIds: number[]): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.url}/${projectId}/employees`, { employeeIds }).pipe(map(() => void 0));
  }

  removeEmployee(projectId: number, employeeId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/${projectId}/employees/${employeeId}`).pipe(map(() => void 0));
  }

  getAuthorizations(projectId: number): Observable<ProjectAuthorization[]> {
    return this.http.get<ApiResponse<ProjectAuthorization[]>>(`${this.url}/${projectId}/authorizations`).pipe(map(r => r.data));
  }

  updateAuthorization(auth: ProjectAuthorization): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${this.url}/${auth.projectId}/authorizations/${auth.employeeId}`, auth).pipe(map(() => void 0));
  }
}
