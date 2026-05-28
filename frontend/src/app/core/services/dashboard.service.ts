import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, DashboardStats, TicketTrend, EmployeePerformance, PriorityDistribution } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly url = `${environment.apiBaseUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(projectId?: number): Observable<DashboardStats> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<ApiResponse<DashboardStats>>(`${this.url}/stats`, { params }).pipe(map(r => r.data));
  }

  getTrends(projectId?: number, days = 30): Observable<TicketTrend[]> {
    let params = new HttpParams().set('days', days);
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<ApiResponse<TicketTrend[]>>(`${this.url}/trends`, { params }).pipe(map(r => r.data));
  }

  getEmployeePerformance(projectId?: number): Observable<EmployeePerformance[]> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<ApiResponse<EmployeePerformance[]>>(`${this.url}/performance`, { params }).pipe(map(r => r.data));
  }

  getPriorityDistribution(projectId?: number): Observable<PriorityDistribution[]> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<ApiResponse<PriorityDistribution[]>>(`${this.url}/priority-dist`, { params }).pipe(map(r => r.data));
  }
}
