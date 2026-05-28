import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Employee, EmployeeRequest, EmployeeStatus } from '../models/employee.model';
import { ApiResponse, PageResponse } from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  createEmployee(emp: EmployeeRequest): Observable<Employee> {
    return this.http.post<ApiResponse<Employee>>(this.apiUrl, emp)
      .pipe(map(r => r.data));
  }

  getEmployees(page = 0, size = 10): Observable<ApiResponse<PageResponse<Employee>>> {
    const params = new HttpParams()
      .set('page', page).set('size', size)
      .set('sortBy', 'createdAt').set('sortDir', 'desc');
    return this.http.get<ApiResponse<PageResponse<Employee>>>(this.apiUrl, { params });
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<ApiResponse<Employee>>(`${this.apiUrl}/${id}`)
      .pipe(map(r => r.data));
  }

  updateEmployee(id: number, emp: EmployeeRequest): Observable<Employee> {
    return this.http.put<ApiResponse<Employee>>(`${this.apiUrl}/${id}`, emp)
      .pipe(map(r => r.data));
  }

  deleteEmployee(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  searchEmployees(search?: string, status?: EmployeeStatus, page = 0, size = 10)
      : Observable<ApiResponse<PageResponse<Employee>>> {
    let params = new HttpParams()
      .set('page', page).set('size', size)
      .set('sortBy', 'createdAt').set('sortDir', 'desc');
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<PageResponse<Employee>>>(`${this.apiUrl}/search`, { params });
  }
}
