import { Escala } from '../entities/Escala';

export interface IEscalaRepository {
  getEscalas(): Promise<Escala[]>;
  getEscalaById(id: string): Promise<Escala | null>;
  saveEscala(escala: Escala): Promise<void>;
  deleteEscala(id: string): Promise<void>;
  getGrupos(): Promise<string[]>;
  saveGrupo(grupo: string): Promise<void>;
  deleteGrupo(grupo: string): Promise<void>;
}
