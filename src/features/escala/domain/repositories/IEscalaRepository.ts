import { Escala } from '../entities/Escala';

export interface IEscalaRepository {
  getEscalas(): Promise<Escala[]>;
  getEscalaById(id: string): Promise<Escala | null>;
}
