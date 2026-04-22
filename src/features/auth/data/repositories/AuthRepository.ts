import AsyncStorage from '@react-native-async-storage/async-storage';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { User } from '../../domain/entities/User';
import { AppError } from '../../../../core/errors/AppError';

const CURRENT_USER_KEY = '@EscalaFacil:currentUser';

export class AuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<User> {
    // Simulação de chamada API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (email === 'admin@escala.com' && password === '123456') {
      const user: User = {
        id: '1',
        name: 'Administrador',
        email,
        role: 'admin',
        token: 'fake-jwt-token-admin'
      };
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }

    if (email === 'user@escala.com' && password === '123456') {
      const user: User = {
        id: '2',
        name: 'Membro Comum',
        email,
        role: 'user',
        token: 'fake-jwt-token-user'
      };
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }

    throw new AppError('Credenciais inválidas', 401);
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  }

  async getCurrentUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (userStr) {
      return JSON.parse(userStr) as User;
    }
    return null;
  }
}
