import { IEscalaRepository } from '../repositories/IEscalaRepository';
import { AppError } from '../../../../core/errors/AppError';

export class DeleteEscalaUseCase {
  constructor(private readonly repository: IEscalaRepository) {}

  async execute(id: string): Promise<void> {
    if (!id) {
      throw new AppError('ID inválido para exclusão.', 400);
    }
    await this.repository.deleteEscala(id);
  }
}
