import { useState, useCallback } from 'react';
import { Escala } from '../../domain/entities/Escala';
import { GetEscalasUseCase } from '../../domain/usecases/GetEscalasUseCase';
import { SaveEscalaUseCase } from '../../domain/usecases/SaveEscalaUseCase';
import { DeleteEscalaUseCase } from '../../domain/usecases/DeleteEscalaUseCase';
import { GetGruposUseCase } from '../../domain/usecases/GetGruposUseCase';
import { SaveGrupoUseCase } from '../../domain/usecases/SaveGrupoUseCase';
import { DeleteGrupoUseCase } from '../../domain/usecases/DeleteGrupoUseCase';
import { AppError } from '../../../../core/errors/AppError';
import { User } from '../../../auth/domain/entities/User';
import { GetUsersUseCase } from '../../../auth/domain/usecases/GetUsersUseCase';

export function useEscalasViewModel(
  getEscalasUseCase: GetEscalasUseCase,
  saveEscalaUseCase: SaveEscalaUseCase,
  deleteEscalaUseCase: DeleteEscalaUseCase,
  getGruposUseCase: GetGruposUseCase,
  saveGrupoUseCase: SaveGrupoUseCase,
  deleteGrupoUseCase: DeleteGrupoUseCase,
  getUsersUseCase: GetUsersUseCase
) {
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [grupos, setGrupos] = useState<string[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
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

  const saveEscala = async (escala: Escala) => {
    try {
      setLoading(true);
      setError(null);
      await saveEscalaUseCase.execute(escala);
      await fetchEscalas();
    } catch (err: any) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError('Erro ao salvar escala.');
    } finally {
      setLoading(false);
    }
  };

  const deleteEscala = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteEscalaUseCase.execute(id);
      await fetchEscalas();
    } catch (err: any) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError('Erro ao excluir escala.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGrupos = useCallback(async () => {
    try {
      setError(null);
      const data = await getGruposUseCase.execute();
      setGrupos(data);
    } catch (err: any) {
      if (err instanceof AppError) {
        setError(err.message);
      } else {
        setError('Erro ao carregar os grupos.');
      }
    }
  }, [getGruposUseCase]);

  const addGrupo = async (name: string) => {
    try {
      setError(null);
      await saveGrupoUseCase.execute(name);
      await fetchGrupos();
    } catch (err: any) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError('Erro ao adicionar grupo.');
    }
  };

  const removeGrupo = async (name: string) => {
    try {
      setError(null);
      await deleteGrupoUseCase.execute(name);
      await fetchGrupos();
    } catch (err: any) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError('Erro ao excluir grupo.');
    }
  };

  const fetchUsuarios = useCallback(async () => {
    try {
      setError(null);
      const data = await getUsersUseCase.execute();
      setUsuarios(data);
    } catch (err: any) {
      if (err instanceof AppError) {
        setError(err.message);
      } else {
        setError('Erro ao carregar os usuários.');
      }
    }
  }, [getUsersUseCase]);

  return {
    escalas,
    grupos,
    usuarios,
    loading,
    error,
    fetchEscalas,
    saveEscala,
    deleteEscala,
    fetchGrupos,
    addGrupo,
    removeGrupo,
    fetchUsuarios
  };
}

