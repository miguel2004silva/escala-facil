import { CorRoupa } from '../entities/CorRoupa';
import { ICoresRepository } from '../repositories/ICoresRepository';

export class GetCoresUseCase {
  constructor(private readonly repository: ICoresRepository) {}

  async execute(): Promise<CorRoupa[]> {
    return await this.repository.getCores();
  }
}
