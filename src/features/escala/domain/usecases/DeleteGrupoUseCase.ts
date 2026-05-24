import { IEscalaRepository } from '../repositories/IEscalaRepository';
import { AppError } from '../../../../core/errors/AppError';

export class DeleteGrupoUseCase {
  constructor(private readonly repository: IEscalaRepository) {}

  async execute(grupo: string): Promise<void> {
    const nomeLimpo = grupo.trim();
    if (!nomeLimpo) {
      throw new AppError('Nome de grupo inválido.', 400);
    }
    
    const gruposExistentes = await this.repository.getGrupos();
    const existe = gruposExistentes.some(g => g.toLowerCase() === nomeLimpo.toLowerCase());
    
    if (!existe) {
      throw new AppError('O grupo informado não existe.', 404);
    }

    await this.repository.deleteGrupo(nomeLimpo);
  }
}
