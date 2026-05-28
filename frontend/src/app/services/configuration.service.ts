import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Holiday, ShiftHours, SlaConfig } from '../models/configuration.model';
import { ApiResponse } from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class ConfigurationService {
  private base = `${environment.apiUrl}/config`;

  constructor(private http: HttpClient) {}

  // ── Shifts ────────────────────────────────────────────────────────────────
  getShifts(): Observable<ShiftHours[]> {
    return this.http.get<ApiResponse<ShiftHours[]>>(`${this.base}/shifts`).pipe(map(r => r.data));
  }
  createShift(s: ShiftHours): Observable<ShiftHours> {
    return this.http.post<ApiResponse<ShiftHours>>(`${this.base}/shifts`, s).pipe(map(r => r.data));
  }
  updateShift(id: number, s: ShiftHours): Observable<ShiftHours> {
    return this.http.put<ApiResponse<ShiftHours>>(`${this.base}/shifts/${id}`, s).pipe(map(r => r.data));
  }
  deleteShift(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/shifts/${id}`).pipe(map(() => void 0));
  }

  // ── Holidays ──────────────────────────────────────────────────────────────
  getHolidays(): Observable<Holiday[]> {
    return this.http.get<ApiResponse<Holiday[]>>(`${this.base}/holidays`).pipe(map(r => r.data));
  }
  createHoliday(h: Holiday): Observable<Holiday> {
    return this.http.post<ApiResponse<Holiday>>(`${this.base}/holidays`, h).pipe(map(r => r.data));
  }
  updateHoliday(id: number, h: Holiday): Observable<Holiday> {
    return this.http.put<ApiResponse<Holiday>>(`${this.base}/holidays/${id}`, h).pipe(map(r => r.data));
  }
  deleteHoliday(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/holidays/${id}`).pipe(map(() => void 0));
  }

  // ── SLA ───────────────────────────────────────────────────────────────────
  getSlaConfigs(): Observable<SlaConfig[]> {
    return this.http.get<ApiResponse<SlaConfig[]>>(`${this.base}/sla`).pipe(map(r => r.data));
  }
  createSlaConfig(c: SlaConfig): Observable<SlaConfig> {
    return this.http.post<ApiResponse<SlaConfig>>(`${this.base}/sla`, c).pipe(map(r => r.data));
  }
  updateSlaConfig(id: number, c: SlaConfig): Observable<SlaConfig> {
    return this.http.put<ApiResponse<SlaConfig>>(`${this.base}/sla/${id}`, c).pipe(map(r => r.data));
  }
  deleteSlaConfig(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/sla/${id}`).pipe(map(() => void 0));
  }
}
