import { UserRole } from './auth.model';

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

export interface ProjectSummary {
  id: number;
  projectCode: string;
  projectName: string;
}

/** Merged Employee+User response from backend */
export interface Employee {
  id?: number;
  username: string;
  email: string;
  role: UserRole;
  employeeName: string;
  designation?: string;
  department?: string;
  status: EmployeeStatus;
  isActive: boolean;
  shiftId?: number;
  shiftName?: string;
  projects?: ProjectSummary[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeRequest {
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  employeeName: string;
  designation?: string;
  department?: string;
  status: EmployeeStatus;
  shiftId?: number;
  projectIds?: number[];
}

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  ACTIVE:   'Active',
  INACTIVE: 'Inactive',
  ON_LEAVE: 'On Leave'
};
