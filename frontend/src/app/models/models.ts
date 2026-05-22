export interface Project {
  id?: number;
  projectName: string;
}

export interface Employee {
  id?: number;
  employeeName: string;
  supportLevel?: string;
}

export interface Ticket {
  id?: number;
  ticketNumber?: string;
  projectId: number;
  projectName?: string;
  issueDescription: string;
  assignedEmployeeId?: number;
  assignedEmployeeName?: string;
  supportLevel?: string;
  priority?: string;
  generationDatetime?: string;
  responseDatetime?: string;
  resolutionTime?: string;
  currentStatus?: string;
  resolutionDetails?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketFilter {
  ticketNumber?: string;
  projectId?: number;
  employeeId?: number;
  priority?: string;
  currentStatus?: string;
  supportLevel?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
// Append explicitly to the base content inside models.ts
export interface UserDTO {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}