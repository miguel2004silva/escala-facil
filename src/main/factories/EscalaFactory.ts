import { EscalaRepository } from '../../features/escala/data/repositories/EscalaRepository';
import { PresencaRepository } from '../../features/presenca/data/repositories/PresencaRepository';
import { GetEscalasUseCase } from '../../features/escala/domain/usecases/GetEscalasUseCase';
import { ConfirmarPresencaUseCase } from '../../features/presenca/domain/usecases/ConfirmarPresencaUseCase';
import { useEscalasViewModel } from '../../features/escala/presentation/viewmodels/useEscalasViewModel';
import { useConfirmarPresencaViewModel } from '../../features/presenca/presentation/viewmodels/useConfirmarPresencaViewModel';

const escalaRepository = new EscalaRepository();
const presencaRepository = new PresencaRepository();

const getEscalasUseCase = new GetEscalasUseCase(escalaRepository);
const confirmarPresencaUseCase = new ConfirmarPresencaUseCase(presencaRepository);

export const makeGetEscalasUseCase = () => getEscalasUseCase;
export const makeConfirmarPresencaUseCase = () => confirmarPresencaUseCase;

export const makeEscalasViewModel = () => {
  return useEscalasViewModel(makeGetEscalasUseCase());
};

export const makeConfirmarPresencaViewModel = () => {
  return useConfirmarPresencaViewModel(makeConfirmarPresencaUseCase());
};
