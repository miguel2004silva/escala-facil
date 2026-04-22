import { useState } from 'react';
import { LoginUseCase } from '../../domain/usecases/LoginUseCase';
import { AppError } from '../../../../core/errors/AppError';

// Recebe o UseCase via Dependency Injection
export function useLoginViewModel(loginUseCase: LoginUseCase) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (onSuccess: () => void) => {
    try {
      setError(null);
      setLoading(true);
      await loginUseCase.execute(email, password);
      onSuccess();
    } catch (err: any) {
      if (err instanceof AppError) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    handleLogin
  };
}
