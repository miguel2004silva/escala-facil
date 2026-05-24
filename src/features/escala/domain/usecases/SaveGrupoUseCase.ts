import { IEscalaRepository } from '../repositories/IEscalaRepository';
import { AppError } from '../../../../core/errors/AppError';

export class SaveGrupoUseCase {
  constructor(private readonly repository: IEscalaRepository) {}

  async execute(grupo: string): Promise<void> {
    const nomeLimpo = grupo.trim();
    if (!nomeLimpo) {
      throw new AppError('O nome do grupo não pode ser vazio.', 400);
    }
    
    const gruposExistentes = await this.repository.getGrupos();
    const jaExiste = gruposExistentes.some(g => g.toLowerCase() === nomeLimpo.toLowerCase());
    
    if (jaExiste) {
      throw new AppError('Este grupo já está cadastrado.', 400);
    }

    await this.repository.saveGrupo(nomeLimpo);
  }
}
