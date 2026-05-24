import { Escala } from '../entities/Escala';
import { IEscalaRepository } from '../repositories/IEscalaRepository';
import { AppError } from '../../../../core/errors/AppError';

export class SaveEscalaUseCase {
  constructor(private readonly repository: IEscalaRepository) {}

  async execute(escala: Escala): Promise<void> {
    if (!escala.grupo) {
      throw new AppError('O grupo/ministério é obrigatório.', 400);
    }
    if (!escala.data) {
      throw new AppError('A data e hora são obrigatórias.', 400);
    }
    if (!escala.membros || escala.membros.length === 0) {
      throw new AppError('A escala deve conter pelo menos um membro.', 400);
    }

    const escalaParaSalvar = {
      ...escala,
      id: escala.id || Math.random().toString(36).substring(2, 11),
      publicada: escala.publicada ?? false, // Por padrão salva como rascunho se não informado
    };

    await this.repository.saveEscala(escalaParaSalvar);
  }
}
