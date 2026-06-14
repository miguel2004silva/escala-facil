import { CoresRepository } from '../../features/cores/data/repositories/CoresRepository';
import { GetCoresUseCase } from '../../features/cores/domain/usecases/GetCoresUseCase';
import { SaveCorUseCase } from '../../features/cores/domain/usecases/SaveCorUseCase';
import { DeleteCorUseCase } from '../../features/cores/domain/usecases/DeleteCorUseCase';
import { useCoresViewModel } from '../../features/cores/presentation/viewmodels/useCoresViewModel';

const coresRepository = new CoresRepository();

const getCoresUseCase = new GetCoresUseCase(coresRepository);
const saveCorUseCase = new SaveCorUseCase(coresRepository);
const deleteCorUseCase = new DeleteCorUseCase(coresRepository);

export const makeGetCoresUseCase = () => getCoresUseCase;
export const makeSaveCorUseCase = () => saveCorUseCase;
export const makeDeleteCorUseCase = () => deleteCorUseCase;

export const makeCoresViewModel = () => {
  return useCoresViewModel(
    makeGetCoresUseCase(),
    makeSaveCorUseCase(),
    makeDeleteCorUseCase()
  );
};
