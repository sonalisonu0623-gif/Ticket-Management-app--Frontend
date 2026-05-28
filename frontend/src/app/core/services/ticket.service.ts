import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse, Ticket, TicketFilter } from '../models/models';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly url = `${environment.apiBaseUrl}/tickets`;

  constructor(private http: HttpClient) {}

  getAll(
    filter: TicketFilter = {},
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    sortDir = 'desc'
  ): Observable<ApiResponse<PageResponse<Ticket>>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    if (filter.ticketNumber) params = params.set('ticketNumber', filter.ticketNumber);
    if (filter.projectId)    params = params.set('projectId', filter.projectId);
    if (filter.employeeId)   params = params.set('employeeId', filter.employeeId);
    if (filter.priority)     params = params.set('priority', filter.priority);
    if (filter.currentStatus) params = params.set('currentStatus', filter.currentStatus);
    if (filter.supportLevel) params = params.set('supportLevel', filter.supportLevel);
    if (filter.slaBreached != null) params = params.set('slaBreached', filter.slaBreached);
    if (filter.dateFrom)     params = params.set('dateFrom', filter.dateFrom);
    if (filter.dateTo)       params = params.set('dateTo', filter.dateTo);

    return this.http.get<ApiResponse<PageResponse<Ticket>>>(this.url, { params });
  }

  getById(id: number): Observable<Ticket> {
    return this.http.get<ApiResponse<Ticket>>(`${this.url}/${id}`).pipe(map(r => r.data));
  }

  getByNumber(ticketNumber: string): Observable<Ticket> {
    return this.http.get<ApiResponse<Ticket>>(`${this.url}/number/${ticketNumber}`).pipe(map(r => r.data));
  }

  create(ticket: Ticket): Observable<Ticket> {
    return this.http.post<ApiResponse<Ticket>>(this.url, ticket).pipe(map(r => r.data));
  }

  update(id: number, ticket: Ticket): Observable<Ticket> {
    return this.http.put<ApiResponse<Ticket>>(`${this.url}/${id}`, ticket).pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`).pipe(map(() => void 0));
  }

  assignEmployee(ticketId: number, employeeId: number): Observable<Ticket> {
    return this.http.patch<ApiResponse<Ticket>>(`${this.url}/${ticketId}/assign`, { employeeId }).pipe(map(r => r.data));
  }

  updateStatus(ticketId: number, status: string, resolution?: string): Observable<Ticket> {
    return this.http.patch<ApiResponse<Ticket>>(`${this.url}/${ticketId}/status`, { status, resolutionDetails: resolution }).pipe(map(r => r.data));
  }

  getMyTickets(page = 0, size = 10): Observable<ApiResponse<PageResponse<Ticket>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<Ticket>>>(`${this.url}/my`, { params });
  }
}
