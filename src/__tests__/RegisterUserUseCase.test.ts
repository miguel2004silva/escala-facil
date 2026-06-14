import { RegisterUserUseCase } from '../features/auth/domain/usecases/RegisterUserUseCase';
import { IAuthRepository } from '../features/auth/domain/repositories/IAuthRepository';
import { User } from '../features/auth/domain/entities/User';
import { AppError } from '../core/errors/AppError';

describe('RegisterUserUseCase', () => {
  let mockAuthRepository: jest.Mocked<IAuthRepository>;
  let useCase: RegisterUserUseCase;

  const adminUser: User = {
    id: 'admin-uuid',
    name: 'Admin Name',
    email: 'admin@test.com',
    role: 'admin',
  };

  const normalUser: User = {
    id: 'user-uuid',
    name: 'Normal User',
    email: 'user@test.com',
    role: 'user',
  };

  beforeEach(() => {
    mockAuthRepository = {
      login: jest.fn(),
      logout: jest.fn(),
      getCurrentUser: jest.fn(),
      getUsers: jest.fn(),
      registerUser: jest.fn(),
    } as any;

    useCase = new RegisterUserUseCase(mockAuthRepository);
  });

  it('should throw an error (403) if current user is not an administrator', async () => {
    await expect(
      useCase.execute(normalUser, 'New User', 'new@test.com', '123456', 'user')
    ).rejects.toThrow(new AppError('Acesso negado. Apenas administradores podem cadastrar novos usuários.', 403));

    await expect(
      useCase.execute(null, 'New User', 'new@test.com', '123456', 'user')
    ).rejects.toThrow(new AppError('Acesso negado. Apenas administradores podem cadastrar novos usuários.', 403));
  });

  it('should throw an error (400) if name is empty', async () => {
    await expect(
      useCase.execute(adminUser, '', 'new@test.com', '123456', 'user')
    ).rejects.toThrow(new AppError('O nome do usuário é obrigatório.', 400));
  });

  it('should throw an error (400) if email is invalid', async () => {
    await expect(
      useCase.execute(adminUser, 'New User', 'invalid-email', '123456', 'user')
    ).rejects.toThrow(new AppError('Formato de e-mail inválido.', 400));
  });

  it('should throw an error (400) if password length is less than 6 characters', async () => {
    await expect(
      useCase.execute(adminUser, 'New User', 'new@test.com', '123', 'user')
    ).rejects.toThrow(new AppError('A senha deve conter pelo menos 6 caracteres.', 400));
  });

  it('should successfully register user when arguments are valid and user is admin', async () => {
    const createdUser: User = {
      id: 'new-uuid',
      name: 'New User',
      email: 'new@test.com',
      role: 'user',
    };

    mockAuthRepository.registerUser.mockResolvedValue(createdUser);

    const result = await useCase.execute(adminUser, 'New User', 'new@test.com', '123456', 'user');

    expect(mockAuthRepository.registerUser).toHaveBeenCalledWith(
      'New User',
      'new@test.com',
      '123456',
      'user'
    );
    expect(result).toEqual(createdUser);
  });
});
