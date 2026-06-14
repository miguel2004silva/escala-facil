import { CorRoupa } from '../entities/CorRoupa';
import { ICoresRepository } from '../repositories/ICoresRepository';
import { User } from '../../../auth/domain/entities/User';
import { AppError } from '../../../../core/errors/AppError';

export class SaveCorUseCase {
  constructor(private readonly repository: ICoresRepository) {}

  async execute(currentUser: User | null, cor: CorRoupa): Promise<void> {
    // 1. Controle Mínimo de Acesso
    if (!currentUser || currentUser.role !== 'admin') {
      throw new AppError('Acesso negado. Apenas administradores podem gerenciar cores de roupas.', 403);
    }

    // 2. Validação de Dados
    if (!cor.grupo || cor.grupo.trim().length === 0) {
      throw new AppError('O grupo/ministério é obrigatório.', 400);
    }

    if (!cor.data || cor.data.trim().length === 0) {
      throw new AppError('A data e hora do culto são obrigatórias.', 400);
    }

    // Verificar se a data é válida
    const dateVal = new Date(cor.data);
    if (isNaN(dateVal.getTime())) {
      throw new AppError('Data do culto inválida.', 400);
    }

    if (!cor.cor || cor.cor.trim().length === 0) {
      throw new AppError('A cor da roupa é obrigatória.', 400);
    }

    const corParaSalvar = {
      ...cor,
      grupo: cor.grupo.trim(),
      cor: cor.cor.trim(),
      observacao: cor.observacao?.trim() || undefined
    };

    // 3. Execução
    await this.repository.saveCor(corParaSalvar);
  }
}
