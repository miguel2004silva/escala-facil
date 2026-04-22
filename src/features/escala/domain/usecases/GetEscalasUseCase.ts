import { Escala } from '../entities/Escala';
import { IEscalaRepository } from '../repositories/IEscalaRepository';

export class GetEscalasUseCase {
  constructor(private readonly escalaRepository: IEscalaRepository) {}

  async execute(): Promise<Escala[]> {
    // Aqui poderia haver lógicas adicionais, como ordenar as escalas pela data
    const escalas = await this.escalaRepository.getEscalas();
    
    // Exemplo de regra de negócio simples: ordenar da mais próxima para a mais distante
    return escalas.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }
}
