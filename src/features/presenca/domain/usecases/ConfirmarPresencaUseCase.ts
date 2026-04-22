import { AppError } from '../../../../core/errors/AppError';

export interface IPresencaRepository {
  confirmarPresenca(escalaId: string, membroId: string, confirmar: boolean): Promise<void>;
}

export class ConfirmarPresencaUseCase {
  constructor(private readonly presencaRepository: IPresencaRepository) {}

  async execute(escalaId: string, membroId: string, confirmar: boolean): Promise<void> {
    if (!escalaId || !membroId) {
      throw new AppError('Dados inválidos para confirmação de presença.', 400);
    }
    
    // Regra de negócio: limite de horário poderia ser validado aqui, 
    // mas vamos abstrair para o escopo inicial
    await this.presencaRepository.confirmarPresenca(escalaId, membroId, confirmar);
  }
}
