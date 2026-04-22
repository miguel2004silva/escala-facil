import { AuthRepository } from '../../features/auth/data/repositories/AuthRepository';
import { LoginUseCase } from '../../features/auth/domain/usecases/LoginUseCase';
import { useLoginViewModel } from '../../features/auth/presentation/viewmodels/useLoginViewModel';

// Singleton instance
const authRepository = new AuthRepository();

export const makeAuthRepository = () => authRepository;

const loginUseCase = new LoginUseCase(makeAuthRepository());

export const makeLoginUseCase = () => {
  return loginUseCase;
};

export const makeLoginViewModel = () => {
  return useLoginViewModel(makeLoginUseCase());
};
