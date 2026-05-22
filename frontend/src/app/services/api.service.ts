import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Project, Employee, Ticket, TicketFilter,
  ApiResponse, PageResponse
} from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Projects
  getProjects(): Observable<Project[]> {
    return this.http.get<ApiResponse<Project[]>>(`${this.baseUrl}/projects`).pipe(map(r => r.data));
  }
  createProject(project: Project): Observable<Project> {
    return this.http.post<ApiResponse<Project>>(`${this.baseUrl}/projects`, project).pipe(map(r => r.data));
  }
  updateProject(id: number, project: Project): Observable<Project> {
    return this.http.put<ApiResponse<Project>>(`${this.baseUrl}/projects/${id}`, project).pipe(map(r => r.data));
  }
  deleteProject(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/projects/${id}`).pipe(map(() => void 0));
  }

  // Employees
  getEmployees(): Observable<Employee[]> {
    return this.http.get<ApiResponse<Employee[]>>(`${this.baseUrl}/employees`).pipe(map(r => r.data));
  }
  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<ApiResponse<Employee>>(`${this.baseUrl}/employees`, employee).pipe(map(r => r.data));
  }
  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<ApiResponse<Employee>>(`${this.baseUrl}/employees/${id}`, employee).pipe(map(r => r.data));
  }
  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/employees/${id}`).pipe(map(() => void 0));
  }

  // Tickets
  getTickets(filter: TicketFilter = {}, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc'): Observable<ApiResponse<PageResponse<Ticket>>> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size))
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    if (filter.ticketNumber)  params = params.set('ticketNumber', filter.ticketNumber);
    if (filter.projectId)     params = params.set('projectId', String(filter.projectId));
    if (filter.employeeId)    params = params.set('employeeId', String(filter.employeeId));
    if (filter.priority)      params = params.set('priority', filter.priority);
    if (filter.currentStatus) params = params.set('currentStatus', filter.currentStatus);
    if (filter.supportLevel)  params = params.set('supportLevel', filter.supportLevel);
    return this.http.get<ApiResponse<PageResponse<Ticket>>>(`${this.baseUrl}/tickets`, { params });
  }

  getTicketById(id: number): Observable<Ticket> {
    return this.http.get<ApiResponse<Ticket>>(`${this.baseUrl}/tickets/${id}`).pipe(map(r => r.data));
  }
  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<ApiResponse<Ticket>>(`${this.baseUrl}/tickets`, ticket).pipe(map(r => r.data));
  }
  updateTicket(id: number, ticket: Ticket): Observable<Ticket> {
    return this.http.put<ApiResponse<Ticket>>(`${this.baseUrl}/tickets/${id}`, ticket).pipe(map(r => r.data));
  }
  deleteTicket(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/tickets/${id}`).pipe(map(() => void 0));
  }
}
