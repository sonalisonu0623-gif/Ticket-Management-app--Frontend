import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Project, ProjectRequest, ProjectStatus } from '../models/project.model';
import { ApiResponse, PageResponse } from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  createProject(project: ProjectRequest): Observable<Project> {
    return this.http.post<ApiResponse<Project>>(this.apiUrl, project)
      .pipe(map(res => res.data));
  }

  getProjects(page = 0, size = 10): Observable<ApiResponse<PageResponse<Project>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', 'createdAt')
      .set('sortDir', 'desc');
    return this.http.get<ApiResponse<PageResponse<Project>>>(this.apiUrl, { params });
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<ApiResponse<Project>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => res.data));
  }

  updateProject(id: number, project: ProjectRequest): Observable<Project> {
    return this.http.put<ApiResponse<Project>>(`${this.apiUrl}/${id}`, project)
      .pipe(map(res => res.data));
  }

  deleteProject(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  searchProjects(search?: string, status?: ProjectStatus, page = 0, size = 10): Observable<ApiResponse<PageResponse<Project>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', 'createdAt')
      .set('sortDir', 'desc');
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<PageResponse<Project>>>(`${this.apiUrl}/search`, { params });
  }
}
