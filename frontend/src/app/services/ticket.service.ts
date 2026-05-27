import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  Ticket,
  TicketRequest,
  PageResponse,
  ApiResponse,
  DashboardStats,
  TicketSearchParams,
  CurrentStatus,
  Priority
} from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  createTicket(ticket: TicketRequest): Observable<Ticket> {
    return this.http.post<ApiResponse<Ticket>>(this.apiUrl, ticket)
      .pipe(map(res => res.data));
  }

  getTickets(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc'): Observable<ApiResponse<PageResponse<Ticket>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    return this.http.get<ApiResponse<PageResponse<Ticket>>>(this.apiUrl, { params });
  }

  getTicketById(id: number): Observable<Ticket> {
    return this.http.get<ApiResponse<Ticket>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => res.data));
  }

  updateTicket(id: number, ticket: TicketRequest): Observable<Ticket> {
    return this.http.put<ApiResponse<Ticket>>(`${this.apiUrl}/${id}`, ticket)
      .pipe(map(res => res.data));
  }

  deleteTicket(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  searchTickets(searchParams: TicketSearchParams): Observable<ApiResponse<PageResponse<Ticket>>> {
    let params = new HttpParams();

    if (searchParams.ticketId) params = params.set('ticketId', searchParams.ticketId);
    if (searchParams.projectAssignment) params = params.set('projectAssignment', searchParams.projectAssignment);
    if (searchParams.status) params = params.set('status', searchParams.status);
    if (searchParams.priority) params = params.set('priority', searchParams.priority);
    if (searchParams.page !== undefined) params = params.set('page', searchParams.page.toString());
    if (searchParams.size !== undefined) params = params.set('size', searchParams.size.toString());
    if (searchParams.sortBy) params = params.set('sortBy', searchParams.sortBy);
    if (searchParams.sortDir) params = params.set('sortDir', searchParams.sortDir);

    return this.http.get<ApiResponse<PageResponse<Ticket>>>(`${this.apiUrl}/search`, { params });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/dashboard`)
      .pipe(map(res => res.data));
  }

  getMyTickets(status?: string, page = 0, size = 10): Observable<ApiResponse<PageResponse<Ticket>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', 'createdAt')
      .set('sortDir', 'desc');
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<PageResponse<Ticket>>>(`${this.apiUrl}/my-tickets`, { params });
  }
}
