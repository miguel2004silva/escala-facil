import { useState, useCallback } from 'react';
import { Escala } from '../../domain/entities/Escala';
import { GetEscalasUseCase } from '../../domain/usecases/GetEscalasUseCase';
import { AppError } from '../../../../core/errors/AppError';

export function useEscalasViewModel(getEscalasUseCase: GetEscalasUseCase) {
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEscalas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEscalasUseCase.execute();
      setEscalas(data);
    } catch (err: any) {
      if (err instanceof AppError) {
        setError(err.message);
      } else {
        setError('Erro ao carregar as escalas.');
      }
    } finally {
      setLoading(false);
    }
  }, [getEscalasUseCase]);

  return {
    escalas,
    loading,
    error,
    fetchEscalas
  };
}
