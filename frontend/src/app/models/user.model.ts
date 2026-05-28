import { UserRole } from './auth.model';

export interface UserRecord {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  employeeId?: number;
  employeeName?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  employeeId?: number;
}

export interface UpdateUserRequest {
  username: string;
  email: string;
  role: UserRole;
  employeeId?: number;
  isActive?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin',
  PROJECT_MANAGER: 'Project Manager',
  EMPLOYEE: 'Employee'
};
