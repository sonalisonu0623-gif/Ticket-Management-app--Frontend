import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ApiResponse, PageResponse,
  Project, Employee, Ticket, TicketFilter,
  Shift, SlaConfig, DashboardDTO
} from '../models';

const BASE = environment.apiBaseUrl;

// ── Project API ──────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private url  = `${BASE}/projects`;

  getAll(status?: string): Observable<Project[]> {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<ApiResponse<Project[]>>(this.url, { params }).pipe(map(r => r.data));
  }
  getById(id: number): Observable<Project> {
    return this.http.get<ApiResponse<Project>>(`${this.url}/${id}`).pipe(map(r => r.data));
  }
  getByEmployee(empId: number): Observable<Project[]> {
    return this.http.get<ApiResponse<Project[]>>(`${this.url}/by-employee/${empId}`).pipe(map(r => r.data));
  }
  create(p: Project): Observable<Project> {
    return this.http.post<ApiResponse<Project>>(this.url, p).pipe(map(r => r.data));
  }
  update(id: number, p: Project): Observable<Project> {
    return this.http.put<ApiResponse<Project>>(`${this.url}/${id}`, p).pipe(map(r => r.data));
  }
  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`).pipe(map(() => void 0));
  }
  activate(id: number): Observable<Project> {
    return this.http.patch<ApiResponse<Project>>(`${this.url}/${id}/activate`, {}).pipe(map(r => r.data));
  }
  deactivate(id: number): Observable<Project> {
    return this.http.patch<ApiResponse<Project>>(`${this.url}/${id}/deactivate`, {}).pipe(map(r => r.data));
  }
}

// ── Employee API ─────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private url  = `${BASE}/employees`;

  getAll(projectId?: number, supportLevel?: string): Observable<Employee[]> {
    let p = new HttpParams();
    if (projectId)    p = p.set('projectId', projectId);
    if (supportLevel) p = p.set('supportLevel', supportLevel);
    return this.http.get<ApiResponse<Employee[]>>(this.url, { params: p }).pipe(map(r => r.data));
  }
  getById(id: number): Observable<Employee> {
    return this.http.get<ApiResponse<Employee>>(`${this.url}/${id}`).pipe(map(r => r.data));
  }
  create(e: Employee): Observable<Employee> {
    return this.http.post<ApiResponse<Employee>>(this.url, e).pipe(map(r => r.data));
  }
  update(id: number, e: Employee): Observable<Employee> {
    return this.http.put<ApiResponse<Employee>>(`${this.url}/${id}`, e).pipe(map(r => r.data));
  }
  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`).pipe(map(() => void 0));
  }
  assignToProject(empId: number, projId: number): Observable<Employee> {
    return this.http.post<ApiResponse<Employee>>(`${this.url}/${empId}/projects/${projId}`, {}).pipe(map(r => r.data));
  }
  removeFromProject(empId: number, projId: number): Observable<Employee> {
    return this.http.delete<ApiResponse<Employee>>(`${this.url}/${empId}/projects/${projId}`).pipe(map(r => r.data));
  }
}

// ── Ticket API ───────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);
  private url  = `${BASE}/tickets`;

  getAll(
    filter: TicketFilter = {},
    page = 0, size = 15,
    sortBy = 'createdAt', sortDir = 'desc'
  ): Observable<ApiResponse<PageResponse<Ticket>>> {
    let p = new HttpParams()
      .set('page', page).set('size', size)
      .set('sortBy', sortBy).set('sortDir', sortDir);
    if (filter.ticketNumber)  p = p.set('ticketNumber',  filter.ticketNumber);
    if (filter.projectId)     p = p.set('projectId',     filter.projectId);
    if (filter.employeeId)    p = p.set('employeeId',    filter.employeeId);
    if (filter.priority)      p = p.set('priority',      filter.priority);
    if (filter.currentStatus) p = p.set('currentStatus', filter.currentStatus);
    if (filter.supportLevel)  p = p.set('supportLevel',  filter.supportLevel);
    if (filter.slaBreached != null) p = p.set('slaBreached', filter.slaBreached);
    if (filter.dateFrom)      p = p.set('dateFrom', filter.dateFrom);
    if (filter.dateTo)        p = p.set('dateTo',   filter.dateTo);
    return this.http.get<ApiResponse<PageResponse<Ticket>>>(this.url, { params: p });
  }

  getById(id: number): Observable<Ticket> {
    return this.http.get<ApiResponse<Ticket>>(`${this.url}/${id}`).pipe(map(r => r.data));
  }
  getByNumber(num: string): Observable<Ticket> {
    return this.http.get<ApiResponse<Ticket>>(`${this.url}/number/${num}`).pipe(map(r => r.data));
  }
  create(t: Ticket): Observable<Ticket> {
    return this.http.post<ApiResponse<Ticket>>(this.url, t).pipe(map(r => r.data));
  }
  update(id: number, t: Ticket): Observable<Ticket> {
    return this.http.put<ApiResponse<Ticket>>(`${this.url}/${id}`, t).pipe(map(r => r.data));
  }
  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`).pipe(map(() => void 0));
  }
}

// ── Dashboard API ────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private url  = `${BASE}/dashboard`;

  get(projectId?: number): Observable<DashboardDTO> {
    const p = projectId ? new HttpParams().set('projectId', projectId) : undefined;
    return this.http.get<ApiResponse<DashboardDTO>>(this.url, { params: p }).pipe(map(r => r.data));
  }
}

// ── Shift API ────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ShiftService {
  private http = inject(HttpClient);
  private url  = `${BASE}/shifts`;

  getAll(): Observable<Shift[]> {
    return this.http.get<ApiResponse<Shift[]>>(this.url).pipe(map(r => r.data));
  }
  create(s: Shift): Observable<Shift> {
    return this.http.post<ApiResponse<Shift>>(this.url, s).pipe(map(r => r.data));
  }
  update(id: number, s: Shift): Observable<Shift> {
    return this.http.put<ApiResponse<Shift>>(`${this.url}/${id}`, s).pipe(map(r => r.data));
  }
  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`).pipe(map(() => void 0));
  }
}

// ── SLA Config API ───────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class SlaConfigService {
  private http = inject(HttpClient);
  private url  = `${BASE}/sla-configs`;

  getAll(projectId?: number): Observable<SlaConfig[]> {
    const p = projectId ? new HttpParams().set('projectId', projectId) : undefined;
    return this.http.get<ApiResponse<SlaConfig[]>>(this.url, { params: p }).pipe(map(r => r.data));
  }
  create(s: SlaConfig): Observable<SlaConfig> {
    return this.http.post<ApiResponse<SlaConfig>>(this.url, s).pipe(map(r => r.data));
  }
  update(id: number, s: SlaConfig): Observable<SlaConfig> {
    return this.http.put<ApiResponse<SlaConfig>>(`${this.url}/${id}`, s).pipe(map(r => r.data));
  }
  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`).pipe(map(() => void 0));
  }
}
