import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, Shift, SlaConfig, SlaReport } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ShiftService {
  private readonly url = `${environment.apiBaseUrl}/shifts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Shift[]> {
    return this.http.get<ApiResponse<Shift[]>>(this.url).pipe(map(r => r.data));
  }

  getById(id: number): Observable<Shift> {
    return this.http.get<ApiResponse<Shift>>(`${this.url}/${id}`).pipe(map(r => r.data));
  }

  create(shift: Shift): Observable<Shift> {
    return this.http.post<ApiResponse<Shift>>(this.url, shift).pipe(map(r => r.data));
  }

  update(id: number, shift: Shift): Observable<Shift> {
    return this.http.put<ApiResponse<Shift>>(`${this.url}/${id}`, shift).pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`).pipe(map(() => void 0));
  }
}

@Injectable({ providedIn: 'root' })
export class SlaService {
  private readonly url = `${environment.apiBaseUrl}/sla`;

  constructor(private http: HttpClient) {}

  getConfigs(projectId?: number): Observable<SlaConfig[]> {
    const url = projectId ? `${this.url}/configs?projectId=${projectId}` : `${this.url}/configs`;
    return this.http.get<ApiResponse<SlaConfig[]>>(url).pipe(map(r => r.data));
  }

  upsertConfig(config: SlaConfig): Observable<SlaConfig> {
    return this.http.post<ApiResponse<SlaConfig>>(`${this.url}/configs`, config).pipe(map(r => r.data));
  }

  getReport(projectId?: number, dateFrom?: string, dateTo?: string): Observable<SlaReport[]> {
    let url = `${this.url}/report?`;
    if (projectId) url += `projectId=${projectId}&`;
    if (dateFrom) url += `dateFrom=${dateFrom}&`;
    if (dateTo) url += `dateTo=${dateTo}`;
    return this.http.get<ApiResponse<SlaReport[]>>(url).pipe(map(r => r.data));
  }

  /**
   * Calculate business-hours-based resolution time (frontend display logic)
   * Shift: startHour to endHour, workingDays (0=Sun, 1=Mon...)
   */
  calculateBusinessHours(
    start: Date,
    end: Date,
    shiftStartHour: number,
    shiftEndHour: number,
    workingDays: number[]
  ): number {
    let hours = 0;
    const current = new Date(start);

    while (current < end) {
      const dayOfWeek = current.getDay();
      if (workingDays.includes(dayOfWeek)) {
        const dayStart = new Date(current);
        dayStart.setHours(shiftStartHour, 0, 0, 0);
        const dayEnd = new Date(current);
        dayEnd.setHours(shiftEndHour, 0, 0, 0);

        const periodStart = current > dayStart ? current : dayStart;
        const periodEnd = end < dayEnd ? end : dayEnd;

        if (periodEnd > periodStart) {
          hours += (periodEnd.getTime() - periodStart.getTime()) / 3600000;
        }
      }
      // Advance to next day
      current.setDate(current.getDate() + 1);
      current.setHours(shiftStartHour, 0, 0, 0);
    }

    return Math.round(hours * 100) / 100;
  }
}
