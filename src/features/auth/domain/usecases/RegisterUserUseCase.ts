import { User } from '../entities/User';
import { IAuthRepository } from '../repositories/IAuthRepository';
import { AppError } from '../../../../core/errors/AppError';

export class RegisterUserUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(
    currentUser: User | null,
    name: string,
    email: string,
    password: string,
    role: 'admin' | 'user'
  ): Promise<User> {
    // 1. Controle Mínimo de Acesso: Apenas administradores podem cadastrar usuários
    if (!currentUser || currentUser.role !== 'admin') {
      throw new AppError('Acesso negado. Apenas administradores podem cadastrar novos usuários.', 403);
    }

    // 2. Validação de Dados
    if (!name || name.trim().length === 0) {
      throw new AppError('O nome do usuário é obrigatório.', 400);
    }

    if (!email || email.trim().length === 0) {
      throw new AppError('O e-mail é obrigatório.', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new AppError('Formato de e-mail inválido.', 400);
    }

    if (!password || password.length < 6) {
      throw new AppError('A senha deve conter pelo menos 6 caracteres.', 400);
    }

    if (role !== 'admin' && role !== 'user') {
      throw new AppError('Perfil de usuário inválido.', 400);
    }

    // 3. Execução através do Repositório
    return await this.authRepository.registerUser(
      name.trim(),
      email.trim(),
      password,
      role
    );
  }
}
