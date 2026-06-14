import { User } from '../entities/User';

export interface IAuthRepository {
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  getUsers(): Promise<User[]>;
  registerUser(name: string, email: string, password: string, role: 'admin' | 'user'): Promise<User>;
}
