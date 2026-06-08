import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  ApiResponse, PageResponse, Project, Employee,
  Ticket, TicketFilter, Shift, SlaConfig, DashboardDTO
} from '../models/models';

const BASE = environment.apiBaseUrl;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // Projects
  getProjects(status?: string): Observable<Project[]> {
    const p = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<ApiResponse<Project[]>>(`${BASE}/projects`, { params: p }).pipe(map(r => r.data ?? []));
  }
  getProjectById(id: number): Observable<Project> {
    return this.http.get<ApiResponse<Project>>(`${BASE}/projects/${id}`).pipe(map(r => r.data));
  }
  createProject(p: Project): Observable<Project> {
    return this.http.post<ApiResponse<Project>>(`${BASE}/projects`, p).pipe(map(r => r.data));
  }
  updateProject(id: number, p: Project): Observable<Project> {
    return this.http.put<ApiResponse<Project>>(`${BASE}/projects/${id}`, p).pipe(map(r => r.data));
  }
  deleteProject(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${BASE}/projects/${id}`).pipe(map(() => void 0));
  }
  activateProject(id: number): Observable<Project> {
    return this.http.patch<ApiResponse<Project>>(`${BASE}/projects/${id}/activate`, {}).pipe(map(r => r.data));
  }
  deactivateProject(id: number): Observable<Project> {
    return this.http.patch<ApiResponse<Project>>(`${BASE}/projects/${id}/deactivate`, {}).pipe(map(r => r.data));
  }

  // Employees
  getEmployees(projectId?: number, supportLevel?: string): Observable<Employee[]> {
    let p = new HttpParams();
    if (projectId)    p = p.set('projectId', projectId);
    if (supportLevel) p = p.set('supportLevel', supportLevel);
    return this.http.get<ApiResponse<Employee[]>>(`${BASE}/employees`, { params: p }).pipe(map(r => r.data ?? []));
  }
  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<ApiResponse<Employee>>(`${BASE}/employees/${id}`).pipe(map(r => r.data));
  }
  createEmployee(e: Employee): Observable<Employee> {
    return this.http.post<ApiResponse<Employee>>(`${BASE}/employees`, e).pipe(map(r => r.data));
  }
  updateEmployee(id: number, e: Employee): Observable<Employee> {
    return this.http.put<ApiResponse<Employee>>(`${BASE}/employees/${id}`, e).pipe(map(r => r.data));
  }
  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${BASE}/employees/${id}`).pipe(map(() => void 0));
  }
  assignEmployeeToProject(empId: number, projId: number): Observable<Employee> {
    return this.http.post<ApiResponse<Employee>>(`${BASE}/employees/${empId}/projects/${projId}`, {}).pipe(map(r => r.data));
  }
  removeEmployeeFromProject(empId: number, projId: number): Observable<Employee> {
    return this.http.delete<ApiResponse<Employee>>(`${BASE}/employees/${empId}/projects/${projId}`).pipe(map(r => r.data));
  }

  // Tickets
  getTickets(filter: TicketFilter = {}, page = 0, size = 15, sortBy = 'createdAt', sortDir = 'desc'): Observable<ApiResponse<PageResponse<Ticket>>> {
    let p = new HttpParams().set('page', page).set('size', size).set('sortBy', sortBy).set('sortDir', sortDir);
    if (filter.ticketNumber)  p = p.set('ticketNumber',  filter.ticketNumber);
    if (filter.projectId)     p = p.set('projectId',     filter.projectId);
    if (filter.employeeId)    p = p.set('employeeId',    filter.employeeId);
    if (filter.priority)      p = p.set('priority',      filter.priority);
    if (filter.currentStatus) p = p.set('currentStatus', filter.currentStatus);
    if (filter.supportLevel)  p = p.set('supportLevel',  filter.supportLevel);
    if (filter.slaBreached != null) p = p.set('slaBreached', filter.slaBreached);
    return this.http.get<ApiResponse<PageResponse<Ticket>>>(`${BASE}/tickets`, { params: p });
  }
  getTicketById(id: number): Observable<Ticket> {
    return this.http.get<ApiResponse<Ticket>>(`${BASE}/tickets/${id}`).pipe(map(r => r.data));
  }
  createTicket(t: Ticket): Observable<Ticket> {
    return this.http.post<ApiResponse<Ticket>>(`${BASE}/tickets`, t).pipe(map(r => r.data));
  }
  updateTicket(id: number, t: Ticket): Observable<Ticket> {
    return this.http.put<ApiResponse<Ticket>>(`${BASE}/tickets/${id}`, t).pipe(map(r => r.data));
  }
  deleteTicket(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${BASE}/tickets/${id}`).pipe(map(() => void 0));
  }

  // Dashboard
  getDashboard(projectId?: number): Observable<DashboardDTO> {
    const p = projectId ? new HttpParams().set('projectId', projectId) : undefined;
    return this.http.get<ApiResponse<DashboardDTO>>(`${BASE}/dashboard`, { params: p }).pipe(map(r => r.data));
  }

  // Shifts
  getShifts(): Observable<Shift[]> {
    return this.http.get<ApiResponse<Shift[]>>(`${BASE}/shifts`).pipe(map(r => r.data ?? []));
  }
  createShift(s: Shift): Observable<Shift> {
    return this.http.post<ApiResponse<Shift>>(`${BASE}/shifts`, s).pipe(map(r => r.data));
  }
  updateShift(id: number, s: Shift): Observable<Shift> {
    return this.http.put<ApiResponse<Shift>>(`${BASE}/shifts/${id}`, s).pipe(map(r => r.data));
  }
  deleteShift(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${BASE}/shifts/${id}`).pipe(map(() => void 0));
  }

  // SLA Configs
  getSlaConfigs(projectId?: number): Observable<SlaConfig[]> {
    const p = projectId ? new HttpParams().set('projectId', projectId) : undefined;
    return this.http.get<ApiResponse<SlaConfig[]>>(`${BASE}/sla-configs`, { params: p }).pipe(map(r => r.data ?? []));
  }
  createSlaConfig(s: SlaConfig): Observable<SlaConfig> {
    return this.http.post<ApiResponse<SlaConfig>>(`${BASE}/sla-configs`, s).pipe(map(r => r.data));
  }
  updateSlaConfig(id: number, s: SlaConfig): Observable<SlaConfig> {
    return this.http.put<ApiResponse<SlaConfig>>(`${BASE}/sla-configs/${id}`, s).pipe(map(r => r.data));
  }
  deleteSlaConfig(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${BASE}/sla-configs/${id}`).pipe(map(() => void 0));
  }
}

  // Profile (re-export from /auth/me)
  getProfile(): any {
    return this.http.get<any>(`${BASE}/auth/me`);
  }
