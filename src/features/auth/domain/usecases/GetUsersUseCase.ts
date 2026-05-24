import { User } from '../entities/User';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class GetUsersUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(): Promise<User[]> {
    return await this.authRepository.getUsers();
  }
}
