// Kept for backward compatibility
export interface AuthStateResponse {
  token: string;
  user: UserSessionData;
}

export interface UserSessionData {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
}
