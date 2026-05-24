import { supabase } from '../../../../main/config/supabase';
import { IPresencaRepository } from '../../domain/usecases/ConfirmarPresencaUseCase';
import { AppError } from '../../../../core/errors/AppError';

export class PresencaRepository implements IPresencaRepository {
  async confirmarPresenca(escalaId: string, membroId: string, confirmar: boolean, justificativa?: string): Promise<void> {
    const status = confirmar ? 'Confirmado' : 'Ausente';
    const just = confirmar ? null : (justificativa || null);

    const { error } = await supabase
      .from('membros_escala')
      .update({
        status: status,
        justificativa: just
      })
      .eq('id', membroId)
      .eq('escala_id', escalaId);

    if (error) {
      throw new AppError(error.message, 500);
    }
  }
}

