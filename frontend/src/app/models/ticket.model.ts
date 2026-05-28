export type SupportLevel = 'L1' | 'L2' | 'L3';
export type Priority = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
export type CurrentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Ticket {
  id?: number;
  ticketId?: string;
  projectAssignment: string;
  issueDescription: string;
  assignedEmployee?: string;
  supportLevel: SupportLevel;
  priority: Priority;
  generationDateTime?: string;
  responseDateTime?: string;
  resolutionTime?: string;
  currentStatus: CurrentStatus;
  resolutionDetails?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
  slaDeadline?: string;
  slaBreached?: boolean;
  workingHoursElapsed?: number;
}

export interface TicketRequest {
  projectAssignment: string;
  issueDescription: string;
  assignedEmployee?: string;
  supportLevel: SupportLevel;
  priority: Priority;
  generationDateTime?: string;
  responseDateTime?: string;
  resolutionTime?: string;
  currentStatus: CurrentStatus;
  resolutionDetails?: string;
  remarks?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  slaBreachedTickets?: number;
}

export interface TicketSearchParams {
  ticketId?: string;
  projectAssignment?: string;
  status?: CurrentStatus;
  priority?: Priority;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

/** @deprecated Use ProjectService.getProjects() instead — kept for backward compatibility */
export const PROJECT_OPTIONS = [
  'HR-Portal',
  'ERP-Telemed',
  'Payroll-System',
  'Employee-Management',
  'CRM-System',
  'Finance-Portal',
  'IT-ServiceDesk'
];

/** @deprecated Use EmployeeService.getEmployees() instead — kept for backward compatibility */
export const EMPLOYEE_OPTIONS = [
  'John Smith',
  'Jane Doe',
  'Bob Johnson',
  'Alice Williams',
  'Michael Brown',
  'Sarah Davis',
  'David Wilson',
  'Emily Martinez'
];

export const PRIORITY_LABELS: Record<Priority, string> = {
  P1_CRITICAL: 'P1 - Critical',
  P2_HIGH: 'P2 - High',
  P3_MEDIUM: 'P3 - Medium',
  P4_LOW: 'P4 - Low'
};

export const STATUS_LABELS: Record<CurrentStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed'
};
