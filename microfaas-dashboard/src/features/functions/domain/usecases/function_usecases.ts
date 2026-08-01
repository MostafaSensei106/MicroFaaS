import {
  FunctionEntity,
  CreateFunctionParams,
  InvokeFunctionParams,
  InvokeResponse,
  TestRunParams,
} from '../entities/function_entity';
import { IFunctionRepository } from '../repositories/function_repository';
import { ValidationFailure } from '@/src/core/errors/failures';

export class ListFunctionsUseCase {
  constructor(private functionRepository: IFunctionRepository) {}

  public async execute(): Promise<FunctionEntity[]> {
    return this.functionRepository.listFunctions();
  }
}

export class GetFunctionByNameUseCase {
  constructor(private functionRepository: IFunctionRepository) {}

  public async execute(name: string): Promise<FunctionEntity | null> {
    return this.functionRepository.getFunctionByName(name);
  }
}

export class CreateFunctionUseCase {
  constructor(private functionRepository: IFunctionRepository) {}

  public async execute(params: CreateFunctionParams): Promise<FunctionEntity> {
    if (!params.name || params.name.trim().length < 2) {
      throw new ValidationFailure('Function name must be at least 2 characters.');
    }
    const cleanName = params.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    return this.functionRepository.createFunction({
      ...params,
      name: cleanName,
    });
  }
}

export class InvokeFunctionUseCase {
  constructor(private functionRepository: IFunctionRepository) {}

  public async execute(params: InvokeFunctionParams): Promise<InvokeResponse> {
    if (!params.name) {
      throw new ValidationFailure('Function name is required for invocation.');
    }
    return this.functionRepository.invokeFunction(params);
  }
}

export class TestRunUseCase {
  constructor(private functionRepository: IFunctionRepository) {}

  public async execute(params: TestRunParams): Promise<InvokeResponse> {
    return this.functionRepository.testRun(params);
  }
}
