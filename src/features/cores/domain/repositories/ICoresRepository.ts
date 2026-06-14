import { CorRoupa } from '../entities/CorRoupa';

export interface ICoresRepository {
  getCores(): Promise<CorRoupa[]>;
  saveCor(cor: CorRoupa): Promise<void>;
  deleteCor(id: string): Promise<void>;
}
