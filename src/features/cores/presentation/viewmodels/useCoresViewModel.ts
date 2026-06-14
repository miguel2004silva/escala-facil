import { useState, useCallback } from 'react';
import { CorRoupa } from '../../domain/entities/CorRoupa';
import { GetCoresUseCase } from '../../domain/usecases/GetCoresUseCase';
import { SaveCorUseCase } from '../../domain/usecases/SaveCorUseCase';
import { DeleteCorUseCase } from '../../domain/usecases/DeleteCorUseCase';
import { AppError } from '../../../../core/errors/AppError';
import { User } from '../../../auth/domain/entities/User';

export function useCoresViewModel(
  getCoresUseCase: GetCoresUseCase,
  saveCorUseCase: SaveCorUseCase,
  deleteCorUseCase: DeleteCorUseCase
) {
  const [cores, setCores] = useState<CorRoupa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCoresUseCase.execute();
      setCores(data);
    } catch (err: any) {
      if (err instanceof AppError) {
        setError(err.message);
      } else {
        setError('Erro ao carregar as cores das roupas.');
      }
    } finally {
      setLoading(false);
    }
  }, [getCoresUseCase]);

  const saveCor = async (currentUser: User | null, cor: CorRoupa) => {
    try {
      setLoading(true);
      setError(null);
      await saveCorUseCase.execute(currentUser, cor);
      await fetchCores();
    } catch (err: any) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError('Erro ao salvar cor de roupa.');
    } finally {
      setLoading(false);
    }
  };

  const deleteCor = async (currentUser: User | null, id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteCorUseCase.execute(currentUser, id);
      await fetchCores();
    } catch (err: any) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError('Erro ao excluir cor de roupa.');
    } finally {
      setLoading(false);
    }
  };

  return {
    cores,
    loading,
    error,
    fetchCores,
    saveCor,
    deleteCor
  };
}
