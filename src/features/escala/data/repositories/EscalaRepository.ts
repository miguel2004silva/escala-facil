import { IEscalaRepository } from '../../domain/repositories/IEscalaRepository';
import { Escala } from '../../domain/entities/Escala';
import { supabase } from '../../../../main/config/supabase';

export class EscalaRepository implements IEscalaRepository {
  async getEscalas(): Promise<Escala[]> {
    const { data, error } = await supabase
      .from('escalas')
      .select(`
        id,
        data,
        grupo,
        publicada,
        membros_escala (
          id,
          nome,
          funcao,
          status,
          justificativa
        )
      `)
      .order('data', { ascending: true });

    if (error) {
      console.error('Erro ao buscar escalas:', error.message);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      data: row.data,
      grupo: row.grupo,
      publicada: row.publicada,
      membros: (row.membros_escala || []).map((m: any) => ({
        id: m.id,
        name: m.nome,
        role: m.funcao,
        presencaConfirmada: m.status === 'Confirmado' ? true : (m.status === 'Ausente' ? false : undefined),
        justificativa: m.justificativa || undefined
      }))
    }));
  }

  async getEscalaById(id: string): Promise<Escala | null> {
    const { data, error } = await supabase
      .from('escalas')
      .select(`
        id,
        data,
        grupo,
        publicada,
        membros_escala (
          id,
          nome,
          funcao,
          status,
          justificativa
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      data: data.data,
      grupo: data.grupo,
      publicada: data.publicada,
      membros: (data.membros_escala || []).map((m: any) => ({
        id: m.id,
        name: m.nome,
        role: m.funcao,
        presencaConfirmada: m.status === 'Confirmado' ? true : (m.status === 'Ausente' ? false : undefined),
        justificativa: m.justificativa || undefined
      }))
    };
  }

  async saveEscala(escala: Escala): Promise<void> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isNew = !escala.id || escala.id.trim() === '' || !uuidRegex.test(escala.id);
    let savedScaleId = escala.id;

    if (isNew) {
      const { data, error } = await supabase
        .from('escalas')
        .insert({
          grupo: escala.grupo,
          data: escala.data,
          publicada: escala.publicada ?? false
        })
        .select()
        .single();
      
      if (error) throw error;
      savedScaleId = data.id;
    } else {
      const { error } = await supabase
        .from('escalas')
        .upsert({
          id: escala.id,
          grupo: escala.grupo,
          data: escala.data,
          publicada: escala.publicada ?? false
        });
      
      if (error) throw error;
    }

    // Excluir membros antigos da escala
    const { error: deleteError } = await supabase
      .from('membros_escala')
      .delete()
      .eq('escala_id', savedScaleId);
    
    if (deleteError) throw deleteError;

    const membersToInsert = escala.membros.map(m => {
      const item: any = {
        escala_id: savedScaleId,
        nome: m.name,
        funcao: m.role,
        status: m.presencaConfirmada === true ? 'Confirmado' : (m.presencaConfirmada === false ? 'Ausente' : 'Pendente'),
        justificativa: m.justificativa || null
      };
      if (uuidRegex.test(m.id)) {
        item.id = m.id;
      }
      return item;
    });

    if (membersToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('membros_escala')
        .insert(membersToInsert);
      
      if (insertError) throw insertError;
    }
  }

  async deleteEscala(id: string): Promise<void> {
    const { error } = await supabase
      .from('escalas')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  async getGrupos(): Promise<string[]> {
    const { data, error } = await supabase
      .from('grupos')
      .select('name')
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar grupos:', error.message);
      return [];
    }

    return (data || []).map(row => row.name);
  }

  async saveGrupo(grupo: string): Promise<void> {
    const { error } = await supabase
      .from('grupos')
      .upsert({ name: grupo }, { onConflict: 'name' });
    
    if (error) throw error;
  }

  async deleteGrupo(grupo: string): Promise<void> {
    const { error } = await supabase
      .from('grupos')
      .delete()
      .eq('name', grupo);
    
    if (error) throw error;
  }
}

