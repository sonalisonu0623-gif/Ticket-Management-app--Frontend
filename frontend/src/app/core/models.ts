// =========================================================
// TicketOps Enterprise — All TypeScript Interfaces
// =========================================================

export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'L1_SUPPORT' | 'L2_SUPPORT' | 'L3_SUPPORT' | 'USER';

// ── API Wrappers ──────────────────────────────────────────
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
  empty: boolean;
}

// ── Auth ──────────────────────────────────────────────────
export interface UserDTO {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserDTO;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

// ── Project ───────────────────────────────────────────────
export interface Project {
  id?: number;
  projectName: string;
  projectCode?: string;
  description?: string;
  supportEmail?: string;
  slaHours?: number;
  shiftTiming?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  employees?: Employee[];
  createdAt?: string;
  updatedAt?: string;
}

// ── Employee ──────────────────────────────────────────────
export interface Employee {
  id?: number;
  employeeId?: string;
  employeeName: string;
  email?: string;
  supportLevel?: 'L1' | 'L2' | 'L3';
  role?: UserRole;
  designation?: string;
  shift?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  projectIds?: number[];
  projectNames?: string[];
  createdAt?: string;
}

// ── Ticket ────────────────────────────────────────────────
export type TicketStatus = 'Open' | 'In Progress' | 'Pending' | 'Resolved' | 'Closed' | 'Escalated';
export type TicketPriority = 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'P4 - Low';

export interface Ticket {
  id?: number;
  ticketNumber?: string;
  projectId: number;
  projectName?: string;
  issueDescription: string;
  assignedEmployeeId?: number;
  assignedEmployeeName?: string;
  supportLevel?: string;
  priority?: TicketPriority;
  generationDatetime?: string;
  responseDatetime?: string;
  resolutionTime?: string;
  businessHoursElapsed?: number;
  currentStatus?: TicketStatus;
  resolutionDetails?: string;
  remarks?: string;
  slaBreached?: boolean;
  slaRemainingHours?: number;
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
  slaBreached?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

// ── Shift ─────────────────────────────────────────────────
export interface Shift {
  id?: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  workingDays?: string[];
  timezone?: string;
}

// ── SLA Config ────────────────────────────────────────────
export interface SlaConfig {
  id?: number;
  projectId: number;
  projectName?: string;
  priorityLevel: string;
  responseTimeSla: number;
  resolutionTimeSla: number;
  escalationTimeSla?: number;
}

// ── Dashboard ─────────────────────────────────────────────
export interface DashboardDTO {
  projectId?: number;
  projectName?: string;
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  escalatedTickets: number;
  criticalTickets: number;
  slaBreachedTickets: number;
  avgResolutionHours?: number;
  slaComplianceRate?: number;
  ticketsByStatus: Record<string, number>;
  ticketsByPriority: Record<string, number>;
  ticketsBySupportLevel: Record<string, number>;
  employeePerformance: EmployeePerformance[];
  recentTickets: Ticket[];
  criticalOpenTickets: Ticket[];
}

export interface EmployeePerformance {
  employeeId: number;
  employeeName: string;
  supportLevel: string;
  totalAssigned: number;
  resolved: number;
  open: number;
  slaBreached: number;
  avgResolutionHours?: number;
}

// ── Toast ─────────────────────────────────────────────────
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// ── UI Helpers ────────────────────────────────────────────
export interface SelectOption {
  value: string | number;
  label: string;
}

export const PRIORITIES: string[] = ['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low'];
export const STATUSES: string[]   = ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed', 'Escalated'];
export const SUPPORT_LEVELS: string[] = ['L1', 'L2', 'L3'];
export const ROLES: UserRole[]    = ['ADMIN', 'PROJECT_MANAGER', 'L1_SUPPORT', 'L2_SUPPORT', 'L3_SUPPORT', 'USER'];
