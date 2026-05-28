// =============================================
// AUTH MODELS
// =============================================
export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'L1_SUPPORT' | 'L2_SUPPORT' | 'USER';

export interface UserSessionData {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  employeeId?: number;
  assignedProjectIds?: number[];
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: UserSessionData;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

// =============================================
// API WRAPPER
// =============================================
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
  first: boolean;
  last: boolean;
}

// =============================================
// PROJECT
// =============================================
export type ProjectStatus = 'ACTIVE' | 'INACTIVE';

export interface Project {
  id?: number;
  projectName: string;
  projectCode: string;
  description?: string;
  supportEmail?: string;
  slaHours?: number;
  shiftId?: number;
  shiftName?: string;
  status?: ProjectStatus;
  employeeCount?: number;
  openTickets?: number;
  createdAt?: string;
  updatedAt?: string;
}

// =============================================
// EMPLOYEE
// =============================================
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';
export type SupportLevel = 'L1' | 'L2' | 'L3';

export interface Employee {
  id?: number;
  employeeId?: string;
  employeeName: string;
  email?: string;
  role?: UserRole;
  designation?: string;
  supportLevel?: SupportLevel;
  shiftId?: number;
  shiftName?: string;
  assignedProjectIds?: number[];
  assignedProjects?: Project[];
  status?: EmployeeStatus;
  userId?: number;
  createdAt?: string;
}

// =============================================
// TICKET
// =============================================
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'P1' | 'P2' | 'P3' | 'P4';

export interface Ticket {
  id?: number;
  ticketNumber?: string;
  projectId: number;
  projectName?: string;
  issueDescription: string;
  assignedEmployeeId?: number;
  assignedEmployeeName?: string;
  supportLevel?: SupportLevel;
  priority?: TicketPriority;
  generationDatetime?: string;
  responseDatetime?: string;
  resolutionTime?: string;
  businessResolutionHours?: number;
  slaHours?: number;
  slaBreached?: boolean;
  slaRemainingHours?: number;
  currentStatus?: TicketStatus;
  resolutionDetails?: string;
  remarks?: string;
  raisedByUserId?: number;
  raisedByUsername?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketFilter {
  ticketNumber?: string;
  projectId?: number;
  employeeId?: number;
  priority?: TicketPriority | '';
  currentStatus?: TicketStatus | '';
  supportLevel?: SupportLevel | '';
  slaBreached?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

// =============================================
// SHIFT
// =============================================
export interface Shift {
  id?: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  workingDays: string[];
  timezone: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// =============================================
// SLA CONFIG
// =============================================
export interface SlaConfig {
  id?: number;
  projectId: number;
  projectName?: string;
  priority: TicketPriority;
  responseHours: number;
  resolutionHours: number;
  escalationEnabled: boolean;
  escalationAfterHours?: number;
}

// =============================================
// PROJECT AUTHORIZATION
// =============================================
export interface ProjectAuthorization {
  projectId: number;
  projectName?: string;
  employeeId: number;
  employeeName?: string;
  role: UserRole;
  assignedAt?: string;
}

// =============================================
// DASHBOARD
// =============================================
export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  onHoldTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  criticalTickets: number;
  slaBreachedTickets: number;
  avgResolutionHours: number;
  resolutionRate: number;
}

export interface TicketTrend {
  date: string;
  created: number;
  resolved: number;
}

export interface EmployeePerformance {
  employeeId: number;
  employeeName: string;
  assignedTickets: number;
  resolvedTickets: number;
  avgResolutionHours: number;
  slaBreachCount: number;
}

export interface PriorityDistribution {
  priority: TicketPriority;
  count: number;
  percentage: number;
}

// =============================================
// REPORTS
// =============================================
export interface ReportFilter {
  projectId?: number;
  employeeId?: number;
  dateFrom?: string;
  dateTo?: string;
  groupBy?: 'day' | 'week' | 'month';
}

export interface SlaReport {
  projectId: number;
  projectName: string;
  totalTickets: number;
  withinSla: number;
  breached: number;
  breachRate: number;
  avgResolutionHours: number;
}

// =============================================
// UI STATE
// =============================================
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationState {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'badge' | 'date' | 'actions' | 'link';
}

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: UserRole[];
  badge?: number;
  children?: NavItem[];
}
