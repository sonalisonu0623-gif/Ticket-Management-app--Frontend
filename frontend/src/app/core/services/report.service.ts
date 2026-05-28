import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, ReportFilter, SlaReport, EmployeePerformance, TicketTrend } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly url = `${environment.apiBaseUrl}/reports`;

  constructor(private http: HttpClient) {}

  private buildParams(filter: ReportFilter): HttpParams {
    let params = new HttpParams();
    if (filter.projectId) params = params.set('projectId', filter.projectId);
    if (filter.employeeId) params = params.set('employeeId', filter.employeeId);
    if (filter.dateFrom) params = params.set('dateFrom', filter.dateFrom);
    if (filter.dateTo) params = params.set('dateTo', filter.dateTo);
    if (filter.groupBy) params = params.set('groupBy', filter.groupBy);
    return params;
  }

  getProjectReport(filter: ReportFilter): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.url}/project`, { params: this.buildParams(filter) }).pipe(map(r => r.data));
  }

  getSlaReport(filter: ReportFilter): Observable<SlaReport[]> {
    return this.http.get<ApiResponse<SlaReport[]>>(`${this.url}/sla`, { params: this.buildParams(filter) }).pipe(map(r => r.data));
  }

  getEmployeeReport(filter: ReportFilter): Observable<EmployeePerformance[]> {
    return this.http.get<ApiResponse<EmployeePerformance[]>>(`${this.url}/employee`, { params: this.buildParams(filter) }).pipe(map(r => r.data));
  }

  getTrendReport(filter: ReportFilter): Observable<TicketTrend[]> {
    return this.http.get<ApiResponse<TicketTrend[]>>(`${this.url}/trends`, { params: this.buildParams(filter) }).pipe(map(r => r.data));
  }

  exportCsv(type: string, filter: ReportFilter): Observable<Blob> {
    return this.http.get(`${this.url}/export/${type}`, {
      params: this.buildParams(filter),
      responseType: 'blob'
    });
  }
}
