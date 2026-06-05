import { UserDTO } from './models';

export interface UserSessionData {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}

export interface AuthStateResponse {
  token: string;
  user: UserSessionData;
}