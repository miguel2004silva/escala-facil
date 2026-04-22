import { AppError } from '../../../../core/errors/AppError';
import { User } from '../entities/User';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(email: string, password: string): Promise<User> {
    if (!email || !email.includes('@')) {
      throw new AppError('Email inválido', 400);
    }
    
    if (!password || password.length < 6) {
      throw new AppError('A senha deve conter no mínimo 6 caracteres', 400);
    }

    return await this.authRepository.login(email, password);
  }
}
