import { User } from '../entities/User';

export interface AuthRepository {
  login(username: string, otp: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}
