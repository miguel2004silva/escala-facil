import { EscalaRepository } from '../../features/escala/data/repositories/EscalaRepository';
import { PresencaRepository } from '../../features/presenca/data/repositories/PresencaRepository';
import { GetEscalasUseCase } from '../../features/escala/domain/usecases/GetEscalasUseCase';
import { SaveEscalaUseCase } from '../../features/escala/domain/usecases/SaveEscalaUseCase';
import { DeleteEscalaUseCase } from '../../features/escala/domain/usecases/DeleteEscalaUseCase';
import { GetGruposUseCase } from '../../features/escala/domain/usecases/GetGruposUseCase';
import { SaveGrupoUseCase } from '../../features/escala/domain/usecases/SaveGrupoUseCase';
import { DeleteGrupoUseCase } from '../../features/escala/domain/usecases/DeleteGrupoUseCase';
import { ConfirmarPresencaUseCase } from '../../features/presenca/domain/usecases/ConfirmarPresencaUseCase';
import { useEscalasViewModel } from '../../features/escala/presentation/viewmodels/useEscalasViewModel';
import { useConfirmarPresencaViewModel } from '../../features/presenca/presentation/viewmodels/useConfirmarPresencaViewModel';
import { GetUsersUseCase } from '../../features/auth/domain/usecases/GetUsersUseCase';
import { makeAuthRepository } from './AuthFactory';

const escalaRepository = new EscalaRepository();
const presencaRepository = new PresencaRepository();

const getEscalasUseCase = new GetEscalasUseCase(escalaRepository);
const saveEscalaUseCase = new SaveEscalaUseCase(escalaRepository);
const deleteEscalaUseCase = new DeleteEscalaUseCase(escalaRepository);
const getGruposUseCase = new GetGruposUseCase(escalaRepository);
const saveGrupoUseCase = new SaveGrupoUseCase(escalaRepository);
const deleteGrupoUseCase = new DeleteGrupoUseCase(escalaRepository);
const getUsersUseCase = new GetUsersUseCase(makeAuthRepository());

const confirmarPresencaUseCase = new ConfirmarPresencaUseCase(presencaRepository);

export const makeGetEscalasUseCase = () => getEscalasUseCase;
export const makeSaveEscalaUseCase = () => saveEscalaUseCase;
export const makeDeleteEscalaUseCase = () => deleteEscalaUseCase;
export const makeGetGruposUseCase = () => getGruposUseCase;
export const makeSaveGrupoUseCase = () => saveGrupoUseCase;
export const makeDeleteGrupoUseCase = () => deleteGrupoUseCase;
export const makeGetUsersUseCase = () => getUsersUseCase;

export const makeConfirmarPresencaUseCase = () => confirmarPresencaUseCase;

export const makeEscalasViewModel = () => {
  return useEscalasViewModel(
    makeGetEscalasUseCase(),
    makeSaveEscalaUseCase(),
    makeDeleteEscalaUseCase(),
    makeGetGruposUseCase(),
    makeSaveGrupoUseCase(),
    makeDeleteGrupoUseCase(),
    makeGetUsersUseCase()
  );
};


export const makeConfirmarPresencaViewModel = () => {
  return useConfirmarPresencaViewModel(makeConfirmarPresencaUseCase());
};
