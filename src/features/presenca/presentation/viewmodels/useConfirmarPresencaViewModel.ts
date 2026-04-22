import { useState } from 'react';
import { ConfirmarPresencaUseCase } from '../../domain/usecases/ConfirmarPresencaUseCase';
import { AppError } from '../../../../core/errors/AppError';
import { Alert } from 'react-native';

export function useConfirmarPresencaViewModel(confirmarUseCase: ConfirmarPresencaUseCase) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const confirmar = async (escalaId: string, membroId: string, confirmar: boolean, onSuccess?: () => void) => {
    try {
      setLoadingId(escalaId);
      await confirmarUseCase.execute(escalaId, membroId, confirmar);
      Alert.alert('Sucesso', confirmar ? 'Presença confirmada!' : 'Ausência justificada.');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (err instanceof AppError) {
        Alert.alert('Erro', err.message);
      } else {
        Alert.alert('Erro', 'Ocorreu um erro ao confirmar presença.');
      }
    } finally {
      setLoadingId(null);
    }
  };

  return {
    confirmar,
    loadingId
  };
}
