import { SaveCorUseCase } from '../features/cores/domain/usecases/SaveCorUseCase';
import { ICoresRepository } from '../features/cores/domain/repositories/ICoresRepository';
import { CorRoupa } from '../features/cores/domain/entities/CorRoupa';
import { User } from '../features/auth/domain/entities/User';
import { AppError } from '../core/errors/AppError';

describe('SaveCorUseCase', () => {
  let mockCoresRepository: jest.Mocked<ICoresRepository>;
  let useCase: SaveCorUseCase;

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
    mockCoresRepository = {
      getCores: jest.fn(),
      saveCor: jest.fn(),
      deleteCor: jest.fn(),
    } as any;

    useCase = new SaveCorUseCase(mockCoresRepository);
  });

  it('should throw an error (403) if current user is not an administrator', async () => {
    const cor: CorRoupa = {
      id: '',
      grupo: 'Louvor',
      data: '2026-06-14T19:30:00.000Z',
      cor: 'Preto',
    };

    await expect(useCase.execute(normalUser, cor)).rejects.toThrow(
      new AppError('Acesso negado. Apenas administradores podem gerenciar cores de roupas.', 403)
    );
  });

  it('should throw an error (400) if group is empty', async () => {
    const cor: CorRoupa = {
      id: '',
      grupo: '',
      data: '2026-06-14T19:30:00.000Z',
      cor: 'Preto',
    };

    await expect(useCase.execute(adminUser, cor)).rejects.toThrow(
      new AppError('O grupo/ministério é obrigatório.', 400)
    );
  });

  it('should throw an error (400) if color is empty', async () => {
    const cor: CorRoupa = {
      id: '',
      grupo: 'Louvor',
      data: '2026-06-14T19:30:00.000Z',
      cor: '',
    };

    await expect(useCase.execute(adminUser, cor)).rejects.toThrow(
      new AppError('A cor da roupa é obrigatória.', 400)
    );
  });

  it('should throw an error (400) if date is empty or invalid', async () => {
    const cor: CorRoupa = {
      id: '',
      grupo: 'Louvor',
      data: 'invalid-date',
      cor: 'Preto',
    };

    await expect(useCase.execute(adminUser, cor)).rejects.toThrow(
      new AppError('Data do culto inválida.', 400)
    );
  });

  it('should successfully save clothing color when inputs are valid and user is admin', async () => {
    const cor: CorRoupa = {
      id: 'color-uuid',
      grupo: 'Louvor',
      data: '2026-06-14T19:30:00.000Z',
      cor: 'Preto',
      observacao: 'Detalhes pretos',
    };

    mockCoresRepository.saveCor.mockResolvedValue();

    await useCase.execute(adminUser, cor);

    expect(mockCoresRepository.saveCor).toHaveBeenCalledWith({
      id: 'color-uuid',
      grupo: 'Louvor',
      data: '2026-06-14T19:30:00.000Z',
      cor: 'Preto',
      observacao: 'Detalhes pretos',
    });
  });
});
