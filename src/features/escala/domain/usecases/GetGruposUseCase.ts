import { IEscalaRepository } from '../repositories/IEscalaRepository';

export class GetGruposUseCase {
  constructor(private readonly repository: IEscalaRepository) {}

  async execute(): Promise<string[]> {
    const grupos = await this.repository.getGrupos();
    // Ordenar alfabeticamente para melhor visualização
    return grupos.sort((a, b) => a.localeCompare(b));
  }
}
