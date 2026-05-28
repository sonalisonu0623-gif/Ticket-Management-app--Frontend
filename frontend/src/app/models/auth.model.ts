export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'EMPLOYEE';

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  employeeId?: number;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  username: string;
  email: string;
  role: UserRole;
  employeeId?: number;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  employeeId?: number;
  isActive: boolean;
  createdAt: string;
}

export interface AuthState {
  token: string | null;
  user: AuthResponse | null;
  isAuthenticated: boolean;
}
