import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  ApiResponse, PageResponse, Project, Employee,
  Ticket, TicketFilter, Shift, SlaConfig, DashboardDTO, UserDTO
} from '../models/models';

const BASE = environment.apiBaseUrl;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // ── Auth / Profile ──────────────────────────────────────
  getProfile(): Observable<ApiResponse<UserDTO>> {
    return this.http.get<ApiResponse<UserDTO>>(`${BASE}/auth/me`);
  }

  // ── Projects ─────────────────────────────────────────────
  getProjects(status?: string): Observable<Project[]> {
    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }

    return this.http
      .get<ApiResponse<Project[]>>(`${BASE}/projects`, { params })
      .pipe(
        map((r: ApiResponse<Project[]>) => r.data ?? [])
      );
  }

  getProjectById(id: number): Observable<Project> {
    return this.http
      .get<ApiResponse<Project>>(`${BASE}/projects/${id}`)
      .pipe(
        map((r: ApiResponse<Project>) => r.data!)
      );
  }

  createProject(p: Project): Observable<Project> {
    return this.http
      .post<ApiResponse<Project>>(`${BASE}/projects`, p)
      .pipe(
        map((r: ApiResponse<Project>) => r.data!)
      );
  }

  updateProject(id: number, p: Project): Observable<Project> {
    return this.http
      .put<ApiResponse<Project>>(`${BASE}/projects/${id}`, p)
      .pipe(
        map((r: ApiResponse<Project>) => r.data!)
      );
  }

  deleteProject(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${BASE}/projects/${id}`)
      .pipe(
        map(() => void 0)
      );
  }

  activateProject(id: number): Observable<Project> {
    return this.http
      .patch<ApiResponse<Project>>(`${BASE}/projects/${id}/activate`, {})
      .pipe(
        map((r: ApiResponse<Project>) => r.data!)
      );
  }

  deactivateProject(id: number): Observable<Project> {
    return this.http
      .patch<ApiResponse<Project>>(`${BASE}/projects/${id}/deactivate`, {})
      .pipe(
        map((r: ApiResponse<Project>) => r.data!)
      );
  }

  // ── Employees ─────────────────────────────────────────────
  getEmployees(projectId?: number, supportLevel?: string): Observable<Employee[]> {
    let params = new HttpParams();

    if (projectId != null) {
      params = params.set('projectId', projectId.toString());
    }

    if (supportLevel) {
      params = params.set('supportLevel', supportLevel);
    }

    return this.http
      .get<ApiResponse<Employee[]>>(`${BASE}/employees`, { params })
      .pipe(
        map((r: ApiResponse<Employee[]>) => r.data ?? [])
      );
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http
      .get<ApiResponse<Employee>>(`${BASE}/employees/${id}`)
      .pipe(
        map((r: ApiResponse<Employee>) => r.data!)
      );
  }

  createEmployee(e: Employee): Observable<Employee> {
    return this.http
      .post<ApiResponse<Employee>>(`${BASE}/employees`, e)
      .pipe(
        map((r: ApiResponse<Employee>) => r.data!)
      );
  }

  updateEmployee(id: number, e: Employee): Observable<Employee> {
    return this.http
      .put<ApiResponse<Employee>>(`${BASE}/employees/${id}`, e)
      .pipe(
        map((r: ApiResponse<Employee>) => r.data!)
      );
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${BASE}/employees/${id}`)
      .pipe(
        map(() => void 0)
      );
  }

  assignEmployeeToProject(empId: number, projId: number): Observable<Employee> {
    return this.http
      .post<ApiResponse<Employee>>(
        `${BASE}/employees/${empId}/projects/${projId}`,
        {}
      )
      .pipe(
        map((r: ApiResponse<Employee>) => r.data!)
      );
  }

  removeEmployeeFromProject(empId: number, projId: number): Observable<Employee> {
    return this.http
      .delete<ApiResponse<Employee>>(
        `${BASE}/employees/${empId}/projects/${projId}`
      )
      .pipe(
        map((r: ApiResponse<Employee>) => r.data!)
      );
  }

  // ── Tickets ───────────────────────────────────────────────
  getTickets(
    filter: TicketFilter = {},
    page = 0,
    size = 15,
    sortBy = 'createdAt',
    sortDir = 'desc'
  ): Observable<ApiResponse<PageResponse<Ticket>>> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    if (filter.ticketNumber) params = params.set('ticketNumber', filter.ticketNumber);
    if (filter.projectId) params = params.set('projectId', filter.projectId.toString());
    if (filter.employeeId) params = params.set('employeeId', filter.employeeId.toString());
    if (filter.priority) params = params.set('priority', filter.priority);
    if (filter.currentStatus) params = params.set('currentStatus', filter.currentStatus);
    if (filter.supportLevel) params = params.set('supportLevel', filter.supportLevel);
    if (filter.slaBreached != null) {
      params = params.set('slaBreached', String(filter.slaBreached));
    }

    return this.http.get<ApiResponse<PageResponse<Ticket>>>(
      `${BASE}/tickets`,
      { params }
    );
  }

  getTicketById(id: number): Observable<Ticket> {
    return this.http
      .get<ApiResponse<Ticket>>(`${BASE}/tickets/${id}`)
      .pipe(
        map((r: ApiResponse<Ticket>) => r.data!)
      );
  }

  createTicket(t: Ticket): Observable<Ticket> {
    return this.http
      .post<ApiResponse<Ticket>>(`${BASE}/tickets`, t)
      .pipe(
        map((r: ApiResponse<Ticket>) => r.data!)
      );
  }

  updateTicket(id: number, t: Ticket): Observable<Ticket> {
    return this.http
      .put<ApiResponse<Ticket>>(`${BASE}/tickets/${id}`, t)
      .pipe(
        map((r: ApiResponse<Ticket>) => r.data!)
      );
  }

  deleteTicket(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${BASE}/tickets/${id}`)
      .pipe(
        map(() => void 0)
      );
  }

  // ── Dashboard ─────────────────────────────────────────────
  getDashboard(projectId?: number): Observable<DashboardDTO> {
    let params = new HttpParams();

    if (projectId != null) {
      params = params.set('projectId', projectId.toString());
    }

    return this.http
      .get<ApiResponse<DashboardDTO>>(`${BASE}/dashboard`, { params })
      .pipe(
        map((r: ApiResponse<DashboardDTO>) => r.data!)
      );
  }

  // ── Shifts ────────────────────────────────────────────────
  getShifts(): Observable<Shift[]> {
    return this.http
      .get<ApiResponse<Shift[]>>(`${BASE}/shifts`)
      .pipe(
        map((r: ApiResponse<Shift[]>) => r.data ?? [])
      );
  }

  createShift(s: Shift): Observable<Shift> {
    return this.http
      .post<ApiResponse<Shift>>(`${BASE}/shifts`, s)
      .pipe(
        map((r: ApiResponse<Shift>) => r.data!)
      );
  }

  updateShift(id: number, s: Shift): Observable<Shift> {
    return this.http
      .put<ApiResponse<Shift>>(`${BASE}/shifts/${id}`, s)
      .pipe(
        map((r: ApiResponse<Shift>) => r.data!)
      );
  }

  deleteShift(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${BASE}/shifts/${id}`)
      .pipe(
        map(() => void 0)
      );
  }

  // ── SLA Configs ───────────────────────────────────────────
  getSlaConfigs(projectId?: number): Observable<SlaConfig[]> {
    let params = new HttpParams();

    if (projectId != null) {
      params = params.set('projectId', projectId.toString());
    }

    return this.http
      .get<ApiResponse<SlaConfig[]>>(`${BASE}/sla-configs`, { params })
      .pipe(
        map((r: ApiResponse<SlaConfig[]>) => r.data ?? [])
      );
  }

  createSlaConfig(s: SlaConfig): Observable<SlaConfig> {
    return this.http
      .post<ApiResponse<SlaConfig>>(`${BASE}/sla-configs`, s)
      .pipe(
        map((r: ApiResponse<SlaConfig>) => r.data!)
      );
  }

  updateSlaConfig(id: number, s: SlaConfig): Observable<SlaConfig> {
    return this.http
      .put<ApiResponse<SlaConfig>>(`${BASE}/sla-configs/${id}`, s)
      .pipe(
        map((r: ApiResponse<SlaConfig>) => r.data!)
      );
  }

  deleteSlaConfig(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${BASE}/sla-configs/${id}`)
      .pipe(
        map(() => void 0)
      );
  }
}