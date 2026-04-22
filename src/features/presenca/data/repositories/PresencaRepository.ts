import AsyncStorage from '@react-native-async-storage/async-storage';
import { IPresencaRepository } from '../../domain/usecases/ConfirmarPresencaUseCase';
import { Escala, Membro } from '../../../escala/domain/entities/Escala';
import { AppError } from '../../../../core/errors/AppError';

const ESCALAS_KEY = '@EscalaFacil:escalas';

export class PresencaRepository implements IPresencaRepository {
  async confirmarPresenca(escalaId: string, membroId: string, confirmar: boolean): Promise<void> {
    // Simula rede
    await new Promise(resolve => setTimeout(resolve, 500));

    const stored = await AsyncStorage.getItem(ESCALAS_KEY);
    if (!stored) {
      throw new AppError('Nenhuma escala encontrada.', 404);
    }

    const escalas: Escala[] = JSON.parse(stored);
    const escalaIndex = escalas.findIndex((e: Escala) => e.id === escalaId);
    
    if (escalaIndex === -1) {
      throw new AppError('Escala não encontrada.', 404);
    }

    const membroIndex = escalas[escalaIndex].membros.findIndex((m: Membro) => m.id === membroId);
    if (membroIndex === -1) {
      throw new AppError('Membro não encontrado na escala.', 404);
    }

    escalas[escalaIndex].membros[membroIndex].presencaConfirmada = confirmar;
    await AsyncStorage.setItem(ESCALAS_KEY, JSON.stringify(escalas));
  }
}
