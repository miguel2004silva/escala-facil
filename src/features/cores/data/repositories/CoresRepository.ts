import { ICoresRepository } from '../../domain/repositories/ICoresRepository';
import { CorRoupa } from '../../domain/entities/CorRoupa';
import { supabase } from '../../../../main/config/supabase';
import { AppError } from '../../../../core/errors/AppError';

export class CoresRepository implements ICoresRepository {
  async getCores(): Promise<CorRoupa[]> {
    const { data, error } = await supabase
      .from('cores_roupa')
      .select('*')
      .order('data', { ascending: true });

    if (error) {
      console.error('Erro ao buscar cores de roupas:', error.message);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      grupo: row.grupo,
      data: row.data,
      cor: row.cor,
      observacao: row.observacao || undefined
    }));
  }

  async saveCor(cor: CorRoupa): Promise<void> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isNew = !cor.id || cor.id.trim() === '' || !uuidRegex.test(cor.id);

    let error;

    if (isNew) {
      const { error: insertError } = await supabase
        .from('cores_roupa')
        .insert({
          grupo: cor.grupo,
          data: cor.data,
          cor: cor.cor,
          observacao: cor.observacao || null
        });
      error = insertError;
    } else {
      const { error: upsertError } = await supabase
        .from('cores_roupa')
        .upsert({
          id: cor.id,
          grupo: cor.grupo,
          data: cor.data,
          cor: cor.cor,
          observacao: cor.observacao || null
        });
      error = upsertError;
    }

    if (error) {
      throw new AppError(error.message, 500);
    }
  }

  async deleteCor(id: string): Promise<void> {
    const { error } = await supabase
      .from('cores_roupa')
      .delete()
      .eq('id', id);

    if (error) {
      throw new AppError(error.message, 500);
    }
  }
}
