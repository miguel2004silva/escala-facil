import { ICoresRepository } from '../repositories/ICoresRepository';
import { User } from '../../../auth/domain/entities/User';
import { AppError } from '../../../../core/errors/AppError';

export class DeleteCorUseCase {
  constructor(private readonly repository: ICoresRepository) {}

  async execute(currentUser: User | null, id: string): Promise<void> {
    // 1. Controle Mínimo de Acesso
    if (!currentUser || currentUser.role !== 'admin') {
      throw new AppError('Acesso negado. Apenas administradores podem excluir cores de roupas.', 403);
    }

    if (!id || id.trim().length === 0) {
      throw new AppError('O identificador é obrigatório para exclusão.', 400);
    }

    // 2. Execução
    await this.repository.deleteCor(id);
  }
}
